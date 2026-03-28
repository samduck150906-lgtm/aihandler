import React, { useEffect, useRef } from 'react';

export default function TossCheckout() {
    const clientKey = 'test_ck_GjLJoQ1aVZKM6pePNZd5rw6KYe2R';
    
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://js.tosspayments.com/v1/payment-widget";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
             // 결제위젯 초기화 (위젯 렌더링 시점에 사용)
             // const tossPayments = window.TossPayments(clientKey);
        }
    }, []);

    const handlePayment = async () => {
        try {
            const tossPayments = window.TossPayments(clientKey);
            await tossPayments.requestPayment('카드', {
                amount: 10000,
                orderId: 'ORDER_' + new Date().getTime(),
                orderName: '토스페이먼츠 테스트 결제',
                customerName: '테스트 고객',
                successUrl: window.location.origin + '/success',
                failUrl: window.location.origin + '/fail',
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center">결제하기</h1>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <p className="mb-6 text-gray-600">토스페이먼츠 연동 테스트</p>
                <button 
                    onClick={handlePayment}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200">
                    10,000원 결제하기 (Toss)
                </button>
            </div>
        </div>
    );
}