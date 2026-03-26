/**
 * In-memory job store for async scan progress/result.
 */

import type { JobState, ScanProgress, NyangScanResult } from './types.js';

const jobs = new Map<string, JobState>();

export function createJob(): string {
  const jobId = `nyang_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  jobs.set(jobId, {
    status: 'pending',
    createdAt: Date.now(),
  });
  return jobId;
}

export function getJob(jobId: string): JobState | undefined {
  return jobs.get(jobId);
}

export function setJobProgress(jobId: string, progress: ScanProgress): void {
  const job = jobs.get(jobId);
  if (job) {
    job.progress = progress;
    job.status = 'running';
  }
}

export function setJobResult(jobId: string, result: NyangScanResult): void {
  const job = jobs.get(jobId);
  if (job) {
    job.status = 'done';
    job.result = result;
    job.progress = {
      phase: 'done',
      scannedPages: result.scannedPages,
      collectedProducts: result.analyzedCount,
      analyzedCount: result.analyzedCount,
    };
  }
}

export function setJobError(jobId: string, error: string): void {
  const job = jobs.get(jobId);
  if (job) {
    job.status = 'error';
    job.error = error;
  }
}

export function setJobAborted(jobId: string): void {
  const job = jobs.get(jobId);
  if (job) job.status = 'aborted';
}

export function startJob(jobId: string): void {
  const job = jobs.get(jobId);
  if (job) job.status = 'running';
}
