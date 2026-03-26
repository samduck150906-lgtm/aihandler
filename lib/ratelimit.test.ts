import { describe, it, expect } from "vitest";
import { rateLimit } from "./ratelimit";

describe("rateLimit (in-memory when no Upstash env)", () => {
  it("allows first request", async () => {
    const r = await rateLimit("test-ip-1");
    expect(r.success).toBe(true);
    expect(r.remaining).toBeLessThanOrEqual(r.limit);
  });

  it("allows requests under limit", async () => {
    const id = "test-ip-under-limit-" + Date.now();
    const r1 = await rateLimit(id);
    expect(r1.success).toBe(true);
    const r2 = await rateLimit(id);
    expect(r2.success).toBe(true);
  });
});
