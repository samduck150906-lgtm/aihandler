/**
 * 냥스널쇼퍼 상품 타입
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'fashion' | 'living' | 'beauty' | 'pet';
  nyangScore: number; // 냥스널쇼퍼만의 추천 점수 (1~10)
  tags: string[];
}

/**
 * 집사의 취향에 맞는 상품을 필터링하는 냥스널 로직
 */
export const getNyangRecommendation = (
  products: Product[],
  butlerPreference: string[]
): Product[] => {
  return products
    .filter((p) => p.tags.some((tag) => butlerPreference.includes(tag)))
    .sort((a, b) => b.nyangScore - a.nyangScore)
    .slice(0, 3); // 상위 3개 추천냥!
};
