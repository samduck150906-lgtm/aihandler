import { getSessionIdFromRequest, ensureAnonymousSession, addChuruToSession, CHURU_PER_PAYMENT } from '../lib/churuService.js';
import { validatePaymentConfirm } from '../lib/validation.js';

export default async function paymentRoutes(fastify, options) {
  fastify.post('/payments/confirm', async (request, reply) => {
    const validated = validatePaymentConfirm(request.body);
    if (validated.error) {
      return reply.status(400).send({ success: false, error: validated.error });
    }
    const { paymentKey, orderId, amount } = validated;
    const userId = request.body?.userId;
    const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
    if (!secretKey) {
      return reply.status(500).send({ success: false, error: '결제 설정 없음' });
    }

    const uid = userId || request.user?.id;
    const sessionId = getSessionIdFromRequest(request);

    // orderId 기반 복구: 이미 처리된 결제면 중복 호출 방지 및 동일 응답
    const existingPayment = uid
      ? await fastify.prisma.payment.findUnique({ where: { orderId } })
      : null;
    const existingAnonymous = !uid
      ? await fastify.prisma.anonymousPayment.findUnique({ where: { orderId } })
      : null;

    if (existingPayment || existingAnonymous) {
      return reply.send({
        success: true,
        message: '결제 승인 및 츄르 충전 완료냥! 🐾',
        churuAdded: CHURU_PER_PAYMENT,
        alreadyProcessed: true,
      });
    }

    const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

    try {
      let response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${encryptedSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });
      if (!response.ok) {
        const tossData = await response.json().catch(() => ({}));
        const msg = tossData?.message || tossData?.code || '결제 승인에 실패했습니다.';
        return reply.status(400).send({ success: false, error: msg });
      }

      if (uid) {
        await fastify.prisma.$transaction([
          fastify.prisma.payment.create({
            data: { userId: uid, orderId, paymentKey, amount, status: 'DONE' },
          }),
          fastify.prisma.user.update({
            where: { id: uid },
            data: { churuCount: { increment: CHURU_PER_PAYMENT } },
          }),
        ]);
      } else {
        // 비로그인: 익명 세션 확보 후 결제 기록 + 츄르 충전
        const { sessionId: sid } = await ensureAnonymousSession(fastify, request, reply);
        await fastify.prisma.anonymousPayment.create({
          data: {
            orderId,
            sessionId: sid,
            paymentKey,
            amount,
            churuAdded: CHURU_PER_PAYMENT,
            status: 'DONE',
          },
        });
        await addChuruToSession(fastify, sid, CHURU_PER_PAYMENT);
      }

      return reply.send({
        success: true,
        message: '결제 승인 및 츄르 충전 완료냥! 🐾',
        churuAdded: CHURU_PER_PAYMENT,
      });
    } catch (error) {
      fastify.log.error('토스 결제 승인 실패:', error);
      const isNetwork = error?.cause?.code === 'ECONNRESET' || error?.name === 'TypeError';
      const msg = isNetwork ? '결제 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.' : '서버 내부 오류가 발생했습니다.';
      return reply.status(500).send({ success: false, error: msg });
    }
  });
}
