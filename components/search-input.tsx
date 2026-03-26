"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
  compact?: boolean;
}

export function SearchInput({
  onSubmit,
  isLoading,
  placeholder = "아 그 뭐였지.. 기억나는 대로 써보세요",
  compact = false,
}: SearchInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 자동 높이 조절
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-xl mx-auto",
        "border-[3px] border-ink bg-white",
        "transition-all duration-200",
        "focus-within:border-brand-500 focus-within:shadow-[4px_4px_0px_0px_#F97316]",
        compact ? "rounded-none" : "rounded-none"
      )}
    >
      <div className="flex items-end gap-2 p-3">
        <Search
          className={cn(
            "shrink-0 mb-1",
            compact ? "w-4 h-4" : "w-5 h-5",
            "text-ink-muted"
          )}
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          maxLength={1200}
          aria-label="검색어 입력"
          className={cn(
            "flex-1 resize-none bg-transparent outline-none",
            "text-ink placeholder:text-ink-faint",
            compact ? "text-[15px]" : "text-base",
            "leading-relaxed",
            "disabled:opacity-50"
          )}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          aria-label="제출"
          className={cn(
            "shrink-0 w-9 h-9",
            "flex items-center justify-center",
            "border-[2px] border-ink",
            "transition-all duration-150",
            value.trim() && !isLoading
              ? "bg-brand-500 text-white hover:bg-brand-600 active:translate-y-[1px]"
              : "bg-surface-muted text-ink-faint cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowUp className="w-4 h-4" strokeWidth={3} />
          )}
        </button>
      </div>
    </div>
  );
}
