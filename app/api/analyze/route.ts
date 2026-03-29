import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export const maxDuration = 60; // Allow enough time for AI analysis

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return Response.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { animal, product_type, ingredient } = await req.json();

    if (!ingredient) {
      return Response.json({ error: "Ingredient string is required" }, { status: 400, headers: corsHeaders });
    }

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      system: `당신은 반려동물 성분 분석 전문가(수의학 기반 영양 분석 + 화학 성분 안전성 평가 + 데이터 규칙 엔진 설계자)입니다.
사용자가 입력한 제품의 전성분을 분석하여 "안전성 / 위험성 / 알레르기 / 질환 영향 / 궁합"을 객관적으로 판단합니다.
긴 설명은 배제하고, "가능성 있음"과 같은 모호한 표현을 금지하며 명확하고 수의학적 근거에 기반하여 반드시 JSON 형식으로만 응답하세요.

[1] 분류 규칙 (category)
- protein_source, carbohydrate, fat, additive, preservative, flavoring, coloring, functional, unknown

[2] 위험도 (risk) 평가 기준
- safe: 명확한 천연 원료, 유익함, 장기 섭취 무해
- caution: 논란 성분, 과다 섭취/알레르기 주의
- danger: 독성, 금기 성분, 장기 섭취 시 질환 위험 상승

[3] 핵심 확인 사항
알레르기 유발 가능 성분, 고양이/개에게 위험한 성분별 구분, 에센셜오일 포함 여부, 인공첨가물/과도한 보존제 여부.

[4] 질환(kidney, urinary, joint, obesity, allergy, dental) 영향 판단:
도움이면 추천 리스트에 포함, 악영향이면 피해야할 리스트에 포함.

[5] 성분 조합(combination) 분석
단백질 원료 다양성, 불필요 첨가물 비율, 탄수화물 과다 여부, 보존제 조합 위험성을 종합 평가.

[6] 점수 시스템 계산 원칙 (최종 0~100점)
- danger 성분 1개당: -25점
- caution 성분 1개당: -10점
- 알레르기 유발 성분: -20점
- 기능성 성분: +10점
- 고품질 단백질: +15점`,
      prompt: `분석 대상 반려동물: ${animal || 'dog'}
제품 타입: ${product_type || 'food'}
전성분 리스트: ${ingredient}`,
      schema: z.object({
        summary: z.string().describe("제품의 안전도에 대한 한줄 요약"),
        risk_level: z.enum(["safe", "caution", "danger"]).describe("최종 안전도 등급"),
        scores: z.object({
          safety: z.number().min(0).max(100),
          nutrition: z.number().min(0).max(100),
          final: z.number().min(0).max(100),
        }),
        ingredient_analysis: z.array(z.object({
          name: z.string().describe("성분명"),
          category: z.enum(["protein_source", "carbohydrate", "fat", "additive", "preservative", "flavoring", "coloring", "functional", "unknown"]),
          risk: z.enum(["safe", "caution", "danger"]),
          reason: z.string().describe("해당 위험도로 판단한 핵심 이유 (수의학적/영양학적 근거, 매우 짧고 명확하게)"),
        })),
        alerts: z.array(z.string()).describe("위험/주의해야 할 사항들을 요약한 알림문 리스트"),
        combination_analysis: z.object({
          protein_quality: z.string().describe("단백질 품질 평가 (예: 우수, 보통, 부족)"),
          additive_level: z.string().describe("첨가물 수준 (예: 무첨가, 적정, 과다)"),
          risk_comment: z.string().describe("성분 조합에 따른 종합적인 위험 평가 코멘트"),
        }),
        recommended_for: z.array(z.enum(["kidney", "urinary", "joint", "obesity", "allergy", "dental", "none"])).describe("급여 시 도움되는 질환군"),
        not_recommended_for: z.array(z.enum(["kidney", "urinary", "joint", "obesity", "allergy", "dental", "none"])).describe("급여 시 악영향인 혹은 주의해야할 질환군"),
      }),
    });

    return Response.json(object, { headers: corsHeaders });
  } catch (error: any) {
    console.error("AI Analysis Pipeline Error:", error);
    return Response.json({ error: error.message || "Failed to analyze ingredients" }, { status: 500, headers: corsHeaders });
  }
}
