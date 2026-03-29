import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="h-2 bg-emerald-600 w-full" />
        <div className="p-8 md:p-14 space-y-12 text-slate-700">
          <header className="space-y-6 border-b border-slate-100 pb-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">개인정보처리방침</h1>
            <div className="inline-block px-4 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest">
              최종 수정일: 2024년 3월 29일
            </div>
          </header>

          <article className="space-y-12">
            <section className="space-y-5">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <span className="text-emerald-600 text-lg uppercase tracking-tighter">Chapter 1</span>
              </h2>
              <p className="text-slate-600 leading-relaxed font-light">이터널식스(이하 "회사")는 이용자의 개인정보를 소중히 여기며, 개인정보 관련 법령을 철저히 준수합니다. 회사는 이용자의 권익 보호를 최우선 가치로 삼고 있습니다.</p>
            </section>

            <section className="space-y-5">
              <h2 className="text-2xl font-black text-slate-900">사업자 및 개인정보 보호책임자</h2>
              <div className="bg-slate-900 p-10 rounded-3xl text-white">
                <h3 className="text-2xl font-black mb-4">성아름 대표</h3>
                <div className="text-sm space-y-1 text-slate-300">
                  <p>상호: 이터널식스</p>
                  <p>연락처: 010-8111-9370</p>
                  <p>이메일: ceo@eternalsix.kr</p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
