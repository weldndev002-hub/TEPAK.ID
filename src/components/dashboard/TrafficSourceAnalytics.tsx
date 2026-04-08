import React from 'react';
import { Card } from '../ui/Card';

const sources = [
    { name: 'Direct Traffic', value: 45, color: 'bg-blue-600', subtext: 'Direct URL, Bookmarks' },
    { name: 'Social Media', value: 30, color: 'bg-orange-400', subtext: 'Instagram, TikTok, Twitter' },
    { name: 'Search Engines', value: 15, color: 'bg-emerald-500', subtext: 'Google, Bing, DuckDuckGo' },
    { name: 'Referrals', value: 10, color: 'bg-purple-500', subtext: 'External blogs, Affiliates' },
];

export const TrafficSourceAnalytics = () => {
    return (
        <Card className="p-8 border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-extrabold text-[#162138] tracking-tight">Traffic Acquisition</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium italic">Monthly distribution by origin</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="material-symbols-outlined text-slate-400">explore</span>
                </div>
            </div>

            <div className="space-y-8">
                {/* Horizontal Stacked Bar representing the whole */}
                <div className="w-full h-4 flex rounded-full overflow-hidden bg-slate-100">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sources.map((source, idx) => (
                        <div key={idx} className="flex items-start gap-4 group">
                            <div className={`mt-1.5 w-3 h-3 rounded-full shrink-0 ${source.color} group-hover:scale-125 transition-transform`} />
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-slate-800">{source.name}</span>
                                    <span className="text-sm font-black text-blue-600">{source.value}%</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{source.subtext}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase italic">Updated 2h ago</p>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View Source Details</button>
                </div>
            </div>
        </Card>
    );
};
