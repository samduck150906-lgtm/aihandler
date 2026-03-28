import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AppCartPage() {
    const navigate = useNavigate();
    
    return (
        <div className="container mx-auto py-12 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-2">수강 신청</h1>
            <p className="text-gray-500 mb-8">학우너 앱 전용 마켓플레이스 결제 (학원비 납부)</p>
            
            <div className="bg-white rounded-xl shadow border p-6 mb-6">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <div>
                        <h3 className="font-bold text-lg">영수학원 고등부 주 3회 반</h3>
                        <p className="text-gray-500 text-sm">성아름 원장님 | 클래스: 9월 정규반</p>
                    </div>
                    <div className="font-bold text-xl text-blue-600">350,000원</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg flex justify-between">
                    <span className="text-gray-600">총 결제 금액</span>
                    <span className="font-bold text-xl">350,000원</span>
                </div>
            </div>
            
            <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition shadow-lg"
            >
                원장님께 수강료 안전결제
            </button>
        </div>
    );
}