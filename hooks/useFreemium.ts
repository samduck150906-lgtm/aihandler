"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const USAGE_KEY = "prompt_maker_usage";
const COINS_KEY = "prompt_maker_coins";
const ADMIN_KEY = "prompt_maker_admin";
const EMAIL_KEY = "prompt_maker_email";

export const MAX_FREE_LIMIT = 3;
export const COST_PER_GENERATION = 3;

// 하드코딩된 관리자 계정 목록 (영구 무료 허용)
const ADMIN_EMAILS = [
  "samduck150906@gmail.com",
  "ceo@eternalsix.kr"
];

export function useFreemium() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const [usageCount, setUsageCount] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from Clerk or LocalStorage
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (user) {
      // Cloud Data (Clerk)
      const cloudCoins = Number(user.publicMetadata?.coins || 0);
      const cloudUsage = Number(user.publicMetadata?.usageCount || 0);
      const email = user.primaryEmailAddress?.emailAddress || "";
      
      setCoins(cloudCoins);
      setUsageCount(cloudUsage);
      setUserEmail(email);
      setIsAdmin(ADMIN_EMAILS.includes(email.toLowerCase()));
    } else {
      // Local Data (Guest)
      try {
        const storedUsage = localStorage.getItem(USAGE_KEY);
        const storedCoins = localStorage.getItem(COINS_KEY);
        const storedAdmin = localStorage.getItem(ADMIN_KEY);
        const storedEmail = localStorage.getItem(EMAIL_KEY);
        
        if (storedUsage) setUsageCount(parseInt(storedUsage, 10));
        if (storedCoins) setCoins(parseInt(storedCoins, 10));
        if (storedAdmin === "true") setIsAdmin(true);
        if (storedEmail) setUserEmail(storedEmail);
      } catch (e) {
        console.error("Failed to read freemium state", e);
      }
    }
    setIsLoaded(true);
  }, [user, isClerkLoaded]);

  const incrementUsage = async () => {
    if (isAdmin) return;

    let nextUsage = usageCount;
    let nextCoins = coins;

    if (usageCount < MAX_FREE_LIMIT) {
      nextUsage = usageCount + 1;
      setUsageCount(nextUsage);
      if (!user) {
        try { localStorage.setItem(USAGE_KEY, nextUsage.toString()); } catch (e) {}
      }
    } else if (coins >= COST_PER_GENERATION) {
      nextCoins = coins - COST_PER_GENERATION;
      setCoins(nextCoins);
      if (!user) {
        try { localStorage.setItem(COINS_KEY, nextCoins.toString()); } catch (e) {}
      }
    }

    // If logged in, update metadata (Usage only for simplicity on client)
    // Note: Incrementing cloud coins should ideally be backend.
    if (user) {
        try {
            await user.update({
                publicMetadata: {
                    ...user.publicMetadata,
                    usageCount: nextUsage,
                    coins: nextCoins
                }
            });
        } catch (e) {
            console.error("Failed to sync usage to cloud", e);
        }
    }
  };

  const addCoins = (amount: number) => {
    // This frontend addCoins is primarily for immediate UI feedback.
    // Real recharge happens in the Netlify Backend Function.
    const nextCoins = coins + amount;
    setCoins(nextCoins);
    if (!user) {
      try { localStorage.setItem(COINS_KEY, nextCoins.toString()); } catch (e) {}
    }
  };

  const saveEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    setUserEmail(trimmed);
    if (!user) {
      try { localStorage.setItem(EMAIL_KEY, trimmed); } catch (e) {}
    }
  };

  const verifyAdmin = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    saveEmail(trimmed);
    if (ADMIN_EMAILS.includes(trimmed)) {
      setIsAdmin(true);
      if (!user) {
        try { localStorage.setItem(ADMIN_KEY, "true"); } catch (e) {}
      }
      return true;
    }
    return false;
  };

  const canGenerate = isAdmin || usageCount < MAX_FREE_LIMIT || coins >= COST_PER_GENERATION;

  return {
    usageCount,
    coins,
    isAdmin,
    userEmail,
    isLoaded,
    canGenerate,
    incrementUsage,
    addCoins,
    saveEmail,
    verifyAdmin,
    isSignedIn: !!user,
    userId: user?.id
  };
}
