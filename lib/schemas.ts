import { z } from "zod";

// ── API 요청 검증 ────────────────────────────────────
const categorySchema = z.enum([
  "movie",
  "song",
  "meme",
  "product",
  "app",
  "book",
  "place",
  "other",
]);

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z
    .string()
    .min(1, "빈 메시지는 허용되지 않습니다.")
    .max(1200, "메시지는 1200자를 초과할 수 없습니다.")
    .refine((s) => s.trim().length > 0, "공백만 있는 메시지는 허용되지 않습니다."),
});

export const chatRequestBodySchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "메시지가 비어있습니다.")
    .max(20, "메시지는 최대 20개까지 허용됩니다."),
  questionCount: z.number().int().min(0).max(20).optional(),
});

export type ChatRequestBody = z.infer<typeof chatRequestBodySchema>;

// ── API 응답 스키마 (AI 출력 검증) ───────────────────
export const questionResponseSchema = z.object({
  type: z.literal("question"),
  question: z.string().min(1),
  options: z.array(z.string()).optional(),
});

export const resultResponseSchema = z.object({
  type: z.literal("result"),
  title: z.string().min(1),
  category: categorySchema,
  confidence: z.number().min(0).max(100),
  reasoning: z.array(z.string()),
  suggestions: z.array(z.string()),
  searchQueries: z.array(z.string()).min(1),
  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
});

export const aiResponseSchema = z.discriminatedUnion("type", [
  questionResponseSchema,
  resultResponseSchema,
]);

export type QuestionResponseSchema = z.infer<typeof questionResponseSchema>;
export type ResultResponseSchema = z.infer<typeof resultResponseSchema>;
export type AIResponseSchema = z.infer<typeof aiResponseSchema>;
