# 토스 결제 플로우 점검 (테스트 키)

## 1. 환경 변수

- **프론트**: `VITE_TOSS_PAYMENTS_CLIENT_KEY` — 토스 테스트 클라이언트 키
- **프론트**: `VITE_APP_URL` — 배포 URL (success/fail 리다이렉트용, 없으면 `window.location.origin` 사용)
- **백엔드**: `TOSS_PAYMENTS_SECRET_KEY` — 토스 시크릿 키 (테스트 시 테스트 시크릿 키)

## 2. 결제 요청 (TossPaymentSheet)

- **금액**: 500원 (상수 `PAYMENT_AMOUNT`)
- **상품명**: `츄르 25개 충전` (`ORDER_NAME`)
- **successUrl**: `{VITE_APP_URL 또는 origin}/payment/success`
- **failUrl**: `{VITE_APP_URL 또는 origin}/payment/fail`

토스 결제 완료 후 위 URL로 리다이렉트되며, 쿼리로 `paymentKey`, `orderId`, `amount`가 전달됩니다.

## 3. 성공 페이지 (/payment/success)

- `paymentKey`, `orderId`, `amount`를 쿼리에서 읽어 백엔드 `POST /payments/confirm` 호출
- 성공 시: 츄르 25개 적립, 2초 후 메인(/)으로 이동
- 화면에 **주문번호(orderId)** 와 **금액(amount)** 표시 권장 (의도대로 전달되는지 확인용)

## 4. 실패 페이지 (/payment/fail)

- 토스가 리다이렉트할 때 `code`, `message` 등 쿼리로 줄 수 있음 — 있으면 화면에 표시하면 점검 시 유리

## 5. 백엔드 확인 API

- `POST /payments/confirm` body: `{ paymentKey, orderId, amount, userId? }`
- 토스 API로 승인 후 DB 반영(선택), 응답 `{ success: true, message }`

## 6. 점검 체크리스트

- [ ] 테스트 키로 결제 시도 → 성공 시 `/payment/success?paymentKey=...&orderId=...&amount=500` 이동
- [ ] 실패/취소 시 `/payment/fail` 이동
- [ ] 성공 페이지에서 주문번호·금액 노출 확인
- [ ] 백엔드 confirm 호출 후 츄르 25개 반영 확인 (userId 연동 시)
