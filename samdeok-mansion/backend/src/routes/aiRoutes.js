import OpenAI from 'openai';
import { scrapeProducts } from '../utils/productScraper.js';
import { ensureAnonymousSession, deductChuru } from '../lib/churuService.js';
import {
  validateGenerateReply,
  validateSearchWhatwasit,
  validateRecommendDeokflix,
  validateAskFingerprince,
  validateNyangShopper,
} from '../lib/validation.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const CHURU_COST = 1;
const CHURU_COST_REPLY = 2;

function openAiErrorMessage(err, fallback) {
  if (err?.status === 429) return '잠시 요청이 몰려있다냥 😿 곧 다시 시도해줘.';
  if (err?.code === 'ECONNRESET' || err?.message?.includes('fetch')) return 'AI 서버 연결이 불안정하다냥. 잠시 후 다시 시도해줘.';
  return fallback || '일시적인 오류가 났다냥. 잠시 후 다시 시도해줘.';
}

export default async function aiRoutes(fastify, options) {

  // 101호 대필 사무소
  fastify.post('/api/generate-reply', async (request, reply) => {
    await ensureAnonymousSession(fastify, request, reply);
    const ok = await deductChuru(fastify, request, reply, CHURU_COST_REPLY);
    if (!ok) return reply.status(402).send({ error: '츄르가 부족하다냥 😿', code: 'INSUFFICIENT_CHURU' });

    const validated = validateGenerateReply(request.body);
    if (validated.error) return reply.status(400).send({ error: validated.error });
    const { otherMsg, myThought, tone } = validated;
    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `당신은 대한민국 2030 세대의 메신저(카카오톡) 대화 전문가입니다.
사용자가 제공하는 [상대방의 메시지]와 [사용자의 속마음]을 바탕으로, 지정된 [말투]에 맞춰 자연스럽고 센스 있는 답장을 단 1개만 생성하세요.

<규칙>
1. 절대로 AI가 쓴 티가 나면 안 됩니다. 딱딱한 서면체 절대 금지.
2. 초성(ㅋㅋ, ㅎㅎ, ㅠㅠ)이나 물결(~), 이모티콘을 대화 톤에 맞춰 자연스럽게 한두 개만 섞어 쓰세요.
3. 길이는 카카오톡 말풍선 하나에 쏙 들어갈 정도(2~4문장)로 짧고 간결하게.
4. 설명이나 따옴표 없이, 카톡 입력창에 바로 복사+붙여넣기 할 수 있는 답장 텍스트만 출력하세요.`
          },
          {
            role: "user",
            content: `[상대방의 메시지]: ${otherMsg || ''}\n[내 속마음]: ${myThought || ''}\n[말투]: ${tone || ''} 느낌으로.`
          }
        ]
      });
      return reply.send({ reply: res.choices[0].message.content });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: openAiErrorMessage(err, '대필 요정 파업 중') });
    }
  });

  // 지하 1층 창고 (뭐였더라)
  fastify.post('/api/search-whatwasit', async (request, reply) => {
    await ensureAnonymousSession(fastify, request, reply);
    const ok = await deductChuru(fastify, request, reply, CHURU_COST);
    if (!ok) return reply.status(402).send({ error: '츄르가 부족하다냥 😿', code: 'INSUFFICIENT_CHURU' });

    const validated = validateSearchWhatwasit(request.body);
    if (validated.error) return reply.status(400).send({ error: validated.error });
    const { query } = validated;
    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: `당신은 희미한 기억을 정확히 찾아주는 탐정입니다.
사용자의 두루뭉술한 설명을 듣고 가장 일치하는 작품/물건의 제목, 짧은 설명, 해시태그 3개를 JSON으로 반환하세요.
형식: {"title": "제목", "desc": "설명", "tags": ["#태그1", "#태그2", "#태그3"]}`
          },
          { role: "user", content: query || '' }
        ],
        response_format: { type: "json_object" }
      });
      const result = JSON.parse(res.choices[0].message.content);
      return reply.send(result);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: openAiErrorMessage(err, '기억 창고 붕괴') });
    }
  });

  // 202호 상영관 (덕플릭스)
  fastify.post('/api/recommend-deokflix', async (request, reply) => {
    await ensureAnonymousSession(fastify, request, reply);
    const ok = await deductChuru(fastify, request, reply, CHURU_COST);
    if (!ok) return reply.status(402).send({ error: '츄르가 부족하다냥 😿', code: 'INSUFFICIENT_CHURU' });

    const validated = validateRecommendDeokflix(request.body);
    if (validated.error) return reply.status(400).send({ error: validated.error });
    const { likes: likesArr } = validated;
    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content: `당신은 탁월한 영화/드라마 큐레이터 '삼덕이(고양이)'입니다.
사용자의 취향 키워드를 분석해 딱 1개의 작품을 추천하세요.
고양이 말투(~다냥, ~라냥)를 사용하고, JSON으로 반환하세요.
형식: {"title": "작품명", "desc": "추천 이유(고양이 말투)", "platform": "시청 가능 OTT"}`
          },
          { role: "user", content: `나의 취향 키워드: ${likesArr.join(', ')}` }
        ],
        response_format: { type: "json_object" }
      });
      const result = JSON.parse(res.choices[0].message.content);
      return reply.send(result);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: openAiErrorMessage(err, '상영관 영사기 고장') });
    }
  });

  // 1층 관리실 (핑거프린스)
  fastify.post('/api/ask-fingerprince', async (request, reply) => {
    await ensureAnonymousSession(fastify, request, reply);
    const ok = await deductChuru(fastify, request, reply, CHURU_COST);
    if (!ok) return reply.status(402).send({ error: '츄르가 부족하다냥 😿', code: 'INSUFFICIENT_CHURU' });

    const validated = validateAskFingerprince(request.body);
    if (validated.error) return reply.status(400).send({ error: validated.error });
    const { question } = validated;
    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content: "당신은 사소한 질문에 즉시 명쾌하게 대답해주는 '삼덕이'입니다. 길게 설명하지 말고 핵심만 딱 짚어서 고양이 말투(~다냥)로 1~2문장으로 대답하세요."
          },
          { role: "user", content: question || '' }
        ]
      });
      return reply.send({ reply: res.choices[0].message.content });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: openAiErrorMessage(err, '관리실 낮잠 중') });
    }
  });

  // 301호 냥스널쇼퍼 (상품 분석 & 비교 추천)
  fastify.post('/api/nyang-shopper', async (request, reply) => {
    await ensureAnonymousSession(fastify, request, reply);
    const ok = await deductChuru(fastify, request, reply, CHURU_COST);
    if (!ok) return reply.status(402).send({ error: '츄르가 부족하다냥 😿', code: 'INSUFFICIENT_CHURU' });

    const validated = validateNyangShopper(request.body);
    if (validated.error) return reply.status(400).send({ error: validated.error });
    const { links: urlList, conditions, mode } = validated;

    try {
      let productContext = '';

      if (urlList.length > 0) {
        const scraped = await scrapeProducts(urlList, { concurrency: 2 });
        const parts = scraped.map((p, i) => {
          if (!p) return `[상품 ${i + 1}] (크롤링 실패)\nURL: ${urlList[i]}`;
          return `[상품 ${i + 1}]\n제목: ${p.title}\n가격: ${p.price}\n${p.description ? `설명: ${p.description.slice(0, 500)}${p.description.length > 500 ? '...' : ''}` : ''}\nURL: ${p.url}`;
        });
        productContext = parts.join('\n\n');
      }

      if (!productContext) {
        productContext = urlList.length ? urlList.map((u, i) => `[상품 ${i + 1}]: ${u}`).join('\n') : '(상품 링크 없음)';
      }

      const systemPrompt = mode === 'compare'
        ? `당신은 비교 쇼핑 전문가 '삼덕이(고양이)'입니다.
여러 상품을 비교 분석하여 사용자의 조건에 가장 맞는 상품을 추천하세요.
고양이 말투(~다냥, ~라냥)를 사용하세요.
JSON 형식으로 반환: {"type": "compare", "items": [{"name": "상품명", "price": "가격", "reason": "추천/비추천 이유", "isPick": true/false}]}
isPick은 가장 추천하는 상품 1개에만 true.`
        : `당신은 꼼꼼한 쇼핑 전문가 '삼덕이(고양이)'입니다.
사용자가 제공한 상품 링크의 정보를 분석하여, 장점 3개, 단점 2개, 삼덕이 총평을 작성하세요.
고양이 말투(~다냥, ~라냥)를 사용하세요.
JSON 형식으로 반환: {"type": "analyze", "analysis": {"productName": "상품명", "price": "가격", "pros": ["장점1", "장점2", "장점3"], "cons": ["단점1", "단점2"], "verdict": "삼덕이 총평"}}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.5,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `${productContext}\n\n[내 조건]: ${conditions || ''}\n\n위 상품 정보를 바탕으로 분석해줘.`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: openAiErrorMessage(error, '쇼핑백이 찢어졌다냥') });
    }
  });
}
