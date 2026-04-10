import React from 'react';
import { Card } from '../ui/Card';
import { GlobeAltIcon, MapIcon } from '@heroicons/react/24/outline';

const locations = [
    { country: 'Indonesia', flag: '🇮🇩', sessions: '45.2k', share: 62, trend: '+12%' },
    { country: 'Malaysia', flag: '🇲🇾', sessions: '12.4k', share: 18, trend: '+5%' },
    { country: 'Singapore', flag: '🇸🇬', sessions: '8.1k', share: 11, trend: '-2%' },
    { country: 'United States', flag: '🇺🇸', sessions: '4.2k', share: 6, trend: '+20%' },
    { country: 'Others', flag: '🌐', sessions: '2.1k', share: 3, trend: '+1%' },
];

export const GeoAnalytics = () => {
    return (
        <Card className="p-10 border-slate-50 shadow-sm h-full rounded-[2.5rem] ">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Geographic Reach</h3>
                    <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest italic leading-none">Top performing territories</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <GlobeAltIcon className="w-6 h-6 text-slate-400" />
                </div>
            </div>

            <div className="space-y-8">
                {locations.map((loc, idx) => (
                    <div key={idx} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-xl filter drop-shadow-sm">{loc.flag}</span>
                                <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{loc.country}</span>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${loc.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {loc.trend}
                                </span>
                                <span className="text-xs font-black text-slate-900 tracking-tighter">{loc.sessions}</span>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100/30">
                            <div 
                                className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${loc.share}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">PRO Insights</p>
                    <h4 className="text-white text-sm font-bold leading-relaxed tracking-tight">Your highest conversion is coming from <span className="text-primary italic underline underline-offset-8 decoration-primary/30">Jakarta, ID</span>.</h4>
                </div>
                {/* Decorative Map mesh or pattern could go here */}
                <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.05] group-hover:opacity-[0.1] group-hover:scale-110 transition-all duration-1000 grayscale">
                    <MapIcon className="w-48 h-48 text-white" />
                </div>
            </div>
        </Card>
    );
};

export default GeoAnalytics;
