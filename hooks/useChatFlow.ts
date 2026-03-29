"use client";

import { useState, useCallback } from "react";
import { trackSearchExecuted, trackAnswerViewed } from "@/lib/gtag";
import type {
  ChatMessage,
  AppPhase,
  ResultResponse,
  QuestionResponse,
  AIResponse } from "@/lib/types";

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
  handleSearch: (query: string) => void;
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

  const sendToAI = useCallback(
    async (newMessages: ChatMessage[], count: number) => {
      setError(null);
      setErrorCode(null);
      setPhase("loading");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            questionCount: count,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const isQuota =
            data.code === "QUOTA_EXCEEDED" ||
            (typeof data.error === "string" &&
              /quota|billing|insufficient_quota/i.test(data.error));
          if (res.status === 429) {
            setErrorCode("429");
            setError(
              data.error ?? "요청이 너무 많아요. 잠시 후 다시 시도해 주세요."
            );
          } else if (isQuota || res.status === 503) {
            setErrorCode("quota");
            setError(
              data.error ??
                "서비스 이용량을 일시적으로 초과했어요. 잠시 후 다시 시도해 주세요."
            );
          } else if (res.status === 401) {
            setErrorCode("401");
            setError(data.error ?? "인증 설정에 문제가 있어요. 관리자에게 문의해 주세요.");
          } else if (res.status === 400) {
            setErrorCode("validation");
            setError(data.error ?? "입력이 올바르지 않아요.");
          } else {
            setErrorCode("500");
            setError(
              data.error ?? "일시적인 오류가 났어요. 잠시 후 다시 시도해 주세요."
            );
          }
          setPhase(history.length > 0 ? "question" : "idle");
          return;
        }

        const parsed = data as AIResponse;

        const updatedHistory: ChatMessage[] = [
          ...newMessages,
          { role: "assistant", content: JSON.stringify(parsed) },
        ];
        setHistory(updatedHistory);

        if (parsed.type === "result") {
          setCurrentResult(parsed);
          setCurrentQuestion(null);
          setPhase("result");
          trackAnswerViewed(parsed.title, parsed.category);
        } else {
          setCurrentQuestion(parsed);
          setCurrentResult(null);
          setQuestionCount((prev) => prev + 1);
          setPhase("question");
        }
      } catch {
        setErrorCode("network");
        setError("네트워크 연결을 확인해 주세요. 다시 시도해 주세요.");
        setPhase(history.length > 0 ? "question" : "idle");
      }
    },
    [history.length]
  );

  const handleSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      trackSearchExecuted(trimmed);
      const newMessages: ChatMessage[] = [
        ...history,
        { role: "user", content: trimmed },
      ];
      setHistory(newMessages);
      sendToAI(newMessages, questionCount);
    },
    [history, questionCount, sendToAI]
  );

  const handleAnswer = useCallback(
    (answer: "네" | "아니오" | "몰라요") => {
      const newMessages: ChatMessage[] = [
        ...history,
        { role: "user", content: answer },
      ];
      setHistory(newMessages);
      sendToAI(newMessages, questionCount);
    },
    [history, questionCount, sendToAI]
  );

  const handleRetry = useCallback(() => {
    const newMessages: ChatMessage[] = [
      ...history,
      {
        role: "user",
        content:
          "아니야, 이거 아닌 것 같아. 비슷하긴 한데 다른 거야. 다시 찾아줘.",
      },
    ];
    setHistory(newMessages);
    setQuestionCount(0);
    sendToAI(newMessages, 0);
  }, [history, sendToAI]);

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
    if (history.length === 0) return;
    const lastIsUser =
      history[history.length - 1]?.role === "user";
    if (!lastIsUser) return;
    sendToAI(history, questionCount);
  }, [history, questionCount, sendToAI]);

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
