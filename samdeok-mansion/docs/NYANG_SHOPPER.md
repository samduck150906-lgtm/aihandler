# 냥스널쇼퍼 (Nyang-sonal Shopper)

## 1. AI 프롬프트 명령어 (System Role)
`.cursorrules` 또는 Cursor AI 설정창에 넣을 수 있는 역할 정의는 프로젝트 루트의 **`.cursorrules`** 파일에 저장되어 있습니다.

---

## 2. 초기 프로젝트 구조 생성 명령어 (Cursor Composer용)
Cursor Composer(`Ctrl+I` / `Cmd+I`)를 연 뒤 아래 명령어를 붙여넣으세요.

```
냥스널쇼퍼라는 이름의 AI 기반 쇼핑 큐레이션 웹 서비스를 만들 거야. Next.js와 Tailwind CSS를 사용하고, 메인 컬러는 고양이 발바닥 같은 연한 핑크와 깔끔한 화이트로 잡아줘.

메인 페이지에는 '집사의 취향 분석하기' 버튼이 있어야 해.

고양이 캐릭터가 말풍선으로 추천 상품을 보여주는 UI 컴포넌트를 만들어줘.

사용자의 예산과 선호 스타일을 입력받는 폼(Form)을 포함해줘.
```

---

## 3. 데이터 분석 로직
- **TypeScript 타입·함수**: `frontend/src/lib/nyang-shopper-types.ts` (Product 인터페이스, getNyangRecommendation)
- **런타임용 JS**: `frontend/src/lib/nyang-shopper.js` (getNyangRecommendation — 앱에서 사용)

## 4. 추천 멘트 생성
`frontend/src/lib/nyangShopperMessage.js`의 `generateNyangMessage(productName, price)`를 사용합니다.

## 5. 삼덕맨션 내 방
- **경로**: `/nyangshopper`
- **로비**: "3층 쇼핑라운지 — 냥스널쇼퍼" 카드에서 입장
- **기능**: 예산·선호 스타일 폼 → "집사의 취향 분석하기" → 로딩 문구(발바닥 애니메이션) → 고양이 말풍선 추천 + 냥 점수(🐾)

---

## 💡 냥스널쇼퍼 아이디어
- **로딩 화면**: "냥스널쇼퍼가 발로 꾹꾹이하며 상품을 고르는 중..." 문구 + 고양이 발바닥 애니메이션
- **리뷰 시스템**: 별점 대신 '생선' 또는 '발바닥' 개수로 만족도 표시
