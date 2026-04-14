"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { RotateCcw, Sparkles, Zap, ExternalLink, CreditCard, UserX, LayoutTemplate, Sun, Moon, History, Trash2, Search, Info, UserCircle, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatFlow } from "@/hooks/useChatFlow";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { useFreemium, MAX_FREE_LIMIT, COST_PER_GENERATION } from "@/hooks/useFreemium";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
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
  const { usageCount, coins, isAdmin, userEmail, userId, isLoaded, canGenerate, incrementUsage, addCoins, verifyAdmin } = useFreemium();



  // Save history and increment usage when a beautiful new response arrives
  useEffect(() => {
    if (phase === "result" && currentResult) {
      savePrompt(currentResult);
      incrementUsage();
      toast.success(
        <div>
           <p className="font-bold">프롬프트 조립 완료!</p>
           {!isAdmin && usageCount >= MAX_FREE_LIMIT && <p className="text-xs text-muted-foreground mt-1 text-rose-500 font-mono">- {COST_PER_GENERATION} 코인 차감 💎</p>}
        </div>
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentResult]);

  const [activeTab, setActiveTab] = useState<"generator" | "history">("generator");
  
  // Generator State
  const [selectedAI, setSelectedAI] = useState(AI_TOOLS[0].name);
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState(LENGTHS[0]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      
      // Handle Toss Payments success
      const paymentStatus = params.get("payment");
      
      if (paymentStatus === "completed") {
        toast.success("코인이 성공적으로 충전되었습니다!", { description: '이제 자유롭게 프롬프트 생성을 이어가세요!' });
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === "fail") {
        toast.error("결제가 취소되었거나 실패했습니다.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Handle AI Tool routing
      const toolSlug = params.get("tool");
      if (toolSlug) {
        const found = AI_TOOLS.find(t => t.slug === toolSlug);
        if (found) {
          setSelectedAI(found.name);
          setActiveTab("generator");
        }
      }
    }
  }, []);
  
  const handleAdminVerify = () => {
    const email = window.prompt("스태프/관리자 인증: 등록된 이메일을 입력하세요.");
    if (email) {
      if (verifyAdmin(email)) {
        toast.success("관리자 계정 인증 완료!", { description: '코인 차감 없이 평생 무료 사용이 가능합니다.' });
      } else {
        toast.error("등록되지 않은 이메일입니다.");
      }
    }
  };
  
  // Link Hub State
  const [activeCategory, setActiveCategory] = useState<Category>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredTools = useMemo(() => {
    return AI_TOOLS.filter((t) => {
      const matchCat = activeCategory === "전체" || t.category === activeCategory;
      const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
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
    
    // Check Freemium Limitation
    if (!canGenerate) {
      window.location.href = '/checkout.html';
      return;
    }

    clearError();
    // 프론트엔드 자동 조립 로직으로 전달 (API 통신 제거)
    handleSearch(selectedAI, purpose.trim(), tone, length);
  };

  // Keyboard shortcut: Ctrl/Cmd + Enter to Submit
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purpose, isLoading, canGenerate, selectedAI, tone, length]);

  const copyHistoryText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("클립보드에 복사되었습니다.");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-[#FAFAF8] dark:bg-zinc-950 transition-colors" role="main">


      <header className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b-[3px] border-ink dark:border-zinc-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2.5 group hover:opacity-80 transition-opacity"
            aria-label="홈"
          >
            <div className="w-8 h-8 bg-brand-500 border-[2px] border-ink dark:border-black flex items-center justify-center text-white font-black group-hover:bg-brand-600 transition-colors shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div className="flex flex-col text-left" onDoubleClick={handleAdminVerify}>
              <span className="text-[15px] font-black tracking-tight leading-none text-ink dark:text-zinc-100 cursor-default">
                AI Handler
              </span>
              <span className="text-[9px] font-mono text-ink-muted dark:text-zinc-400 tracking-wide mt-0.5 cursor-default">
                AI 핸들러
              </span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            {isLoaded && isAdmin && (
               <span className="hidden sm:inline-block px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-[10px] font-black uppercase tracking-widest rounded-full">
                 ADMIN ⚡
               </span>
            )}
            {isActive && (
              <button
                type="button"
                onClick={handleReset}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold hover:bg-ink hover:text-white dark:hover:bg-zinc-700 dark:text-zinc-200 active:translate-y-[1px] shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]"
              >
                <RotateCcw className="w-3 h-3" />
                새로 조립하기
              </button>
            )}

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 text-ink dark:text-zinc-200 hover:bg-brand-50 dark:hover:bg-zinc-700 active:translate-y-[1px] shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]"
                aria-label="테마 변경"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            <div className="flex items-center ml-1 border-l pl-3 dark:border-zinc-800">
              {!isSignedIn ? (
                <button 
                  onClick={loginWithGoogle}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold hover:bg-brand-500 transition-colors shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  로그인
                </button>
              ) : (
                <div className="flex items-center gap-2">
                   <span className="hidden md:block text-[10px] font-mono text-ink-muted dark:text-zinc-400 max-w-[100px] truncate">{userEmail}</span>
                   <button 
                    onClick={logout}
                    className="p-2 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 text-ink dark:text-zinc-200 hover:bg-red-50 dark:hover:bg-red-900/20 active:translate-y-[1px] shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]"
                    title="로그아웃"
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
                activeTab === "generator" ? "bg-ink text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-ink-muted hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              <Zap className="w-4 h-4" /> 프롬프트 생성기
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "px-5 py-3 font-black text-sm uppercase tracking-widest flex items-center gap-2",
                activeTab === "history" ? "bg-ink text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-ink-muted hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              <History className="w-4 h-4" /> 최근 내역 <span className="text-[10px] bg-brand-500 text-white px-1.5 rounded-full">{history.length}</span>
            </button>
          </div>

          {activeTab === "generator" && (
            <>
              <form onSubmit={onSubmit} className="bg-white dark:bg-zinc-900 border-[3px] border-ink dark:border-zinc-800 p-5 md:p-7 shadow-[4px_4px_0px_#1f2937] dark:shadow-[4px_4px_0px_#000]">
                <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="ai-select" className="block text-xs font-bold text-ink dark:text-zinc-300 mb-1.5 uppercase tracking-wide font-mono">
                      1. 대상 AI 툴
                    </label>
                    <div className="relative">
                      <select
                        id="ai-select"
                        value={selectedAI}
                        onChange={(e) => setSelectedAI(e.target.value)}
                        className="w-full border-[2px] border-ink dark:border-zinc-700 bg-surface-muted dark:bg-zinc-800 dark:text-zinc-200 px-3 py-2 text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                        disabled={isLoading}
                      >
                        {CATEGORIES.filter(c => c !== "전체").map(cat => (
                          <optgroup key={cat} label={cat}>
                            {AI_TOOLS.filter(t => t.category === cat).map(tool => (
                              <option key={tool.name} value={tool.name}>{tool.name}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="tone-select" className="block text-xs font-bold text-ink dark:text-zinc-300 mb-1.5 uppercase tracking-wide font-mono">
                      2. 어조 (Tone)
                    </label>
                    <select
                      id="tone-select"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full border-[2px] border-ink dark:border-zinc-700 bg-surface-muted dark:bg-zinc-800 dark:text-zinc-200 px-3 py-2 text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                      disabled={isLoading}
                    >
                      {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="len-select" className="block text-xs font-bold text-ink dark:text-zinc-300 mb-1.5 uppercase tracking-wide font-mono">
                      3. 길이 (Length)
                    </label>
                    <select
                      id="len-select"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full border-[2px] border-ink dark:border-zinc-700 bg-surface-muted dark:bg-zinc-800 dark:text-zinc-200 px-3 py-2 text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                      disabled={isLoading}
                    >
                      {LENGTHS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="purpose" className="block text-sm font-bold text-ink dark:text-zinc-300 mb-2 uppercase tracking-wide font-mono">
                    4. 어떤 결과물을 원하시나요? (목적)
                  </label>
                  <textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="예: 20대 타겟 다이어트 보조제 상세페이지 카피라이팅 기획해줘"
                    className="w-full border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:text-zinc-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[120px] resize-y placeholder:text-ink-faint dark:placeholder:text-zinc-500"
                    disabled={isLoading}
                  />
                  <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-2 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    선택하신 [{AI_TOOLS.find(t=>t.name === selectedAI)?.category}] 모델에 맞춰 파라미터가 자동 번역/최적화됩니다.
                  </p>
                </div>

                {/* Freemium Progress Bar */}
                {isLoaded && (
                  <div className="mb-4">
                    {isAdmin ? (
                      <div className="text-center bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-bold py-2 border border-brand-200 dark:border-brand-800/50">
                        ✨ 관리자 무제한 사용 활성화
                      </div>
                    ) : usageCount < MAX_FREE_LIMIT ? (
                      <div className="flex items-center gap-3 bg-surface-muted dark:bg-zinc-950 p-3 border-[2px] border-ink-faint dark:border-zinc-800">
                        <div className="text-[11px] font-black uppercase text-ink dark:text-zinc-300 whitespace-nowrap tracking-wide">
                          남은 무료 횟수: <span className="text-brand-600 dark:text-brand-400 ml-1">{Math.max(0, MAX_FREE_LIMIT - usageCount)} / {MAX_FREE_LIMIT}</span>
                        </div>
                        <div className="flex-1 h-2.5 bg-ink-faint/30 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-500 transition-all duration-500 ease-in-out" 
                            style={{ width: `${(usageCount / MAX_FREE_LIMIT) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-surface-muted dark:bg-zinc-950 p-3 border-[2px] border-ink-faint dark:border-zinc-800">
                        <div className="text-[11px] font-black tracking-wide uppercase text-ink dark:text-zinc-300 whitespace-nowrap flex items-center">
                          보유 코인: <span className="text-brand-600 dark:text-brand-400 ml-1 mr-2 text-sm">💎 {coins}</span>
                          <span className="text-ink-muted dark:text-zinc-500 text-[10px]">(1회 = {COST_PER_GENERATION}코인 차감)</span>
                        </div>
                        <a 
                          href={`/checkout.html?${new URLSearchParams({
                            email: userEmail || "",
                            userId: userId || ""
                          }).toString()}`} 
                          className="text-[10px] sm:text-xs font-black text-white bg-ink dark:bg-zinc-300 dark:text-zinc-900 px-3 py-1.5 border-[2px] border-ink dark:border-black rounded-none shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000] hover:bg-brand-500 hover:text-white transition-colors uppercase"
                        >
                           코인 충전 ⚡
                        </a>
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
                      <Sparkles className="w-5 h-5" /> 전문 프레임워크 조립 중...
                    </span>
                  ) : (
                    <span>
                      프롬프트 자동 조립 🚀
                      {isLoaded && !isAdmin && usageCount >= MAX_FREE_LIMIT && (
                        <span className="text-[10px] ml-2 text-rose-600 dark:text-rose-400">(-{COST_PER_GENERATION} 코인)</span>
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
                    <button onClick={() => { clearError(); handleReset(); }} className="text-xs underline text-rose-500">초기화</button>
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
                  <p className="text-sm font-bold">최근 생성된 프롬프트가 없습니다.</p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-ink dark:text-zinc-200 text-sm">로컬 저장소 ({history.length})</h3>
                    <button onClick={clearHistory} className="text-xs text-rose-500 font-bold flex items-center gap-1 hover:underline">
                      <Trash2 className="w-3 h-3" /> 모두 지우기
                    </button>
                  </div>
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div key={item.id} className="border-2 border-ink-faint dark:border-zinc-800 p-4 hover:border-brand-300 dark:hover:border-brand-700 transition-colors group relative">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-ink dark:text-zinc-200 text-sm">{item.title}</h4>
                          <span className="text-[10px] text-ink-muted dark:text-zinc-500 font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-ink-secondary dark:text-zinc-400 line-clamp-3 mb-3 bg-surface-muted dark:bg-zinc-950 p-2 font-mono whitespace-pre-wrap">{item.prompt}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] px-2 py-0.5 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 font-bold border border-brand-200 dark:border-brand-800/50">{item.category}</span>
                          <div className="flex gap-2">
                            <button onClick={() => removePrompt(item.id)} className="text-[11px] text-ink-muted hover:text-rose-500 font-bold">삭제</button>
                            <button onClick={() => copyHistoryText(item.prompt)} className="text-[11px] text-white bg-ink dark:bg-zinc-100 dark:text-zinc-900 px-3 py-1 font-bold hover:bg-brand-500 dark:hover:bg-brand-400 transition-colors shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]">복사</button>
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
              글로벌 AI 툴 허브
            </h2>
          </div>

          <div className="mb-5 relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-ink-muted dark:text-zinc-500" />
             </div>
             <input
               type="text"
               placeholder="원하는 AI 툴 검색..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:text-zinc-100 pl-10 pr-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-ink-faint dark:placeholder:text-zinc-600 shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]"
             />
          </div>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
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
              <div key={tool.name} className="bg-white dark:bg-zinc-900 border-[2px] border-ink dark:border-zinc-700 shadow-[3px_3px_0px_#1f2937] dark:shadow-[3px_3px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1f2937] dark:hover:shadow-[6px_6px_0px_#000] transition-all duration-200 group">
                <div className={cn("px-4 py-2 flex justify-between items-center border-b-2 border-ink dark:border-zinc-800", tool.color)}>
                  <h3 className="font-black text-[15px]">
                    <Link href={`/tools/${tool.slug}`} className="hover:underline">
                      {tool.name}
                    </Link>
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 border border-current bg-white dark:bg-black/20 text-ink dark:text-white">
                    {tool.desc}
                  </span>
                </div>
                <div className="p-3 grid grid-cols-2 gap-2 bg-surface-muted dark:bg-zinc-950">
                  <a href={tool.signUpUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-[11px] font-bold px-2 py-2 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-zinc-200 hover:bg-ink hover:text-white dark:hover:bg-zinc-700 transition-colors">
                    <ExternalLink className="w-3 h-3" /> 공식홈 (가입)
                  </a>
                  <a href={tool.deleteAccountUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-[11px] font-bold px-2 py-2 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-zinc-200 hover:bg-rose-500 hover:text-white transition-colors">
                    <UserX className="w-3 h-3" /> 탈퇴/계정관리
                  </a>
                  
                  {/* Tooltip implementation for Pricing */}
                  <div className="relative group flex">
                    <a href={tool.subscribeUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold px-2 py-2 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-zinc-200 hover:bg-brand-500 hover:text-white dark:hover:border-brand-500 transition-colors">
                      <CreditCard className="w-3 h-3" /> 유료 플랜/구독
                    </a>
                    {/* Tooltip content */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-ink text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      {tool.price}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink"></div>
                    </div>
                  </div>

                  <a href={tool.cancelSubscriptionUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-[11px] font-bold px-2 py-2 border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 dark:text-zinc-200 hover:bg-emerald-500 hover:text-white transition-colors">
                    <Zap className="w-3 h-3" /> 구독 해지버튼
                  </a>
                </div>
              </div>
            ))}
            {filteredTools.length === 0 && (
              <div className="text-center py-8 text-ink-muted text-sm font-bold border-2 border-dashed border-ink-faint">
                검색된 AI 툴이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

    </main>
  );
}
