export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="h-2 bg-indigo-600 w-full" />
        <div className="p-8 md:p-14 space-y-12 text-slate-700">
          <header className="space-y-6 border-b border-slate-100 pb-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">서비스 이용약관</h1>
            <div className="inline-block px-4 py-1.5 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest">
              시행일: 2024년 1월 1일
            </div>
          </header>

          <div className="space-y-10">
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 border-l-4 border-indigo-500 pl-5">제 1 조 (목적)</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                본 약관은 이터널식스(이하 "회사")가 운영하는 웹사이트 및 서비스를 이용함에 있어 "회사"와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 border-l-4 border-indigo-500 pl-5">제 2 조 (용어의 정의)</h2>
              <div className="bg-slate-50 p-7 rounded-2xl space-y-4 border border-slate-100 italic text-sm">
                <p className="text-slate-600">1. "서비스"란 회사가 제공하는 모든 인터넷 기반의 인텔리전트 도구 및 통합 허브를 의미합니다.</p>
                <p className="text-slate-600">2. "이용자"란 회사의 서비스에 접속하여 본 약관에 따라 회사가 제공하는 서비스를 지속적으로 이용하는 회원 및 비회원을 말합니다.</p>
              </div>
            </section>
            
            <section className="pt-16 border-t border-slate-100">
              <div className="bg-indigo-600 p-10 rounded-3xl text-white space-y-5">
                <h3 className="text-2xl font-black tracking-tight">결제 및 환불 정책</h3>
                <p className="text-indigo-100 leading-relaxed text-sm">
                  유료 서비스 이용 시 결제 수단 관리 및 결제 취소, 환불에 관한 상세 사항은 별도의 '취소 및 환불정책' 페이지의 규정을 따릅니다.
                </p>
              </div>
            </section>
          </div>
          
          <footer className="pt-12 border-t border-slate-100 text-center text-sm text-slate-500 font-medium">
            이용약관 관련 문의는 <span className="text-indigo-600">ceo@eternalsix.kr</span>로 연락 주시기 바랍니다.
          </footer>
        </div>
      </div>
    </div>
  );
}
