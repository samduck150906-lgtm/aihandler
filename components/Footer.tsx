import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t py-12 px-6 mt-auto">
      <div className="container mx-auto max-w-7xl text-slate-600">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 text-center md:text-left">
          <div className="space-y-4">
            <h3 className="font-bold text-xl tracking-tight text-slate-900 leading-tight">이터널식스</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto md:mx-0">
              혁신적인 AI 솔루션으로 비즈니스의 미래를 함께 만듭니다. 우리는 기술의 힘으로 일상을 더 가치 있게 변화시킵니다.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400">고객지원</h4>
            <nav className="flex flex-col space-y-3 text-sm">
              <Link href="/terms" className="hover:text-indigo-600 transition-colors">이용약관</Link>
              <Link href="/privacy" className="hover:text-indigo-600 transition-colors font-medium">개인정보처리방침</Link>
              <Link href="/refund" className="hover:text-indigo-600 transition-colors">취소 및 환불정책</Link>
            </nav>
          </div>
          
          <div className="space-y-4 lg:col-span-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400">사업자 정보</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-xs">
              <div className="space-y-2">
                <p><span className="font-semibold text-slate-800 mr-2">상호</span> 이터널식스</p>
                <p><span className="font-semibold text-slate-800 mr-2">대표자</span> 성아름</p>
                <p><span className="font-semibold text-slate-800 mr-2">사업자번호</span> 303-28-65658</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-semibold text-slate-800 mr-2">통신판매업</span> 제 2025-수원영통-1499호</p>
                <p><span className="font-semibold text-slate-800 mr-2">연락처</span> 010-8111-9370</p>
                <p><span className="font-semibold text-slate-800 mr-2">이메일</span> ceo@eternalsix.kr</p>
              </div>
              <p className="sm:col-span-2 leading-relaxed"><span className="font-semibold text-slate-800 mr-2">주소</span> 경기도 수원시 영통구 삼성로 186-1 4층</p>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} 이터널식스. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm opacity-80 hover:opacity-100 transition-all cursor-default">
              <span className="text-[10px] font-black text-indigo-600 tracking-tighter uppercase italic">Toss Payments</span>
              <div className="w-[1px] h-3 bg-slate-200" />
              <span className="text-[10px] text-slate-500 font-bold">안전결제 가맹점</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
