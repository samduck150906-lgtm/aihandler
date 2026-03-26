"use client";

import { useState, useEffect } from "react";

const USAGE_KEY = "prompt_maker_usage";
const PREMIUM_KEY = "prompt_maker_premium";
export const MAX_FREE_LIMIT = 3;

export function useFreemium() {
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedUsage = localStorage.getItem(USAGE_KEY);
      const storedPremium = localStorage.getItem(PREMIUM_KEY);
      
      if (storedUsage) {
        setUsageCount(parseInt(storedUsage, 10));
      }
      if (storedPremium === "true") {
        setIsPremium(true);
      }
    } catch (e) {
      console.error("Failed to read freemium state", e);
    }
    setIsLoaded(true);
  }, []);

  const incrementUsage = () => {
    if (isPremium) return;
    setUsageCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(USAGE_KEY, next.toString());
      } catch (e) {
        console.error("Failed to save usage count", e);
      }
      return next;
    });
  };

  const unlockPremium = () => {
    setIsPremium(true);
    try {
      localStorage.setItem(PREMIUM_KEY, "true");
    } catch (e) {
      console.error("Failed to save premium state", e);
    }
  };

  const canGenerate = isPremium || usageCount < MAX_FREE_LIMIT;

  return {
    usageCount,
    isPremium,
    isLoaded,
    canGenerate,
    incrementUsage,
    unlockPremium,
  };
}
