"use client";

import { HelpCircle, Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionResponse } from "@/lib/types";

type AnswerOption = "네" | "아니오" | "몰라요";

interface QuestionCardProps {
  question: QuestionResponse;
  questionNumber: number;
  onAnswer: (answer: AnswerOption) => void;
  isLoading: boolean;
}

const DEFAULT_BUTTONS: { label: AnswerOption; icon: React.ReactNode; style: string }[] = [
  {
    label: "네",
    icon: <Check className="w-4 h-4" strokeWidth={3} />,
    style: "bg-emerald-50 border-emerald-600 text-emerald-700 hover:bg-emerald-100",
  },
  {
    label: "아니오",
    icon: <X className="w-4 h-4" strokeWidth={3} />,
    style: "bg-rose-50 border-rose-500 text-rose-600 hover:bg-rose-100",
  },
  {
    label: "몰라요",
    icon: <Minus className="w-4 h-4" strokeWidth={3} />,
    style: "bg-surface-muted border-ink-faint text-ink-secondary hover:bg-gray-100",
  },
];

export function QuestionCard({
  question,
  questionNumber,
  onAnswer,
  isLoading,
}: QuestionCardProps) {
  const buttons = DEFAULT_BUTTONS;

  return (
    <div className="w-full max-w-xl mx-auto animate-pop-in">
      <div className="border-[3px] border-ink bg-white overflow-hidden">
        <div className="bg-brand-50 border-b-[2px] border-ink px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-brand-600" aria-hidden />
            <span className="font-mono text-xs font-bold text-brand-700 tracking-wider">
              🕵️ INVESTIGATING #{questionNumber}
            </span>
          </div>
        </div>

        <div className="p-5">
          <p
            className="text-lg font-extrabold text-ink leading-snug mb-5 break-keep"
            role="heading"
            aria-level={2}
          >
            {question.question}
          </p>

          <div className="grid grid-cols-3 gap-2">
            {buttons.map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => onAnswer(btn.label)}
                disabled={isLoading}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5",
                  "py-3.5 px-3",
                  "border-[2px] font-bold text-sm",
                  "transition-all duration-150",
                  "active:translate-y-[1px]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  btn.style
                )}
                aria-label={btn.label}
                aria-busy={isLoading}
              >
                {btn.icon}
                {btn.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-surface-muted border border-ink-faint overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(questionNumber * 20, 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-ink-muted whitespace-nowrap">
              {questionNumber}/5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
