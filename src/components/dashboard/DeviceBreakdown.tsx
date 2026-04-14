import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface DeviceBreakdownProps {
  className?: string;
}

export const DeviceBreakdown: React.FC<DeviceBreakdownProps> = ({ className }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/analytics/dashboard?range=30d');
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error('Device Stats Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const devices = data?.devices || [];
  const browsers = data?.browsers || [];
  const totalVisits = data?.totalViews || 0;

  // Find percentages for ring rendering
  const mobileShare = devices.find((d: any) => d.type === 'Mobile')?.percentage || 0;
  const desktopShare = devices.find((d: any) => d.type === 'Desktop')?.percentage || 0;

  if (isLoading) {
    return <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse", className)}>
        <div className="bg-white p-8 rounded-2xl border border-slate-100 h-64 flex items-center justify-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">Loading...</div>
        <div className="bg-white p-8 rounded-2xl border border-slate-100 h-64 flex items-center justify-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">Loading...</div>
    </div>;
  }

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-8", className)}>
        
        {/* Left: Device Share (Donut Chart) */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold self-start mb-6 text-slate-900 uppercase tracking-tight">Device Share</h3>
            
            <div className="relative w-48 h-48 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeDasharray="100, 100" strokeWidth="3"></path>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f6af3b" strokeDasharray={`${mobileShare}, 100`} strokeWidth="3" className="transition-all duration-1000 origin-center"></path>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#465f89" strokeDasharray={`${desktopShare}, 100`} strokeDashoffset={`-${mobileShare}`} strokeWidth="3" className="transition-all duration-1000 origin-center"></path>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">{totalVisits.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Total Views</span>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-slate-50 mt-auto">
                <div className="text-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mx-auto mb-1.5 shadow-sm shadow-primary/30"></div>
                    <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase">MOBILE</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">{mobileShare}%</p>
                </div>
                <div className="text-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#465f89] mx-auto mb-1.5 shadow-sm shadow-slate-900/30"></div>
                    <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase">DESKTOP</p>
                    <p className="text-xs font-black text-slate-900 mt-0.5">{desktopShare}%</p>
                </div>
            </div>
        </div>

        {/* Right: Browser Performance (Real Data) */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold mb-6 text-slate-900 uppercase tracking-tight">Browser Performance</h3>
            
            <div className="space-y-7">
                {browsers.map((b: any, idx: number) => (
                    <div key={idx}>
                        <div className="flex justify-between text-xs font-black mb-2.5 uppercase tracking-tight">
                            <span className="flex items-center gap-2 text-slate-500">
                                <span className="text-base leading-none">{b.icon}</span> 
                                {b.name}
                            </span>
                            <span className="text-slate-900">{b.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100/50">
                            <div 
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    idx === 0 ? "bg-primary" : idx === 1 ? "bg-[#465f89]" : "bg-slate-300"
                                )} 
                                style={{ width: `${b.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}

                {browsers.length === 0 && (
                    <div className="py-8 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">No data available yet</div>
                )}
            </div>
        </div>

    </div>
  );
};

export default DeviceBreakdown;
