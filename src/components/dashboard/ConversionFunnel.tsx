import React from 'react';
import { Card } from '../ui/Card';
import { FunnelIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

const funnelSteps = [
    { label: 'Total Visits', value: '12,402', percent: 100, color: 'bg-primary' },
    { label: 'Product Views', value: '5,820', percent: 47, color: 'bg-primary/80' },
    { label: 'Added to Cart', value: '1,240', percent: 10, color: 'bg-primary/60' },
    { label: 'Purchased', value: '452', percent: 3.6, color: 'bg-emerald-500' },
];

export const ConversionFunnel = () => {
    return (
        <Card className="p-10 border-slate-50 shadow-sm h-full rounded-[2.5rem] font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Sales Funnel</h3>
                    <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest italic leading-none">Conversion path efficiency</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <FunnelIcon className="w-6 h-6 text-slate-400" />
                </div>
            </div>

            <div className="space-y-6">
                {funnelSteps.map((step, idx) => {
                    const nextStep = funnelSteps[idx + 1];
                    const dropoff = nextStep ? (100 - (nextStep.percent / step.percent) * 100).toFixed(1) : null;

                    return (
                        <div key={idx} className="relative">
                            {/* Funnel Bar */}
                            <div className="flex items-center gap-6">
                                <div className="w-28 text-right shrink-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{step.label}</p>
                                    <p className="text-xl font-black text-slate-900 tabular-nums tracking-tighter uppercase">{step.value}</p>
                                </div>
                                <div className="flex-1 h-16 bg-slate-50 rounded-2xl relative overflow-hidden group border border-slate-100/50">
                                    <div 
                                        className={cn(step.color, "h-full transition-all duration-1000 ease-out flex items-center justify-end px-6 shadow-sm group-hover:brightness-110")}
                                        style={{ width: `${step.percent}%` }}
                                    >
                                        <span className="text-white text-[11px] font-black group-hover:scale-125 transition-transform tracking-widest">{step.percent}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dropoff arrow if not the last step */}
                            {dropoff && (
                                <div className="flex justify-end pr-10 -my-2 relative z-10">
                                    <div className="flex items-center gap-2 py-2 px-4 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-black text-rose-600 uppercase tracking-widest shadow-2xl shadow-rose-500/10 animate-pulse">
                                        <ArrowDownIcon className="w-4 h-4" />
                                        {dropoff}% Drop-off
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 p-8 bg-emerald-50 border border-emerald-100/50 rounded-[2rem] flex items-center justify-between shadow-sm">
                <div>
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.3em] mb-2 leading-none">Global Conversion Rate</p>
                    <p className="text-4xl font-black text-emerald-800 tracking-tighter uppercase">3.64%</p>
                </div>
                <div className="text-right">
                    <span className="px-4 py-2 rounded-xl bg-white/50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">+14% vs Avg</span>
                </div>
            </div>
        </Card>
    );
};

// Internal cn helper if not imported
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default ConversionFunnel;

// Internal Badge helper for brevity
const Badge = ({ children, variant, className }: any) => (
    <span className={`px-2 py-0.5 rounded-full ${className}`}>
        {children}
    </span>
);
