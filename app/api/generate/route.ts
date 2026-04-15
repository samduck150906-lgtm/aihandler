import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

interface GenerateBody {
  aiTool: string;
  category: string;
  purpose: string;
  tone: string;
  length: string;
  locale: string;
  role?: string;
  format?: string;
  context?: string;
  extras?: string;
}

// Rate limit: simple in-memory per-user (reset on server restart)
const usageMap = new Map<string, { count: number; resetAt: number }>();
const PRO_DAILY_LIMIT = 200;
const FREE_DAILY_LIMIT = 3;

function checkRateLimit(userId: string, isPro: boolean): boolean {
  const now = Date.now();
  const limit = isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const entry = usageMap.get(userId);

  if (!entry || now > entry.resetAt) {
    usageMap.set(userId, { count: 1, resetAt: now + 86400000 });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API not configured" }, { status: 500 });
  }

  try {
    const body: GenerateBody = await req.json();
    const { aiTool, category, purpose, tone, length, locale, role, format, context, extras } = body;

    if (!purpose?.trim()) {
      return NextResponse.json({ error: "Purpose is required" }, { status: 400 });
    }

    // Build system prompt based on locale
    const isKorean = locale === "ko";

    const systemPrompt = isKorean
      ? `당신은 세계 최고의 AI 프롬프트 엔지니어입니다. 사용자가 선택한 AI 도구에 최적화된 프롬프트를 생성해야 합니다.

규칙:
- "${aiTool}" (${category} 카테고리)에 최적화된 프롬프트를 생성합니다.
- 이미지/비디오/오디오 도구의 경우 해당 도구의 네이티브 문법(파라미터, 태그 등)을 정확히 사용합니다.
- 텍스트/LLM 도구의 경우 해당 도구의 강점을 극대화하는 구조화된 프롬프트를 생성합니다.
- 프롬프트만 출력합니다. 설명이나 추가 텍스트 없이, 바로 복사해서 붙여넣을 수 있는 프롬프트만 제공합니다.
- Midjourney는 /imagine prompt: 형태로, Stable Diffusion은 가중치 문법으로, DALL-E는 자연어로, Suno/Udio는 장르와 가사 태그로 작성합니다.`
      : `You are the world's leading AI prompt engineer. Generate a prompt optimized for the user's selected AI tool.

Rules:
- Generate a prompt optimized for "${aiTool}" (${category} category).
- For image/video/audio tools, use the tool's native syntax (parameters, tags, etc.) precisely.
- For text/LLM tools, create a structured prompt that maximizes the tool's strengths.
- Output ONLY the prompt. No explanations, no extra text — just a ready-to-paste prompt.
- Midjourney uses /imagine prompt: format, Stable Diffusion uses weight syntax, DALL-E uses natural language, Suno/Udio uses genre and lyric tags.`;

    // Build user message with all settings
    const parts: string[] = [];

    parts.push(isKorean ? `[목적]: ${purpose}` : `[Purpose]: ${purpose}`);

    if (tone && tone !== "상관없음") {
      parts.push(isKorean ? `[어조]: ${tone}` : `[Tone]: ${tone}`);
    }

    if (length && length !== "상관없음") {
      parts.push(isKorean ? `[길이]: ${length}` : `[Length]: ${length}`);
    }

    if (role) {
      parts.push(isKorean ? `[역할/페르소나]: ${role}` : `[Role/Persona]: ${role}`);
    }

    if (format) {
      parts.push(isKorean ? `[출력 형식]: ${format}` : `[Output Format]: ${format}`);
    }

    if (context) {
      parts.push(isKorean ? `[배경/맥락]: ${context}` : `[Context]: ${context}`);
    }

    if (extras) {
      parts.push(isKorean ? `[추가 지시사항]: ${extras}` : `[Additional Instructions]: ${extras}`);
    }

    parts.push(isKorean
      ? `\n위 조건에 맞춰 "${aiTool}"에서 바로 사용 가능한 최적의 프롬프트를 생성해주세요.`
      : `\nGenerate the optimal prompt for "${aiTool}" based on the above conditions.`
    );

    const userMessage = parts.join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("[generate] OpenAI error:", err);
      return NextResponse.json(
        { error: "AI generation failed", code: response.status },
        { status: 502 }
      );
    }

    const data = await response.json();
    const generatedPrompt = data.choices?.[0]?.message?.content?.trim() || "";

    if (!generatedPrompt) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 502 });
    }

    return NextResponse.json({ prompt: generatedPrompt });
  } catch (err) {
    console.error("[generate] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
