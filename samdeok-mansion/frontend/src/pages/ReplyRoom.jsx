import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useMansionStore from '../store/useMansionStore.js';
import TossPaymentSheet from '../components/TossPaymentSheet.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const TONES = [
  { id: 'polite', label: '정중하게 🙏', value: '정중하게' },
  { id: 'cool', label: '센스있게 😎', value: '센스있게' },
  { id: 'firm', label: '단호하게 💪', value: '단호하게' },
  { id: 'funny', label: '유머러스하게 😂', value: '유머러스하게' },
];

export default function ReplyRoom() {
  const navigate = useNavigate();
  const churuCount = useMansionStore((s) => s.churuCount);
  const syncChuruFromServer = useMansionStore((s) => s.syncChuruFromServer);
  const [otherMsg, setOtherMsg] = useState('');
  const [myThought, setMyThought] = useState('');
  const [tone, setTone] = useState(TONES[0].value);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const cost = 2;
  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    if (churuCount < cost) {
      setIsPaymentOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/generate-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ otherMsg, myThought, tone }),
      });
      const data = await res.json();
      await syncChuruFromServer();
      if (res.status === 402) {
        setError(data.error || '츄르가 부족하다냥 😿');
        setIsPaymentOpen(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || '대필 요정 파업 중');
      setResult(data.reply);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (result) navigator.clipboard.writeText(result);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <button type="button" onClick={() => navigate('/')} className="min-h-[44px] min-w-[44px] flex items-center text-gray-600 hover:text-gray-900 active:scale-[0.98]">
            ← 로비
          </button>
          <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-2 rounded-full">보유 츄르 {churuCount}개</span>
        </div>
      </header>

      <main className="max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-1">101호 대필 사무소</h1>
        <p className="text-gray-500 text-sm mb-6">답장, 뭐라고 할까?</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🗣️ 상대방이 뭐라고 했어?</label>
            <textarea
              value={otherMsg}
              onChange={(e) => setOtherMsg(e.target.value)}
              placeholder="상대방 메시지를 붙여넣어 주세요"
              className="w-full rounded-2xl border border-gray-200 p-4 min-h-[80px] focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">🤫 진짜 내 속마음은?</label>
            <textarea
              value={myThought}
              onChange={(e) => setMyThought(e.target.value)}
              placeholder="속마음을 짧게 적어 주세요"
              className="w-full rounded-2xl border border-gray-200 p-4 min-h-[80px] focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🎭 어떤 느낌으로 써줄까?</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition active:scale-[0.98] ${
                    tone === t.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full min-h-[48px] py-4 rounded-2xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-70 active:scale-[0.98] transition"
        >
          {loading ? '삼덕이가 타자 치는 중... 🐾' : '츄르 2개 내고 대필 맡기기 ✨'}
        </button>

        {error && <p className="mt-4 p-3 rounded-2xl bg-red-50 text-red-700 text-sm">{error}</p>}
        {result && (
          <div
            role="button"
            tabIndex={0}
            onClick={copyResult}
            onKeyDown={(e) => e.key === 'Enter' && copyResult()}
            className="mt-6 p-4 rounded-2xl bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100 active:scale-[0.98] transition"
          >
            <p className="text-gray-800 whitespace-pre-wrap">{result}</p>
            <p className="text-green-600 text-xs mt-2">클릭하면 복사된다냥 📋</p>
          </div>
        )}
      </main>

      <TossPaymentSheet isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
    </div>
  );
}
