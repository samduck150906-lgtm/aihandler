import { ensureAnonymousSession } from '../lib/churuService.js';

export default async function sessionRoutes(fastify) {
  /** 현재 세션의 츄르 잔액 반환. 쿠키 없으면 새 익명 세션 생성 후 10개 지급 */
  fastify.get('/api/session', async (request, reply) => {
    const { session } = await ensureAnonymousSession(fastify, request, reply);
    return reply.send({ churuCount: session.churuCount, sessionId: session.sessionId });
  });
}
