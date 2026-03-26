import React, { useState } from 'react';
import useMansionStore from '../store/useMansionStore.js';
import TossPaymentSheet from '../components/TossPaymentSheet.jsx';

export default function NyangShopperRoom() {
  const churuCount = useMansionStore((s) => s.churuCount);
  const syncChuruFromServer = useMansionStore((s) => s.syncChuruFromServer);
  const [links, setLinks] = useState(['']);
  const [conditions, setConditions] = useState('');
  const [mode, setMode] = useState('analyze'); // 'analyze' | 'compare'
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const ROOM_COST = 1;
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

  const addLink = () => {
    if (links.length < 5) setLinks([...links, '']);
  };
  const updateLink = (index, value) => {
    const updated = [...links];
    updated[index] = value;
    setLinks(updated);
  };
  const removeLink = (index) => {
    if (links.length > 1) setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const validLinks = links.filter((l) => l.trim());
    if (validLinks.length === 0) {
      alert('상품 링크를 최소 1개 넣어달라냥!');
      return;
    }
    if (!conditions.trim()) {
      alert('어떤 조건으로 분석할지 알려달라냥!');
      return;
    }
    if (churuCount < ROOM_COST) {
      setIsPaymentOpen(true);
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/nyang-shopper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ links: validLinks, conditions, mode }),
      });
      const data = await response.json();
      await syncChuruFromServer();
      if (response.status === 402) {
        setIsPaymentOpen(true);
        return;
      }
      if (!response.ok) throw new Error(data.error || '쇼핑백이 찢어졌다냥');
      setResult(data);
    } catch (err) {
      alert('삼덕이가 쇼핑백을 놓쳤다냥! 다시 시도해달라냥.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6FF] text-gray-800 font-sans pb-20">
      {/* 네비게이션 */}
      <nav className="sticky top-0 bg-[#F8F6FF]/90 backdrop-blur-sm px-4 sm:px-6 py-3 flex justify-between items-center border-b border-purple-100 z-10">
        <button
          onClick={() => window.history.back()}
          className="min-h-[44px] min-w-[44px] flex items-center text-gray-500 font-bold hover:text-purple-500"
        >
          ← 맨션 입구로
        </button>
        <span className="font-bold text-gray-800 text-sm sm:text-base">301호 쇼핑 라운지</span>
        <div className="bg-purple-50 px-3 py-2 rounded-full text-sm font-bold border border-purple-200">
          <span className="text-purple-700">츄르 </span>
          <span className="text-purple-600">{churuCount}</span>
        </div>
      </nav>

      <main className="px-4 sm:px-6 pt-6 sm:pt-8 pb-20 max-w-xl md:max-w-2xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <div className="text-5xl mb-3">🛍️🐱</div>
          <h2 className="text-2xl font-black mb-2 tracking-tight">냥스널쇼퍼</h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            &quot;링크만 던져주면 삼덕이가 꼼꼼하게 뜯어본다냥&quot;
          </p>
        </div>

        {/* 링크 입력 영역 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
          <label className="block text-sm font-bold text-gray-700">
            🔗 상품 링크 (최대 5개)
          </label>
          {links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="url"
                value={link}
                onChange={(e) => updateLink(i, e.target.value)}
                placeholder="https://coupang.com/..."
                className="flex-1 bg-gray-50 rounded-xl p-3 text-sm focus:outline-none focus:bg-purple-50 focus:ring-2 focus:ring-purple-200"
              />
              {links.length > 1 && (
                <button
                  onClick={() => removeLink(i)}
                  className="text-gray-400 hover:text-red-400 font-bold px-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {links.length < 5 && (
            <button
              onClick={addLink}
              className="text-sm text-purple-500 font-bold hover:text-purple-700"
            >
              + 링크 추가
            </button>
          )}
        </div>

        {/* 조건 입력 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 focus-within:border-purple-300 transition-colors">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            📋 내 조건 (예산, 용도, 취향 등)
          </label>
          <textarea
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            placeholder='예: "예산 5만원 이내, 20대 여자 생일선물, 실용적이면서 예쁜 거"'
            className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:outline-none focus:bg-purple-50 focus:ring-2 focus:ring-purple-200 resize-none h-20"
          />
        </div>

        {/* 모드 선택 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            📊 어떻게 분석할까?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'analyze', label: '이 상품 분석해줘 🔍' },
              { key: 'compare', label: '이 중에 골라줘 🏆' },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`p-3 rounded-xl text-sm font-bold transition-all ${
                  mode === m.key
                    ? 'bg-purple-50 border-2 border-purple-400 text-purple-700'
                    : 'bg-white border-2 border-gray-100 text-gray-500 hover:border-gray-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 실행 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-purple-500 hover:bg-purple-600 active:scale-[0.98] text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-purple-200 transition-all disabled:opacity-70"
        >
          {isLoading
            ? '삼덕이가 상품 뜯어보는 중... 📦'
            : `츄르 ${ROOM_COST}개 내고 쇼핑 상담 받기 🛒`}
        </button>

        {/* 결과 영역 */}
        {result && (
          <div className="mt-8 space-y-4 animate-[slideUp_0.4s_ease-out]">
            {/* 단일 분석 결과 */}
            {result.type === 'analyze' && result.analysis && (
              <div className="bg-white p-6 rounded-3xl shadow-md border border-purple-100">
                <h3 className="text-lg font-black text-gray-900 mb-1">
                  {result.analysis.productName}
                </h3>
                <p className="text-purple-600 font-bold text-sm mb-4">
                  {result.analysis.price}
                </p>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs font-bold text-green-600 mb-1">👍 장점</p>
                    {(result.analysis.pros || []).map((p, i) => (
                      <p key={i} className="text-sm text-gray-700">• {p}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-500 mb-1">👎 단점</p>
                    {(result.analysis.cons || []).map((c, i) => (
                      <p key={i} className="text-sm text-gray-700">• {c}</p>
                    ))}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-purple-600 mb-1">🐱 삼덕이 총평</p>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {result.analysis.verdict}
                  </p>
                </div>
              </div>
            )}

            {/* 비교 추천 결과 */}
            {result.type === 'compare' && result.items && (
              <>
                {result.items.map((item, i) => (
                  <div
                    key={i}
                    className={`bg-white p-5 rounded-2xl shadow-sm border ${
                      item.isPick
                        ? 'border-purple-400 ring-2 ring-purple-200'
                        : 'border-gray-100'
                    } relative`}
                  >
                    {item.isPick && (
                      <span className="absolute -top-3 left-4 bg-purple-500 text-white text-[10px] font-black px-3 py-1 rounded-full">
                        삼덕&apos;s PICK 🏆
                      </span>
                    )}
                    <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                    <p className="text-sm text-purple-600 font-bold mb-2">{item.price}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.reason}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </main>

      {/* 결제 바텀 시트 */}
      <TossPaymentSheet
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </div>
  );
}
