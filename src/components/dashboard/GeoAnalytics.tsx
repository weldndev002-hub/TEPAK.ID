import React from 'react';
import { Card } from '../ui/Card';

const locations = [
    { country: 'Indonesia', flag: '🇮🇩', sessions: '45.2k', share: 62, trend: '+12%' },
    { country: 'Malaysia', flag: '🇲🇾', sessions: '12.4k', share: 18, trend: '+5%' },
    { country: 'Singapore', flag: '🇸🇬', sessions: '8.1k', share: 11, trend: '-2%' },
    { country: 'United States', flag: '🇺🇸', sessions: '4.2k', share: 6, trend: '+20%' },
    { country: 'Others', flag: '🌐', sessions: '2.1k', share: 3, trend: '+1%' },
];

export const GeoAnalytics = () => {
    return (
        <Card className="p-8 border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-extrabold text-[#162138] tracking-tight">Geographic Reach</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium italic">Top performing territories</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="material-symbols-outlined text-slate-400">public</span>
                </div>
            </div>

            <div className="space-y-6">
                {locations.map((loc, idx) => (
                    <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{loc.flag}</span>
                                <span className="text-sm font-black text-slate-800">{loc.country}</span>
                            </div>
                            <div className="text-right flex items-center gap-3">
                                <span className={`text-[10px] font-black ${loc.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {loc.trend}
                                </span>
                                <span className="text-xs font-black text-slate-900">{loc.sessions}</span>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                            <div 
                                className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${loc.share}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 p-6 bg-slate-900 rounded-3xl relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">PRO Insights</p>
                    <h4 className="text-white font-bold leading-tight">Your highest conversion is coming from <span className="text-blue-400 underline underline-offset-4 decoration-blue-400/30">Jakarta, ID</span>.</h4>
                </div>
                {/* Decorative Map mesh or pattern could go here */}
                <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[100px] text-white">map</span>
                </div>
            </div>
        </Card>
    );
};
