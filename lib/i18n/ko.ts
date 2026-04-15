import type { TranslationKey } from "./en";

const ko: Record<TranslationKey, string> = {
  // Header
  "header.title": "AI 핸들러",
  "header.subtitle": "AI 프롬프트 허브",
  "header.home": "홈",
  "header.login": "로그인",
  "header.logout": "로그아웃",
  "header.newPrompt": "새로 조립하기",
  "header.admin": "ADMIN",
  "header.theme": "테마 변경",

  // Tabs
  "tab.generator": "프롬프트 생성기",
  "tab.history": "최근 내역",

  // Generator
  "gen.aiTool": "1. 대상 AI 툴",
  "gen.tone": "2. 어조 (Tone)",
  "gen.length": "3. 길이 (Length)",
  "gen.purpose": "4. 어떤 결과물을 원하시나요? (목적)",
  "gen.placeholder": "예: 20대 타겟 다이어트 보조제 상세페이지 카피라이팅 기획해줘",
  "gen.optimized": "선택하신 [{category}] 모델에 맞춰 파라미터가 자동 번역/최적화됩니다.",
  "gen.submit": "프롬프트 자동 조립",
  "gen.submitting": "전문 프레임워크 조립 중...",
  "gen.coinCost": "(-{cost} 코인)",
  "gen.shortcut": "Ctrl+Enter으로 제출",

  // Tones
  "tone.any": "상관없음",
  "tone.professional": "전문적인",
  "tone.friendly": "친근한",
  "tone.analytical": "분석적인",
  "tone.creative": "창의적인",
  "tone.direct": "직설적인",

  // Lengths
  "length.any": "상관없음",
  "length.short": "짧게 (1문단)",
  "length.medium": "중간 (2~3문단)",
  "length.long": "길게 (상세하게)",

  // Freemium
  "free.remaining": "남은 무료 횟수:",
  "free.adminUnlimited": "관리자 무제한 사용 활성화",
  "free.coins": "보유 코인:",
  "free.perUse": "(1회 = {cost}코인 차감)",
  "free.recharge": "코인 충전",
  "free.exhausted": "무료 횟수를 모두 사용했습니다. 코인을 충전하거나 Pro를 구독하세요.",
  "free.subscribe": "Pro 구독",

  // Auth Modal
  "auth.welcomeBack": "다시 오신 것을 환영합니다",
  "auth.createAccount": "계정 만들기",
  "auth.googleContinue": "Google로 계속하기",
  "auth.emailContinue": "이메일로 계속하기",
  "auth.email": "이메일",
  "auth.password": "비밀번호 (6자 이상)",
  "auth.loginBtn": "로그인",
  "auth.signupBtn": "회원가입",
  "auth.processing": "처리 중...",
  "auth.noAccount": "계정이 없으신가요?",
  "auth.hasAccount": "이미 계정이 있으신가요?",
  "auth.signupLink": "회원가입",
  "auth.loginLink": "로그인",
  "auth.termsAgree": "가입 시 다음에 동의하는 것으로 간주됩니다:",
  "auth.terms": "이용약관",
  "auth.and": "및",
  "auth.privacy": "개인정보처리방침",

  // Auth Errors
  "auth.err.invalidCredentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "auth.err.alreadyRegistered": "이미 가입된 이메일입니다. 로그인해 주세요.",
  "auth.err.weakPassword": "비밀번호는 6자 이상이어야 합니다.",
  "auth.err.generic": "인증에 실패했습니다.",

  // Auth Toasts
  "auth.toast.loginSuccess": "로그인 성공!",
  "auth.toast.signupSuccess": "인증 메일이 발송되었습니다. 메일함을 확인해주세요!",

  // Prompt Result
  "result.generated": "프롬프트 생성 완료",
  "result.success": "SUCCESS",
  "result.tips": "활용 팁",
  "result.retry": "다시 생성",
  "result.copy": "프롬프트 복사하기",
  "result.copied": "복사 완료",
  "result.fallback": "프롬프트를 생성하지 못했습니다.",

  // Result suggestions (defaults)
  "result.suggestion.copy": "복사 버튼을 눌러 결과물을 해당 AI 툴에 붙여넣으세요.",
  "result.suggestion.retry": "원하는 결과가 아니라면, 옵션을 변경해 다시 생성해 보세요.",

  // Result reasoning (defaults)
  "result.reasoning.frontend": "프론트엔드에서 즉각적으로 조립된 조합형 결과물입니다.",
  "result.reasoning.optimized": "선택한 옵션(어조, 길이)과 AI 특성에 맞춰 문구가 최적화되었습니다.",

  // History
  "history.empty": "최근 생성된 프롬프트가 없습니다.",
  "history.localStorage": "로컬 저장소",
  "history.clearAll": "모두 지우기",
  "history.delete": "삭제",
  "history.copy": "복사",
  "history.clipboard": "클립보드에 복사되었습니다.",
  "history.clipboardFail": "복사에 실패했습니다.",

  // AI Tools Hub
  "hub.title": "글로벌 AI 툴 허브",
  "hub.search": "원하는 AI 툴 검색...",
  "hub.noResult": "검색된 AI 툴이 없습니다.",
  "hub.official": "공식홈 (가입)",
  "hub.deleteAccount": "탈퇴/계정관리",
  "hub.pricing": "유료 플랜/구독",
  "hub.cancelSub": "구독 해지버튼",

  // Categories
  "cat.all": "전체",
  "cat.textLLM": "텍스트/LLM",
  "cat.image": "이미지",
  "cat.video": "비디오",
  "cat.audio": "오디오/음악",
  "cat.productivity": "생산성/코딩",

  // Pricing / Checkout
  "pricing.title": "AI Handler로 더 많이 사용하기",
  "pricing.coinPacks": "코인 팩",
  "pricing.proPlan": "Pro 플랜",
  "pricing.coins50": "50 코인",
  "pricing.coins200": "200 코인",
  "pricing.coins500": "500 코인",
  "pricing.proMonthly": "Pro 월간 구독",
  "pricing.proDesc": "무제한 프롬프트 생성 + 우선 지원",
  "pricing.buyCoins": "코인 구매",
  "pricing.subscribePro": "구독하기",
  "pricing.perMonth": "/월",
  "pricing.oneTime": "1회",
  "pricing.popular": "인기",

  // Payment
  "payment.success": "코인이 성공적으로 충전되었습니다!",
  "payment.successDesc": "이제 자유롭게 프롬프트 생성을 이어가세요!",
  "payment.fail": "결제가 취소되었거나 실패했습니다.",
  "payment.proSuccess": "Pro 플랜이 활성화되었습니다! 무제한 사용을 즐기세요.",

  // Toast
  "toast.promptComplete": "프롬프트 조립 완료!",
  "toast.coinDeducted": "-{cost} 코인 차감",
  "toast.loginRequired": "로그인 후 코인을 충전하실 수 있습니다.",

  // Footer
  "footer.terms": "이용약관",
  "footer.privacy": "개인정보처리방침",
  "footer.refund": "취소 및 환불 안내",
  "footer.copyright": "Copyright {year} AI Handler. All rights reserved.",

  // Tool Landing Page
  "tool.backToHub": "메인 허브로 돌아가기",
  "tool.promptBuilder": "프롬프트 조립기",
  "tool.desc": "당신의 아이디어를 완벽한 {name} 맞춤형 프롬프트로 단숨에 변환해 드립니다. 지금 바로 최고의 결과물을 뽑아내세요!",
  "tool.pricingPolicy": "가격 정책",
  "tool.quickLink": "바로가기",
  "tool.officialSite": "{name} 공식 홈페이지",
  "tool.startBuilding": "프롬프트 조립 시작하기",

  // Legal pages
  "legal.terms": "이용약관",
  "legal.privacy": "개인정보처리방침",
  "legal.refund": "취소 및 환불 안내",

  // Language
  "lang.en": "English",
  "lang.ko": "한국어",
};

export default ko;
