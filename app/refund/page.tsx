export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="h-2 bg-amber-500 w-full" />
        <div className="p-8 md:p-14 space-y-12 text-slate-700">
          <header className="space-y-6 border-b border-slate-100 pb-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">취소 및 환불정책</h1>
            <div className="inline-block px-4 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest">
              최종 수정일: 2024년 3월 29일
            </div>
          </header>

          <section className="space-y-10">
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 border-l-4 border-amber-500 pl-5">1. 청약철회 기준</h2>
              <div className="grid gap-4 mt-6">
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="font-black text-slate-900 uppercase tracking-tight mb-2">미사용 결제건 (7일 이내)</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">디지털 서비스 이용 내역이 없는 경우 100% 환불 처리됩니다.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-12 border-t border-slate-100">
              <h2 className="text-2xl font-black text-slate-900">환불 신청 연락처</h2>
              <p className="text-slate-600 leading-relaxed">
                대표 메일: <span className="font-bold underline decoration-amber-300">ceo@eternalsix.kr</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
