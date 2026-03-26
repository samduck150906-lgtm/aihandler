import React, { Suspense } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import roomConfig from '../config/roomConfig.js';
import { getRoomBySlug } from '../config/roomConfig.js';
import { Helmet } from 'react-helmet-async';

export default function RoomRouter() {
  const { slug } = useParams();
  const room = getRoomBySlug(slug);

  // 존재하지 않는 slug면 메인으로 리디렉트
  if (!room) {
    return <Navigate to="/" replace />;
  }

  const RoomComponent = room.component;

  return (
    <>
      {/* 동적 SEO 메타데이터 */}
      <Helmet>
        <title>{room.seo.title}</title>
        <meta name="description" content={room.seo.description} />
        <meta property="og:title" content={room.seo.title} />
        <meta property="og:description" content={room.seo.description} />
        <meta property="og:url" content={`https://samdeok.kr/${room.slug}`} />
      </Helmet>

      {/* 로딩 스피너 (lazy load 중 표시) */}
      <Suspense
        fallback={
          <div
            className="min-h-screen flex items-center justify-center text-amber-200/90"
            style={{
              background: 'linear-gradient(165deg, #0a0912 0%, #0f0e17 30%, #151320 60%, #0f0e17 100%)',
              backgroundAttachment: 'fixed',
            }}
          >
            <div className="text-center">
              <img
                src="/samdeok/samdeok-face.png"
                alt=""
                className="w-16 h-16 mx-auto animate-bounce mb-4 object-contain"
                style={{ filter: 'drop-shadow(0 0 24px rgba(212, 175, 55, 0.25))' }}
              />
              <p className="text-sm font-medium text-amber-300/80 animate-pulse tracking-wide">
                삼덕이가 방문 여는 중...
              </p>
            </div>
          </div>
        }
      >
        <RoomComponent />
      </Suspense>

      {/* 비슷한 서비스 추천 — 프리미엄 호텔델루나 */}
      <section
        className="max-w-xl mx-auto px-4 py-8 bg-[#0a0912]"
        aria-label="비슷한 서비스"
      >
        <div className="h-px w-full max-w-xs mx-auto mb-6 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
        <p className="text-[11px] font-medium text-amber-400/60 mb-4 tracking-[0.2em] uppercase text-center">
          다른 방
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {roomConfig
            .filter((r) => r.slug !== room.slug)
            .map((r) => (
              <Link
                key={r.slug}
                to={`/${r.slug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#12101a]/90 border border-amber-800/30 text-amber-200/90 text-sm font-medium hover:border-amber-600/50 hover:bg-amber-950/30 transition-all duration-200 no-underline"
              >
                <span>{r.emoji}</span>
                <span>{r.title}</span>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}
