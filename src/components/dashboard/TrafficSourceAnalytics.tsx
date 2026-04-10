import React from 'react';
import { Card } from '../ui/Card';
import { MapIcon } from '@heroicons/react/24/outline';

const sources = [
    { name: 'Direct Traffic', value: 45, color: 'bg-primary', subtext: 'Direct URL, Bookmarks' },
    { name: 'Social Media', value: 30, color: 'bg-secondary', subtext: 'Instagram, TikTok, Twitter' },
    { name: 'Search Engines', value: 15, color: 'bg-emerald-500', subtext: 'Google, Bing, DuckDuckGo' },
    { name: 'Referrals', value: 10, color: 'bg-indigo-500', subtext: 'External blogs, Affiliates' },
];

export const TrafficSourceAnalytics = () => {
    return (
        <Card className="p-10 border-slate-50 shadow-sm h-full rounded-[2.5rem] ">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Traffic Acquisition</h3>
                    <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest italic leading-none">Monthly distribution by origin</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <MapIcon className="w-6 h-6 text-slate-400" />
                </div>
            </div>

            <div className="space-y-10">
                {/* Horizontal Stacked Bar representing the whole */}
                <div className="w-full h-5 flex rounded-[1.25rem] overflow-hidden bg-slate-50 border border-slate-100/50">
                    {sources.map((source, idx) => (
                        <div 
                            key={idx} 
                            className={source.color} 
                            style={{ width: `${source.value}%` }}
                            title={`${source.name}: ${source.value}%`}
                        />
                    ))}
                </div>

                {/* Legend & Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sources.map((source, idx) => (
                        <div key={idx} className="flex items-start gap-4 group">
                            <div className={`mt-1.5 w-4 h-4 rounded-lg shrink-0 ${source.color} group-hover:scale-110 transition-transform shadow-sm`} />
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{source.name}</span>
                                    <span className="text-xs font-black text-primary tracking-tighter">{source.value}%</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic opacity-80">{source.subtext}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase italic leading-none">Updated 2h ago</p>
                    <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:scale-105 transition-transform">
                        View Source Details
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default TrafficSourceAnalytics;
