import React from 'react';
import { cn } from '../../lib/utils';

export interface DeviceBreakdownProps {
  className?: string;
}

export const DeviceBreakdown: React.FC<DeviceBreakdownProps> = ({ className }) => {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-8", className)}>
        
        {/* Left: Device Share (Donut Chart) */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold self-start mb-6 text-slate-900">Device Share</h3>
            
            <div className="relative w-48 h-48 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background Track */}
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeDasharray="100, 100" strokeWidth="3"></path>
                    {/* Ring 1 - Mobile (Primary) */}
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f6af3b" strokeDasharray="65, 100" strokeWidth="3" className="animate-[spin_1s_ease-out_reverse] origin-center"></path>
                    {/* Ring 2 - Desktop (Secondary) */}
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#465f89" strokeDasharray="25, 100" strokeDashoffset="-65" strokeWidth="3" className="animate-[spin_1.5s_ease-out_reverse] origin-center"></path>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900">2.4k</span>
                    <span className="text-[10px] text-slate-400 font-bold tracking-widest">TOTAL VISITS</span>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 w-full pt-2 border-t border-slate-50 mt-auto">
                <div className="text-center">
                    <div className="w-3 h-3 rounded-full bg-primary mx-auto mb-1"></div>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest">MOBILE</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">65%</p>
                </div>
                <div className="text-center">
                    <div className="w-3 h-3 rounded-full bg-secondary mx-auto mb-1"></div>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest">DESKTOP</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">25%</p>
                </div>
                <div className="text-center">
                    <div className="w-3 h-3 rounded-full bg-slate-200 mx-auto mb-1"></div>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest">TABLET</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">10%</p>
                </div>
            </div>
        </div>

        {/* Right: Browser Performance (Progress Bars) */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold mb-6 text-slate-900">Browser Performance</h3>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="flex items-center gap-2 text-slate-700">Chrome <span className="w-2 h-2 rounded-full bg-primary"></span></span>
                        <span className="text-slate-900">58%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '58%' }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="flex items-center gap-2 text-slate-700">Safari <span className="w-2 h-2 rounded-full bg-secondary"></span></span>
                        <span className="text-slate-900">32%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full" style={{ width: '32%' }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="flex items-center gap-2 text-slate-700">Firefox <span className="w-2 h-2 rounded-full bg-slate-400"></span></span>
                        <span className="text-slate-900">10%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                </div>
            </div>
        </div>

    </div>
  );
};

export default DeviceBreakdown;
