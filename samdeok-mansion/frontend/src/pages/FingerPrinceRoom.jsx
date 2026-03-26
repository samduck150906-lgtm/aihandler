import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useMansionStore from '../store/useMansionStore.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function FingerPrinceRoom() {
  const navigate = useNavigate();
  const churuCount = useMansionStore((s) => s.churuCount);
  const syncChuruFromServer = useMansionStore((s) => s.syncChuruFromServer);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ask-fingerprince`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      await syncChuruFromServer();
      if (res.status === 402) {
        setError(data.error || '츄르가 부족하다냥 😿');
        return;
      }
      if (!res.ok) throw new Error(data.error || '관리실 낮잠 중');
      setResult(data.reply);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <header className="sticky top-0 z-30 bg-[#FFFDF9]/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <button type="button" onClick={() => navigate('/')} className="min-h-[44px] min-w-[44px] flex items-center text-gray-600 hover:text-gray-900 active:scale-[0.98]">
            ← 로비
          </button>
          <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-2 rounded-full">보유 츄르 {churuCount}개</span>
        </div>
      </header>

      <main className="max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-xl font-bold text-gray-800 mb-1">1층 관리실</h1>
        <p className="text-gray-500 text-sm mb-8">핑거프린스 — 사소한 질문 다 대답해준다냥</p>

        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="검색하기 민망한 질문을 입력하세요"
            className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-gray-800 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="min-h-[48px] px-6 py-3 rounded-2xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-70 active:scale-[0.98] transition"
          >
            물어보기 ✨
          </button>
        </div>

        {error && <p className="mt-4 p-3 rounded-2xl bg-red-50 text-red-700 text-sm">{error}</p>}
        {result && (
          <div className="mt-6 p-4 rounded-2xl bg-orange-100 border-l-4 border-orange-500 text-gray-800 max-w-md">
            <p className="whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </main>
    </div>
  );
}
