/**
 * 냥스널쇼퍼 (Nyangsnal Shopper) — 타입 정의
 * No hardcoded site-specific selectors; configurable per request.
 */

export interface ProductData {
  url: string;
  title: string;
  description: string;
  price?: number;
  materials?: string;
  reviews?: string[];
  optionInfo?: string;
}

export interface ScoredProduct extends ProductData {
  softnessScore: number;
  comfortScore: number;
  totalScore: number;
}

/** Configurable CSS selector map for any site */
export interface SelectorConfig {
  pagination?: {
    /** Selector for container that holds page links */
    container?: string;
    /** Selector for next page link (single link) */
    nextLink?: string;
    /** Selector for each page link (e.g. a[href*="page="]) */
    pageLinks?: string;
    /** Query param names to try for page number: page, p, pg, etc. */
    pageParam?: string[];
    /** Selector for product list container */
    listContainer?: string;
  };
  productList?: {
    /** Container wrapping all product items */
    listContainer?: string;
    /** Each product item block */
    item?: string;
    /** Link to product detail inside item */
    productLink?: string;
  };
  productDetail?: {
    title?: string;
    price?: string;
    description?: string;
    materials?: string;
    reviews?: string;
    reviewItems?: string;
    optionInfo?: string;
  };
}

export interface ScanProgress {
  phase: 'pagination' | 'collecting' | 'extracting' | 'scoring' | 'done';
  scannedPages: number;
  collectedProducts: number;
  analyzedCount: number;
  currentPage?: number;
  totalPages?: number;
}

export interface NyangScanResult {
  bestProduct: ScoredProduct | null;
  ranking: ScoredProduct[];
  analyzedCount: number;
  scannedPages: number;
}

export interface JobState {
  status: 'pending' | 'running' | 'done' | 'error' | 'aborted';
  progress?: ScanProgress;
  result?: NyangScanResult;
  error?: string;
  createdAt: number;
}

export const REQUEST_TIMEOUT_MS = 8000;
export const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min
export const CONCURRENCY_LIMIT = 5;
export const MAX_RETRIES = 2;
