"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

interface ConversationTrailProps {
  messages: ChatMessage[];
}

export function ConversationTrail({ messages }: ConversationTrailProps) {
  if (messages.length === 0) return null;

  // 최근 메시지만 간략히 표시 (마지막 6개)
  const recent = messages.slice(-6);

  return (
    <div className="w-full max-w-xl mx-auto mb-4">
      <div className="flex flex-col gap-1.5">
        {recent.map((msg, i) => {
          const isUser = msg.role === "user";

          // assistant 메시지에서 간략 정보 추출
          let displayText = msg.content;
          if (!isUser) {
            try {
              const parsed = JSON.parse(msg.content);
              if (parsed.type === "question") {
                displayText = `❓ ${"question" in parsed ? parsed.question : ""}`;
              } else if (parsed.type === "result") {
                displayText = `✅ ${parsed.title}`;
              }
            } catch {
              displayText = msg.content.slice(0, 60);
            }
          }

          return (
            <div
              key={i}
              className={cn(
                "text-xs px-3 py-1.5 max-w-[85%] truncate",
                "font-mono",
                isUser
                  ? "self-end bg-ink text-white"
                  : "self-start bg-surface-muted text-ink-secondary border border-ink-faint"
              )}
            >
              {isUser ? `→ ${displayText}` : displayText}
            </div>
          );
        })}
      </div>
    </div>
  );
}
