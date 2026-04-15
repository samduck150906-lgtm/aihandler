"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { RotateCcw, Sparkles, Zap, ExternalLink, CreditCard, UserX, LayoutTemplate, Sun, Moon, History, Trash2, Search, LogIn, LogOut, Globe, ChevronDown, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatFlow } from "@/hooks/useChatFlow";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { useFreemium, MAX_FREE_LIMIT, COST_PER_GENERATION } from "@/hooks/useFreemium";
import { useTranslation } from "@/lib/i18n/index";
import { PromptResult } from "@/components/prompt-result";
import { Skeleton } from "@/components/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import { AI_TOOLS, type Category } from "@/lib/data/ai-tools";

const TONES = ["상관없음", "전문적인", "친근한", "분석적인", "창의적인", "직설적인"];
const LENGTHS = ["상관없음", "짧게 (1문단)", "중간 (2~3문단)", "길게 (상세하게)"];
const CATEGORIES: Category[] = ["전체", "텍스트/LLM", "이미지", "비디오", "오디오/음악", "생산성/코딩"];

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const {
    phase,
    currentResult,
    error,
    isLoading,
    isActive,
    handleSearch,
    handleRetry,
    handleReset,
    clearError,
  } = useChatFlow();

  const { history, savePrompt, removePrompt, clearHistory } = usePromptHistory();
  const {
    usageCount,
    coins,
    isAdmin,
    isPro,
    userEmail,
    userId,
    isLoaded,
    canGenerate,
    incrementUsage,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    logout,
    isSignedIn,
    openPaddleCheckout,
    refreshCoins,
  } = useFreemium();

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    try {
      if (authMode === "login") {
        await loginWithEmail(authEmail, authPassword);
        toast.success(t("auth.toast.loginSuccess"));
      } else {
        await signUpWithEmail(authEmail, authPassword);
        toast.success(t("auth.toast.signupSuccess"), { duration: 5000 });
      }
      setIsAuthModalOpen(false);
      setAuthEmail("");
      setAuthPassword("");
    } catch (error: any) {
      const msg = error?.message || t("auth.err.generic");
      if (msg.includes("Invalid login credentials")) {
        toast.error(t("auth.err.invalidCredentials"));
      } else if (msg.includes("User already registered")) {
        toast.error(t("auth.err.alreadyRegistered"));
        setAuthMode("login");
      } else if (msg.includes("Password should be at least")) {
        toast.error(t("auth.err.weakPassword"));
      } else {
        toast.error(msg);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Save history and increment usage
  useEffect(() => {
    if (phase === "result" && currentResult) {
      savePrompt(currentResult);
      incrementUsage();
      toast.success(
        <div>
          <p className="font-bold">{t("toast.promptComplete")}</p>
          {!isAdmin && !isPro && usageCount >= MAX_FREE_LIMIT && (
            <p className="text-xs text-muted-foreground mt-1 text-rose-500 font-mono">
              - {COST_PER_GENERATION} {t("pricing.coinPacks")} 💎
            </p>
          )}
        </div>
      );
    }
  }, [phase, currentResult]);

  // Handle payment success
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get("payment");

      if (paymentStatus === "completed") {
        refreshCoins();
        toast.success(t("payment.success"), { description: t("payment.successDesc") });
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === "fail") {
        toast.error(t("payment.fail"));
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Handle AI Tool routing
      const toolSlug = params.get("tool");
      if (toolSlug) {
        const found = AI_TOOLS.find((t) => t.slug === toolSlug);
        if (found) {
          setSelectedAI(found.name);
          setActiveTab("generator");
        }
      }
    }
  }, []);

  const [activeTab, setActiveTab] = useState<"generator" | "history">("generator");
  const [selectedAI, setSelectedAI] = useState(AI_TOOLS[0].name);
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState(LENGTHS[0]);
  // Advanced Settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advRole, setAdvRole] = useState("");
  const [advFormat, setAdvFormat] = useState("");
  const [advContext, setAdvContext] = useState("");
  const [advExtras, setAdvExtras] = useState("");

  const [activeCategory, setActiveCategory] = useState<Category>("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    return AI_TOOLS.filter((t) => {
      const matchCat = activeCategory === "전체" || t.category === activeCategory;
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === "result") {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
      setActiveTab("generator");
    }
  }, [phase]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() || isLoading) return;

    if (!canGenerate) {
      if (!isSignedIn) {
        setIsAuthModalOpen(true);
        toast.info(t("toast.loginRequired"), { duration: 4000 });
      } else {
        // Open Paddle checkout for coins (price ID from env)
        const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_COINS_50;
        if (priceId) {
          openPaddleCheckout(priceId);
        } else {
          toast.error("Payment service not configured");
        }
      }
      return;
    }

    clearError();
    handleSearch(selectedAI, purpose.trim(), tone, length, locale, {
      role: advRole.trim() || undefined,
      format: advFormat.trim() || undefined,
      context: advContext.trim() || undefined,
      extras: advExtras.trim() || undefined,
    });
  };

  // Keyboard shortcut: Ctrl/Cmd + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (purpose.trim() && !isLoading && canGenerate) {
          e.preventDefault();
          onSubmit(e as any);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [purpose, isLoading, canGenerate, selectedAI, tone, length]);

  const copyHistoryText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("history.clipboard"));
    } catch {
      toast.error(t("history.clipboardFail"));
    }
  };

  if (!mounted) return null;

  return (
    <main className="flex-1 flex flex-col bg-[#FAFAF8] dark:bg-zinc-950 transition-colors" role="main">
      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAuthModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border-[3px] border-ink dark:border-zinc-700 shadow-[8px_8px_0px_#000] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-ink dark:text-white uppercase tracking-tighter">
                {authMode === "login" ? t("auth.welcomeBack") : t("auth.createAccount")}
              </h2>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-ink-muted hover:text-ink dark:text-zinc-500 dark:hover:text-white"
              >
                <UserX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => loginWithGoogle()}
                className="w-full flex items-center justify-center gap-3 py-3 border-[2px] border-ink dark:border-zinc-700 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-ink dark:text-zinc-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {t("auth.googleContinue")}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">{t("auth.emailContinue")}</span>
                </div>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-black uppercase text-ink-muted dark:text-zinc-500 mb-1">
                    {t("auth.email")}
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-zinc-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-ink-muted dark:text-zinc-500 mb-1">
                    {t("auth.password")}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-zinc-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-3 bg-ink text-white dark:bg-white dark:text-zinc-900 font-black hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAuthLoading ? t("auth.processing") : authMode === "login" ? t("auth.loginBtn") : t("auth.signupBtn")}
                </button>
              </form>

              <p className="text-center text-xs text-ink-muted dark:text-zinc-500">
                {authMode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                  className="ml-1 font-bold text-brand-600 hover:underline"
                >
                  {authMode === "login" ? t("auth.signupLink") : t("auth.loginLink")}
                </button>
              </p>

              {authMode === "signup" && (
                <p className="text-center text-[10px] text-zinc-400 leading-relaxed">
                  {t("auth.termsAgree")} <a href="/terms" className="underline">{t("auth.terms")}</a> {t("auth.and")} <a href="/privacy" className="underline">{t("auth.privacy")}</a>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b-[3px] border-ink dark:border-zinc-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2.5 group hover:opacity-80 transition-opacity"
            aria-label="Home"
          >
            <div className="w-8 h-8 bg-brand-500 border-[2px] border-ink dark:border-black flex items-center justify-center text-white font-black group-hover:bg-brand-600 transition-colors shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[15px] font-black tracking-tight leading-none text-ink dark:text-zinc-100">
                AI Handler
              </span>
              <span className="text-[9px] font-mono text-ink-muted dark:text-zinc-400 tracking-wide mt-0.5">
                {t("header.subtitle")}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            {isLoaded && isAdmin && (
              <span className="hidden sm:inline-block px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-[10px] font-black uppercase tracking-widest rounded-full">
                ADMIN ⚡
              </span>
            )}

            {isLoaded && isPro && (
              <span className="hidden sm:inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase tracking-widest rounded-full">
                PRO ✨
              </span>
            )}

            {isActive && (
              <button
                type="button"
                onClick={handleReset}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold hover:bg-ink hover:text-white dark:hover:bg-zinc-700 dark:text-zinc-200 active:translate-y-[1px] shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]"
              >
                <RotateCcw className="w-3 h-3" />
                {t("header.newPrompt")}
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center gap-1 border-l pl-3 dark:border-zinc-800">
              <Globe className="w-3.5 h-3.5 text-ink-muted dark:text-zinc-500" />
              <button
                onClick={() => setLocale(locale === "en" ? "ko" : "en")}
                className="px-2.5 py-1.5 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-black text-ink dark:text-zinc-200 hover:bg-brand-50 dark:hover:bg-zinc-700 active:translate-y-[1px] shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000] uppercase tracking-wider"
              >
                {locale === "en" ? "한국어" : "EN"}
              </button>
            </div>

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 text-ink dark:text-zinc-200 hover:bg-brand-50 dark:hover:bg-zinc-700 active:translate-y-[1px] shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            <div className="flex items-center ml-1 border-l pl-3 dark:border-zinc-800">
              {!isSignedIn ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold hover:bg-brand-500 transition-colors shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {t("header.login")}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="hidden md:block text-[10px] font-mono text-ink-muted dark:text-zinc-400 max-w-[120px] truncate">
                    {userEmail}
                  </span>
                  <button
                    onClick={logout}
                    className="p-2 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 text-ink dark:text-zinc-200 hover:bg-red-50 dark:hover:bg-red-900/20 active:translate-y-[1px] shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 lg:py-12 flex flex-col lg:flex-row gap-10 lg:gap-16">
        {/* Left Section: Prompt Generator & History */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex space-x-2 border-b-[3px] border-ink dark:border-zinc-800">
            <button
              onClick={() => setActiveTab("generator")}
              className={cn(
                "px-5 py-3 font-black text-sm uppercase tracking-widest flex items-center gap-2",
                activeTab === "generator"
                  ? "bg-ink text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-ink-muted hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              <Zap className="w-4 h-4" /> {t("tab.generator")}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "px-5 py-3 font-black text-sm uppercase tracking-widest flex items-center gap-2",
                activeTab === "history"
                  ? "bg-ink text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-ink-muted hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              <History className="w-4 h-4" /> {t("tab.history")} <span className="text-[10px] bg-brand-500 text-white px-1.5 rounded-full">{history.length}</span>
            </button>
          </div>

          {activeTab === "generator" && (
            <>
              <form onSubmit={onSubmit} className="bg-white dark:bg-zinc-900 border-[3px] border-ink dark:border-zinc-800 p-5 md:p-7 shadow-[4px_4px_0px_#1f2937] dark:shadow-[4px_4px_0px_#000]">
                <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="ai-select" className="block text-xs font-bold text-ink dark:text-zinc-300 mb-1.5 uppercase tracking-wide font-mono">
                      {t("gen.aiTool")}
                    </label>
                    <select
                      id="ai-select"
                      value={selectedAI}
                      onChange={(e) => setSelectedAI(e.target.value)}
                      className="w-full border-[2px] border-ink dark:border-zinc-700 bg-surface-muted dark:bg-zinc-800 dark:text-zinc-200 px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                      disabled={isLoading}
                    >
                      {CATEGORIES.filter((c) => c !== "전체").map((cat) => (
                        <optgroup key={cat} label={cat}>
                          {AI_TOOLS.filter((t) => t.category === cat).map((tool) => (
                            <option key={tool.name} value={tool.name}>
                              {tool.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="tone-select" className="block text-xs font-bold text-ink dark:text-zinc-300 mb-1.5 uppercase tracking-wide font-mono">
                      {t("gen.tone")}
                    </label>
                    <select
                      id="tone-select"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full border-[2px] border-ink dark:border-zinc-700 bg-surface-muted dark:bg-zinc-800 dark:text-zinc-200 px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                      disabled={isLoading}
                    >
                      {TONES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="len-select" className="block text-xs font-bold text-ink dark:text-zinc-300 mb-1.5 uppercase tracking-wide font-mono">
                      {t("gen.length")}
                    </label>
                    <select
                      id="len-select"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full border-[2px] border-ink dark:border-zinc-700 bg-surface-muted dark:bg-zinc-800 dark:text-zinc-200 px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                      disabled={isLoading}
                    >
                      {LENGTHS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="purpose" className="block text-sm font-bold text-ink dark:text-zinc-300 mb-2 uppercase tracking-wide font-mono">
                    {t("gen.purpose")}
                  </label>
                  <textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder={t("gen.placeholder")}
                    className="w-full border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:text-zinc-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[120px] resize-y placeholder:text-ink-faint dark:placeholder:text-zinc-500"
                    disabled={isLoading}
                  />
                  <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-2 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {t("gen.optimized", { category: AI_TOOLS.find((t) => t.name === selectedAI)?.category || "전체" })}
                  </p>
                </div>

                {/* Freemium Progress Bar */}
                {isLoaded && (
                  <div className="mb-4">
                    {isAdmin ? (
                      <div className="text-center bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-bold py-2 border border-brand-200 dark:border-brand-800/50">
                        ✨ {t("free.adminUnlimited")}
                      </div>
                    ) : isPro ? (
                      <div className="text-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold py-2 border border-emerald-200 dark:border-emerald-800/50">
                        ✨ Pro Plan Active
                      </div>
                    ) : usageCount < MAX_FREE_LIMIT ? (
                      <div className="flex items-center gap-3 bg-surface-muted dark:bg-zinc-950 p-3 border-[2px] border-ink-faint dark:border-zinc-800">
                        <div className="text-[11px] font-black uppercase text-ink dark:text-zinc-300 whitespace-nowrap tracking-wide">
                          {t("free.remaining")}: <span className="text-brand-600 dark:text-brand-400 ml-1">{Math.max(0, MAX_FREE_LIMIT - usageCount)} / {MAX_FREE_LIMIT}</span>
                        </div>
                        <div className="flex-1 h-2.5 bg-ink-faint/30 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 transition-all duration-500"
                            style={{ width: `${(usageCount / MAX_FREE_LIMIT) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : coins > 0 ? (
                      <div className="flex items-center justify-between bg-surface-muted dark:bg-zinc-950 p-3 border-[2px] border-ink-faint dark:border-zinc-800">
                        <div className="text-[11px] font-black tracking-wide uppercase text-ink dark:text-zinc-300 flex items-center">
                          {t("free.coins")}: <span className="text-brand-600 dark:text-brand-400 ml-1 mr-2 text-sm">💎 {coins}</span>
                          <span className="text-ink-muted dark:text-zinc-500 text-[10px]">{t("free.perUse", { cost: COST_PER_GENERATION })}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_COINS_50;
                            if (priceId) openPaddleCheckout(priceId);
                          }}
                          className="text-[10px] sm:text-xs font-black text-white bg-ink dark:bg-zinc-300 dark:text-zinc-900 px-3 py-1.5 border-[2px] border-ink dark:border-black hover:bg-brand-500 transition-colors uppercase"
                        >
                          {t("free.recharge")} ⚡
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/30 p-3 border-[2px] border-rose-300 dark:border-rose-800">
                        <div className="text-[11px] font-black text-rose-700 dark:text-rose-400">
                          {t("free.exhausted")}
                        </div>
                        <div className="flex gap-2">
                          {!isSignedIn && (
                            <button
                              type="button"
                              onClick={() => setIsAuthModalOpen(true)}
                              className="text-[10px] font-black text-white bg-brand-500 px-3 py-1.5 hover:bg-brand-600"
                            >
                              {t("header.login")}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_COINS_50;
                              if (priceId) openPaddleCheckout(priceId);
                            }}
                            className="text-[10px] font-black text-white bg-ink dark:bg-zinc-300 dark:text-zinc-900 px-3 py-1.5 hover:bg-brand-500"
                          >
                            {t("free.recharge")} ⚡
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !purpose.trim()}
                  className={cn(
                    "w-full py-4 px-6 border-[3px] border-ink dark:border-black font-black text-lg tracking-wide uppercase transition-all duration-200",
                    isLoading || !purpose.trim()
                      ? "bg-surface-muted dark:bg-zinc-800 text-ink-muted dark:text-zinc-500 cursor-not-allowed"
                      : "bg-brand-400 text-ink hover:bg-brand-500 hover:-translate-y-1 shadow-[4px_4px_0px_#1f2937] dark:shadow-[4px_4px_0px_#000]"
                  )}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2 animate-pulse">
                      <Sparkles className="w-5 h-5" /> {t("gen.submitting")}
                    </span>
                  ) : (
                    <span>
                      {t("gen.submit")} 🚀
                      {isLoaded && !isAdmin && !isPro && usageCount >= MAX_FREE_LIMIT && coins > 0 && (
                        <span className="text-[10px] ml-2 text-rose-600 dark:text-rose-400">{t("gen.coinCost", { cost: COST_PER_GENERATION })}</span>
                      )}
                    </span>
                  )}
                </button>
              </form>

              {/* Activity / Result Area */}
              <div ref={resultRef} className="mt-8">
                {error && (
                  <div className="bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-400 p-4 text-center">
                    <p className="text-sm text-rose-600 font-bold mb-2">{error}</p>
                    <button onClick={() => { clearError(); handleReset(); }} className="text-xs underline text-rose-500">
                      Reset
                    </button>
                  </div>
                )}

                {isLoading && (
                  <div className="w-full max-w-3xl border-[3px] border-ink dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900 animate-fade-in shadow-[4px_4px_0px_#1f2937] dark:shadow-[4px_4px_0px_#000]">
                    <div className="flex items-center space-x-4 mb-6">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                      <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-[60%]" />
                        <Skeleton className="h-3 w-[40%]" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-[90%]" />
                      <Skeleton className="h-4 w-[95%]" />
                      <Skeleton className="h-20 w-full mt-4" />
                    </div>
                  </div>
                )}

                {phase === "result" && currentResult && (
                  <div className="animate-fade-in py-2">
                    <PromptResult result={currentResult} onRetry={handleRetry} />
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "history" && (
            <div className="bg-white dark:bg-zinc-900 border-[3px] border-ink dark:border-zinc-800 p-5 shadow-[4px_4px_0px_#1f2937] dark:shadow-[4px_4px_0px_#000] min-h-[400px]">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-ink-muted dark:text-zinc-500 py-20">
                  <History className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-bold">{t("history.empty")}</p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-ink dark:text-zinc-200 text-sm">{t("history.localStorage")} ({history.length})</h3>
                    <button onClick={clearHistory} className="text-xs text-rose-500 font-bold flex items-center gap-1 hover:underline">
                      <Trash2 className="w-3 h-3" /> {t("history.clearAll")}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div key={item.id} className="border-2 border-ink-faint dark:border-zinc-800 p-4 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-ink dark:text-zinc-200 text-sm">{item.title}</h4>
                          <span className="text-[10px] text-ink-muted dark:text-zinc-500 font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-ink-secondary dark:text-zinc-400 line-clamp-3 mb-3 bg-surface-muted dark:bg-zinc-950 p-2 font-mono whitespace-pre-wrap">
                          {item.prompt}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] px-2 py-0.5 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 font-bold border border-brand-200 dark:border-brand-800/50">
                            {item.category}
                          </span>
                          <div className="flex gap-2">
                            <button onClick={() => removePrompt(item.id)} className="text-[11px] text-ink-muted hover:text-rose-500 font-bold">
                              {t("history.delete")}
                            </button>
                            <button onClick={() => copyHistoryText(item.prompt)} className="text-[11px] text-white bg-ink dark:bg-zinc-100 dark:text-zinc-900 px-3 py-1 font-bold hover:bg-brand-500 transition-colors shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]">
                              {t("history.copy")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: AI Tools Hub */}
        <div className="lg:w-[380px] xl:w-[420px] shrink-0 lg:sticky lg:top-24 lg:self-start max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
          <div className="mb-4">
            <h2 className="text-xl md:text-2xl font-black text-ink dark:text-zinc-100 flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-brand-500" />
              {t("hub.title")}
            </h2>
          </div>

          <div className="mb-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-ink-muted dark:text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder={t("hub.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:text-zinc-100 pl-10 pr-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-ink-faint dark:placeholder:text-zinc-600 shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]"
            />
          </div>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1 text-xs font-bold border-2 border-ink dark:border-zinc-700 transition-colors shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]",
                  activeCategory === cat ? "bg-brand-400 text-ink" : "bg-white dark:bg-zinc-800 text-ink dark:text-zinc-300 hover:bg-surface-muted dark:hover:bg-zinc-700"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-4 pb-10">
            {filteredTools.map((tool) => (
              <div key={tool.name} className="bg-white dark:bg-zinc-900 border-[2px] border-ink dark:border-zinc-700 shadow-[3px_3px_0px_#1f2937] dark:shadow-[3px_3px_0px_#000] hover:-translate-y-1 transition-all group">
                <div className={cn("px-4 py-2 flex justify-between items-center border-b-2 border-ink dark:border-zinc-800", tool.color)}>
                  <h3 className="font-black text-[15px]">
                    <Link href={`/tools/${tool.slug}`} className="hover:underline">
                      {tool.name}
                    </Link>
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 border border-current bg-white dark:bg-black/20">
                    {tool.desc}
                  </span>
                </div>
                <div className="p-3 grid grid-cols-2 gap-2 bg-surface-muted dark:bg-zinc-950">
                  <a href={tool.signUpUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-[11px] font-bold px-2 py-2 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-zinc-200 hover:bg-ink hover:text-white transition-colors">
                    <ExternalLink className="w-3 h-3" /> {t("hub.official")}
                  </a>
                  <a href={tool.deleteAccountUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-[11px] font-bold px-2 py-2 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-zinc-200 hover:bg-rose-500 hover:text-white transition-colors">
                    <UserX className="w-3 h-3" /> {t("hub.deleteAccount")}
                  </a>
                  <a href={tool.subscribeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-[11px] font-bold px-2 py-2 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-zinc-200 hover:bg-brand-500 hover:text-white transition-colors" title={tool.price}>
                    <CreditCard className="w-3 h-3" /> {t("hub.pricing")}
                  </a>
                  <a href={tool.cancelSubscriptionUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-[11px] font-bold px-2 py-2 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-zinc-200 hover:bg-emerald-500 hover:text-white transition-colors">
                    <Zap className="w-3 h-3" /> {t("hub.cancelSub")}
                  </a>
                </div>
              </div>
            ))}
            {filteredTools.length === 0 && (
              <div className="text-center py-8 text-ink-muted text-sm font-bold border-2 border-dashed border-ink-faint">
                {t("hub.noResult")}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
