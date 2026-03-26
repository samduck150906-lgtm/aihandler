import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useMansionStore from '../store/useMansionStore.js';

export default function GolapingRoom() {
  const navigate = useNavigate();
  const churuCount = useMansionStore((s) => s.churuCount);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const options = input
    .split(/[,，\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const handlePick = () => {
    if (options.length === 0) return;
    setSpinning(true);
    setResult(null);
    const duration = 1500;
    const interval = 80;
    let elapsed = 0;
    const tick = () => {
      elapsed += interval;
      setResult(options[Math.floor(Math.random() * options.length)]);
      if (elapsed < duration) setTimeout(tick, interval);
      else setSpinning(false);
    };
    setTimeout(tick, interval);
  };

  const showResult = result && !spinning;

  return (
    <div className="min-h-screen bg-sky-50">
      <header className="sticky top-0 z-30 bg-sky-50/80 backdrop-blur-md border-b border-sky-200">
        <div className="max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <button type="button" onClick={() => navigate('/')} className="min-h-[44px] min-w-[44px] flex items-center text-gray-600 hover:text-gray-900 active:scale-[0.98]">
            ← 로비
          </button>
          <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-2 rounded-full">보유 츄르 {churuCount}개</span>
        </div>
      </header>

      <main className="max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-xl font-bold text-gray-800 mb-1">옥상 라운지</h1>
        <p className="text-gray-500 text-sm mb-6">골라핑 — 결정장애 대신 룰렛 돌려준다냥</p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="후보를 쉼표로 구분해서 입력하세요&#10;예: 김밥, 돈까스, 파스타, 짜장면"
          className="w-full rounded-2xl border border-sky-200 bg-white p-4 min-h-[100px] text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
          rows={3}
        />

        <button
          type="button"
          onClick={handlePick}
          disabled={options.length === 0 || spinning}
          className="mt-6 w-full min-h-[48px] py-4 rounded-2xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-70 active:scale-[0.98] transition"
        >
          대신 골라주냥! ✨
        </button>

        {(result || spinning) && (
          <div className="mt-8 py-6 px-6 rounded-2xl bg-orange-500 text-white text-center text-xl font-bold">
            <span className={spinning ? 'inline-block animate-pulse' : ''}>🎯</span>{' '}
            <span className={spinning ? 'animate-pulse' : showResult ? 'animate-bounce' : ''}>{result || '...'}</span>
          </div>
        )}
      </main>
    </div>
  );
}
