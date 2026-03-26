/**
 * Softness / Comfort scoring engine.
 * Local heuristic NLP — no external LLM.
 */

import type { ProductData, ScoredProduct } from './types.js';

const SOFTNESS_POSITIVE: Record<string, number> = {
  modal: 25,
  silk: 24,
  rayon: 22,
  bamboo: 23,
  soft: 20,
  'premium cotton': 21,
  cotton: 12,
  울: 8,
  양모: 8,
  마: 10,
  린넨: 6,
  촉감: 15,
  부드럽: 18,
  실크: 24,
  모달: 25,
  레이온: 22,
  대나무: 23,
  프리미엄: 10,
  코튼: 12,
};

const SOFTNESS_NEGATIVE: Record<string, number> = {
  'polyester heavy': -20,
  polyester: -8,
  stiff: -18,
  thick fleece: -12,
  거칠: -14,
  딱딱: -16,
  뻣뻣: -15,
  플리스: -10,
  폴리에스터: -8,
};

const COMFORT_POSITIVE: Record<string, number> = {
  breathable: 18,
  lightweight: 14,
  stretch: 16,
  편안: 18,
  통기: 16,
  가벼움: 14,
  스트레치: 16,
  신축: 14,
  쿠션: 12,
  푹신: 14,
};

const COMFORT_NEGATIVE: Record<string, number> = {
  heavy: -12,
  tight: -10,
  무거움: -12,
  답답: -14,
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreByKeywords(
  text: string,
  positive: Record<string, number>,
  negative: Record<string, number>
): number {
  const normalized = normalizeText(text);
  let score = 50; // base
  for (const [keyword, weight] of Object.entries(positive)) {
    if (normalized.includes(keyword)) score += weight;
  }
  for (const [keyword, weight] of Object.entries(negative)) {
    if (normalized.includes(keyword)) score += weight;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreSoftness(product: ProductData): number {
  const text = [product.title, product.description, product.materials ?? ''].join(' ');
  return scoreByKeywords(text, SOFTNESS_POSITIVE, SOFTNESS_NEGATIVE);
}

export function scoreComfort(product: ProductData): number {
  const text = [product.title, product.description, product.materials ?? ''].join(' ');
  return scoreByKeywords(text, COMFORT_POSITIVE, COMFORT_NEGATIVE);
}

export function scoreProduct(product: ProductData): ScoredProduct {
  const softnessScore = scoreSoftness(product);
  const comfortScore = scoreComfort(product);
  const totalScore = softnessScore * 0.6 + comfortScore * 0.4;
  return {
    ...product,
    softnessScore,
    comfortScore,
    totalScore,
  };
}
