/**
 * API 입력값 검증: 길이 제한, 타입, URL 허용 도메인(SSRF 방지)
 */

const MAX_TEXT_LEN = 2000;
const MAX_QUERY_LEN = 500;
const MAX_LINKS = 5;
const MAX_CONDITIONS_LEN = 500;
const MAX_LIKES_ITEMS = 20;

/** 냥스널쇼퍼 허용 도메인 (SSRF 방지) — 필요 시 환경변수로 확장 */
const ALLOWED_SHOP_HOSTS = [
  'www.coupang.com', 'coupang.com',
  'shopping.naver.com', 'search.shopping.naver.com', 'smartstore.naver.com', 'brand.naver.com',
  'www.11st.co.kr', 'www.gmarket.co.kr', 'www.auction.co.kr',
  'www.tmon.co.kr', 'www.wemakeprice.com', 'www.interpark.com',
  'shopping.interpark.com', 'www.lotteon.com', 'www.ssg.com', 'www.naver.com', 'naver.com',
];

function toStr(v, maxLen = MAX_TEXT_LEN) {
  if (v == null) return '';
  const s = String(v).trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function toStrRequired(v, maxLen, fieldName) {
  const s = toStr(v, maxLen);
  if (!s) return { error: `${fieldName || '입력'}을(를) 입력해주세요.` };
  return { value: s };
}

/**
 * generate-reply: otherMsg, myThought, tone
 */
export function validateGenerateReply(body) {
  const otherMsg = toStr(body?.otherMsg, MAX_TEXT_LEN);
  const myThought = toStr(body?.myThought, MAX_TEXT_LEN);
  const tone = toStr(body?.tone, 50);
  if (!otherMsg && !myThought) return { error: '상대 메시지 또는 속마음을 입력해주세요.' };
  return { otherMsg, myThought, tone };
}

/**
 * search-whatwasit: query
 */
export function validateSearchWhatwasit(body) {
  const res = toStrRequired(body?.query, MAX_QUERY_LEN, '검색어');
  if (res.error) return res;
  return { query: res.value };
}

/**
 * recommend-deokflix: likes (배열 또는 문자열)
 */
export function validateRecommendDeokflix(body) {
  let likes = body?.likes;
  const arr = Array.isArray(likes) ? likes : (typeof likes === 'string' ? likes.split(/[,，\n]/).map((s) => s.trim()).filter(Boolean) : []);
  const limited = arr.slice(0, MAX_LIKES_ITEMS).map((s) => toStr(s, 100));
  if (limited.length === 0) return { error: '취향 키워드를 적어주세요.' };
  return { likes: limited };
}

/**
 * ask-fingerprince: question
 */
export function validateAskFingerprince(body) {
  const res = toStrRequired(body?.question, MAX_QUERY_LEN, '질문');
  if (res.error) return res;
  return { question: res.value };
}

/**
 * nyang-shopper: links (배열), conditions, mode
 * links는 URL 화이트리스트 검사 후 반환
 */
export function validateNyangShopper(body) {
  const mode = body?.mode === 'compare' ? 'compare' : 'analyze';
  const conditions = toStr(body?.conditions, MAX_CONDITIONS_LEN);
  let links = body?.links;
  const arr = Array.isArray(links) ? links : (links ? [links] : []);
  const trimmed = arr
    .filter((u) => u != null && String(u).trim())
    .map((u) => String(u).trim())
    .slice(0, MAX_LINKS);
  if (trimmed.length === 0) return { error: '상품 링크를 최소 1개 넣어주세요.' };

  const allowed = [];
  for (const url of trimmed) {
    const result = isAllowedShopUrl(url);
    if (result.allowed) allowed.push(result.url);
    else allowed.push(null); // 허용 안 되면 null로 두고 스크래퍼에서 스킵하거나 에러 처리
  }
  const invalidCount = allowed.filter((u) => u === null).length;
  if (invalidCount === allowed.length) return { error: '허용된 쇼핑 사이트 링크만 넣어주세요. (네이버, 쿠팡, 11번가, G마켓 등)' };
  if (invalidCount > 0) {
    // 일부만 허용: 허용된 것만 사용
  }
  const validLinks = allowed.filter(Boolean);
  return { links: validLinks, conditions, mode };
}

/**
 * URL이 허용된 쇼핑 호스트인지 검사 (SSRF 방지)
 */
export function isAllowedShopUrl(url) {
  if (!url || typeof url !== 'string') return { allowed: false };
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return { allowed: false };
  try {
    const u = new URL(trimmed);
    const host = u.hostname.toLowerCase();
    const allowed = ALLOWED_SHOP_HOSTS.some((h) => host === h || host.endsWith('.' + h));
    if (!allowed) return { allowed: false };
    return { allowed: true, url: trimmed };
  } catch {
    return { allowed: false };
  }
}

/**
 * 결제 confirm: paymentKey, orderId, amount
 */
export function validatePaymentConfirm(body) {
  const paymentKey = body?.paymentKey != null ? String(body.paymentKey).trim() : '';
  const orderId = body?.orderId != null ? String(body.orderId).trim() : '';
  const amount = typeof body?.amount === 'number' ? body.amount : Number(body?.amount);
  if (!paymentKey || paymentKey.length > 200) return { error: '결제 키가 올바르지 않습니다.' };
  if (!orderId || orderId.length > 64) return { error: '주문 ID가 올바르지 않습니다.' };
  if (!Number.isFinite(amount) || amount < 100 || amount > 10000000) return { error: '결제 금액이 올바르지 않습니다.' };
  return { paymentKey, orderId, amount };
}

export const LIMITS = {
  MAX_TEXT_LEN,
  MAX_QUERY_LEN,
  MAX_LINKS,
  MAX_CONDITIONS_LEN,
  MAX_LIKES_ITEMS,
};
