/**
 * Multi-page category scanner.
 * Detects pagination automatically; collects all product URLs with concurrency & retry.
 */

import * as cheerio from 'cheerio';
import type { SelectorConfig } from './types.js';
import { REQUEST_TIMEOUT_MS, CONCURRENCY_LIMIT, MAX_RETRIES } from './types.js';

const PAGINATION_PARAMS = ['page', 'p', 'pg', 'offset', 'start', 'cursor'];
const PRODUCT_PATH_HINTS = ['/product', '/pd/', '/item', '/gp/', '/goods/', '/prd/', '/detail'];

export interface ScannerOptions {
  signal?: AbortSignal;
  config?: SelectorConfig;
  onProgress?: (scannedPages: number, collectedProducts: number) => void;
}

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
  if (signal) {
    signal.addEventListener('abort', abort, { once: true });
  }
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
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (e) {
    if (signal) signal.removeEventListener('abort', abort);
    clearTimeout(timeoutId);
    throw e;
  }
  if (signal) signal.removeEventListener('abort', abort);
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
      if (i < retries) await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr ?? new Error('Fetch failed');
}

function getBaseUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return url;
  }
}

function isSameOrigin(href: string, baseOrigin: string): boolean {
  try {
    const u = new URL(href, baseOrigin);
    const base = new URL(baseOrigin);
    return u.origin === base.origin;
  } catch {
    return false;
  }
}

function looksLikeProductPath(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return PRODUCT_PATH_HINTS.some((h) => lower.includes(h)) || /\/[a-z0-9-]+\/[a-z0-9-]+/i.test(pathname);
}

function extractPageUrls($: cheerio.CheerioAPI, baseUrl: string, config?: SelectorConfig): string[] {
  const seen = new Set<string>();
  const base = new URL(baseUrl);
  const pageParamNames = config?.pagination?.pageParam ?? PAGINATION_PARAMS;

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    try {
      const u = new URL(href, baseUrl);
      if (u.origin !== base.origin) return;
      const param = pageParamNames.find((p) => u.searchParams.has(p));
      if (param) {
        u.searchParams.sort();
        seen.add(u.toString());
      }
    } catch {
      // ignore invalid URLs
    }
  });

  return Array.from(seen);
}

function extractProductUrlsFromPage(
  $: cheerio.CheerioAPI,
  categoryUrl: string,
  config?: SelectorConfig
): string[] {
  const base = getBaseUrl(categoryUrl);
  const origin = new URL(categoryUrl).origin;
  const seen = new Set<string>();

  const listContainer = config?.productList?.listContainer;
  const itemSel = config?.productList?.item;
  const linkSel = config?.productList?.productLink;

  const $container = listContainer ? $(listContainer).first() : $.root();
  const $items = itemSel ? $container.find(itemSel) : $container.find('a[href]');

  $items.each((_, el) => {
    const $link = linkSel ? $(el).find(linkSel).first() : $(el);
    const href = $link.attr('href') ?? $(el).attr('href');
    if (!href) return;
    try {
      const u = new URL(href, categoryUrl);
      if (!isSameOrigin(u.toString(), origin)) return;
      const path = u.pathname;
      if (!path || path === '/' || path === new URL(categoryUrl).pathname) return;
      if (config?.productList?.productLink || looksLikeProductPath(path)) {
        u.hash = '';
        u.search = ''; // normalize
        seen.add(u.toString());
      }
    } catch {
      // ignore
    }
  });

  if (seen.size === 0) {
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      try {
        const u = new URL(href, categoryUrl);
        if (u.origin !== origin) return;
        if (looksLikeProductPath(u.pathname)) {
          u.hash = '';
          u.search = '';
          seen.add(u.toString());
        }
      } catch {
        // ignore
      }
    });
  }

  return Array.from(seen);
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
  signal?: AbortSignal
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker(): Promise<void> {
    while (index < items.length) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const i = index++;
      const item = items[i];
      const r = await fn(item, i);
      results[i] = r;
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * Collect ALL product URLs from a category (all pages).
 */
export async function collectAllProducts(
  categoryUrl: string,
  options: ScannerOptions = {}
): Promise<{ productUrls: string[]; scannedPages: number }> {
  const { signal, config, onProgress } = options;
  const productUrlSet = new Set<string>();
  let scannedPages = 0;

  const html = await fetchWithRetry(categoryUrl, signal);
  const $ = cheerio.load(html);
  const base = new URL(categoryUrl);

  const pageUrls = extractPageUrls($, categoryUrl, config);
  const allPageUrls = [categoryUrl, ...pageUrls.filter((u) => u !== categoryUrl)];
  const uniquePages = Array.from(new Set(allPageUrls));
  const collectedByPage: string[][] = await runWithConcurrency(
    uniquePages,
    CONCURRENCY_LIMIT,
    async (pageUrl) => {
      const pageHtml = await fetchWithRetry(pageUrl, signal);
      const $page = cheerio.load(pageHtml);
      return extractProductUrlsFromPage($page, pageUrl, config);
    },
    signal
  );
  collectedByPage.flat().forEach((u) => productUrlSet.add(u));
  scannedPages = uniquePages.length;
  onProgress?.(scannedPages, productUrlSet.size);

  return {
    productUrls: Array.from(productUrlSet),
    scannedPages,
  };
}
