import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/ratelimit", () => ({
  rateLimit: vi.fn(() =>
    Promise.resolve({
      success: true,
      limit: 10,
      remaining: 9,
      reset: 0,
    })
  ),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(() =>
    Promise.resolve({
      text: JSON.stringify({
        type: "result",
        title: "테스트",
        category: "other",
        confidence: 80,
        reasoning: ["테스트"],
        suggestions: [],
        searchQueries: ["테스트 검색"],
      }),
    })
  ),
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => "gpt-4o-mini"),
}));

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when messages is empty", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when message content is blank", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "   " }],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
