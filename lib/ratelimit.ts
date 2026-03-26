/**
 * Rate limit: Upstash Redis (프로덕션) 또는 in-memory (개발용).
 * 환경변수 UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN 없으면 in-memory 사용.
 */

const LIMIT_PER_MINUTE = parseInt(
  process.env.RATE_LIMIT_PER_MINUTE ?? "10",
  10
);
const LIMIT_PER_DAY = parseInt(
  process.env.RATE_LIMIT_PER_DAY ?? "100",
  10
);

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

async function checkUpstash(identifier: string): Promise<RateLimitResult> {
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const minuteLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(LIMIT_PER_MINUTE, "1 m"),
    prefix: "whatwasit:min",
  });

  const dayLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(LIMIT_PER_DAY, "24 h"),
    prefix: "whatwasit:day",
  });

  const [minRes, dayRes] = await Promise.all([
    minuteLimiter.limit(identifier),
    dayLimiter.limit(identifier),
  ]);

  if (!minRes.success || !dayRes.success) {
    return {
      success: false,
      limit: LIMIT_PER_MINUTE,
      remaining: 0,
      reset: Math.max(minRes.reset, dayRes.reset),
    };
  }

  return {
    success: true,
    limit: LIMIT_PER_MINUTE,
    remaining: Math.min(minRes.remaining, dayRes.remaining),
    reset: minRes.reset,
  };
}

// In-memory: 분당 N회 (일일 제한은 단순화)
const memoryStore = new Map<
  string,
  { count: number; windowStart: number }
>();

function checkMemory(identifier: string): RateLimitResult {
  const now = Date.now();
  const windowMs = 60_000;
  const key = identifier;
  const entry = memoryStore.get(key);

  if (!entry) {
    memoryStore.set(key, { count: 1, windowStart: now });
    return {
      success: true,
      limit: LIMIT_PER_MINUTE,
      remaining: LIMIT_PER_MINUTE - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }

  if (now - entry.windowStart > windowMs) {
    memoryStore.set(key, { count: 1, windowStart: now });
    return {
      success: true,
      limit: LIMIT_PER_MINUTE,
      remaining: LIMIT_PER_MINUTE - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }

  entry.count += 1;
  const success = entry.count <= LIMIT_PER_MINUTE;
  return {
    success,
    limit: LIMIT_PER_MINUTE,
    remaining: Math.max(0, LIMIT_PER_MINUTE - entry.count),
    reset: Math.ceil((entry.windowStart + windowMs) / 1000),
  };
}

export async function rateLimit(identifier: string): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (url && token && token.length > 20) {
    try {
      return await checkUpstash(identifier);
    } catch (e) {
      console.error("[RateLimit] Upstash fallback to in-memory due to error:", e);
      return checkMemory(identifier);
    }
  }
  return checkMemory(identifier);
}
