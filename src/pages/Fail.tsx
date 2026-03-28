import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function FailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const message = searchParams.get('message') || '결제를 처리하는 도중 문제가 발생했습니다.';
    const code = searchParams.get('code');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-transparent bg-gray-50 px-4">
            <div className="bg-white p-10 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <h1 className="text-2xl font-bold mb-4 text-gray-800">결제 실패</h1>
                <p className="text-gray-700 font-medium mb-1">{message}</p>
                {code && <p className="text-sm text-gray-500 mb-8">에러 코드: {code}</p>}
                
                <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-gray-800 hover:bg-black text-white font-bold py-3 px-4 rounded transition duration-200"
                >
                    다시 시도하기
                </button>
            </div>
        </div>
    );
}