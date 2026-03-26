/**
 * Recommendation engine: rank by softnessScore * 0.6 + comfortScore * 0.4, return TOP 3.
 */

import type { ScoredProduct } from './types.js';
import { scoreProduct } from './scorer.js';
import type { ProductData } from './types.js';

const SOFTNESS_WEIGHT = 0.6;
const COMFORT_WEIGHT = 0.4;

export function rankProducts(products: ProductData[]): ScoredProduct[] {
  const scored = products.map((p) => scoreProduct(p));
  return scored.sort((a, b) => b.totalScore - a.totalScore);
}

export function getTopN(scored: ScoredProduct[], n: number = 3): ScoredProduct[] {
  return scored.slice(0, n);
}

export function getBestProduct(ranking: ScoredProduct[]): ScoredProduct | null {
  return ranking[0] ?? null;
}
