/**
 * 냥스널쇼퍼 API: async scan with job polling.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jobAbortControllers = new Map();

async function loadNyangsnal() {
  const modulePath = path.resolve(__dirname, '../../nyangshopper/dist/index.js');
  return import(pathToFileURL(modulePath).href);
}

export default async function nyangShopperRoutes(fastify) {
  fastify.post('/api/nyangshopper/scan', async (request, reply) => {
    const { categoryUrl, selectors } = request.body || {};
    if (!categoryUrl || typeof categoryUrl !== 'string') {
      return reply.status(400).send({ error: 'categoryUrl is required' });
    }
    let nyang;
    try {
      nyang = await loadNyangsnal();
    } catch (e) {
      fastify.log.error(e);
      return reply.status(500).send({ error: 'Nyangsnal Shopper module not built. Run: npm run build:nyang' });
    }
    const jobId = nyang.createJob();
    const controller = new AbortController();
    jobAbortControllers.set(jobId, controller);
    nyang.startJob(jobId);
    nyang.runPipeline({
      categoryUrl,
      selectors,
      signal: controller.signal,
      useCache: true,
      onProgress: (progress) => nyang.setJobProgress(jobId, progress),
    })
      .then((result) => {
        jobAbortControllers.delete(jobId);
        nyang.setJobResult(jobId, result);
      })
      .catch((err) => {
        jobAbortControllers.delete(jobId);
        if (err?.name === 'AbortError') nyang.setJobAborted(jobId);
        else nyang.setJobError(jobId, err?.message ?? String(err));
      });
    return reply.send({ jobId });
  });

  fastify.get('/api/nyangshopper/scan/result/:jobId', async (request, reply) => {
    const { jobId } = request.params;
    let nyang;
    try {
      nyang = await loadNyangsnal();
    } catch (e) {
      return reply.status(500).send({ error: 'Module not built' });
    }
    const job = nyang.getJob(jobId);
    if (!job) return reply.status(404).send({ error: 'Job not found' });
    return reply.send({
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
    });
  });

  fastify.delete('/api/nyangshopper/scan/:jobId', async (request, reply) => {
    const { jobId } = request.params;
    const controller = jobAbortControllers.get(jobId);
    if (controller) {
      controller.abort();
      jobAbortControllers.delete(jobId);
    }
    try {
      const nyang = await loadNyangsnal();
      nyang.setJobAborted(jobId);
    } catch (_) {}
    return reply.send({ ok: true });
  });
}
