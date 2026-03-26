/**
 * In-memory cache for scanned category results.
 * TTL: 10 minutes.
 */

import type { NyangScanResult } from './types.js';
import { CACHE_TTL_MS } from './types.js';

const cache = new Map<string, { result: NyangScanResult; expiresAt: number }>();

export function getCached(key: string): NyangScanResult | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.result;
}

export function setCached(key: string, result: NyangScanResult): void {
  cache.set(key, {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function cacheKey(categoryUrl: string): string {
  try {
    const u = new URL(categoryUrl);
    u.searchParams.sort();
    return u.toString();
  } catch {
    return categoryUrl;
  }
}
