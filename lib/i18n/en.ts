const en = {
  // Header
  "header.title": "AI Handler",
  "header.subtitle": "Global AI Prompt Hub",
  "header.home": "Home",
  "header.login": "Log In",
  "header.logout": "Log Out",
  "header.newPrompt": "New Prompt",
  "header.admin": "ADMIN",
  "header.theme": "Toggle Theme",

  // Tabs
  "tab.generator": "Prompt Generator",
  "tab.history": "History",

  // Generator
  "gen.aiTool": "1. Target AI Tool",
  "gen.tone": "2. Tone",
  "gen.length": "3. Length",
  "gen.purpose": "4. What result do you want? (Purpose)",
  "gen.placeholder": "e.g. Create a marketing copy for a diet supplement targeting 20s",
  "gen.optimized": "Parameters will be auto-optimized for the selected [{category}] model.",
  "gen.submit": "Generate Prompt",
  "gen.submitting": "Assembling expert framework...",
  "gen.coinCost": "(-{cost} coins)",
  "gen.shortcut": "Ctrl+Enter to submit",

  // Tones
  "tone.any": "Any",
  "tone.professional": "Professional",
  "tone.friendly": "Friendly",
  "tone.analytical": "Analytical",
  "tone.creative": "Creative",
  "tone.direct": "Direct",

  // Lengths
  "length.any": "Any",
  "length.short": "Short (1 paragraph)",
  "length.medium": "Medium (2-3 paragraphs)",
  "length.long": "Long (detailed)",

  // Freemium
  "free.remaining": "Free uses remaining:",
  "free.adminUnlimited": "Admin unlimited access enabled",
  "free.coins": "Coins:",
  "free.perUse": "(1 use = {cost} coins)",
  "free.recharge": "Recharge",
  "free.exhausted": "Free uses exhausted. Recharge coins or subscribe to Pro.",
  "free.subscribe": "Go Pro",

  // Auth Modal
  "auth.welcomeBack": "Welcome Back",
  "auth.createAccount": "Create Account",
  "auth.googleContinue": "Continue with Google",
  "auth.emailContinue": "Continue with email",
  "auth.email": "Email",
  "auth.password": "Password (6+ characters)",
  "auth.loginBtn": "Log In",
  "auth.signupBtn": "Sign Up",
  "auth.processing": "Processing...",
  "auth.noAccount": "Don't have an account?",
  "auth.hasAccount": "Already have an account?",
  "auth.signupLink": "Sign Up",
  "auth.loginLink": "Log In",
  "auth.termsAgree": "By signing up, you agree to our",
  "auth.terms": "Terms of Service",
  "auth.and": "and",
  "auth.privacy": "Privacy Policy",

  // Auth Errors
  "auth.err.invalidCredentials": "Invalid email or password.",
  "auth.err.alreadyRegistered": "This email is already registered. Please log in.",
  "auth.err.weakPassword": "Password must be at least 6 characters.",
  "auth.err.generic": "Authentication failed.",

  // Auth Toasts
  "auth.toast.loginSuccess": "Logged in successfully!",
  "auth.toast.signupSuccess": "Verification email sent. Please check your inbox!",

  // Prompt Result
  "result.generated": "PROMPT GENERATED",
  "result.success": "SUCCESS",
  "result.tips": "Tips",
  "result.retry": "Regenerate",
  "result.copy": "Copy Prompt",
  "result.copied": "Copied!",
  "result.fallback": "Failed to generate prompt.",

  // Result suggestions (defaults)
  "result.suggestion.copy": "Click the copy button and paste the result into the AI tool.",
  "result.suggestion.retry": "If the result isn't what you want, change options and regenerate.",

  // Result reasoning (defaults)
  "result.reasoning.frontend": "Instantly assembled on the frontend using the combination engine.",
  "result.reasoning.optimized": "Optimized for the selected tone, length, and AI model characteristics.",

  // History
  "history.empty": "No prompts generated yet.",
  "history.localStorage": "Local Storage",
  "history.clearAll": "Clear All",
  "history.delete": "Delete",
  "history.copy": "Copy",
  "history.clipboard": "Copied to clipboard.",
  "history.clipboardFail": "Failed to copy.",

  // AI Tools Hub
  "hub.title": "Global AI Tool Hub",
  "hub.search": "Search AI tools...",
  "hub.noResult": "No AI tools found.",
  "hub.official": "Official Site",
  "hub.deleteAccount": "Account / Delete",
  "hub.pricing": "Pricing / Plans",
  "hub.cancelSub": "Cancel Subscription",

  // Categories
  "cat.all": "All",
  "cat.textLLM": "Text/LLM",
  "cat.image": "Image",
  "cat.video": "Video",
  "cat.audio": "Audio/Music",
  "cat.productivity": "Productivity/Code",

  // Pricing / Checkout
  "pricing.title": "Get More with AI Handler",
  "pricing.coinPacks": "Coin Packs",
  "pricing.proPlan": "Pro Plan",
  "pricing.coins50": "50 Coins",
  "pricing.coins200": "200 Coins",
  "pricing.coins500": "500 Coins",
  "pricing.proMonthly": "Pro Monthly",
  "pricing.proDesc": "Unlimited prompt generation + priority support",
  "pricing.buyCoins": "Buy Coins",
  "pricing.subscribePro": "Subscribe",
  "pricing.perMonth": "/month",
  "pricing.oneTime": "one-time",
  "pricing.popular": "POPULAR",

  // Payment
  "payment.success": "Coins recharged successfully!",
  "payment.successDesc": "Continue generating prompts freely!",
  "payment.fail": "Payment was cancelled or failed.",
  "payment.proSuccess": "Pro plan activated! Enjoy unlimited access.",

  // Toast
  "toast.promptComplete": "Prompt assembled!",
  "toast.coinDeducted": "-{cost} coins deducted",
  "toast.loginRequired": "Please log in to recharge coins.",

  // Footer
  "footer.terms": "Terms",
  "footer.privacy": "Privacy",
  "footer.refund": "Refund Policy",
  "footer.copyright": "Copyright {year} AI Handler. All rights reserved.",

  // Tool Landing Page
  "tool.backToHub": "Back to Hub",
  "tool.promptBuilder": "Prompt Builder",
  "tool.desc": "Transform your ideas into perfectly crafted {name} prompts in seconds. Get the best results now!",
  "tool.pricingPolicy": "Pricing",
  "tool.quickLink": "Quick Link",
  "tool.officialSite": "{name} Official Site",
  "tool.startBuilding": "Start Building Prompt",

  // Legal pages
  "legal.terms": "Terms of Service",
  "legal.privacy": "Privacy Policy",
  "legal.refund": "Cancellation & Refund Policy",

  // Language
  "lang.en": "English",
  "lang.ko": "Korean",
} as const;

export type TranslationKey = keyof typeof en;
export default en;
