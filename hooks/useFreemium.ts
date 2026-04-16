"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

const USAGE_KEY = "prompt_maker_usage";
const COINS_KEY = "prompt_maker_coins";

export const MAX_FREE_LIMIT = 3;
export const COST_PER_GENERATION = 3;
export const PRO_DAILY_LIMIT = 200;

const PRO_USAGE_KEY = "prompt_maker_pro_usage";
const PRO_USAGE_DATE_KEY = "prompt_maker_pro_date";

export type SubscriptionStatus = "none" | "active" | "cancelled" | "past_due";

export function useFreemium() {
  const [usageCount, setUsageCount] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>("none");
  const [proDailyUsage, setProDailyUsage] = useState<number>(0);

  // Check admin status via server-side function (no hardcoded emails)
  const checkAdminStatus = useCallback(async (accessToken: string) => {
    try {
      const res = await fetch("/.netlify/functions/check-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      const data = await res.json();
      setIsAdmin(data.isAdmin === true);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  // Auth State Listener
  useEffect(() => {
    if (!supabase) {
      setIsLoaded(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserEmail(session.user.email || "");
        if (session.access_token) {
          checkAdminStatus(session.access_token);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUserEmail(session.user.email || "");
        if (session.access_token) {
          checkAdminStatus(session.access_token);
        }
      } else {
        setUserEmail("");
        setIsAdmin(false);
        setSubscriptionStatus("none");
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminStatus]);

  // Sync Data from Supabase or localStorage
  useEffect(() => {
    async function syncData() {
      if (session?.user && supabase) {
        const { data } = await supabase
          .from("profiles")
          .select("coins, usage_count, subscription_status")
          .eq("id", session.user.id)
          .single();

        if (data) {
          setCoins(data.coins || 0);
          setUsageCount(data.usage_count || 0);
          setSubscriptionStatus(data.subscription_status || "none");
        }
      } else {
        try {
          const storedUsage = localStorage.getItem(USAGE_KEY);
          const storedCoins = localStorage.getItem(COINS_KEY);
          if (storedUsage) setUsageCount(parseInt(storedUsage, 10));
          if (storedCoins) setCoins(parseInt(storedCoins, 10));
        } catch {}
      }
      // Load Pro daily usage from localStorage
      try {
        const today = new Date().toISOString().slice(0, 10);
        const storedDate = localStorage.getItem(PRO_USAGE_DATE_KEY);
        if (storedDate === today) {
          const storedProUsage = localStorage.getItem(PRO_USAGE_KEY);
          if (storedProUsage) setProDailyUsage(parseInt(storedProUsage, 10));
        } else {
          localStorage.setItem(PRO_USAGE_DATE_KEY, today);
          localStorage.setItem(PRO_USAGE_KEY, "0");
          setProDailyUsage(0);
        }
      } catch {}

      setIsLoaded(true);
    }

    syncData();
  }, [session]);

  const isPro = subscriptionStatus === "active";
  const proLimitReached = isPro && proDailyUsage >= PRO_DAILY_LIMIT;

  const incrementUsage = async () => {
    if (isAdmin) return;

    // Pro: track daily usage
    if (isPro) {
      const next = proDailyUsage + 1;
      setProDailyUsage(next);
      try {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem(PRO_USAGE_DATE_KEY, today);
        localStorage.setItem(PRO_USAGE_KEY, next.toString());
      } catch {}
      return;
    }

    let nextUsage = usageCount;
    let nextCoins = coins;

    if (usageCount < MAX_FREE_LIMIT) {
      nextUsage = usageCount + 1;
      setUsageCount(nextUsage);
    } else if (coins >= COST_PER_GENERATION) {
      nextCoins = coins - COST_PER_GENERATION;
      setCoins(nextCoins);
    }

    if (session?.user && supabase) {
      // Atomic update on server
      if (usageCount < MAX_FREE_LIMIT) {
        await supabase.rpc("increment_usage", { p_user_id: session.user.id });
      } else if (coins >= COST_PER_GENERATION) {
        await supabase.rpc("deduct_coins", {
          p_user_id: session.user.id,
          p_amount: COST_PER_GENERATION,
        });
      }
    } else {
      try {
        localStorage.setItem(USAGE_KEY, nextUsage.toString());
        localStorage.setItem(COINS_KEY, nextCoins.toString());
      } catch {}
    }
  };

  const canGenerate = isAdmin || (isPro && !proLimitReached) || usageCount < MAX_FREE_LIMIT || coins >= COST_PER_GENERATION;

  // --- Auth Methods ---
  const loginWithGoogle = async () => {
    if (!supabase) throw new Error("Auth service not configured. Please contact support.");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const loginWithGitHub = async () => {
    if (!supabase) throw new Error("Auth service not configured. Please contact support.");
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin },
    });
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!supabase) throw new Error("Auth service not configured. Please contact support.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string) => {
    if (!supabase) throw new Error("Auth service not configured. Please contact support.");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const logout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  // --- Paddle Checkout ---
  const openPaddleCheckout = useCallback(
    (priceId: string) => {
      const paddle = (window as any).Paddle;
      if (!paddle) {
        console.error("Paddle.js not loaded");
        return;
      }
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: {
          user_id: session?.user?.id || "",
          user_email: session?.user?.email || "",
        },
        customer: session?.user?.email
          ? { email: session.user.email }
          : undefined,
        settings: {
          theme: "light",
          locale: "en",
          displayMode: "overlay",
          successUrl: `${window.location.origin}?payment=completed`,
        },
      });
    },
    [session]
  );

  // Refresh coins from DB (call after successful payment)
  const refreshCoins = useCallback(async () => {
    if (!session?.user || !supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("coins, subscription_status")
      .eq("id", session.user.id)
      .single();
    if (data) {
      setCoins(data.coins || 0);
      setSubscriptionStatus(data.subscription_status || "none");
    }
  }, [session]);

  return {
    usageCount,
    coins,
    isAdmin,
    isPro,
    proDailyUsage,
    proLimitReached,
    userEmail,
    isLoaded,
    canGenerate,
    incrementUsage,
    subscriptionStatus,
    loginWithGoogle,
    loginWithGitHub,
    loginWithEmail,
    signUpWithEmail,
    logout,
    openPaddleCheckout,
    refreshCoins,
    isSignedIn: !!session?.user,
    userId: session?.user?.id,
  };
}
