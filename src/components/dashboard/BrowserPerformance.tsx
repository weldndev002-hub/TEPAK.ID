import React from 'react';
import { cn } from '../../lib/utils';

export interface BrowserStat {
  browser: string;
  version: string;
  count: number;
  percentage: number;
  icon: string;
}

const DEFAULT_STATS: BrowserStat[] = [
  { browser: 'Google Chrome', version: 'v119.0.0', count: 542120, percentage: 85, icon: '🌐' },
  { browser: 'Safari Desktop', version: 'v17.1', count: 128402, percentage: 40, icon: '🍎' },
  { browser: 'Mozilla Firefox', version: 'v118.0', count: 42190, percentage: 15, icon: '🦊' }
];

export const BrowserPerformance: React.FC<{ stats?: BrowserStat[] }> = ({ stats = DEFAULT_STATS }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-50">
        <h4 className="text-lg font-bold text-slate-900">Browser Performance</h4>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xl">{stat.icon}</span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{stat.browser}</p>
                  <p className="text-xs text-slate-500">{stat.version}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{stat.count.toLocaleString()}</p>
                <div className="w-32 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000" 
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowserPerformance;
