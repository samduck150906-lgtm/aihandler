/**
 * GA4 이벤트 전송. @next/third-parties의 sendGAEvent 사용 (측정 ID는 layout에서 로드됨).
 */
import { sendGAEvent } from "@next/third-parties/google";

export function gtagEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  sendGAEvent({ event: eventName, ...params } as Parameters<typeof sendGAEvent>[0]);
}

/** 검색 실행: 사용자가 질문/검색을 던질 때 */
export function trackSearchExecuted(query: string): void {
  gtagEvent("search_executed", {
    search_term: query.slice(0, 100),
    event_category: "engagement",
  });
}

/** 정답 확인: AI가 결과를 보여줬을 때 */
export function trackAnswerViewed(title: string, category: string): void {
  gtagEvent("answer_viewed", {
    result_title: title.slice(0, 100),
    result_category: category,
    event_category: "engagement",
  });
}

/** 공유하기: 사용자가 공유 버튼을 눌렀을 때 */
export function trackContentShared(method: string, title?: string): void {
  gtagEvent("content_shared", {
    method,
    content_title: title?.slice(0, 100) ?? "",
    event_category: "share",
  });
}
