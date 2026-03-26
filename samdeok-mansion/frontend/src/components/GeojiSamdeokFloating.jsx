import { useState } from 'react';
import useMansionStore from '../store/useMansionStore';
import TossPaymentSheet from './TossPaymentSheet';

const CHURU_GIVE = 1;

export default function GeojiSamdeokFloating() {
  const churuCount = useMansionStore((s) => s.churuCount);
  const useChuru = useMansionStore((s) => s.useChuru);
  const [thanks, setThanks] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const handleGiveChuru = () => {
    if (churuCount >= CHURU_GIVE) {
      const used = useChuru(CHURU_GIVE);
      if (used) {
        setThanks(true);
        setTimeout(() => setThanks(false), 2000);
      }
    } else {
      setPaymentOpen(true);
    }
  };

  const handlePaymentClose = () => {
    setPaymentOpen(false);
  };

  return (
    <>
      <div
        className="fixed bottom-6 left-4 z-30 flex flex-col items-start gap-0 pointer-events-none sm:left-6"
        aria-hidden
      >
        <div className="pointer-events-auto flex flex-col items-end">
          {/* 말풍선 */}
          <div className="mb-1 px-4 py-2.5 rounded-2xl rounded-bl-md bg-white border-2 border-orange-200 shadow-lg max-w-[200px] sm:max-w-[240px]">
            {thanks ? (
              <p className="text-sm font-semibold text-orange-600 animate-pulse">
                고마워 냥! 냠냠 맛있당 🐾
              </p>
            ) : (
              <p className="text-sm text-gray-800 leading-relaxed">
                야~~옹.. 아~ 배고프네~~~
              </p>
            )}
          </div>
          {/* 츄르 1개 주기 버튼 (감사 상태가 아닐 때만) */}
          {!thanks && (
            <button
              type="button"
              onClick={handleGiveChuru}
              className="mb-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-md active:scale-[0.98] transition-transform"
            >
              츄르 1개 주기
            </button>
          )}
          {/* 거지삼덕이 캐릭터 — 감사할 땐 스카이, 평소엔 얼굴 */}
          <div className="relative">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-orange-100 border-2 border-orange-300 shadow-md flex items-center justify-center animate-bounce">
              <img
                src={thanks ? '/samdeok/samdeok-circle-sky.png' : '/samdeok/samdeok-face.png'}
                alt="거지삼덕이"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <TossPaymentSheet isOpen={paymentOpen} onClose={handlePaymentClose} />
    </>
  );
}
