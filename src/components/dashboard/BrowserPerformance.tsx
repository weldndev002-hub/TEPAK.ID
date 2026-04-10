import React from 'react';
import { cn } from '../../lib/utils';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

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
    <div className="bg-white rounded-[2.5rem] border border-slate-50 overflow-hidden shadow-sm ">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <div>
            <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Browser Performance</h4>
            <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest italic">User Agent Analysis</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100/50">
            <GlobeAltIcon className="w-5 h-5 text-slate-400" />
        </div>
      </div>
      <div className="p-8">
        <div className="space-y-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center justify-between group cursor-default">
              <div className="flex items-center gap-5">
                <span className="text-2xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500">{stat.icon}</span>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{stat.browser}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{stat.version}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 tracking-tighter mb-2">{stat.count.toLocaleString()}</p>
                <div className="w-32 h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100/30">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out" 
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
