"use client";

import { cn } from "@/lib/utils";

interface ExampleChipsProps {
  onSelect: (text: string) => void;
}

const EXAMPLES = [
  {
    emoji: "🎬",
    text: "넷플릭스에서 본 일본 애니인데 남녀가 몸이 바뀌는 거",
  },
  {
    emoji: "🎹",
    text: "인스타에서 본 버튼 여러개 달린 기계, 누르면 웹페이지 뜸",
  },
  {
    emoji: "🎵",
    text: "틱톡에서 들은 노래, 여자가 부르는데 나나나~ 이런 가사",
  },
  {
    emoji: "😂",
    text: "고양이가 테이블 위에서 컵 밀어 떨어뜨리는 그 짤",
  },
];

export function ExampleChips({ onSelect }: ExampleChipsProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <p className="font-mono text-[10px] text-ink-muted tracking-[2px] uppercase text-center mb-3">
        예를 들면 이런 식으로
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => onSelect(ex.text)}
            className={cn(
              "flex items-start gap-3 p-3.5",
              "bg-white border-[2px] border-gray-200",
              "text-left",
              "transition-all duration-150",
              "hover:border-brand-500 hover:bg-brand-50",
              "active:translate-y-[1px]",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="text-xl shrink-0 mt-0.5">{ex.emoji}</span>
            <span className="text-[13px] text-ink-secondary leading-relaxed">
              {ex.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
