"use client";

import { useState, useEffect } from "react";
import type { ResultResponse } from "@/lib/types";

export interface HistoryItem {
  id: string;
  timestamp: number;
  title: string;
  prompt: string;
  category: string;
}

const STORAGE_KEY = "prompt_maker_history";
const MAX_HISTORY = 50;

export function usePromptHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history from local storage", e);
    }
    setIsLoaded(true);
  }, []);

  const savePrompt = (result: ResultResponse) => {
    const promptText = result.searchQueries?.[0];
    if (!promptText) return;

    const newItem: HistoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      timestamp: Date.now(),
      title: result.title,
      prompt: promptText,
      category: result.category,
    };

    setHistory((prev) => {
      // Remove duplicates with same title (optional, but let's just prepend)
      const filtered = prev.filter((item) => item.prompt !== promptText);
      const nextHistory = [newItem, ...filtered].slice(0, MAX_HISTORY);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
      } catch (e) {
        console.error("Failed to save history", e);
      }
      return nextHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  const removePrompt = (id: string) => {
    setHistory((prev) => {
      const nextHistory = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
      } catch (e) {
        // ignore
      }
      return nextHistory;
    });
  };

  return {
    history,
    isLoaded,
    savePrompt,
    clearHistory,
    removePrompt,
  };
}
