"use client";

import { useState, useCallback } from "react";
import { trackSearchExecuted, trackAnswerViewed } from "@/lib/gtag";
import type { AppPhase, ResultResponse } from "@/lib/types";
import { generatePrompt } from "@/lib/generatePrompt";
import { AI_TOOLS } from "@/lib/data/ai-tools";

export interface AdvancedSettings {
  role?: string;
  format?: string;
  context?: string;
  extras?: string;
}

export interface UseChatFlowReturn {
  phase: AppPhase;
  currentResult: ResultResponse | null;
  error: string | null;
  isLoading: boolean;
  isActive: boolean;
  handleSearch: (
    aiName: string,
    purpose: string,
    tone: string,
    length: string,
    locale?: string,
    advanced?: AdvancedSettings
  ) => void;
  handleRetry: () => void;
  handleReset: () => void;
  clearError: () => void;
}

export function useChatFlow(): UseChatFlowReturn {
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [currentResult, setCurrentResult] = useState<ResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const handleSearch = useCallback(
    async (
      aiName: string,
      purpose: string,
      tone: string,
      length: string,
      locale: string = "en",
      advanced: AdvancedSettings = {}
    ) => {
      const trimmed = purpose.trim();
      if (!trimmed) return;
      trackSearchExecuted(trimmed);

      setPhase("loading");
      setError(null);

      const toolObj = AI_TOOLS.find((t) => t.name === aiName);
      const category = toolObj?.category || "전체";

      try {
        // Try OpenAI API first
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aiTool: aiName,
            category,
            purpose: trimmed,
            tone,
            length,
            locale,
            ...advanced,
          }),
        });

        let generated: string;

        if (res.ok) {
          const data = await res.json();
          generated = data.prompt;
        } else {
          // Fallback to frontend generation
          console.warn("[useChatFlow] API failed, using frontend fallback");
          generated = generatePrompt(aiName, category, trimmed, tone, length);
        }

        const result: ResultResponse = {
          type: "result",
          title: locale === "ko"
            ? `${aiName} 맞춤형 프롬프트 완성`
            : `${aiName} Optimized Prompt Ready`,
          category: "other",
          confidence: 100,
          reasoning: locale === "ko"
            ? [
                "OpenAI GPT 엔진으로 생성된 고급 프롬프트입니다.",
                "선택한 옵션과 AI 특성에 맞춰 문구가 최적화되었습니다.",
              ]
            : [
                "Advanced prompt generated via OpenAI GPT engine.",
                "Optimized for your selected options and AI tool characteristics.",
              ],
          suggestions: locale === "ko"
            ? [
                "복사 버튼을 눌러 결과물을 해당 AI 툴에 붙여넣으세요.",
                "원하는 결과가 아니라면, 옵션을 변경해 다시 생성해 보세요.",
              ]
            : [
                "Click copy and paste the result into your AI tool.",
                "Not what you expected? Adjust settings and regenerate.",
              ],
          searchQueries: [generated],
        };

        setCurrentResult(result);
        setPhase("result");
        trackAnswerViewed(result.title, result.category);
      } catch (err) {
        console.error("[useChatFlow] Error:", err);
        // Final fallback: frontend generation
        const generated = generatePrompt(aiName, category, trimmed, tone, length);
        const result: ResultResponse = {
          type: "result",
          title: locale === "ko"
            ? `${aiName} 맞춤형 프롬프트 완성`
            : `${aiName} Optimized Prompt Ready`,
          category: "other",
          confidence: 100,
          reasoning: locale === "ko"
            ? ["프론트엔드에서 즉각적으로 조립된 결과물입니다."]
            : ["Assembled instantly on the frontend."],
          suggestions: locale === "ko"
            ? ["복사 버튼을 눌러 결과물을 해당 AI 툴에 붙여넣으세요."]
            : ["Click copy and paste the result into your AI tool."],
          searchQueries: [generated],
        };
        setCurrentResult(result);
        setPhase("result");
      }
    },
    []
  );

  const handleRetry = useCallback(() => {
    setPhase("idle");
    setCurrentResult(null);
  }, []);

  const handleReset = useCallback(() => {
    setPhase("idle");
    setCurrentResult(null);
    setError(null);
  }, []);

  return {
    phase,
    currentResult,
    error,
    isLoading: phase === "loading",
    isActive: phase !== "idle",
    handleSearch,
    handleRetry,
    handleReset,
    clearError,
  };
}
