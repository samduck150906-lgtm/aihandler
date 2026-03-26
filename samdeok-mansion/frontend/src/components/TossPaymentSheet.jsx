import { useEffect, useRef } from 'react';

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_PAYMENTS_CLIENT_KEY;

const PAYMENT_AMOUNT = 500;
const ORDER_NAME = '痢꾨Ⅴ 25媛?異⑹쟾';

export default function TossPaymentSheet({ isOpen, onClose }) {
  const paymentWidgetRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !TOSS_CLIENT_KEY) return;

    const loadWidget = async () => {
      const { loadPaymentWidget } = await import('@tosspayments/payment-widget-sdk');
      const paymentWidget = await loadPaymentWidget(TOSS_CLIENT_KEY, 'anonymous');
      paymentWidgetRef.current = paymentWidget;
      paymentWidget.renderPaymentMethods('#payment-method', { value: PAYMENT_AMOUNT });
      paymentWidget.renderAgreement('#agreement');
    };

    loadWidget();
    return () => {
      paymentWidgetRef.current = null;
    };
  }, [isOpen]);

  const handlePayment = async () => {
    const widget = paymentWidgetRef.current;
    if (!widget) return;
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    try {
      await widget.requestPayment({
        orderId,
        orderName: ORDER_NAME,
        amount: PAYMENT_AMOUNT,
        successUrl: `${baseUrl}/payment/success`,
        failUrl: `${baseUrl}/payment/fail`,
        customerEmail: 'customer@samdeok.mansion',
        customerName: '?쇰뜒留⑥뀡 怨좉컼',
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* 모바일: 하단 시트 / 데스크탑: 중앙 모달 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto transition-transform duration-300 ease-out rounded-t-3xl md:bottom-auto md:left-1/2 md:right-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:w-full md:max-h-[90vh] md:rounded-3xl md:pb-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 pr-2">츄르 충전</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full hover:bg-gray-100 active:scale-[0.98]"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
          <p className="text-orange-800 font-medium">{PAYMENT_AMOUNT}원 결제 시 츄르 25개 지급</p>
          <p className="text-orange-600 text-sm mt-1">결제 후 바로 모든 방을 이용할 수 있다냥 🐾</p>
        </div>
        <div id="payment-method" className="min-h-[120px] mb-4" />
        <div id="agreement" className="mb-6" />
        <button
          type="button"
          onClick={handlePayment}
          className="w-full min-h-[48px] py-4 rounded-2xl bg-orange-500 text-white font-semibold hover:bg-orange-600 active:scale-[0.98] transition"
        >
          {PAYMENT_AMOUNT}원 결제하고 츄르 받기
        </button>
      </div>
    </>
  );
}