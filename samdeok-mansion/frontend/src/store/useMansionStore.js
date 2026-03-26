import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_API_BASE_URL || '') : '';

const useMansionStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      churuCount: 0,

      login: () => set({ isLoggedIn: true }), // 츄르는 서버 GET /api/session 기준
      logout: () => set({ isLoggedIn: false, churuCount: 0 }),

      /** 서버 잔액과 동기화 (앱 로드·결제 완료 후 호출). 쿠키로 세션 식별 */
      syncChuruFromServer: async () => {
        const base = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_API_BASE_URL || '') : '';
        try {
          const res = await fetch(`${base}/api/session`, { credentials: 'include' });
          const data = await res.json();
          if (res.ok && typeof data.churuCount === 'number') set({ churuCount: data.churuCount });
        } catch (_) {}
      },

      setChuruCount: (n) => set({ churuCount: n }),

      useChuru: (cost) => {
        const current = get().churuCount;
        if (current >= cost) {
          set({ churuCount: current - cost });
          return true;
        }
        return false;
      },

      chargeChuru: (amount) => set((s) => ({ churuCount: s.churuCount + amount })),
    }),
    { name: 'mansion-store', partialize: (s) => ({ churuCount: s.churuCount, isLoggedIn: s.isLoggedIn }) }
  )
);

export default useMansionStore;
