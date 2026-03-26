import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import roomConfig from '../config/roomConfig.js';
import useMansionStore from '../store/useMansionStore.js';

export default function SamdeokMansion() {
  const churuCount = useMansionStore((s) => s.churuCount);
  const isLoggedIn = useMansionStore((s) => s.isLoggedIn);
  const login = useMansionStore((s) => s.login);

  return (
    <div
      className="min-h-screen text-[#e8e0d5] selection:bg-amber-500/25 selection:text-[#0f0e17]"
      style={{
        background:
          'linear-gradient(165deg, #0a0912 0%, #0f0e17 18%, #151320 35%, #1a1628 50%, #151320 70%, #0f0e17 88%, #0a0912 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 상단 은은한 골드 글로우 (달빛 분위기) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 premium-glow-slow"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212, 175, 55, 0.08) 0%, transparent 55%)',
        }}
        aria-hidden
      />

      <Helmet>
        <title>삼덕맨션 - 일상의 귀찮은 고민, AI가 해결 | 삼덕이</title>
        <meta name="description" content="답장 대필, 기억 찾기, 영화 추천, 상품 분석까지. 11년 차 건물주 삼덕이가 츄르만 주면 다 해결해 드립니다." />
      </Helmet>

      {/* 헤더 — 데스크탑·모바일 공통: 터치/클릭 친화적 크기 */}
      <header className="sticky top-0 z-50 bg-[#0a0912]/85 backdrop-blur-xl border-b border-amber-900/50 px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex justify-between items-center">
        <h1 className="flex items-center gap-2 text-lg sm:text-xl font-medium tracking-[0.2em] text-amber-100/95 uppercase">
          <img src="/samdeok/samdeok-face.png" alt="" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" aria-hidden />
          삼덕맨션
        </h1>
        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoggedIn && (
            <button
              type="button"
              onClick={() => { login(); syncChuruFromServer(); }}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center px-3 py-2 text-sm font-medium text-amber-200/90 hover:text-amber-100 transition-colors duration-200 tracking-wide rounded-lg"
            >
              체험하기
            </button>
          )}
          <div className="premium-badge-glow flex items-center gap-2 bg-[#151320] px-3 py-2 sm:px-4 rounded-full border border-amber-700/40 min-h-[44px] sm:min-h-0 items-center">
            <span className="text-xs font-medium text-amber-300/80 tracking-wide">보유 츄르</span>
            <span className="text-sm font-semibold text-amber-100 tabular-nums">{churuCount}개</span>
          </div>
        </div>
      </header>

      {/* 히어로 — 모바일·데스크탑: 패딩·타이포 반응형 */}
      <section className="relative z-10 px-4 sm:px-6 md:px-8 pt-10 sm:pt-16 pb-10 sm:pb-14 max-w-2xl md:max-w-4xl mx-auto text-center">
        <p
          className="text-[11px] sm:text-xs font-medium text-amber-400/70 tracking-[0.35em] uppercase mb-4 sm:mb-6"
          style={{ letterSpacing: '0.35em' }}
        >
          Welcome
        </p>
        <div
          className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 opacity-95"
          style={{
            filter: 'drop-shadow(0 0 24px rgba(212, 175, 55, 0.25))',
          }}
        >
          <img src="/samdeok/samdeok-circle-mint.png" alt="" className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain" aria-hidden />
          <img src="/samdeok/samdeok-face.png" alt="삼덕이" className="w-14 h-14 sm:w-[4.5rem] sm:h-[4.5rem] md:w-20 md:h-20 object-contain" />
          <img src="/samdeok/samdeok-circle-sky.png" alt="" className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain" aria-hidden />
        </div>
        <h2 className="text-xl sm:text-3xl md:text-4xl font-medium text-[#f8f4ee] leading-[1.35] tracking-tight mb-4 premium-text-balance">
          어서오라냥,
          <br />
          <span className="text-amber-200/95 font-semibold">11년 차 건물주 삼덕이</span>가
          <br />
          다 해결해 준다냥
        </h2>
        <div className="premium-divider-ornament my-6">
          <span className="text-amber-500/60 text-lg">✦</span>
        </div>
        <p className="text-amber-200/60 text-sm sm:text-base font-normal max-w-md mx-auto leading-relaxed">
          일상의 귀찮은 고민들, 츄르만 주면 완벽하게 처리해 드립니다.
        </p>
      </section>

      {/* 방 카드 — 모바일 1열, 데스크탑 2열 그리드 + 터치 친화 */}
      <section className="relative z-10 px-4 sm:px-6 md:px-8 pb-16 sm:pb-20 max-w-2xl md:max-w-5xl mx-auto" aria-label="서비스 목록">
        <h2 className="sr-only">삼덕맨션 서비스 목록</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 list-none p-0 m-0">
          {roomConfig.map((tool) => (
            <li key={tool.slug}>
              <Link
                to={`/${tool.slug}`}
                className="premium-card-hover block group relative overflow-hidden no-underline text-inherit rounded-2xl cursor-pointer active:scale-[0.99] border border-amber-900/50 bg-[#12101a]/90 backdrop-blur-sm min-h-[44px]"
                style={{
                  boxShadow: '0 4px 24px -4px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(212,175,55,0.06)',
                }}
              >
                {/* 카드 왼쪽 골드 액센트 라인 */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(180deg, rgba(212,175,55,0.5), rgba(212,175,55,0.2))',
                  }}
                />
                {tool.isHot && (
                  <div className="absolute top-5 right-5 bg-amber-500/90 text-[#0f0e17] text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase">
                    Hot
                  </div>
                )}
                <div className="flex gap-4 sm:gap-5 items-start pl-4 pr-4 py-4 sm:pl-5 sm:pr-5 sm:py-5 md:py-6">
                  <div
                    className="flex-shrink-0 w-14 h-14 flex items-center justify-center text-2xl rounded-xl border border-amber-800/40 bg-amber-950/30 group-hover:border-amber-600/50 group-hover:bg-amber-900/25 transition-all duration-300"
                    style={{
                      boxShadow: 'inset 0 1px 0 0 rgba(212,175,55,0.08)',
                    }}
                  >
                    {tool.emoji}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[11px] font-semibold text-amber-400/80 mb-1.5 tracking-wide uppercase">
                      {tool.room}
                    </p>
                    <h3 className="text-base sm:text-lg font-semibold text-[#f5f0e8] mb-2 leading-snug">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-amber-200/55 leading-relaxed mb-4">
                      {tool.desc}
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0912]/70 border border-amber-800/30 text-xs font-medium text-amber-200/80">
                      {tool.cost === 0 ? (
                        <span className="text-amber-200">무료 개방 ✨</span>
                      ) : (
                        <>
                          <span>입장료</span>
                          <span className="text-amber-100 font-semibold">츄르 {tool.cost}개</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* 모든 방 바로가기 — 프리미엄 푸터 블록 */}
        <div className="mt-12 pt-10">
          <div className="premium-gold-line w-full mb-6" />
          <p className="text-[11px] font-medium text-amber-400/60 mb-4 tracking-[0.2em] uppercase">
            모든 방
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {roomConfig.map((tool) => (
              <Link
                key={tool.slug}
                to={`/${tool.slug}`}
                className="min-h-[44px] inline-flex items-center px-4 py-2.5 sm:py-2 rounded-xl bg-[#12101a]/80 text-amber-200/85 text-sm font-medium border border-amber-800/30 hover:border-amber-600/50 hover:bg-amber-950/30 transition-all duration-200 no-underline"
              >
                {tool.emoji} {tool.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 푸터 — safe area(노치/홈 인디케이터) 반영 */}
      <footer className="relative z-10 pt-8 pb-12 pb-[max(3rem,env(safe-area-inset-bottom))] text-center">
        <div className="flex justify-center gap-4 mb-4">
          <img src="/samdeok/samdeok-circle-mint.png" alt="" className="w-8 h-8 object-contain opacity-80" aria-hidden />
          <img src="/samdeok/samdeok-face.png" alt="" className="w-8 h-8 object-contain opacity-90" aria-hidden />
          <img src="/samdeok/samdeok-circle-sky.png" alt="" className="w-8 h-8 object-contain opacity-80" aria-hidden />
        </div>
        <div className="premium-gold-line w-24 mx-auto mb-6 opacity-60" />
        <p className="text-[11px] text-amber-800/70 font-medium tracking-widest uppercase">
          © 2026 ETERNAL SIX
        </p>
      </footer>
    </div>
  );