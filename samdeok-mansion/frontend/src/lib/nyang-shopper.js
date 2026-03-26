/**
 * 냥스널쇼퍼 추천 로직 (Product 타입은 nyang-shopper-types.ts 참고)
 * @param {Array<{ id: string, name: string, price: number, category: string, nyangScore: number, tags: string[] }>} products
 * @param {string[]} butlerPreference - 집사 취향 태그
 * @returns {Array} 상위 3개 추천
 */
export function getNyangRecommendation(products, butlerPreference) {
  return products
    .filter((p) => p.tags.some((tag) => butlerPreference.includes(tag)))
    .sort((a, b) => b.nyangScore - a.nyangScore)
    .slice(0, 3);
}
