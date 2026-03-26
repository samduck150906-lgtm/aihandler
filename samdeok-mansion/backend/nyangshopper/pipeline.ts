/**
 * Full pipeline: scan → extract → score → recommend.
 * With cache, AbortController, progress callback.
 */

import { collectAllProducts } from './scanner.js';
import { extractProductData } from './extractor.js';
import { rankProducts, getTopN, getBestProduct } from './recommender.js';
import { getCached, setCached, cacheKey } from './cache.js';
import type { SelectorConfig, ScanProgress, NyangScanResult } from './types.js';
import { CONCURRENCY_LIMIT } from './types.js';

const EXTRACT_CONCURRENCY = CONCURRENCY_LIMIT;

export interface PipelineOptions {
  categoryUrl: string;
  selectors?: SelectorConfig;
  signal?: AbortSignal;
  useCache?: boolean;
  onProgress?: (progress: ScanProgress) => void;
}

export async function runPipeline(options: PipelineOptions): Promise<NyangScanResult> {
  const { categoryUrl, selectors, signal, useCache = true, onProgress } = options;

  const key = cacheKey(categoryUrl);
  if (useCache) {
    const cached = getCached(key);
    if (cached) {
      onProgress?.({
        phase: 'done',
        scannedPages: cached.scannedPages,
        collectedProducts: cached.ranking.length + (cached.analyzedCount - cached.ranking.length),
        analyzedCount: cached.analyzedCount,
      });
      return cached;
    }
  }

  onProgress?.({ phase: 'pagination', scannedPages: 0, collectedProducts: 0 });

  const { productUrls, scannedPages } = await collectAllProducts(categoryUrl, {
    signal,
    config: selectors,
    onProgress: (pages, collected) => {
      onProgress?.({
        phase: 'collecting',
        scannedPages: pages,
        collectedProducts: collected,
        analyzedCount: 0,
      });
    },
  });

  onProgress?.({
    phase: 'extracting',
    scannedPages,
    collectedProducts: productUrls.length,
    analyzedCount: 0,
  });

  const productDataList: Awaited<ReturnType<typeof extractProductData>>[] = [];
  for (let i = 0; i < productUrls.length; i += EXTRACT_CONCURRENCY) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const chunk = productUrls.slice(i, i + EXTRACT_CONCURRENCY);
    const results = await Promise.all(
      chunk.map((url) =>
        extractProductData(url, { signal, config: selectors })
      )
    );
    productDataList.push(...results);
    onProgress?.({
      phase: 'extracting',
      scannedPages,
      collectedProducts: productUrls.length,
      analyzedCount: productDataList.length,
    });
  }

  const valid = productDataList.filter((p): p is NonNullable<typeof p> => p != null);

  onProgress?.({ phase: 'scoring', scannedPages, collectedProducts: productUrls.length, analyzedCount: valid.length });

  const ranking = getTopN(rankProducts(valid), 3);
  const bestProduct = getBestProduct(ranking);
  const result: NyangScanResult = {
    bestProduct,
    ranking,
    analyzedCount: valid.length,
    scannedPages,
  };

  if (useCache) setCached(key, result);
  onProgress?.({ phase: 'done', scannedPages, collectedProducts: productUrls.length, analyzedCount: valid.length });

  return result;
}
