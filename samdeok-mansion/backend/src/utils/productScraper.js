/**
 * 상품 페이지 크롤러 — cheerio로 HTML 파싱, 사이트별/일반 폴백으로 상품 정보 추출
 * 동적 렌더링(쿠팡 등) 사이트는 초기 HTML만으로는 한계 있음 → 추후 puppeteer 연동 가능
 * SSRF 방지: 허용된 쇼핑 호스트만 요청 (validation.isAllowedShopUrl와 동일 목록)
 */

import * as cheerio from 'cheerio';
import { isAllowedShopUrl } from '../lib/validation.js';

const FETCH_TIMEOUT_MS = 12000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * URL에서 HTML 가져오기 (타임아웃 + User-Agent)
 */
async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * 가격처럼 보이는 문자열 추출 (숫자+원, 콤마 등)
 */
function extractPriceFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/(?:₩|원|\\s)?[\d,]+(?:\.\d+)?\s*원?/);
  return match ? match[0].trim() : null;
}

/**
 * HTML에서 가격 유사 텍스트 찾기
 */
function findPriceInDoc($) {
  const priceSelectors = [
    '.total-price strong',
    '.sale-price',
    '.price-value',
    '[class*="price"]',
    '[data-price]',
    'meta[property="product:price:amount"]',
  ];
  for (const sel of priceSelectors) {
    const el = $(sel).first();
    if (el.length) {
      const price = el.attr('content') || el.attr('data-price') || el.text();
      const normalized = extractPriceFromText(price);
      if (normalized) return normalized;
    }
  }
  const bodyText = $('body').text().replace(/\s+/g, ' ');
  return extractPriceFromText(bodyText);
}

/**
 * 쿠팡 — 초기 HTML에 JSON 데이터가 있는 경우 시도
 */
function tryCoupang($, html) {
  const out = { title: null, price: null, description: null };
  try {
    const jsonMatch = html.match(/<script[^>]*>.*?__PRELOADED_STATE__\s*=\s*({[\s\S]*?});?\s*<\/script>/);
    if (jsonMatch) {
      const raw = jsonMatch[1];
      const productMatch = raw.match(/"productName"\s*:\s*"([^"]+)"/);
      if (productMatch) out.title = productMatch[1].replace(/\\u[\da-f]{4}/gi, (m) => String.fromCharCode(parseInt(m.slice(2), 16)));
      const priceMatch = raw.match(/"salePrice"\s*:\s*(\d+)/);
      if (priceMatch) out.price = `${Number(priceMatch[1]).toLocaleString()}원`;
    }
  } catch (_) {}
  out.title = out.title || $('meta[property="og:title"]').attr('content');
  out.price = out.price || findPriceInDoc($);
  out.description = $('meta[property="og:description"]').attr('content');
  return out;
}

/**
 * 네이버 쇼핑 / 스마트스토어
 */
function tryNaver($) {
  return {
    title: $('meta[property="og:title"]').attr('content') || $('title').text().trim(),
    price: findPriceInDoc($) || $('meta[property="product:price:amount"]').attr('content') ? `${$('meta[property="product:price:amount"]').attr('content')}원` : null,
    description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
  };
}

/**
 * 11번가 / G마켓 등 — og + 일반 셀렉터
 */
function tryGeneric($) {
  const title = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
  const price = findPriceInDoc($);
  const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
  return { title, price, description };
}

/**
 * 단일 URL 크롤링 → { title, price, description, rawSummary } 또는 실패 시 null
 * 허용된 쇼핑 도메인이 아니면 요청하지 않음 (SSRF 방지)
 */
export async function scrapeProduct(url) {
  if (!url || typeof url !== 'string') return null;
  const { allowed, url: safeUrl } = isAllowedShopUrl(url);
  if (!allowed || !safeUrl) return null;

  try {
    const html = await fetchHtml(safeUrl);
    if (!html) return null;

    const $ = cheerio.load(html, { decodeEntities: true });
    let info = { title: null, price: null, description: null };

    const host = new URL(safeUrl).hostname.toLowerCase();
    if (host.includes('coupang.com')) {
      info = tryCoupang($, html);
    } else if (host.includes('naver') || host.includes('smartstore') || host.includes('shopping')) {
      info = tryNaver($);
    } else {
      info = tryGeneric($);
    }

    const rawSummary = [info.title, info.price, info.description].filter(Boolean).join(' | ');
    return {
      url: safeUrl,
      title: info.title || '(제목 없음)',
      price: info.price || '(가격 정보 없음)',
      description: info.description || '',
      rawSummary: rawSummary || trimmed,
    };
  } catch (err) {
    return null;
  }
}

/**
 * 여러 URL 순차 크롤링 (동시 요청 제한으로 차단 완화)
 */
export async function scrapeProducts(links, options = {}) {
  const { concurrency = 2, onProgress } = options;
  const results = [];
  const list = [...(links || [])].filter((u) => u && String(u).trim().startsWith('http'));

  for (let i = 0; i < list.length; i += concurrency) {
    const chunk = list.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map((url) => scrapeProduct(url)));
    results.push(...chunkResults);
    if (onProgress && typeof onProgress === 'function') {
      onProgress({ done: results.length, total: list.length });
    }
  }

  return results;
}
