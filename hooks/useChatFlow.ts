"use client";

import { useState, useCallback } from "react";
import { trackSearchExecuted, trackAnswerViewed } from "@/lib/gtag";
import type {
  ChatMessage,
  AppPhase,
  ResultResponse,
  QuestionResponse,
  AIResponse } from "@/lib/types";
import { generatePrompt } from "@/lib/generatePrompt";
import { AI_TOOLS } from "@/lib/data/ai-tools";

export type ErrorCode =
  | "network"
  | "429"
  | "401"
  | "500"
  | "validation"
  | "quota"
  | null;

export interface UseChatFlowReturn {
  phase: AppPhase;
  history: ChatMessage[];
  currentQuestion: QuestionResponse | null;
  currentResult: ResultResponse | null;
  questionCount: number;
  error: string | null;
  errorCode: ErrorCode;
  isLoading: boolean;
  isActive: boolean;
  handleSearch: (aiName: string, purpose: string, tone: string, length: string) => void;
  handleAnswer: (answer: "네" | "아니오" | "몰라요") => void;
  handleRetry: () => void;
  handleReset: () => void;
  clearError: () => void;
  /** 마지막 요청 재시도 (에러 시) */
  retryLast: () => void;
}

export function useChatFlow(): UseChatFlowReturn {
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
  const [currentResult, setCurrentResult] = useState<ResultResponse | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<ErrorCode>(null);

  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  const handleSearch = useCallback(
    (aiName: string, purpose: string, tone: string, length: string) => {
      const trimmed = purpose.trim();
      if (!trimmed) return;
      trackSearchExecuted(trimmed);

      setPhase("loading");
      setError(null);
      setErrorCode(null);

      // 모의 지연 (자연스러운 UX 제공을 위해 약간의 딜레이만 줌)
      setTimeout(() => {
        const toolObj = AI_TOOLS.find((t) => t.name === aiName);
        const category = toolObj?.category || "전체";
        
        // 프론트엔드 조합형 자바스크립트 호출
        const generated = generatePrompt(aiName, category, trimmed, tone, length);
        
        const result: ResultResponse = {
          type: "result",
          title: `${aiName} 맞춤형 프롬프트 완성`,
          category: "other",
          confidence: 100,
          reasoning: [
            "프론트엔드에서 즉각적으로 조립된 조합형 결과물입니다.",
            "선택한 옵션(어조, 길이)과 AI 특성에 맞춰 문구가 최적화되었습니다."
          ],
          suggestions: [
             "복사 버튼을 눌러 결과물을 해당 AI 툴에 붙여넣으세요.",
             "원하는 결과가 아니라면, 옵션을 변경해 다시 생성해 보세요."
          ],
          searchQueries: [generated]
        };

        setCurrentResult(result);
        setCurrentQuestion(null);
        setPhase("result");
        trackAnswerViewed(result.title, result.category);
      }, 400); // 0.4초
    },
    []
  );

  const handleAnswer = useCallback(
    (answer: "네" | "아니오" | "몰라요") => {
      // API 통신을 제거했으므로 더 이상 질문-답변 과정이 존재하지 않음
    },
    []
  );

  const handleRetry = useCallback(() => {
    // 다시 생성하기 버튼을 눌렀을 때, 폼으로 돌아가도록 리셋
    setPhase("idle");
    setCurrentResult(null);
  }, []);

  const handleReset = useCallback(() => {
    setPhase("idle");
    setHistory([]);
    setCurrentQuestion(null);
    setCurrentResult(null);
    setQuestionCount(0);
    setError(null);
    setErrorCode(null);
  }, []);

  const retryLast = useCallback(() => {
    // API 통신 제거로 사용하지 않음
  }, []);

  return {
    phase,
    history,
    currentQuestion,
    currentResult,
    questionCount,
    error,
    errorCode,
    isLoading: phase === "loading",
    isActive: phase !== "idle",
    handleSearch,
    handleAnswer,
    handleRetry,
    handleReset,
    clearError,
    retryLast,
  };
}
