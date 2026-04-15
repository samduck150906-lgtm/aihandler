/**
 * Server-side admin check (Netlify Function).
 * Admin emails are stored ONLY on the server via ADMIN_EMAILS env var.
 * This prevents exposing admin identities in client-side code.
 */
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { accessToken } = JSON.parse(event.body || "{}");

    if (!accessToken) {
      return { statusCode: 400, headers, body: JSON.stringify({ isAdmin: false }) };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ isAdmin: false }) };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT and get user info
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user?.email) {
      return { statusCode: 200, headers, body: JSON.stringify({ isAdmin: false }) };
    }

    // Admin emails stored server-side only
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isAdmin = adminEmails.includes(user.email.toLowerCase());

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ isAdmin }),
    };
  } catch (err) {
    console.error("[check-admin] Error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ isAdmin: false }) };
  }
};
