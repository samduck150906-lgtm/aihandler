import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';
import aiRoutes from './routes/aiRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import nyangShopperRoutes from './routes/nyangShopperRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

fastify.decorate('prisma', prisma);

await fastify.register(cors, { origin: true, credentials: true });
await fastify.register(cookie, { secret: process.env.COOKIE_SECRET || 'mansion-cookie-secret-change-in-production' });
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: 15 * 60 * 1000, // 15분당 100회 (IP 기준)
  message: { error: '요청이 너무 많다냥 😿 잠시 후 다시 시도해주세요.' },
});
await fastify.register(sessionRoutes);
await fastify.register(aiRoutes);
await fastify.register(paymentRoutes);
await fastify.register(nyangShopperRoutes);

fastify.listen({ port: 4000, host: '0.0.0.0' }, (err) => {
  if (err) { fastify.log.error(err); process.exit(1); }
});
