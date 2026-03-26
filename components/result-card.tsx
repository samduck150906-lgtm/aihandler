"use client";

import { useState, useCallback } from "react";
import { ExternalLink, RotateCcw, ShoppingCart, Search, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResultResponse } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { trackContentShared } from "@/lib/gtag";

const SHARE_URL = "https://whatwasit.kr";

const GOOGLE_SEARCH_BASE = "https://www.google.com/search?q=";
const COUPANG_SEARCH_BASE = "https://www.coupang.com/np/search?q=";
const YOUTUBE_SEARCH_BASE = "https://www.youtube.com/results?search_query=";

interface ResultCardProps {
  result: ResultResponse;
  onRetry: () => void;
}

export function ResultCard({ result, onRetry }: ResultCardProps) {
  const [shareLabel, setShareLabel] = useState<string | null>(null);
  const meta = CATEGORY_META[result.category] ?? CATEGORY_META.other;
  const searchQueries = result.searchQueries?.length
    ? result.searchQueries
    : [result.title];
  const primaryQuery = searchQueries[0] ?? result.title;

  const isShoppable = result.category === "product";
  const isMedia = ["movie", "song", "meme", "book"].includes(result.category);

  const handleShare = useCallback(async () => {
    const title = `뭐였더라 - ${result.title}`;
    const text = `"${result.title}" 찾았어요! whatwasit.kr에서 AI 탐정이 도와줬어요.`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title,
          text,
          url: SHARE_URL,
        });
        trackContentShared("web_share", result.title);
        setShareLabel("공유됨!");
        setTimeout(() => setShareLabel(null), 2000);
      } else {
        await navigator.clipboard.writeText(`${text} ${SHARE_URL}`);
        trackContentShared("copy_link", result.title);
        setShareLabel("링크 복사됨!");
        setTimeout(() => setShareLabel(null), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(`${text} ${SHARE_URL}`);
      trackContentShared("copy_link", result.title);
      setShareLabel("링크 복사됨!");
      setTimeout(() => setShareLabel(null), 2000);
    }
  }, [result.title]);

  return (
    <div className="w-full max-w-xl mx-auto animate-pop-in">
      <div className="border-[3px] border-ink bg-white overflow-hidden">
        <div className="bg-ink text-white px-4 py-2.5 flex items-center justify-between">
          <span className="font-mono text-xs tracking-wider">
            ✅ WHATWASIT FOUND
          </span>
          <span
            className={cn(
              "font-mono text-xs font-black px-2.5 py-0.5",
              result.confidence >= 90
                ? "bg-emerald-400 text-ink"
                : result.confidence >= 80
                  ? "bg-brand-400 text-ink"
                  : "bg-yellow-400 text-ink"
            )}
          >
            {result.confidence}%
          </span>
        </div>

        <div className="relative bg-surface-muted border-b-[3px] border-ink">
          <img
            src={`https://placehold.co/600x320/f5f5f3/d1d5db?text=${encodeURIComponent(meta.emoji + " " + result.title)}&font=source-sans-pro`}
            alt={result.title}
            className="w-full h-40 object-cover"
          />
          <div
            className={cn(
              "absolute top-3 left-3",
              "px-2.5 py-1 text-xs font-bold",
              "border-[2px] border-ink",
              meta.color
            )}
          >
            {meta.emoji} {meta.label}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">{meta.emoji}</span>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-ink leading-tight break-keep">
                {result.title}
              </h2>
            </div>
          </div>

          {result.reasoning?.length > 0 && (
            <ul className="text-[15px] text-ink-secondary leading-relaxed mb-3 list-disc list-inside space-y-0.5">
              {result.reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}

          {result.suggestions?.length > 0 && (
            <p className="text-sm text-ink-muted mb-4">
              추천: {result.suggestions.join(", ")}
            </p>
          )}

          {/* 검색 쿼리 링크 (3~6개 Google) */}
          <div className="mb-4">
            <p className="font-mono text-[10px] text-ink-muted tracking-wider uppercase mb-2">
              바로 검색해 보기
            </p>
            <div className="flex flex-wrap gap-2">
              {searchQueries.slice(0, 6).map((q, i) => (
                <a
                  key={i}
                  href={GOOGLE_SEARCH_BASE + encodeURIComponent(q)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1",
                    "px-2.5 py-1.5",
                    "border-[2px] border-ink bg-white text-ink",
                    "text-xs font-bold",
                    "hover:bg-brand-50 active:translate-y-[1px]",
                    "transition-all duration-150"
                  )}
                >
                  <Search className="w-3 h-3" />
                  {q.length > 18 ? q.slice(0, 18) + "…" : q}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <a
              href={
                isShoppable
                  ? COUPANG_SEARCH_BASE + encodeURIComponent(primaryQuery)
                  : GOOGLE_SEARCH_BASE + encodeURIComponent(primaryQuery)
              }
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center justify-center gap-2",
                "w-full py-3 px-4",
                "bg-ink text-white",
                "text-sm font-bold",
                "border-none",
                "hover:bg-brand-500 active:translate-y-[1px]",
                "transition-all duration-150"
              )}
            >
              {isShoppable ? (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  최저가 검색하기
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  자세히 검색하기
                </>
              )}
            </a>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleShare}
                className={cn(
                  "flex-1 min-w-[100px] flex items-center justify-center gap-1.5",
                  "py-2.5 px-3",
                  "border-[2px] border-ink bg-white text-ink",
                  "text-sm font-bold",
                  "hover:bg-brand-50 active:translate-y-[1px]",
                  "transition-all duration-150"
                )}
                aria-label="공유하기"
              >
                <Share2 className="w-3.5 h-3.5" />
                {shareLabel ?? "공유하기"}
              </button>
              {isMedia && (
                <a
                  href={
                    YOUTUBE_SEARCH_BASE + encodeURIComponent(primaryQuery)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex-1 min-w-[100px] flex items-center justify-center gap-1.5",
                    "py-2.5 px-3",
                    "border-[2px] border-ink bg-white text-ink",
                    "text-sm font-bold",
                    "hover:bg-brand-50 active:translate-y-[1px]",
                    "transition-all duration-150"
                  )}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  YouTube
                </a>
              )}
              <button
                type="button"
                onClick={onRetry}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5",
                  "py-2.5 px-3",
                  "border-[2px] border-ink bg-white text-ink",
                  "text-sm font-bold",
                  "hover:bg-surface-muted active:translate-y-[1px]",
                  "transition-all duration-150"
                )}
                aria-label="이거 아냐, 다시 찾기"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                이거 아냐
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
