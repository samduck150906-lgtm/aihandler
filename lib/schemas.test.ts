import { describe, it, expect } from "vitest";
import {
  chatRequestBodySchema,
  aiResponseSchema,
  questionResponseSchema,
  resultResponseSchema } from "./schemas";

describe("chatRequestBodySchema", () => {
  it("rejects empty messages", () => {
    expect(chatRequestBodySchema.safeParse({ messages: [] }).success).toBe(false);
  });

  it("rejects messages over 20", () => {
    const messages = Array.from({ length: 21 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: "x",
    }));
    expect(chatRequestBodySchema.safeParse({ messages }).success).toBe(false);
  });

  it("rejects message content over 1200 chars", () => {
    expect(
      chatRequestBodySchema.safeParse({
        messages: [{ role: "user", content: "a".repeat(1201) }],
      }).success
    ).toBe(false);
  });

  it("rejects blank content", () => {
    expect(
      chatRequestBodySchema.safeParse({
        messages: [{ role: "user", content: "   " }],
      }).success
    ).toBe(false);
  });

  it("accepts valid body with optional questionCount", () => {
    const r = chatRequestBodySchema.safeParse({
      messages: [{ role: "user", content: "넷플릭스 일본 애니" }],
      questionCount: 2,
    });
    expect(r.success).toBe(true);
  });
});

describe("aiResponseSchema", () => {
  it("parses valid question response", () => {
    const data = {
      type: "question",
      question: "애니메이션이었나요?",
      options: ["네", "아니오"],
    };
    expect(questionResponseSchema.safeParse(data).success).toBe(true);
  });

  it("parses valid result response", () => {
    const data = {
      type: "result",
      title: "너의 이름은",
      category: "movie",
      confidence: 90,
      reasoning: ["일본", "넷플릭스"],
      suggestions: ["날씨의 아이"],
      searchQueries: ["너의 이름은 영화", "신카이 마코토"],
    };
    expect(resultResponseSchema.safeParse(data).success).toBe(true);
  });

  it("rejects result without searchQueries", () => {
    const data = {
      type: "result",
      title: "x",
      category: "other",
      confidence: 50,
      reasoning: [],
      suggestions: [],
      searchQueries: [],
    };
    expect(resultResponseSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid category", () => {
    const data = {
      type: "result",
      title: "x",
      category: "invalid",
      confidence: 80,
      reasoning: ["a"],
      suggestions: [],
      searchQueries: ["q"],
    };
    expect(aiResponseSchema.safeParse(data).success).toBe(false);
  });
});
