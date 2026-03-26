# 🔍 뭐였더라 (WhatWasIt)

> 입가에 맴도는 그 이름, AI가 바로 찾아드립니다.  
> **whatwasit.kr**

기억나지 않는 영화, 노래, 짤, 물건을 대충 설명하면 AI 탐정이 찾아줍니다.

---

## 🚀 Quick Start

### 1. 의존성 설치

```bash
pnpm install
# 또는 npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local`에 **필수** 값 설정:

| 변수 | 필수 | 설명 |
|------|------|------|
| `OPENAI_API_KEY` | ✅ | OpenAI API 키 (GPT-4o-mini) |
| `UPSTASH_REDIS_REST_URL` | - | Upstash Redis URL (미설정 시 in-memory 레이트리밋) |
| `UPSTASH_REDIS_REST_TOKEN` | - | Upstash Redis Token |
| `RATE_LIMIT_PER_MINUTE` | - | 분당 요청 제한 (기본 10) |
| `RATE_LIMIT_PER_DAY` | - | 일당 요청 제한 (기본 100) |

### 3. 개발 서버 실행

```bash
pnpm dev
# 또는 npm run dev
```

http://localhost:3000 접속

### 4. 검증 명령어

```bash
pnpm lint        # ESLint
pnpm typecheck   # TypeScript (strict)
pnpm test        # Vitest
pnpm build       # Next.js 프로덕션 빌드
```

---

## 📁 프로젝트 구조

```
├── app/
│   ├── api/chat/route.ts   # AI 채팅 API (Edge), 입력검증·레이트리밋·재시도
│   ├── layout.tsx          # 메타데이터, 오픈그래프, 뷰포트
│   ├── page.tsx            # 메인 (useChatFlow 훅 사용)
│   ├── robots.ts           # robots.txt
│   └── sitemap.ts          # sitemap.xml
├── components/             # ResultCard, QuestionCard, SearchInput 등
├── hooks/useChatFlow.ts    # 채팅 상태·API 호출·에러/429 처리
├── lib/
│   ├── schemas.ts          # zod 요청/응답 스키마
│   ├── types.ts            # 타입 + CATEGORY_META
│   ├── prompt.ts           # getSystemPrompt(questionCount)
│   ├── ratelimit.ts        # Upstash 또는 in-memory
│   └── utils.ts
└── vitest.setup.ts, vitest.config.ts
```

---

## 🧠 핵심 로직

- **입력 검증:** 메시지 개수(최대 20), content 길이(1200자), 빈/공백 거부
- **응답 스키마:** `question`(question, options?) / `result`(title, category, confidence, reasoning, suggestions, searchQueries, links?)
- **파싱 실패 시:** 모델 재요청 1회 → 실패 시 안전한 fallback 응답
- **레이트리밋:** IP 기준 분당·일당 제한, 429 시 친절 안내
- **5회 질문 후:** 서버에서 `questionCount`로 강제 result 유도

---

## 🚢 배포 (Vercel) 체크리스트

- [ ] Vercel 프로젝트 연결 (Git 연동 또는 `vercel` CLI)
- [ ] 환경변수 설정: **OPENAI_API_KEY** 필수
- [ ] (권장) Upstash Redis 생성 후 `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` 설정
- [ ] `pnpm build` 로컬에서 성공 확인
- [ ] 배포 후 `/` 접속, 검색·질문·결과 카드·검색 링크 동작 확인
- [ ] (선택) 도메인 연결 후 `metadataBase`/sitemap URL 확인

### Edge Runtime

- 채팅 API는 `runtime = "edge"` 사용. Upstash는 Edge 호환.
- Node 전용 패키지가 필요하면 해당 API만 `runtime = "nodejs"`로 변경 가능 (README에 이유·영향 명시).

---

## 📌 다음 단계 (선택)

- [ ] 실제 검색 API 연동 (Google Custom Search / SerpAPI) 후 근거 기반 결론 확장
- [ ] 쿠팡 파트너스 링크
- [ ] PWA, 공유 기능
