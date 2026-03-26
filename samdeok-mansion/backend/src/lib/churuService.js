/**
 * 츄르 잔액 조회/차감/충전 (익명 세션 또는 User 기준)
 * - 익명: AnonymousSession
 * - 로그인: User.churuCount (기존)
 */

const TRIAL_CHURU = 10;
const CHURU_PER_PAYMENT = 25;
const SESSION_COOKIE_NAME = 'mansion_session';
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30일
};
const MAX_TRIAL_SESSIONS_PER_IP_PER_24H = 3; // 같은 IP에서 체험 세션 3개 초과 시 0개 지급

/**
 * 요청에서 세션 ID 추출 (쿠키 또는 헤더)
 */
function getSessionIdFromRequest(request) {
  const cookie = request.cookies?.[SESSION_COOKIE_NAME];
  if (cookie) return cookie;
  return request.headers['x-session-id'] || null;
}

/**
 * 익명 세션 확보: 없으면 생성 후 쿠키 설정
 */
async function ensureAnonymousSession(fastify, request, reply) {
  let sessionId = getSessionIdFromRequest(request);
  let session = null;

  if (sessionId) {
    session = await fastify.prisma.anonymousSession.findUnique({
      where: { sessionId },
    });
  }

  if (!session) {
    sessionId = crypto.randomUUID();
    const clientIp = request.ip || null;
    let initialChuru = TRIAL_CHURU;
    if (clientIp) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const count = await fastify.prisma.anonymousSession.count({
        where: { clientIp, createdAt: { gte: since } },
      });
      if (count >= MAX_TRIAL_SESSIONS_PER_IP_PER_24H) initialChuru = 0;
    }
    session = await fastify.prisma.anonymousSession.create({
      data: { sessionId, churuCount: initialChuru, clientIp },
    });
    reply.setCookie(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS);
  }

  return { sessionId, session };
}

/**
 * 현재 츄르 잔액 반환 (익명 세션만 지원, 로그인은 추후 확장)
 */
async function getChuruBalance(fastify, request, reply) {
  const { session } = await ensureAnonymousSession(fastify, request, reply);
  return session.churuCount;
}

/**
 * 츄르 차감. 부족하면 false, 성공하면 true
 */
async function deductChuru(fastify, request, reply, cost) {
  const { sessionId, session } = await ensureAnonymousSession(fastify, request, reply);
  if (session.churuCount < cost) return false;
  await fastify.prisma.anonymousSession.update({
    where: { sessionId },
    data: { churuCount: { decrement: cost } },
  });
  return true;
}

/**
 * 익명 세션에 츄르 충전 (결제 완료 시)
 */
async function addChuruToSession(fastify, sessionId, amount) {
  if (!sessionId || amount <= 0) return false;
  await fastify.prisma.anonymousSession.update({
    where: { sessionId },
    data: { churuCount: { increment: amount } },
  });
  return true;
}

export {
  TRIAL_CHURU,
  CHURU_PER_PAYMENT,
  SESSION_COOKIE_NAME,
  getSessionIdFromRequest,
  ensureAnonymousSession,
  getChuruBalance,
  deductChuru,
  addChuruToSession,
};
