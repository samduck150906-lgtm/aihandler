import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useMansionStore from '../store/useMansionStore.js';
import TossPaymentSheet from '../components/TossPaymentSheet.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function DeokflixRoom() {
  const navigate = useNavigate();
  const churuCount = useMansionStore((s) => s.churuCount);
  const syncChuruFromServer = useMansionStore((s) => s.syncChuruFromServer);
  const [likes, setLikes] = useState('');
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

    const likesArr = likes.split(/[,，\n]/).map((s) => s.trim()).filter(Boolean);
    if (likesArr.length === 0) {
      setError('취향 키워드를 적어달라냥!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/recommend-deokflix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ likes: likesArr }),
      });
      const data = await res.json();
      await syncChuruFromServer();
      if (res.status === 402) {
        setError(data.error || '츄르가 부족하다냥 😿');
        setIsPaymentOpen(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || '상영관 영사기 고장');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-gray-100">
      <header className="sticky top-0 z-30 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <button type="button" onClick={() => navigate('/')} className="min-h-[44px] min-w-[44px] flex items-center text-gray-400 hover:text-white active:scale-[0.98]">
            ← 로비
          </button>
          <span className="text-sm font-medium text-orange-400 bg-orange-900/30 px-3 py-2 rounded-full">보유 츄르 {churuCount}개</span>
        </div>
      </header>

      <main className="max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-xl font-bold mb-1">202호 상영관</h1>
        <p className="text-gray-400 text-sm mb-6">덕플릭스 — 취향 저격으로 딱 골라준다냥</p>

        <input
          type="text"
          value={likes}
          onChange={(e) => setLikes(e.target.value)}
          placeholder="좋아하는 장르, 배우, 작품 (쉼표로 구분)"
          className="w-full rounded-2xl bg-gray-800 border border-gray-600 p-4 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 outline-none"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full min-h-[48px] py-4 rounded-2xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-70 active:scale-[0.98] transition"
        >
          {loading ? '삼덕이가 필모 찍는 중... 🍿' : '츄르 1개 내고 추천 받기'}
        </button>

        {error && <p className="mt-4 p-3 rounded-2xl bg-red-900/50 text-red-300 text-sm">{error}</p>}
        {result && (
          <div className="mt-6 p-5 rounded-2xl bg-gray-800 border border-gray-600">
            <h3 className="font-bold text-lg text-white">{result.title}</h3>
            <p className="text-gray-300 text-sm mt-2">{result.desc}</p>
            {result.platform && <p className="text-orange-400 text-xs mt-2">📺 {result.platform}</p>}
          </div>
        )}
      </main>

      <TossPaymentSheet isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
    </div>
  );
}
