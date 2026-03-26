"use client";

import { useState, useEffect } from "react";

const THINKING_MESSAGES = [
  { emoji: "🔍", text: "기억의 파편을 모으는 중입니다..." },
  { emoji: "🧠", text: "탐정이 돋보기를 닦는 중..." },
  { emoji: "🧩", text: "퍼즐 조각을 맞추는 중..." },
  { emoji: "💭", text: "뇌세포를 총동원하는 중..." },
  { emoji: "🕵️", text: "단서를 추적하고 있습니다..." },
  { emoji: "📡", text: "기억 저편을 스캔 중..." },
];

export function ThinkingIndicator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const msg = THINKING_MESSAGES[index];

  return (
    <div className="w-full max-w-xl mx-auto animate-fade-in">
      <div className="inline-flex items-center gap-3 px-5 py-3.5 border-[2px] border-ink-faint bg-white">
        <span className="text-base transition-all duration-300">{msg.emoji}</span>
        <span
          key={index}
          className="font-mono text-xs text-ink-secondary animate-fade-in"
        >
          {msg.text}
        </span>
        <div className="flex gap-1 ml-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-dot"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
