"use client";

import { useState, useCallback } from "react";
import { Copy, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackContentShared } from "@/lib/gtag";
import type { ResultResponse } from "@/lib/types";

interface PromptResultProps {
  result: ResultResponse;
  onRetry: () => void;
}

export function PromptResult({ result, onRetry }: PromptResultProps) {
  const [copied, setCopied] = useState(false);
  
  const generatedPrompt = result.searchQueries?.[0] || "프롬프트를 생성하지 못했습니다.";

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      trackContentShared("copy_prompt", result.title);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }, [generatedPrompt, result.title]);

  return (
    <div className="w-full max-w-3xl mx-auto animate-pop-in">
      <div className="border-[3px] border-ink dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_#1f2937] dark:shadow-[4px_4px_0px_#000]">
        
        {/* Header */}
        <div className="bg-ink dark:bg-zinc-800 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-mono text-sm tracking-widest font-bold">
            ✨ PROMPT GENERATED
          </span>
          <span className="font-mono text-xs font-black px-2.5 py-0.5 bg-brand-400 text-ink rounded-full">
            SUCCESS
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 md:p-6 pb-20 md:pb-4 position-relative">
          <div className="mb-4">
            <h2 className="text-xl md:text-2xl font-black text-ink dark:text-zinc-100 leading-tight mb-2">
              {result.title}
            </h2>
            {result.reasoning?.length > 0 && (
              <ul className="text-sm text-ink-secondary dark:text-zinc-400 list-disc list-inside space-y-1">
                {result.reasoning.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Prompt Code Block */}
          <div className="relative group mt-5">
            <div className="absolute -top-3 left-4 bg-white dark:bg-zinc-900 px-2 text-xs font-bold text-ink-muted dark:text-zinc-500 z-10 font-mono uppercase tracking-widest">
              Prompt Output
            </div>
            <pre className="relative w-full text-sm font-mono text-ink dark:text-zinc-200 bg-surface-muted dark:bg-zinc-950 p-5 pt-6 border-[2px] border-ink dark:border-zinc-700 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {generatedPrompt}
            </pre>
            <button
              onClick={handleCopy}
              className={cn(
                "hidden md:flex absolute top-3 right-3 p-2 transition-all border-[2px] border-ink dark:border-zinc-700 hover:-translate-y-0.5 shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000] active:translate-y-0 active:shadow-none",
                copied ? "bg-emerald-400 text-ink dark:bg-emerald-500 dark:text-zinc-900" : "bg-brand-500 text-white dark:bg-brand-600 dark:border-black"
              )}
              aria-label="Copy Prompt"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {result.suggestions?.length > 0 && (
            <div className="mt-5 p-4 bg-brand-50 dark:bg-zinc-800/50 border-[2px] border-brand-200 dark:border-zinc-700">
              <p className="font-bold text-sm text-brand-800 dark:text-zinc-300 mb-2">💡 활용 팁</p>
              <ul className="text-sm text-brand-700 dark:text-zinc-400 list-disc list-inside space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions (Floating on Mobile) */}
        <div className="bg-surface-muted dark:bg-zinc-900/50 border-t-[3px] border-ink dark:border-zinc-800 p-4 flex justify-end gap-3 fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none bg-opacity-95 backdrop-blur-sm md:backdrop-blur-none">
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-1.5",
              "py-3 md:py-2 px-4",
              "border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-800 text-ink dark:text-zinc-200",
              "text-sm font-bold",
              "hover:bg-ink hover:text-white dark:hover:bg-zinc-700 active:translate-y-[1px]",
              "transition-all duration-150 shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]"
            )}
          >
            <RotateCcw className="w-4 h-4" />
            다시 생성
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "flex-[2_2_0%] md:flex-none flex items-center justify-center gap-1.5",
              "py-3 md:py-2 px-5",
              "border-[2px] border-ink dark:border-zinc-700 text-white",
              "text-sm font-black",
              "active:translate-y-[1px]",
              "transition-all duration-150 shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]",
              copied ? "bg-emerald-500 hover:bg-emerald-600 border-transparent text-white" : "bg-ink dark:bg-zinc-100 dark:text-zinc-900 hover:bg-gray-800"
            )}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 md:w-4 md:h-4" />
                복사 완료
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 md:w-4 md:h-4" />
                프롬프트 복사하기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
