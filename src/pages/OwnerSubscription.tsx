import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function OwnerSubscriptionPage() {
    const navigate = useNavigate();
    
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-center mb-4">학우너 ERP 요금제</h1>
            <p className="text-gray-500 text-center mb-12">원장님을 위한 스마트한 학원 관리 시스템</p>
            
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">프리미엄 요금제</h3>
                        <div className="flex items-end gap-1 mb-6">
                            <span className="text-4xl font-extrabold text-blue-600">₩29,000</span>
                            <span className="text-gray-500 font-medium pb-1">/ 월</span>
                        </div>
                        <ul className="space-y-4 mb-8 text-gray-600">
                            <li className="flex gap-2">✅ 학생 무제한 관리</li>
                            <li className="flex gap-2">✅ 수납/결제 캘린더 자동화</li>
                            <li className="flex gap-2">✅ 학부모 알림장 발송 기능</li>
                        </ul>
                    </div>
                    <button 
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
                    >
                        정기구독 시작하기
                    </button>
                </div>

                <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 p-8 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">추천</div>
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-gray-200">연간 요금제 (20% 할인)</h3>
                        <div className="flex items-end gap-1 mb-6">
                            <span className="text-4xl font-extrabold text-white">₩278,000</span>
                            <span className="text-gray-400 font-medium pb-1">/ 년</span>
                        </div>
                        <ul className="space-y-4 mb-8 text-gray-300">
                            <li className="flex gap-2">✅ 프리미엄 요금제의 모든 기능</li>
                            <li className="flex gap-2">✅ 무료 홈페이지 개설 지원</li>
                            <li className="flex gap-2">✅ 1:1 전담 매니저 배정</li>
                        </ul>
                    </div>
                    <button 
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-white text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-100 transition"
                    >
                        1년 구독하기
                    </button>
                </div>
            </div>
        </div>
    );
}