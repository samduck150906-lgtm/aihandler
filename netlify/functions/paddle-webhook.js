/**
 * Paddle Webhook Handler (Netlify Function)
 * Processes payment events from Paddle Billing v2.
 *
 * Handles:
 * - transaction.completed → credit coins for one-time purchases
 * - subscription.activated → enable Pro plan
 * - subscription.canceled → disable Pro plan
 */
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

// Coin mapping: Paddle Price ID → coins to credit
// Configure via PADDLE_PRICE_COINS_MAP env var as JSON, e.g.:
// {"pri_xxx":50,"pri_yyy":200,"pri_zzz":500}
function getCoinMap() {
  try {
    const raw = process.env.PADDLE_PRICE_COINS_MAP;
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function verifySignature(rawBody, signature, secretKey) {
  if (!secretKey || !signature) return false;
  try {
    // Paddle Billing v2 uses ts;h1= signature format
    const parts = {};
    signature.split(";").forEach((pair) => {
      const [k, v] = pair.split("=");
      parts[k] = v;
    });
    const ts = parts["ts"];
    const h1 = parts["h1"];
    if (!ts || !h1) return false;

    const payload = `${ts}:${rawBody}`;
    const computed = crypto
      .createHmac("sha256", secretKey)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(h1, "hex")
    );
  } catch {
    return false;
  }
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // Verify webhook signature
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  const signature = event.headers["paddle-signature"];

  if (webhookSecret && signature) {
    if (!verifySignature(event.body, signature, webhookSecret)) {
      console.error("[Paddle Webhook] Signature verification failed");
      return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid signature" }) };
    }
  }

  try {
    const payload = JSON.parse(event.body);
    const eventType = payload.event_type;
    const data = payload.data;

    console.log(`[Paddle Webhook] Event: ${eventType}`);

    const supabase = getSupabase();
    if (!supabase) {
      console.error("[Paddle Webhook] Supabase not configured");
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Server config error" }) };
    }

    // Extract user ID from custom_data passed during checkout
    const userId = data?.custom_data?.user_id;

    switch (eventType) {
      case "transaction.completed": {
        // One-time coin purchase
        if (!userId) {
          console.warn("[Paddle Webhook] No user_id in transaction custom_data");
          break;
        }

        const coinMap = getCoinMap();
        let totalCoins = 0;

        // Sum coins from all items in the transaction
        const items = data.items || [];
        for (const item of items) {
          const priceId = item.price?.id;
          if (priceId && coinMap[priceId]) {
            totalCoins += coinMap[priceId] * (item.quantity || 1);
          }
        }

        if (totalCoins > 0) {
          // Atomic coin update using RPC or raw SQL
          const { error } = await supabase.rpc("add_coins", {
            p_user_id: userId,
            p_amount: totalCoins,
          });

          if (error) {
            // Fallback: manual atomic update
            console.warn("[Paddle Webhook] RPC failed, trying direct update:", error.message);
            await supabase
              .from("profiles")
              .update({ coins: supabase.raw(`coins + ${totalCoins}`) })
              .eq("id", userId);
          }

          console.log(`[Paddle Webhook] Credited ${totalCoins} coins to user ${userId}`);
        }
        break;
      }

      case "subscription.activated":
      case "subscription.updated": {
        if (!userId) break;

        const status = data.status; // active, canceled, past_due, etc.
        await supabase
          .from("profiles")
          .update({
            subscription_status: status === "active" ? "active" : "none",
            paddle_subscription_id: data.id || null,
          })
          .eq("id", userId);

        console.log(`[Paddle Webhook] Subscription ${status} for user ${userId}`);
        break;
      }

      case "subscription.canceled": {
        if (!userId) break;

        await supabase
          .from("profiles")
          .update({
            subscription_status: "cancelled",
          })
          .eq("id", userId);

        console.log(`[Paddle Webhook] Subscription cancelled for user ${userId}`);
        break;
      }

      default:
        console.log(`[Paddle Webhook] Unhandled event: ${eventType}`);
    }

    return { statusCode: 200, headers, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error("[Paddle Webhook] Error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Internal error" }) };
  }
};
