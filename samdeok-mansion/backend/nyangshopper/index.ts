/**
 * 냥스널쇼퍼 (Nyangsnal Shopper) — public API
 */

export { runPipeline } from './pipeline.js';
export type { PipelineOptions } from './pipeline.js';
export type {
  ProductData,
  ScoredProduct,
  SelectorConfig,
  ScanProgress,
  NyangScanResult,
  JobState,
} from './types.js';
export { scoreProduct, scoreSoftness, scoreComfort } from './scorer.js';
export { getCached, setCached, cacheKey } from './cache.js';
export {
  createJob,
  getJob,
  setJobProgress,
  setJobResult,
  setJobError,
  setJobAborted,
  startJob,
} from './jobStore.js';
