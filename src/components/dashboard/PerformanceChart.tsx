import React from 'react';
import { ChartBarIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';

export const PerformanceChart: React.FC = () => {
    return (
        <section className="space-y-8 h-full flex flex-col ">
            <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Performa Halaman (30 Hari)</h3>
                <div className="flex gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <button className="px-6 py-2 bg-white shadow-sm border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 transition-all hover:scale-[1.02]">Views</button>
                    <button className="px-6 py-2 text-slate-400 hover:text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Clicks</button>
                </div>
            </div>

            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-50 shadow-sm flex-1 relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-100 transition-all duration-700">
                {/* DECORATIVE CHART BARS */}
                <div className="absolute inset-x-12 bottom-0 flex items-end gap-3 h-2/3 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                    {[20, 35, 25, 45, 60, 50, 80, 65, 90, 75, 100, 85].map((h, i) => (
                        <div 
                            key={i} 
                            style={{ height: `${h}%` }} 
                            className="flex-1 bg-primary rounded-t-2xl group-hover:bg-primary transition-all duration-700 delay-[calc(i*50ms)]" 
                        />
                    ))}
                </div>

                {/* CHART INFO OVERLAY */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-6">
                    <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform duration-700 border border-primary/10">
                        <PresentationChartLineIcon className="w-10 h-10" />
                    </div>
                    <div className="space-y-3">
                        <p className="text-slate-900 font-black text-sm uppercase tracking-[0.2em]">Real-time Analytics</p>
                        <p className="text-slate-400 text-[10px] font-black max-w-xs mt-2 uppercase tracking-widest leading-relaxed italic opacity-80">
                            Data trafik sedang diproses untuk akurasi maksimal. Laporan interaktif akan muncul sesaat lagi.
                        </p>
                    </div>
                </div>

                {/* CHART LINES DECORATION */}
                <div className="absolute inset-0 pointer-events-none opacity-30">
                    <div className="w-full h-px bg-slate-100 absolute top-1/4" />
                    <div className="w-full h-px bg-slate-100 absolute top-2/4" />
                    <div className="w-full h-px bg-slate-100 absolute top-3/4" />
                </div>
            </div>
        </section>
    );
};

export default PerformanceChart;
