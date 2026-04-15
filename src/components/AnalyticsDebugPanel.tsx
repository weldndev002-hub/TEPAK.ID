import React, { useState } from 'react';
import { trackAnalyticsEvent, trackPageView, trackClick, trackPurchase } from '../lib/analytics';

/**
 * Analytics Debug Panel
 * Gunakan untuk testing analytics tracking
 * Buka browser console untuk lihat logs
 */
export const AnalyticsDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<string>('Ready');

  const handleTrackPageView = async () => {
    setStatus('Tracking page view...');
    await trackPageView();
    setStatus('✅ Page view tracked');
    setTimeout(() => setStatus('Ready'), 3000);
  };

  const handleTrackClick = async () => {
    setStatus('Tracking click...');
    await trackClick('debug-test');
    setStatus('✅ Click tracked');
    setTimeout(() => setStatus('Ready'), 3000);
  };

  const handleTrackPurchase = async () => {
    setStatus('Tracking purchase...');
    await trackPurchase('ORDER-DEBUG-123', 100000);
    setStatus('✅ Purchase tracked');
    setTimeout(() => setStatus('Ready'), 3000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50 font-bold text-xs"
        title="Analytics Debug Panel"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center justify-between">
        <span className="font-black uppercase tracking-widest text-sm">Analytics Debug</span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-xl hover:scale-125 transition-transform"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
          <p className="text-sm font-bold text-slate-900">{status}</p>
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleTrackPageView}
            className="w-full px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 font-black text-xs uppercase rounded-lg transition-colors"
          >
            📄 Track Page View
          </button>
          <button
            onClick={handleTrackClick}
            className="w-full px-3 py-2 bg-green-100 hover:bg-green-200 text-green-900 font-black text-xs uppercase rounded-lg transition-colors"
          >
            🖱️ Track Click
          </button>
          <button
            onClick={handleTrackPurchase}
            className="w-full px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-black text-xs uppercase rounded-lg transition-colors"
          >
            💳 Track Purchase
          </button>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-2">⚠️ Instructions</p>
          <ul className="text-[10px] text-amber-800 space-y-1">
            <li>1. Buka browser console (F12)</li>
            <li>2. Klik tombol untuk track events</li>
            <li>3. Lihat log di console</li>
            <li>4. Refresh dashboard</li>
            <li>5. Lihat Total Views meningkat</li>
          </ul>
        </div>

        {/* Tips */}
        <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
          <p className="text-[10px] font-black text-cyan-900 uppercase tracking-widest mb-2">💡 Tips</p>
          <p className="text-[10px] text-cyan-800">
            Pastikan sudah login sebelum testing. Analytics hanya mencatat untuk authenticated users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDebugPanel;
