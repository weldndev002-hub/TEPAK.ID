import React from 'react';
import { useAnalyticsTracking } from './hooks/useAnalyticsTracking';

/**
 * Analytics Tracker Component
 * Letakan di layout utama atau halaman penting untuk auto-track page views
 * Ini akan otomatis mencatat setiap kali user membuka halaman
 */
export const AnalyticsTracker: React.FC = () => {
  useAnalyticsTracking();
  return null; // Component ini hanya untuk tracking, tidak render UI
};

export default AnalyticsTracker;
