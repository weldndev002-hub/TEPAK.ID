import React from 'react';

export const PerformanceChart: React.FC = () => {
    return (
        <section className="space-y-8 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Performa Halaman (30 Hari)</h3>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-full">
                    <button className="px-5 py-1.5 bg-white shadow-sm rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900">Views</button>
                    <button className="px-5 py-1.5 text-slate-400 hover:text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors">Clicks</button>
                </div>
            </div>

            <div className="bg-white p-12 rounded-[3rem] border border-slate-50 shadow-sm flex-1 relative overflow-hidden group">
                {/* DECORATIVE CHART BARS */}
                <div className="absolute inset-x-12 bottom-0 flex items-end gap-3 h-2/3 opacity-20">
                    {[20, 35, 25, 45, 60, 50, 80, 65, 90, 75, 100, 85].map((h, i) => (
                        <div 
                            key={i} 
                            style={{ height: `${h}%` }} 
                            className="flex-1 bg-blue-500 rounded-t-xl group-hover:bg-blue-400 transition-all duration-700" 
                        />
                    ))}
                </div>

                {/* CHART INFO OVERLAY */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shadow-xl shadow-blue-500/10">
                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>show_chart</span>
                    </div>
                    <div>
                        <p className="text-slate-900 font-black text-sm uppercase tracking-widest">Real-time Analytics</p>
                        <p className="text-slate-400 text-xs font-medium max-w-xs mt-2">Data trafik Anda sedang diproses dan akan tampil secara interaktif dalam hitungan detik.</p>
                    </div>
                </div>

                {/* CHART LINES DECORATION */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-px bg-slate-50 absolute top-1/4" />
                    <div className="w-full h-px bg-slate-50 absolute top-2/4" />
                    <div className="w-full h-px bg-slate-50 absolute top-3/4" />
                </div>
            </div>
        </section>
    );
};

export default PerformanceChart;
