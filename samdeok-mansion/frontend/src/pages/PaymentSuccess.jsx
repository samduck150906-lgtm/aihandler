import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useMansionStore from '../store/useMansionStore.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const syncChuruFromServer = useMansionStore((s) => s.syncChuruFromServer);
  const [status, setStatus] = useState('confirming'); // confirming | success | error

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      return;
    }

    const confirm = async () => {
      try {
        const res = await fetch(`${API_BASE}/payments/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        });
        const data = await res.json();
        if (data.success) {
          await syncChuruFromServer();
          setStatus('success');
          setTimeout(() => navigate('/', { replace: true }), 2000);
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };

    confirm();
  }, [searchParams, syncChuruFromServer, navigate]);

  const pageBg = 'min-h-screen flex items-center justify-center p-4';
  const bgStyle = {
    background: 'linear-gradient(165deg, #0a0912 0%, #0f0e17 40%, #151320 70%, #0f0e17 100%)',
    backgroundAttachment: 'fixed',
  };

  if (status === 'confirming') {
    return (
      <div className={pageBg + ' text-amber-200/80'} style={bgStyle}>
        <p className="animate-pulse">결제 확인 중... 🐾</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={pageBg + ' flex-col gap-4 text-amber-200/90'} style={bgStyle}>
        <p className="text-amber-200">결제 확인에 실패했다냥 😿</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-[#12101a] text-amber-100 font-medium border border-amber-600/50 hover:border-amber-500/60 hover:bg-amber-900/30 active:scale-[0.98] transition-all duration-200"
        >
          로비로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className={pageBg + ' flex-col gap-4 text-amber-200/90'} style={bgStyle}>
      <p className="text-amber-200 font-semibold">츄르 25개 충전 완료했다냥! 🐾</p>
      <p className="text-amber-200/70 text-sm">주문번호: {searchParams.get('orderId')} · {searchParams.get('amount')}원 결제 완료</p>
      <p className="text-amber-700/80 text-xs">잠시 후 로비로 이동합니다.</p>
    </div>
  );
}
