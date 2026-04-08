import React from 'react';
import { Card } from '../ui/Card';

const funnelSteps = [
    { label: 'Total Visits', value: '12,402', percent: 100, color: 'bg-blue-600' },
    { label: 'Product Views', value: '5,820', percent: 47, color: 'bg-blue-500' },
    { label: 'Added to Cart', value: '1,240', percent: 10, color: 'bg-blue-400' },
    { label: 'Purchased', value: '452', percent: 3.6, color: 'bg-emerald-500' },
];

export const ConversionFunnel = () => {
    return (
        <Card className="p-8 border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-extrabold text-[#162138] tracking-tight">Sales Funnel</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium italic">Conversion path efficiency</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="material-symbols-outlined text-slate-400">filter_alt</span>
                </div>
            </div>

            <div className="space-y-4">
                {funnelSteps.map((step, idx) => {
                    const nextStep = funnelSteps[idx + 1];
                    const dropoff = nextStep ? (100 - (nextStep.percent / step.percent) * 100).toFixed(1) : null;

                    return (
                        <div key={idx} className="relative">
                            {/* Funnel Bar */}
                            <div className="flex items-center gap-4">
                                <div className="w-24 text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{step.label}</p>
                                    <p className="text-lg font-black text-slate-800 tabular-nums">{step.value}</p>
                                </div>
                                <div className="flex-1 h-12 bg-slate-50 rounded-lg relative overflow-hidden group">
                                    <div 
                                        className={`${step.color} h-full transition-all duration-1000 ease-out flex items-center justify-end px-4 shadow-sm`}
                                        style={{ width: `${step.percent}%` }}
                                    >
                                        <span className="text-white text-[10px] font-black group-hover:scale-125 transition-transform">{step.percent}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dropoff arrow if not the last step */}
                            {dropoff && (
                                <div className="flex justify-end pr-8 -my-1 relative z-10">
                                    <div className="flex items-center gap-1.5 py-1 px-2.5 bg-rose-50 border border-rose-100 rounded-full text-[9px] font-black text-rose-500 uppercase tracking-widest shadow-sm">
                                        <span className="material-symbols-outlined text-[10px]">arrow_downward</span>
                                        {dropoff}% Drop-off
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Global Conversion Rate</p>
                    <p className="text-2xl font-black text-emerald-700 tracking-tighter">3.64%</p>
                </div>
                <div className="text-right">
                    <Badge variant="ghost" className="bg-emerald-100 text-emerald-700 border-none text-[10px] font-black">+14% vs avg.</Badge>
                </div>
            </div>
        </Card>
    );
};

// Internal Badge helper for brevity
const Badge = ({ children, variant, className }: any) => (
    <span className={`px-2 py-0.5 rounded-full ${className}`}>
        {children}
    </span>
);
