/**
 * 추천 멘트 생성 (AI API 호출용 / 냥스널쇼퍼 말풍선)
 * @param {string} productName - 상품명
 * @param {number} price - 가격
 * @returns {string} 고양이 말투 추천 멘트
 */
export function generateNyangMessage(productName, price) {
  const messages = [
    `이 ${productName}은(는) 집사에게 정말 잘 어울릴 것 같다냥! 가격도 ${price.toLocaleString()}원이면 츄르 몇 개만 아끼면 된다냥.`,
    `내 예리한 수염이 이 상품을 가리키고 있다냥. ${productName}, 이건 꼭 사야 한다냥!`,
    `집사, 아직도 고민 중이냥? 이 ${productName}은 금방 품절될 것 같은 예감이 든다냥!`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
