"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const USAGE_KEY = "prompt_maker_usage";
const COINS_KEY = "prompt_maker_coins";
const ADMIN_KEY = "prompt_maker_admin";
const EMAIL_KEY = "prompt_maker_email";

export const MAX_FREE_LIMIT = 3;
export const COST_PER_GENERATION = 3;

// 하드코딩된 관리자 계정 목록 (영구 무료 허용)
const ADMIN_EMAILS = [
  "samduck150906@gmail.com",
  "ceo@eternalsix.kr",
  "ceo@eternalsix.com"
];

export function useFreemium() {
  const [usageCount, setUsageCount] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Auth State Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserEmail(session.user.email || "");
        setIsAdmin(ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || ""));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUserEmail(session.user.email || "");
        setIsAdmin(ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || ""));
      } else {
        setUserEmail("");
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync Data
  useEffect(() => {
    async function syncData() {
      if (session?.user) {
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('coins, usageCount') // I added usageCount to table in migration
          .eq('id', session.user.id)
          .single();

        if (data) {
          setCoins(data.coins || 0);
          setUsageCount(data.usageCount || 0);
        }
      } else {
        // Load from LocalStorage for Guests
        try {
          const storedUsage = localStorage.getItem(USAGE_KEY);
          const storedCoins = localStorage.getItem(COINS_KEY);
          
          if (storedUsage) setUsageCount(parseInt(storedUsage, 10));
          if (storedCoins) setCoins(parseInt(storedCoins, 10));
        } catch (e) {}
      }
      setIsLoaded(true);
    }

    syncData();
  }, [session]);

  const incrementUsage = async () => {
    if (isAdmin) return;

    let nextUsage = usageCount;
    let nextCoins = coins;

    if (usageCount < MAX_FREE_LIMIT) {
      nextUsage = usageCount + 1;
      setUsageCount(nextUsage);
    } else if (coins >= COST_PER_GENERATION) {
      nextCoins = coins - COST_PER_GENERATION;
      setCoins(nextCoins);
    }

    if (session?.user) {
      // Update Supabase
      await supabase
        .from('profiles')
        .update({ coins: nextCoins, usageCount: nextUsage })
        .eq('id', session.user.id);
    } else {
      // Update LocalStorage
      try {
        localStorage.setItem(USAGE_KEY, nextUsage.toString());
        localStorage.setItem(COINS_KEY, nextCoins.toString());
      } catch (e) {}
    }
  };

  const addCoins = (amount: number) => {
    const nextCoins = coins + amount;
    setCoins(nextCoins);
    if (!session?.user) {
      try { localStorage.setItem(COINS_KEY, nextCoins.toString()); } catch (e) {}
    }
    // Note: Cloud addCoins is done in confirm-payment netlify function.
  };

  const canGenerate = isAdmin || usageCount < MAX_FREE_LIMIT || coins >= COST_PER_GENERATION;

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return {
    usageCount,
    coins,
    isAdmin,
    userEmail,
    isLoaded,
    canGenerate,
    incrementUsage,
    addCoins,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    logout,
    isSignedIn: !!session?.user,
    userId: session?.user?.id
  };
}
