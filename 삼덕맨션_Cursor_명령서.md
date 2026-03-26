# 🐾 삼덕맨션 풀스택 구축 — Cursor AI 명령서

---

## 프로젝트 개요

"삼덕맨션"은 11년 차 건물주 치즈냥이 '삼덕이'가 운영하는 AI 유틸리티 웹앱이다. 5개의 방(기능)을 하나의 웹 포털에 묶고, '츄르'라는 통합 재화로 과금하는 구조다. 프론트엔드는 React + Tailwind + Zustand, 백엔드는 Fastify + Prisma + PostgreSQL, 결제는 토스페이먼츠를 사용한다.

---

## 1단계: 프로젝트 초기 세팅

### 폴더 구조 생성

```
samdeok-mansion/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── TossPaymentSheet.jsx    # 공용 결제 바텀시트
│   │   ├── pages/
│   │   │   ├── SamdeokMansion.jsx      # 메인 로비 (홈)
│   │   │   ├── ReplyRoom.jsx           # 101호 대필 사무소
│   │   │   ├── WhatWasItRoom.jsx       # 지하 1층 창고
│   │   │   ├── DeokflixRoom.jsx        # 202호 상영관
│   │   │   ├── FingerPrinceRoom.jsx    # 1층 관리실
│   │   │   └── GolapingRoom.jsx        # 옥상 라운지
│   │   ├── store/
│   │   │   └── useMansionStore.js      # Zustand 전역 상태
│   │   └── App.jsx                     # React Router
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── routes/
│   │   │   ├── aiRoutes.js             # OpenAI 4개 방 AI 라우터
│   │   │   └── paymentRoutes.js        # 토스페이먼츠 승인 API
│   │   └── server.js                   # Fastify 서버 엔트리
│   ├── .env
│   └── package.json
└── docker-compose.yml
```

### 패키지 설치

**프론트엔드:**
```bash
cd frontend
npm create vite@latest . -- --template react
npm install zustand react-router-dom @tosspayments/payment-widget-sdk
npm install -D tailwindcss @tailwindcss/vite
```

**백엔드:**
```bash
cd backend
npm init -y
npm install fastify @fastify/cors openai @prisma/client
npm install -D prisma nodemon
npx prisma init
```

---

## 2단계: 백엔드 DB 스키마 (Prisma)

`backend/prisma/schema.prisma` 파일을 아래와 같이 작성하라.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String          @id @default(uuid())
  provider      String          // "kakao", "google", "apple"
  snsId         String          @unique
  nickname      String?
  churuCount    Int             @default(10) // 웰컴 츄르 10개

  payments      Payment[]
  histories     UsageHistory[]

  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model Payment {
  id            String   @id @default(uuid())
  user          User     @relation(fields: [userId], references: [id])
  userId        String

  orderId       String   @unique
  paymentKey    String?  @unique
  amount        Int
  churuAdded    Int      @default(25)
  status        String   // "READY", "DONE", "CANCELED"

  createdAt     DateTime @default(now())
}

model UsageHistory {
  id            String   @id @default(uuid())
  user          User     @relation(fields: [userId], references: [id])
  userId        String

  roomType      String   // "REPLY", "WHATWASIT", "DEOKFLIX", "FINGER", "GOLAPING"
  cost          Int
  promptData    Json
  resultData    Json

  createdAt     DateTime @default(now())
}
```

`npx prisma migrate dev --name init`으로 마이그레이션 실행.

---

## 3단계: 백엔드 서버 & API 라우트

### server.js (Fastify 엔트리)

```javascript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import aiRoutes from './routes/aiRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

fastify.decorate('prisma', prisma);
await fastify.register(cors, { origin: true });
await fastify.register(aiRoutes);
await fastify.register(paymentRoutes);

fastify.listen({ port: 4000, host: '0.0.0.0' }, (err) => {
  if (err) { fastify.log.error(err); process.exit(1); }
});
```

### aiRoutes.js — 4개 방의 OpenAI 엔드포인트

각 방마다 역할에 맞는 system prompt와 temperature를 다르게 설정한다.

| 방 | 엔드포인트 | model | temp | system prompt 핵심 |
|---|---|---|---|---|
| 101호 대필 사무소 | POST `/api/generate-reply` | gpt-4o-mini | 0.7 | "2030 카톡 전문가. AI 티 절대 금지. 2~4문장. 초성/이모티콘 자연스럽게." |
| 지하 창고 | POST `/api/search-whatwasit` | gpt-4o-mini | 0.3 | "기억 탐정. JSON 반환: {title, desc, tags[3개]}. response_format: json_object" |
| 202호 상영관 | POST `/api/recommend-deokflix` | gpt-4o-mini | 0.8 | "영화 큐레이터 삼덕이(고양이 말투). JSON: {title, desc, platform}" |
| 1층 관리실 | POST `/api/ask-fingerprince` | gpt-4o-mini | 0.5 | "사소한 질문 전문. 고양이 말투. 1~2문장만." |

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function aiRoutes(fastify, options) {

  // 101호 대필 사무소
  fastify.post('/api/generate-reply', async (request, reply) => {
    const { otherMsg, myThought, tone } = request.body;
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
            content: `[상대방의 메시지]: ${otherMsg}\n[내 속마음]: ${myThought}\n[말투]: ${tone} 느낌으로.`
          }
        ]
      });
      return reply.send({ reply: res.choices[0].message.content });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: '대필 요정 파업 중' });
    }
  });

  // 지하 1층 창고 (뭐였더라)
  fastify.post('/api/search-whatwasit', async (request, reply) => {
    const { query } = request.body;
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
          { role: "user", content: query }
        ],
        response_format: { type: "json_object" }
      });
      const result = JSON.parse(res.choices[0].message.content);
      return reply.send(result);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: '기억 창고 붕괴' });
    }
  });

  // 202호 상영관 (덕플릭스)
  fastify.post('/api/recommend-deokflix', async (request, reply) => {
    const { likes } = request.body;
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
          { role: "user", content: `나의 취향 키워드: ${likes.join(', ')}` }
        ],
        response_format: { type: "json_object" }
      });
      const result = JSON.parse(res.choices[0].message.content);
      return reply.send(result);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: '상영관 영사기 고장' });
    }
  });

  // 1층 관리실 (핑거프린스)
  fastify.post('/api/ask-fingerprince', async (request, reply) => {
    const { question } = request.body;
    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content: "당신은 사소한 질문에 즉시 명쾌하게 대답해주는 '삼덕이'입니다. 길게 설명하지 말고 핵심만 딱 짚어서 고양이 말투(~다냥)로 1~2문장으로 대답하세요."
          },
          { role: "user", content: question }
        ]
      });
      return reply.send({ reply: res.choices[0].message.content });
    } catch (err) {
      return reply.status(500).send({ error: '관리실 낮잠 중' });
    }
  });
}
```

### paymentRoutes.js — 토스페이먼츠 결제 승인 API

```javascript
export default async function paymentRoutes(fastify, options) {
  fastify.post('/payments/confirm', async (request, reply) => {
    const { paymentKey, orderId, amount } = request.body;
    const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
    const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64');

    try {
      const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${encryptedSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });

      const tossData = await response.json();
      if (!response.ok) {
        return reply.status(400).send({ success: false, error: tossData.message });
      }

      const userId = request.user.id; // JWT 미들웨어에서 추출

      await fastify.prisma.$transaction([
        fastify.prisma.payment.create({
          data: { userId, orderId, paymentKey, amount, status: 'DONE' },
        }),
        fastify.prisma.user.update({
          where: { id: userId },
          data: { churuCount: { increment: 25 } }, // 20개 + 보너스 5개
        }),
      ]);

      return reply.send({ success: true, message: '결제 승인 및 츄르 충전 완료냥! 🐾' });
    } catch (error) {
      fastify.log.error('토스 결제 승인 실패:', error);
      return reply.status(500).send({ success: false, error: '서버 내부 오류' });
    }
  });
}
```

---

## 4단계: 프론트엔드 전역 상태 (Zustand)

### `src/store/useMansionStore.js`

```javascript
import { create } from 'zustand';

const useMansionStore = create((set, get) => ({
  isLoggedIn: false,
  churuCount: 0,

  login: () => set({ isLoggedIn: true, churuCount: 10 }), // 웰컴 츄르 10개
  logout: () => set({ isLoggedIn: false, churuCount: 0 }),

  useChuru: (cost) => {
    const current = get().churuCount;
    if (current >= cost) {
      set({ churuCount: current - cost });
      return true;
    }
    return false;
  },

  chargeChuru: (amount) => set((s) => ({ churuCount: s.churuCount + amount })),
}));

export default useMansionStore;
```

---

## 5단계: 프론트엔드 페이지 컴포넌트 (5개 방 + 메인)

### 디자인 시스템 공통 규칙

- **메인 컬러**: 배경 `#FFFDF9`(아이보리), 포인트 `orange-500`(치즈냥이 오렌지)
- **레이아웃 스타일**: 토스(TDS) 스타일 — 큼직한 카드, 넉넉한 여백, rounded-2xl~3xl
- **마이크로 인터랙션**: `active:scale-[0.98]`(누를 때 쫀득), `group-hover:scale-110`(아이콘 확대), `animate-pulse`(HOT 뱃지)
- **헤더**: sticky, 배경 blur, 우측 상단에 '보유 츄르 N개' 항상 노출
- **모든 방에 츄르 잔액 실시간 표시** (Zustand 구독)

### 5-1. 메인 로비 `SamdeokMansion.jsx`

- 히어로 섹션: 바운스 고양이 이모지 🐈, "어서오라냥! 11년 차 건물주 삼덕이가 다 해결해 준다냥" 카피
- 5개 방 카드 리스트 (tools 배열 map): 각 카드에 방 번호, 제목, 설명, 츄르 비용, HOT 뱃지
- 카드 클릭 시 `useNavigate()`로 해당 방 라우트 이동
- 무료 방은 파란색 "무료 개방 ✨", 유료 방은 오렌지 "츄르 N개 차감" 뱃지
- 푸터: `© 2026 ETERNAL SIX. All rights reserved.`

**tools 배열 데이터:**

```javascript
const tools = [
  { id: 'reply', room: '101호 대필 사무소', title: '답장, 뭐라고 할까?', desc: '읽씹하긴 미안하고, 내 말 하긴 힘들 때 대신 써주냥', cost: 2, emoji: '⌨️', isHot: true },
  { id: 'whatwasit', room: '지하 1층 창고', title: '뭐였더라?', desc: '이름이 기억 안 나는 영화, 노래, 물건 다 찾아주냥', cost: 1, emoji: '🔍', isHot: false },
  { id: 'deokflix', room: '202호 상영관', title: '덕플릭스', desc: '오늘 뭐 볼지 취향 저격으로 딱 골라주냥', cost: 1, emoji: '🍿', isHot: false },
  { id: 'fingerprince', room: '1층 관리실', title: '핑거프린스', desc: '검색하기도 민망한 사소한 질문, 다 대답해준다냥', cost: 0, emoji: '💡', isHot: false },
  { id: 'golaping', room: '옥상 라운지', title: '골라핑', desc: '오늘 점심 뭐 먹지? 결정장애 대신 룰렛 돌려주냥', cost: 0, emoji: '🎲', isHot: false },
];
```

### 5-2. 101호 대필 사무소 `ReplyRoom.jsx` (수익화 핵심, 츄르 2개)

- **톤**: 화이트/오렌지 밝은 톤
- **입력 폼 3개**:
  1. `🗣️ 상대방이 뭐라고 했어?` — textarea
  2. `🤫 진짜 내 속마음은?` — textarea
  3. `🎭 어떤 느낌으로 써줄까?` — 4개 버튼 그룹 (정중하게 🙏 / 센스있게 😎 / 단호하게 💪 / 유머러스하게 😂)
- **실행 버튼**: "츄르 2개 내고 대필 맡기기 ✨"
- **로딩**: "삼덕이가 타자 치는 중... 🐾" (animate-pulse)
- **결과**: 초록색 카드, 클릭하면 클립보드 복사
- **츄르 부족 시**: `TossPaymentSheet` 바텀시트 오픈
- **API**: `POST /api/generate-reply` → `{ otherMsg, myThought, tone }`

### 5-3. 지하 1층 창고 `WhatWasItRoom.jsx` (츄르 1개)

- **톤**: 다크 모드 `bg-[#1A1A1A]` — 먼지 쌓인 창고 컨셉
- **입력**: 큰 textarea, placeholder "넷플릭스에서 본 일본 애니인데 남녀가 몸이 바뀌는 거"
- **실행 버튼**: "기억 찾아오기 🔍", 로딩 "삼덕이가 창고 뒤지는 중... 🔦"
- **결과**: 폴라로이드 사진 컨셉 (흰색 카드, 살짝 rotate-1, 이미지 영역 + 제목 + 설명 + 태그 3개)
- **API**: `POST /api/search-whatwasit` → `{ query }` → JSON `{ title, desc, tags }`

### 5-4. 202호 상영관 `DeokflixRoom.jsx` (츄르 1개)

- **톤**: 시네마틱 다크 `bg-[#0A0A0A]`
- **3단계 UX 플로우**:
  1. **카드 스와이프**: 4개 장르 카드를 하나씩 보여주며 "✕ 패스냥" / "♥ 이거다냥" 버튼. 각 카드는 고유 배경색.
  2. **분석 완료**: "취향 파악 끝났다냥!" → "결과 확인하기 ✨" 버튼 (여기서 츄르 1개 차감)
  3. **최종 결과**: 작품명, 추천 이유(고양이 말투), OTT 플랫폼 링크, "다시 고르기 ↺" 버튼
- **장르 카드 데이터**: 피 튀기는 액션 🩸 / 뇌 빼고 보는 코미디 🤪 / 숨막히는 심리 스릴러 👁️ / 설레는 로맨틱 코미디 💖
- **API**: `POST /api/recommend-deokflix` → `{ likes: [선택한 키워드 배열] }` → JSON `{ title, desc, platform }`

### 5-5. 1층 관리실 `FingerPrinceRoom.jsx` (무료)

- **톤**: 밝은 화이트/오렌지 (메인과 동일)
- **UI**: 검색 엔진 스타일 — 큰 input 한 줄 + "물어보기 ✨" 버튼, Enter키 지원
- **결과**: 오렌지 말풍선 형태
- **API**: `POST /api/ask-fingerprince` → `{ question }` → `{ reply }`
- **체류 시간 유도용 무료 기능**

### 5-6. 옥상 라운지 `GolapingRoom.jsx` (무료)

- **톤**: 하늘색 `bg-sky-50` — 옥상 하늘 컨셉
- **UI**: textarea에 쉼표로 후보 입력 → "대신 골라주냥! ✨" 버튼
- **룰렛 애니메이션**: 🎯 spin → 결과 bounce
- **결과**: 큼직한 오렌지 뱃지로 선택된 항목 표시
- **AI 호출 없음** (프론트에서 `Math.random()` 처리), 체류 시간 유도용 무료 기능

---

## 6단계: 공용 결제 바텀시트 컴포넌트

### `TossPaymentSheet.jsx`

- `@tosspayments/payment-widget-sdk` 사용
- props: `isOpen`, `onClose`
- 환경변수 `VITE_TOSS_PAYMENTS_CLIENT_KEY`에서 클라이언트 키 로드
- 바닥에서 올라오는 모달 UI (backdrop blur + slide up 애니메이션)
- 🙀 "츄르가 다 떨어졌다냥!" 타이틀
- "딱 500원으로 츄르 25개 충전" 프로모션 박스
- 토스 위젯 DOM (#payment-method, #agreement) 렌더
- 결제 성공 시 successUrl → `/payment/success`로 리디렉트, 백엔드에서 `/payments/confirm` 승인 처리
- **이 컴포넌트는 모든 유료 방에서 공통으로 재사용** — 츄르 부족 시 `setIsPaymentOpen(true)` 한 줄로 호출

---

## 7단계: React Router 라우팅

### `App.jsx`

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SamdeokMansion from './pages/SamdeokMansion';
import ReplyRoom from './pages/ReplyRoom';
import WhatWasItRoom from './pages/WhatWasItRoom';
import DeokflixRoom from './pages/DeokflixRoom';
import FingerPrinceRoom from './pages/FingerPrinceRoom';
import GolapingRoom from './pages/GolapingRoom';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SamdeokMansion />} />
        <Route path="/reply" element={<ReplyRoom />} />
        <Route path="/whatwasit" element={<WhatWasItRoom />} />
        <Route path="/deokflix" element={<DeokflixRoom />} />
        <Route path="/fingerprince" element={<FingerPrinceRoom />} />
        <Route path="/golaping" element={<GolapingRoom />} />
      </Routes>
    </BrowserRouter>
  );
}
```

메인 페이지의 카드 클릭: `onClick={() => navigate('/' + tool.id)}`

---

## 8단계: 환경변수

### `backend/.env`
```
DATABASE_URL=postgresql://user:password@localhost:5432/samdeok
OPENAI_API_KEY=sk-xxxxx
TOSS_PAYMENTS_SECRET_KEY=test_sk_xxxxx
```

### `frontend/.env`
```
VITE_TOSS_PAYMENTS_CLIENT_KEY=test_ck_xxxxx
VITE_API_BASE_URL=http://localhost:4000
```

---

## 핵심 체크리스트

- [ ] 모든 페이지에서 Zustand `churuCount` 실시간 반영
- [ ] 유료 방(101호, 지하, 202호)에서 츄르 부족 시 `TossPaymentSheet` 바텀시트 자동 오픈
- [ ] 무료 방(1층, 옥상)은 결제 체크 로직 없이 바로 실행
- [ ] 모든 카드/버튼에 `active:scale-[0.98]` 터치 피드백 적용
- [ ] 모바일 반응형: max-w-xl 중앙 정렬, 데스크탑에서도 깔끔하게
- [ ] API 에러 시 고양이 말투 에러 메시지 표시 (대필 요정 파업 중, 기억 창고 붕괴 등)
- [ ] 결과물 클릭 시 클립보드 복사 기능 (101호)
- [ ] 덕플릭스 3단계 UX 플로우 (스와이프 → 분석 → 결과) 정확히 구현
- [ ] 골라핑은 AI 호출 없이 프론트 `Math.random()`만 사용
