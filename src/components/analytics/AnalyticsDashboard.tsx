import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { 
    ChartBarIcon, 
    DevicePhoneMobileIcon, 
    ComputerDesktopIcon, 
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CalendarIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';
import Button from '../ui/Button';

export const AnalyticsDashboard = () => {
    const [range, setRange] = useState('7d');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({
        start: '2026-04-03',
        end: '2026-04-10'
    });

    // Simulated Analytics Data
    const [data, setData] = useState({
        totalViews: 12450,
        totalClicks: 842,
        avgCTR: '6.7%',
        devices: [
            { type: 'Mobile', percentage: 72, icon: DevicePhoneMobileIcon, color: 'text-primary bg-amber-50' },
            { type: 'Desktop', percentage: 28, icon: ComputerDesktopIcon, color: 'text-blue-600 bg-blue-50' }
        ],
        browsers: [
            { name: 'Chrome', percentage: 65, icon: '🌐' },
            { name: 'Safari', percentage: 22, icon: '🍎' },
            { name: 'Firefox', percentage: 8, icon: '🦊' }
        ]
    });

    const handleRefresh = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/analytics/dashboard?range=${range}`);
            const result = await res.json();
            
            if (res.ok) {
                // Decorate API data with icons and colors for UI
                const decoratedData = {
                    ...result,
                    devices: (result.devices || []).map((d: any) => ({
                        ...d,
                        icon: d.type === 'Mobile' ? DevicePhoneMobileIcon : ComputerDesktopIcon,
                        color: d.type === 'Mobile' ? 'text-primary bg-amber-50' : 'text-blue-600 bg-blue-50'
                    }))
                };
                setData(decoratedData);
            } else {
                setError(result.error || "Gagal memuat agregasi data dari server.");
            }
        } catch (err) {
            console.error('Analytics Error:', err);
            setError("Gagal menghubungi server analitik.");
        } finally {
            setIsLoading(false);
        }
    };

    const showDateError = (msg: string) => {
        setDateError(msg);
        setTimeout(() => setDateError(null), 3000);
    };

    const handleDateChange = (type: 'start' | 'end', val: string) => {
        const newRange = { ...dateRange, [type]: val };
        
        // Validation: startDate > endDate
        if (type === 'start' && val > newRange.end) {
            showDateError('Tanggal awal tidak boleh lebih besar dari tanggal akhir!');
            return;
        }
        if (type === 'end' && val < newRange.start) {
            showDateError('Tanggal akhir tidak boleh lebih kecil dari tanggal awal!');
            setDateRange({ ...dateRange, end: dateRange.start });
            return;
        }

        setDateError(null);
        setDateRange(newRange);
        handleRefresh();
    };

    useEffect(() => {
        handleRefresh();
    }, [range]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    {['24h', '7d', '30d', '90d'].map((r) => (
                        <button 
                            key={r}
                            onClick={() => setRange(r)}
                            className={cn(
                                "px-4 md:px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                range === r ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                            )}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-full sm:w-auto">
                        <div className="flex items-center px-2 md:px-3 gap-2 flex-1 sm:flex-none">
                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                            <input 
                                type="date" 
                                value={dateRange.start}
                                onChange={(e) => handleDateChange('start', e.target.value)}
                                className="bg-transparent border-none text-[10px] font-black text-slate-600 focus:ring-0 uppercase p-0" 
                            />
                        </div>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <div className="flex items-center px-2 md:px-3 gap-2 flex-1 sm:flex-none">
                            <input 
                                type="date" 
                                value={dateRange.end}
                                onChange={(e) => handleDateChange('end', e.target.value)}
                                className="bg-transparent border-none text-[10px] font-black text-slate-600 focus:ring-0 uppercase p-0" 
                            />
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        onClick={handleRefresh}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all w-full sm:w-auto flex justify-center"
                    >
                        <ArrowPathIcon className={cn("w-5 h-5 text-slate-500", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>
            {dateError && (
                <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-xs font-bold animate-in slide-in-from-top duration-200">
                    <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />{dateError}
                </div>
            )}

            {/* ERROR STATE / BLANK CHART */}
            {error ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 p-8 md:p-12 text-center group">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6 group-hover:shake transition-transform">
                        <ExclamationTriangleIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-2">{error}</h3>
                    <p className="text-sm text-slate-500 max-w-xs mb-8">Sistem gagal menarik data dari server agregasi. Silakan coba segarkan halaman.</p>
                    <Button 
                        variant="primary" 
                        onClick={() => window.location.reload()}
                        className="bg-[#0873df] px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                    >
                        <ArrowPathIcon className="w-4 h-4" /> Refresh Halaman
                    </Button>
                </div>
            ) : (
                <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-8 transition-opacity duration-300", isLoading ? "opacity-40" : "opacity-100")}>
                    
                    {/* Device Segmentation Chart (Simplified visual represent) */}
                    <Card className="lg:col-span-2 p-8 border-slate-50 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-1">Device Segmentation</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Traffic Distribution</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                                <ArrowTrendingUpIcon className="w-4 h-4" /> 12% Growth
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            {/* Donut Simulation */}
                            <div className="relative flex justify-center">
                                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeDasharray="100, 100" strokeWidth="4"></path>
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f6af3b" strokeDasharray={`${data.devices[0].percentage}, 100`} strokeWidth="4" className="transition-all duration-1000"></path>
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#465f89" strokeDasharray={`${data.devices[1].percentage}, 100`} strokeDashoffset={`-${data.devices[0].percentage}`} strokeWidth="4" className="transition-all duration-1000"></path>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{data.devices[0].percentage}%</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mobile First</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {data.devices.map((device, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-3xl border border-slate-50 bg-slate-50/30">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", device.color)}>
                                                <device.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{device.type}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sessions</p>
                                            </div>
                                        </div>
                                        <span className="text-lg font-black text-slate-900 tracking-tighter">{device.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Browser Ranking Table */}
                    <Card className="p-8 border-slate-50 shadow-sm">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                <ChartBarIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Top 3 Browsers</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visitor Preference</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {data.browsers.map((browser, idx) => (
                                <div key={idx} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl">{browser.icon}</span>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{browser.name}</p>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(s => <div key={s} className={cn("w-1 h-1 rounded-full", s <= (3-idx) ? "bg-primary" : "bg-slate-200")}></div>)}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{browser.percentage}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/30">
                                        <div 
                                            className={cn("h-full transition-all duration-1000 ease-out rounded-full", idx === 0 ? "bg-primary" : idx === 1 ? "bg-blue-600" : "bg-slate-400")} 
                                            style={{ width: `${browser.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-50">
                            <button className="w-full py-3 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border border-slate-100 hover:text-slate-900 hover:bg-white transition-all">
                                View Full User Agent Report
                            </button>
                        </div>
                    </Card>

                </div>
            )}
        </div>
    );
};
