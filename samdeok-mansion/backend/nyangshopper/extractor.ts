/**
 * Product detail extractor.
 * Uses configurable CSS selectors; no hardcoded site-specific selectors.
 */

import * as cheerio from 'cheerio';
import type { ProductData, SelectorConfig } from './types.js';
import { REQUEST_TIMEOUT_MS, MAX_RETRIES } from './types.js';

async function fetchWithTimeout(
  url: string,
  signal?: AbortSignal,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => {
    clearTimeout(timeoutId);
    controller.abort();
  };
  if (signal) signal.addEventListener('abort', abort, { once: true });
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; NyangsnalShopper/1.0; +https://samdeok-mansion)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener('abort', abort);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    if (signal) signal.removeEventListener('abort', abort);
    clearTimeout(timeoutId);
    throw e;
  }
}

async function fetchWithRetry(
  url: string,
  signal?: AbortSignal,
  retries: number = MAX_RETRIES
): Promise<string> {
  let lastErr: Error | null = null;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchWithTimeout(url, signal);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      if (i < retries) await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw lastErr ?? new Error('Fetch failed');
}

function getText($: cheerio.CheerioAPI, selector: string | undefined, fallbackSel?: string): string {
  if (selector) {
    const t = $(selector).first().text().trim();
    if (t) return t;
  }
  if (fallbackSel) {
    const t = $(fallbackSel).first().text().trim();
    if (t) return t;
  }
  return '';
}

function getPrice($: cheerio.CheerioAPI, selector: string | undefined): number | undefined {
  const raw = selector ? $(selector).first().text().trim() : '';
  const match = raw.replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : undefined;
}

export interface ExtractorOptions {
  signal?: AbortSignal;
  config?: SelectorConfig;
}

/**
 * Extract product data from a single product page.
 */
export async function extractProductData(
  productUrl: string,
  options: ExtractorOptions = {}
): Promise<ProductData | null> {
  const { signal, config } = options;
  const detail = config?.productDetail;

  try {
    const html = await fetchWithRetry(productUrl, signal);
    const $ = cheerio.load(html);

    const title =
      getText($, detail?.title) ||
      getText($, 'h1') ||
      getText($, '[data-product-name]') ||
      getText($, '.product-title') ||
      $('title').first().text().trim();
    const description =
      getText($, detail?.description) ||
      getText($, '[name="description"]') ||
      getText($, '.product-description') ||
      getText($, '#description') ||
      getText($, '.detail');
    const materials = getText($, detail?.materials) || getText($, '.material') || getText($, '[class*="material"]');
    const price = getPrice($, detail?.price) ?? getPrice($, '[class*="price"]') ?? getPrice($, '[data-price]');

    const reviews: string[] = [];
    const reviewSel = detail?.reviewItems ?? detail?.reviews;
    if (reviewSel) {
      $(reviewSel).each((_, el) => {
        const t = $(el).text().trim();
        if (t && t.length < 500) reviews.push(t);
      });
    }
    const optionInfo = getText($, detail?.optionInfo) || getText($, '.option') || getText($, '[class*="option"]');

    return {
      url: productUrl,
      title: title || new URL(productUrl).pathname.split('/').pop() || productUrl,
      description,
      price,
      materials: materials || undefined,
      reviews: reviews.length ? reviews : undefined,
      optionInfo: optionInfo || undefined,
    };
  } catch {
    return null;
  }
}
