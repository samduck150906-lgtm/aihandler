import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function SuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('결제 승인 진행 중...');
    
    useEffect(() => {
        const orderId = searchParams.get('orderId');
        const paymentKey = searchParams.get('paymentKey');
        const amount = searchParams.get('amount');
        
        if (orderId && paymentKey && amount) {
            // 실제 서비스에서는 이곳에서 백엔드 API로 paymentKey, orderId, amount를 전송하여
            // 토스 결제 승인 API(POST https://api.tosspayments.com/v1/payments/confirm)를 호출해야 합니다.
            setStatus(`결제가 성공적으로 완료되었습니다! 주문번호: ${orderId}`);
        } else {
            setStatus('잘못된 접근입니다.');
        }
    }, [searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-100 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-2xl font-bold mb-4 text-gray-800">결제 성공</h1>
                <p className="text-gray-600 mb-8 whitespace-pre-wrap">{status}</p>
                <button 
                    onClick={() => navigate('/')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                >
                    홈으로 돌아가기
                </button>
            </div>
        </div>
    );
}