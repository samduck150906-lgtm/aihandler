import type {
  AIResponseSchema,
  QuestionResponseSchema,
  ResultResponseSchema,
} from "./schemas";

// ── AI 응답 타입 (schemas와 동기화) ──────────────────
export type Category = ResultResponseSchema["category"];

export type ResultResponse = ResultResponseSchema;
export type QuestionResponse = QuestionResponseSchema;
export type AIResponse = AIResponseSchema;

// ── 대화 히스토리 ────────────────────────────────────
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── UI 상태 ──────────────────────────────────────────
export type AppPhase = "idle" | "loading" | "question" | "result";

export interface AppState {
  phase: AppPhase;
  history: ChatMessage[];
  currentQuestion: QuestionResponse | null;
  currentResult: ResultResponse | null;
  questionCount: number;
}

// ── 카테고리 메타 (value export, type-only에서 사용 금지) ─
export const CATEGORY_META: Record<
  Category,
  { label: string; emoji: string; color: string }
> = {
  movie: { label: "영화/드라마", emoji: "🎬", color: "bg-blue-100 text-blue-700" },
  song: { label: "노래/음악", emoji: "🎵", color: "bg-purple-100 text-purple-700" },
  meme: { label: "짤/밈", emoji: "😂", color: "bg-green-100 text-green-700" },
  product: { label: "제품/물건", emoji: "📦", color: "bg-orange-100 text-orange-700" },
  app: { label: "앱/서비스", emoji: "📱", color: "bg-cyan-100 text-cyan-700" },
  book: { label: "책/웹툰", emoji: "📚", color: "bg-amber-100 text-amber-700" },
  place: { label: "장소/맛집", emoji: "📍", color: "bg-rose-100 text-rose-700" },
  other: { label: "기타", emoji: "🔮", color: "bg-gray-100 text-gray-700" },
};
