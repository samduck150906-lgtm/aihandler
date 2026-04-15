// ── AI 응답 타입 ──────────────────────────────────────
export type Category =
  | "movie" | "song" | "meme" | "product"
  | "app" | "book" | "place" | "other";

export interface ResultResponse {
  type: "result";
  title: string;
  category: Category;
  confidence: number;
  reasoning: string[];
  suggestions: string[];
  searchQueries: string[];
  links?: { label: string; url: string }[];
}

export type QuestionResponse = {
  type: "question";
  question: string;
  options?: string[];
};

export type AIResponse = ResultResponse | QuestionResponse;

// ── 대화 히스토리 ────────────────────────────────────
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── UI 상태 ──────────────────────────────────────────
export type AppPhase = "idle" | "loading" | "question" | "result";

// ── Paddle 관련 ──────────────────────────────────────
export interface PaddlePriceConfig {
  priceId: string;
  coins: number;
  label: string;
}

export type SubscriptionStatus = "none" | "active" | "cancelled" | "past_due";
