import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useMansionStore from '../store/useMansionStore.js';
import TossPaymentSheet from '../components/TossPaymentSheet.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function WhatWasItRoom() {
  const navigate = useNavigate();
  const churuCount = useMansionStore((s) => s.churuCount);
  const syncChuruFromServer = useMansionStore((s) => s.syncChuruFromServer);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const cost = 1;
  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    if (churuCount < cost) {
      setIsPaymentOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/search-whatwasit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      await syncChuruFromServer();
      if (res.status === 402) {
        setError(data.error || '츄르가 부족하다냥 😿');
        setIsPaymentOpen(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || '기억 창고 붕괴');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-gray-100">
      <header className="sticky top-0 z-30 bg-[#1A1A1A]/90 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <button type="button" onClick={() => navigate('/')} className="min-h-[44px] min-w-[44px] flex items-center text-gray-400 hover:text-white active:scale-[0.98]">
            ← 로비
          </button>
          <span className="text-sm font-medium text-orange-400 bg-orange-900/30 px-3 py-2 rounded-full">보유 츄르 {churuCount}개</span>
        </div>
      </header>

      <main className="max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-xl font-bold mb-1">지하 1층 창고</h1>
        <p className="text-gray-400 text-sm mb-6">뭐였더라?</p>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="넷플릭스에서 본 일본 애니인데 남녀가 몸이 바뀌는 거"
          className="w-full rounded-2xl bg-gray-800 border border-gray-600 p-4 min-h-[120px] text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          rows={4}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full min-h-[48px] py-4 rounded-2xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-70 active:scale-[0.98] transition"
        >
          {loading ? '삼덕이가 창고 뒤지는 중... 🔦' : '기억 찾아오기 🔍'}
        </button>

        {loading && <p className="text-center text-orange-400 mt-2 animate-pulse">삼덕이가 창고 뒤지는 중... 🔦</p>}
        {error && <p className="mt-4 p-3 rounded-2xl bg-red-900/50 text-red-300 text-sm">{error}</p>}
        {result && (
          <div className="mt-6 p-5 rounded-2xl bg-white text-gray-800 shadow-xl transform rotate-1 max-w-sm mx-auto">
            <div className="h-24 rounded-xl bg-gray-100 flex items-center justify-center text-4xl mb-4">🎬</div>
            <h3 className="font-bold text-lg">{result.title}</h3>
            <p className="text-sm text-gray-600 mt-2">{result.desc}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {(result.tags || []).map((tag, i) => (
                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </main>

      <TossPaymentSheet isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
    </div>
  );
}
