import React from 'react';

export const DeviceBreakdown: React.FC = () => {
    return (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 flex flex-col items-center shadow-sm hover:shadow-xl transition-all h-full">
            <h3 className="text-sm font-black self-start mb-10 uppercase tracking-widest text-slate-400">Sebaran Perangkat</h3>
            
            <div className="relative w-56 h-56 mb-12">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background track */}
                    <path 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="#f1f5f9" 
                        strokeWidth="3.5"
                        strokeDasharray="100, 100"
                    ></path>
                    {/* Mobile - 65% (Primary) */}
                    <path 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="#f6af3b" 
                        strokeWidth="4"
                        strokeDasharray="65, 100"
                        className="animate-in fade-in duration-1000"
                    ></path>
                    {/* Desktop - 25% (Secondary) */}
                    <path 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="#465f89" 
                        strokeWidth="4"
                        strokeDasharray="25, 100"
                        strokeDashoffset="-65"
                        className="animate-in fade-in duration-1000 delay-300"
                    ></path>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">2.4k</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Total Kunjungan</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 w-full pt-8 border-t border-slate-50">
                {[
                    { label: 'MOBILE', color: 'bg-primary', percent: '65%' },
                    { label: 'DESKTOP', color: 'bg-secondary', percent: '25%' },
                    { label: 'TABLET', color: 'bg-slate-200', percent: '10%' },
                ].map((item) => (
                    <div key={item.label} className="text-center group cursor-default">
                        <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2 shadow-sm group-hover:scale-125 transition-transform`}></div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-lg font-black text-slate-900">{item.percent}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeviceBreakdown;
