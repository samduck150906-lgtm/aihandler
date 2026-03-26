# 🐾 삼덕맨션

11년 차 건물주 치즈냥이 '삼덕이'가 운영하는 AI 유틸리티 웹앱. 5개의 방(기능) + 통합 재화(츄르) + 토스페이먼츠 결제.

## 구조

- **frontend**: React + Vite + Tailwind + Zustand
- **backend**: Fastify + Prisma + PostgreSQL
- **결제**: 토스페이먼츠

## 로컬 실행

### 1. DB (PostgreSQL)

```bash
docker compose up -d
```

### 2. 백엔드

```bash
cd backend
cp .env.example .env   # DATABASE_URL, OPENAI_API_KEY, TOSS_PAYMENTS_SECRET_KEY 설정
npm install
npx prisma migrate dev --name init
npm run dev
```

서버: `http://localhost:4000`

### 3. 프론트엔드

```bash
cd frontend
cp .env.example .env   # VITE_TOSS_PAYMENTS_CLIENT_KEY, VITE_API_BASE_URL 설정
npm install
npm run dev
```

앱: `http://localhost:5173`

## 환경변수

**backend/.env**

- `DATABASE_URL` — PostgreSQL 연결 문자열
- `OPENAI_API_KEY` — OpenAI API 키
- `TOSS_PAYMENTS_SECRET_KEY` — 토스페이먼츠 시크릿 키 (테스트: `test_sk_...`)

**frontend/.env**

- `VITE_TOSS_PAYMENTS_CLIENT_KEY` — 토스페이먼츠 클라이언트 키 (테스트: `test_ck_...`)
- `VITE_API_BASE_URL` — 백엔드 URL (예: `http://localhost:4000`)

## 방 목록

| 경로 | 방 | 츄르 |
|------|-----|------|
| / | 로비 | - |
| /reply | 101호 대필 사무소 | 2 |
| /whatwasit | 지하 1층 창고 (뭐였더라) | 1 |
| /deokflix | 202호 상영관 | 1 |
| /fingerprince | 1층 관리실 | 무료 |
| /golaping | 옥상 라운지 | 무료 |

© 2026 ETERNAL SIX.
