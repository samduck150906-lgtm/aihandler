import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentFail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 gap-4 text-amber-200/90"
      style={{
        background: 'linear-gradient(165deg, #0a0912 0%, #0f0e17 40%, #151320 70%, #0f0e17 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <p className="text-amber-200">결제가 취소되었거나 실패했다냥 😿</p>
      {(code || message) && (
        <p className="text-amber-200/70 text-sm max-w-md text-center">
          {code && <span>코드: {code}</span>}
          {code && message && ' · '}
          {message && <span>{message}</span>}
        </p>
      )}
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
