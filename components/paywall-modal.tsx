"use client";

import { useState } from "react";
import { X, Sparkles, CreditCard, Wallet, Landmark, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { loadTossPayments } from "@tosspayments/payment-sdk";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

export function PaywallModal({ isOpen, onClose, onUpgradeSuccess }: PaywallModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"korean" | "bank" | null>(null);
  const [depositorName, setDepositorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositorName.trim()) return;
    
    setIsSubmitting(true);
    // Mocking API call for bank transfer
    setTimeout(() => {
      setIsSubmitting(false);
      onUpgradeSuccess();
    }, 1200);
  };



  const handleKoreanPayment = async () => {
    setIsSubmitting(true);
    try {
      // 💡 Toss Client Key (Fallback to test mode key so the modal works instantly anywhere)
      // Once the user puts NEXT_PUBLIC_TOSS_CLIENT_KEY in Netlify, it will switch to LIVE seamlessly.
      const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
      const tossPayments = await loadTossPayments(tossClientKey);
      
      const uuid = typeof crypto !== "undefined" && crypto.randomUUID 
        ? crypto.randomUUID().replace(/-/g, "") 
        : Date.now().toString();

      await tossPayments.requestPayment("카드", {
        amount: 29000,
        orderId: `order_${uuid}`,
        orderName: "프리미엄 평생 소장권",
        customerName: "고객님",
        successUrl: window.location.origin + "?payment=success",
        failUrl: window.location.origin + "?payment=fail",
      });
    } catch (err: any) {
      if (err.code === "USER_CANCEL") {
        setIsSubmitting(false); // 결제창 닫힘
      } else {
        alert("결제 초기화 오류: " + err.message);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/70 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border-[3px] border-ink dark:border-zinc-800 w-full max-w-lg shadow-[8px_8px_0px_#1f2937] dark:shadow-[8px_8px_0px_#000] relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-brand-500 text-ink dark:text-zinc-900 px-6 py-4 flex items-center justify-between border-b-[3px] border-ink dark:border-zinc-800 shrink-0">
          <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
            <Sparkles className="w-5 h-5 fill-ink dark:fill-zinc-900" /> 프리미엄 업그레이드
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/30 rounded transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 font-bold" />
          </button>
        </div>

        {/* Content Body area (Scrollable) */}
        <div className="p-6 md:p-8 overflow-y-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full mb-4 border-[2px] border-brand-300 dark:border-brand-700">
              <Sparkles className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="text-2xl font-black text-ink dark:text-zinc-100 mb-2">무료 생성 횟수를 모두 사용하셨습니다</h3>
            <p className="text-sm text-ink-muted dark:text-zinc-400 font-bold leading-relaxed max-w-xs mx-auto">
              무제한 생성 및 더욱 강력한 고급 맞춤형 프레임워크 기능을 위해 프리미엄 플랜으로 업그레이드하세요.
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <p className="text-xs font-black text-ink dark:text-zinc-300 uppercase tracking-widest pl-1 mb-2">결제 수단 선택</p>
            


            <button 
              onClick={() => { setSelectedMethod("korean"); handleKoreanPayment(); }}
              className={cn(
                "w-full flex items-center gap-3 p-4 border-[2px] border-ink dark:border-zinc-700 text-left transition-transform hover:-translate-y-0.5 shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]",
                selectedMethod === "korean" ? "bg-brand-50 dark:bg-brand-950/20 ring-2 ring-brand-500" : "bg-white dark:bg-zinc-800"
              )}
            >
              <div className="w-10 h-10 bg-surface-muted dark:bg-zinc-900 flex items-center justify-center border-2 border-ink-faint dark:border-zinc-700">
                <CreditCard className="w-5 h-5 text-ink dark:text-zinc-300" />
              </div>
              <div>
                <div className="font-black text-ink dark:text-zinc-100 text-sm">한국 결제 시스템</div>
                <div className="text-[11px] font-bold text-ink-muted dark:text-zinc-500 tracking-tight">신용카드, 카카오페이, 네이버페이 지원</div>
              </div>
            </button>

            <button 
              onClick={() => setSelectedMethod("bank")}
              className={cn(
                "w-full flex items-center gap-3 p-4 border-[2px] border-ink dark:border-zinc-700 text-left transition-transform hover:-translate-y-0.5 shadow-[2px_2px_0px_#1f2937] dark:shadow-[2px_2px_0px_#000]",
                selectedMethod === "bank" ? "bg-brand-50 dark:bg-brand-950/20 ring-2 ring-brand-500" : "bg-white dark:bg-zinc-800"
              )}
            >
              <div className="w-10 h-10 bg-surface-muted dark:bg-zinc-900 flex items-center justify-center border-2 border-ink-faint dark:border-zinc-700">
                <Landmark className="w-5 h-5 text-ink dark:text-zinc-300" />
              </div>
              <div>
                <div className="font-black text-ink dark:text-zinc-100 text-sm">무통장 입금</div>
                <div className="text-[11px] font-bold text-ink-muted dark:text-zinc-500 tracking-tight">계좌이체 (기업/개인 뱅킹) 지원</div>
              </div>
            </button>
          </div>

          {selectedMethod === "bank" && (
            <div className="bg-surface-muted dark:bg-zinc-950 border-[2px] border-ink dark:border-zinc-700 p-5 animate-fade-in shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
              <div className="mb-4">
                <p className="text-xs font-bold text-ink-muted dark:text-zinc-400 mb-1">프리미엄 무제한 이용권</p>
                <div className="text-lg font-black text-ink dark:text-zinc-100 flex items-center justify-between">
                  <span>₩29,000 / 평생 소장</span>
                </div>
              </div>
              
              <div className="bg-brand-100 dark:bg-brand-900/20 border border-brand-300 dark:border-brand-800/50 p-4 mb-4 text-center">
                <div className="text-[10px] font-black uppercase text-brand-800 dark:text-brand-300 tracking-widest mb-1">입금계좌 정보</div>
                <div className="text-sm font-black text-ink dark:text-zinc-100 flex flex-col gap-1">
                  <span className="text-brand-600 dark:text-brand-400">하나은행</span>
                  <span className="font-mono text-lg tracking-wider">73491025243107</span>
                  <span className="text-ink-secondary dark:text-zinc-300">예금주: 성아름</span>
                </div>
              </div>

              <form onSubmit={handleBankSubmit} className="space-y-4">
                <div>
                  <label htmlFor="depositor" className="block text-xs font-bold text-ink dark:text-zinc-300 mb-1.5">
                    입금자명
                  </label>
                  <input
                    id="depositor"
                    type="text"
                    value={depositorName}
                    onChange={(e) => setDepositorName(e.target.value)}
                    placeholder="실명을 입력하세요"
                    className="w-full border-[2px] border-ink dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:text-zinc-100 px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                
                <p className="text-[11px] text-ink-muted dark:text-zinc-500 font-bold text-center leading-relaxed px-2">
                  입금 확인 후 프리미엄 권한이 즉시 승인됩니다. <br/> (현재 데모: 입력 후 버튼 클릭 시 즉시 승인 처리됨)
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting || !depositorName.trim()}
                  className="w-full py-3.5 px-4 bg-ink text-white dark:bg-zinc-100 dark:text-zinc-900 font-black text-sm tracking-wide uppercase transition-all duration-200 border-[2px] border-ink dark:border-zinc-100 shadow-[4px_4px_0px_#1f2937] dark:shadow-[4px_4px_0px_#000] hover:bg-gray-800 dark:hover:bg-white hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_#1f2937]"
                >
                  {isSubmitting ? "승인 처리 중..." : "입금 확인 요청"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
