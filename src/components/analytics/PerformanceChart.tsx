import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export const PerformanceChart: React.FC = () => {
    const [activeTab, setActiveTab] = useState('views');
    
    // Mock data for simplified SVG chart
    const dataPoints = [40, 60, 45, 90, 65, 100, 80, 70, 85, 60, 75, 45, 55, 30, 20];

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h3 className="text-xl font-black text-slate-900 font-headline tracking-tight">Ikhtisar Performa</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Pertumbuhan dalam 30 hari terakhir</p>
                </div>
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    {['Views', 'Klik', 'Penjualan'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={cn(
                                "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                activeTab === tab.toLowerCase() ? "bg-white text-primary shadow-sm ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* SVG Visual Chart */}
            <div className="relative h-64 w-full flex items-end gap-1.5 px-2">
                {dataPoints.map((h, i) => (
                    <div 
                        key={i} 
                        className="group relative flex-1 h-full flex flex-col justify-end"
                    >
                        <div 
                            className={cn(
                                "w-full bg-primary/10 border-t-4 border-primary rounded-t-lg transition-all duration-500 hover:bg-primary/20 cursor-pointer overflow-hidden relative",
                                activeTab === 'penjualan' ? "animate-in slide-in-from-bottom" : ""
                            )}
                            style={{ height: `${h}%` }}
                        >
                            {/* Animated reflection effect */}
                            <div className="absolute inset-0 bg-white/10 -skew-x-[25deg] -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 pointer-events-none z-10">
                            <div className="bg-slate-900 text-white text-[10px] font-black py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap">
                                {Math.floor(h * 12.3)} views
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between mt-8 text-[10px] text-slate-400 font-black uppercase tracking-widest px-2">
                <span>01 MEI</span>
                <span>07 MEI</span>
                <span>14 MEI</span>
                <span>21 MEI</span>
                <span>28 MEI</span>
                <span>01 JUN</span>
            </div>
        </div>
    );
};

export default PerformanceChart;
