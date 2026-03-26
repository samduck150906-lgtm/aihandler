import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { getSystemPrompt } from "@/lib/prompt";
import {
  chatRequestBodySchema,
  aiResponseSchema,
  type AIResponseSchema,
} from "@/lib/schemas";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "edge";

const MAX_TOKENS = 800;
const TEMPERATURE = 0.6;

function getRequestId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  if (realIp) return realIp;
  return "unknown";
}

function extractJsonFromText(text: string): string {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  return match ? match[0] : cleaned;
}

function safeFallbackPayload(): AIResponseSchema {
  return {
    type: "result",
    title: "찾지 못했어요",
    category: "other",
    confidence: 0,
    reasoning: ["응답을 파싱하지 못했습니다."],
    suggestions: [
      "다시 한 번 설명해 주시거나, 조금 더 구체적으로 말씀해 주세요.",
    ],
    searchQueries: ["기억나는 대로 검색"],
  };
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId();
  const log = (msg: string, data?: unknown) =>
    console.log(`[${requestId}] ${msg}`, data ?? "");

  try {
    const body = await req.json();
    const parsed = chatRequestBodySchema.safeParse(body);
    if (!parsed.success) {
      log("validation failed", parsed.error.flatten());
      return NextResponse.json(
        {
          error: "입력이 올바르지 않습니다.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { messages, questionCount = 0 } = parsed.data;
    
    // Phase 3: Extract category from the last user message
    let category = "텍스트/LLM";
    let processedMessages = [...messages];
    if (processedMessages.length > 0) {
      const lastMsg = processedMessages[processedMessages.length - 1];
      const match = lastMsg.content.match(/^\[카테고리:\s*(.*?)\]\s*/);
      if (match) {
        category = match[1];
        // Remove the category injection string from the actual message going to OpenAI
        processedMessages[processedMessages.length - 1].content = lastMsg.content.replace(match[0], "");
      }
    }

    const clientIp = getClientIp(req);
    const rl = await rateLimit(clientIp);
    if (!rl.success) {
      log("rate limit exceeded", { clientIp });
      return NextResponse.json(
        {
          error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
          code: "RATE_LIMIT_EXCEEDED",
        },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const systemPrompt = getSystemPrompt(questionCount, category);

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
      temperature: TEMPERATURE,
      maxTokens: MAX_TOKENS,
    });

    let rawJson = extractJsonFromText(text);
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawJson);
    } catch {
      parsedJson = null;
    }
    let parsedResponse = aiResponseSchema.safeParse(parsedJson);

    if (!parsedResponse.success) {
      log("parse fail, retrying once", { raw: text.slice(0, 200) });
      const retry = await generateText({
        model: openai("gpt-4o-mini"),
        system:
          systemPrompt + "\n\n중요: 위 스키마대로 JSON만 출력하라. 코드블록 없이.",
        messages: processedMessages.map((m) => ({ role: m.role, content: m.content })),
        temperature: 0.3,
        maxTokens: MAX_TOKENS,
      });
      rawJson = extractJsonFromText(retry.text);
      try {
        parsedJson = JSON.parse(rawJson);
      } catch {
        parsedJson = null;
      }
      parsedResponse = aiResponseSchema.safeParse(parsedJson);
    }

    if (!parsedResponse.success) {
      log("parse fail after retry", parsedResponse.error.flatten());
      return NextResponse.json(safeFallbackPayload(), {
        status: 200,
        headers: { "X-Fallback": "true" },
      });
    }

    log("success", { type: parsedResponse.data.type });
    return NextResponse.json(parsedResponse.data);
  } catch (err) {
    log("error", err);
    const message =
      err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
    const isQuota =
      /quota|billing|insufficient_quota|rate limit/i.test(message);
    if (isQuota) {
      return NextResponse.json(
        {
          error:
            "서비스 이용량을 일시적으로 초과했어요. 잠시 후 다시 시도해 주세요.",
          code: "QUOTA_EXCEEDED",
          requestId,
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: message, requestId },
      { status: 500 }
    );
  }
}
