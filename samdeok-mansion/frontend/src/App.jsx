import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SamdeokMansion from './pages/SamdeokMansion.jsx';
import RoomRouter from './pages/RoomRouter.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import PaymentFail from './pages/PaymentFail.jsx';
import useMansionStore from './store/useMansionStore.js';

export default function App() {
  const syncChuruFromServer = useMansionStore((s) => s.syncChuruFromServer);
  useEffect(() => {
    syncChuruFromServer();
  }, [syncChuruFromServer]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SamdeokMansion />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/fail" element={<PaymentFail />} />
          <Route path="/:slug" element={<RoomRouter />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
