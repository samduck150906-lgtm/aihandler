"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { RotateCcw, Sparkles, Zap, ExternalLink, CreditCard, UserX, LayoutTemplate, Sun, Moon, History, Trash2, Search, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatFlow } from "@/hooks/useChatFlow";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { useFreemium, MAX_FREE_LIMIT } from "@/hooks/useFreemium";
import { PromptResult } from "@/components/prompt-result";
import { Skeleton } from "@/components/skeleton";
import { PaywallModal } from "@/components/paywall-modal";

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
  const { usageCount, isPremium, isLoaded, canGenerate, incrementUsage, unlockPremium } = useFreemium();

  const [showPaywall, setShowPaywall] = useState(false);

  // Save history and increment usage when a beautiful new response arrives
  useEffect(() => {
    if (phase === "result" && currentResult) {
      savePrompt(currentResult);
      incrementUsage();
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
      if (paymentStatus === "success") {
        unlockPremium();
        alert("프리미엄 결제가 완료되었습니다! 이제 AI 핸들러를 무제한으로 자유롭게 이용해 보세요.");
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === "fail") {
        alert("결제가 취소되었거나 실패했습니다.");
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
  }, [unlockPremium]);
  
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
      setShowPaywall(true); 
      return;
    }

    const selectedToolObj = AI_TOOLS.find(t => t.name === selectedAI) || AI_TOOLS[0];
    const categoryInject = `[카테고리: ${selectedToolObj.category}]`;
    const toneParam = tone === "상관없음" ? "" : ` [어조: ${tone}]`;
    const lenParam = length === "상관없음" ? "" : ` [길이: ${length}]`;
    const query = `${categoryInject} [대상AI: ${selectedAI}]${toneParam}${lenParam} 목적: ${purpose.trim()}`;
    
    clearError();
    handleSearch(query);
  };

  const copyHistoryText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("복사되었습니다.");
    } catch {
      // ignore
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-[#FAFAF8] dark:bg-zinc-950 transition-colors" role="main">
      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
        onUpgradeSuccess={() => {
          unlockPremium();
          setShowPaywall(false);
          alert("프리미엄 무제한 이용권이 활성화되었습니다!");
        }} 
      />

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
            <div className="flex flex-col text-left">
              <span className="text-[15px] font-black tracking-tight leading-none text-ink dark:text-zinc-100">
                AI Handler
              </span>
              <span className="text-[9px] font-mono text-ink-muted dark:text-zinc-400 tracking-wide mt-0.5">
                AI 핸들러
              </span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            {isLoaded && isPremium && (
               <span className="hidden sm:inline-block px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-[10px] font-black uppercase tracking-widest rounded-full">
                 PRO ⚡
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
                    {isPremium ? (
                      <div className="text-center bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-bold py-2 border border-brand-200 dark:border-brand-800/50">
                        ✨ 무제한 프리미엄 활성화
                      </div>
                    ) : (
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
                        {usageCount >= MAX_FREE_LIMIT && (
                           <button type="button" onClick={() => setShowPaywall(true)} className="text-[10px] font-bold text-white bg-ink dark:bg-zinc-300 dark:text-zinc-900 px-2.5 py-1 rounded">제한 해제</button>
                        )}
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
                    "프롬프트 자동 조립 🚀"
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
        <div className="lg:w-[380px] xl:w-[420px] shrink-0">
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

          <div className="grid gap-4">
            {filteredTools.map((tool) => (
              <div key={tool.name} className="bg-white dark:bg-zinc-900 border-[2px] border-ink dark:border-zinc-700 shadow-[3px_3px_0px_#1f2937] dark:shadow-[3px_3px_0px_#000]">
                <div className={cn("px-4 py-2 flex justify-between items-center border-b-2 border-ink dark:border-zinc-800", tool.color)}>
                  <h3 className="font-black text-[15px]">
                    <Link href={`/tools/${tool.slug}`} className="hover:underline">
                      {tool.name}
                    </Link>
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 border border-current bg-white dark:bg-black/20 text-white">
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

      <footer className="mt-auto py-12 text-center border-t border-ink-faint dark:border-zinc-800 border-dashed bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col text-left mb-2 md:mb-0">
             <div className="flex items-center gap-2 mb-3">
               <div className="w-6 h-6 bg-brand-500 flex items-center justify-center text-white"><Sparkles className="w-3 h-3" /></div>
               <span className="font-black text-ink dark:text-zinc-100 text-lg">AI 핸들러</span>
             </div>
             <p className="text-[11px] font-bold text-ink-muted dark:text-zinc-500 mb-1 max-w-sm leading-tight group flex items-start gap-1">
               <Info className="w-3 h-3 mt-0.5 shrink-0" />
               국내 최초 4단계 맞춤형 프롬프트 생성 모델 및 글로벌 주요 제너레이티브 AI 마켓 서비스 직통 허브.
             </p>
          </div>
          
          <div className="text-[11px] text-left md:text-right font-bold text-ink-secondary dark:text-zinc-400 space-y-1.5 border-l-2 md:border-l-0 border-ink-faint md:border-r-2 dark:border-zinc-800 pl-4 md:pl-0 md:pr-4">
            <p><span className="text-ink dark:text-zinc-300 mr-1.5 uppercase font-mono tracking-wider text-[9px]">Company</span> 이터널식스 (Eternal Six)</p>
            <p><span className="text-ink dark:text-zinc-300 mr-1.5 uppercase font-mono tracking-wider text-[9px]">CEO</span> 성아름 <span className="text-ink dark:text-zinc-300 mx-2 text-[9px]">|</span> 개인사업자</p>
            <p><span className="text-ink dark:text-zinc-300 mr-1.5 uppercase font-mono tracking-wider text-[9px]">Office</span> 경기도 수원시 영통구 삼성로186-1 4층</p>
            <p><span className="text-ink dark:text-zinc-300 mr-1.5 uppercase font-mono tracking-wider text-[9px]">Contact</span> 010-8111-9370 <span className="text-ink dark:text-zinc-300 mx-2 text-[9px]">|</span> cinging1000@naver.com</p>
            <p className="pt-2 text-[10px] text-ink-faint dark:text-zinc-600">Copyright © 2026 이터널식스 All rights reserved. AI Handler V5.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
