import React from 'react';

export const BrowserPerformance: React.FC = () => {
    const browsers = [
        { name: 'Chrome', percent: 58, color: 'bg-primary' },
        { name: 'Safari', percent: 32, color: 'bg-secondary' },
        { name: 'Firefox', percent: 10, color: 'bg-slate-400' },
    ];

    return (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all h-full">
            <h3 className="text-sm font-black mb-10 uppercase tracking-widest text-slate-400">Performa Browser</h3>
            
            <div className="space-y-10">
                {browsers.map((browser) => (
                    <div key={browser.name} className="group">
                        <div className="flex justify-between items-center text-xs font-black mb-3 uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">
                            <span className="flex items-center gap-3">
                                {browser.name} 
                                <span className={`w-2.5 h-2.5 rounded-full ${browser.color} shadow-sm group-hover:scale-150 transition-transform`}></span>
                            </span>
                            <span className="text-sm font-black">{browser.percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-50 group-hover:border-slate-200 transition-all">
                            <div 
                                className={`h-full ${browser.color} animate-in slide-in-from-left duration-1000 ease-out shadow-sm`} 
                                style={{ width: `${browser.percent}%` }}
                            >
                                {/* Animated reflection */}
                                <div className="h-full w-20 bg-white/10 -skew-x-12 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wawasan Browser</p>
                <p className="text-xs font-bold text-slate-700 mt-1">Chrome mendominasi transaksi sebesar 72%.</p>
            </div>
        </div>
    );
};

export default BrowserPerformance;
