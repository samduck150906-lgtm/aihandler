"use client";

import { useState, useEffect } from "react";

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
  const [usageCount, setUsageCount] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedUsage = localStorage.getItem(USAGE_KEY);
      const storedCoins = localStorage.getItem(COINS_KEY);
      const storedAdmin = localStorage.getItem(ADMIN_KEY);
      const storedEmail = localStorage.getItem(EMAIL_KEY);
      
      if (storedUsage) {
        setUsageCount(parseInt(storedUsage, 10));
      }
      if (storedCoins) {
        setCoins(parseInt(storedCoins, 10));
      }
      if (storedAdmin === "true") {
        setIsAdmin(true);
      }
      if (storedEmail) {
        setUserEmail(storedEmail);
      }
    } catch (e) {
      console.error("Failed to read freemium state", e);
    }
    setIsLoaded(true);
  }, []);

  const incrementUsage = () => {
    if (isAdmin) return;

    if (usageCount < MAX_FREE_LIMIT) {
      const next = usageCount + 1;
      setUsageCount(next);
      try { localStorage.setItem(USAGE_KEY, next.toString()); } catch (e) {}
    } else if (coins >= COST_PER_GENERATION) {
      const nextCoins = coins - COST_PER_GENERATION;
      setCoins(nextCoins);
      try { localStorage.setItem(COINS_KEY, nextCoins.toString()); } catch (e) {}
    }
  };

  const addCoins = (amount: number) => {
    const nextCoins = coins + amount;
    setCoins(nextCoins);
    try { localStorage.setItem(COINS_KEY, nextCoins.toString()); } catch (e) {}
  };

  const saveEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    setUserEmail(trimmed);
    try { localStorage.setItem(EMAIL_KEY, trimmed); } catch (e) {}
  };

  const verifyAdmin = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    saveEmail(trimmed);
    if (ADMIN_EMAILS.includes(trimmed)) {
      setIsAdmin(true);
      try { localStorage.setItem(ADMIN_KEY, "true"); } catch (e) {}
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
  };
}
