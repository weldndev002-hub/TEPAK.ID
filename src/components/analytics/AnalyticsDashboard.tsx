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
    
    // Set default range to last 7 days from today
    const [dateRange, setDateRange] = useState(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    });

    // Simulated Analytics Data
    const [data, setData] = useState({
        totalViews: 12450,
        totalClicks: 842,
        avgCTR: '6.7%',
        conversionRate: '3.2%',
        totalRevenue: 3250000,
        totalOrders: 26,
        avgOrderValue: 125000,
        devices: [
            { type: 'Mobile', percentage: 72, icon: DevicePhoneMobileIcon, color: 'text-primary bg-amber-50' },
            { type: 'Desktop', percentage: 28, icon: ComputerDesktopIcon, color: 'text-blue-600 bg-blue-50' }
        ],
        browsers: [
            { name: 'Chrome', percentage: 65, icon: '🌐' },
            { name: 'Safari', percentage: 22, icon: '🍎' },
            { name: 'Firefox', percentage: 8, icon: '🦊' }
        ],
        sales: {
            total_revenue: 3250000,
            order_count: 26
        },
        top_links: [
            { path: '/products', views: 2450, clicks: 312 },
            { path: '/checkout', views: 1844, clicks: 128 }
        ],
        time_series: {
            labels: ['Apr 03', 'Apr 04', 'Apr 05', 'Apr 06', 'Apr 07', 'Apr 08'],
            views: [2100, 2254, 2345, 2122, 2988, 1744],
            clicks: [145, 168, 142, 156, 189, 142],
            sales: [450000, 520000, 485000, 625000, 875000, 295000]
        }
    });

    const handleRefresh = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Include date range if available
            const url = `/api/analytics/dashboard?range=${range}&start=${dateRange.start}&end=${dateRange.end}`;
            const res = await fetch(url);
            const result = await res.json();
            
            if (res.ok) {
                // Calculate conversion rate and metrics
                const totalViews = result.totalViews || 0;
                const totalOrders = result.sales?.order_count || 0;
                const totalRevenue = result.sales?.total_revenue || 0;
                const totalClicks = result.totalClicks || 0;
                
                const conversionRate = totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(1) : '0';
                const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';
                const avgOrderValue = totalOrders > 0 ? Math.floor(totalRevenue / totalOrders) : 0;

                // Decorate API data with icons and colors for UI
                const decoratedData = {
                    ...result,
                    totalRevenue,
                    totalOrders,
                    conversionRate: `${conversionRate}%`,
                    avgOrderValue: avgOrderValue,
                    avgCTR: `${ctr}%`,
                    devices: (result.devices || []).map((d: any) => ({
                        ...d,
                        icon: d.type === 'Mobile' ? DevicePhoneMobileIcon : ComputerDesktopIcon,
                        color: d.type === 'Mobile' ? 'text-primary bg-amber-50' : 'text-blue-600 bg-blue-50'
                    })),
                    browsers: result.browsers || []
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
            showDateError('Tanggal awal tidak boleh melampaui tanggal akhir! Form di-reset.');
            setDateRange({ ...dateRange, start: dateRange.end }); // Auto reset to end date
            return;
        }
        if (type === 'end' && val < newRange.start) {
            showDateError('Tanggal akhir tidak boleh lebih kecil dari tanggal awal! Form di-reset.');
            setDateRange({ ...dateRange, end: dateRange.start }); // Auto reset to start date
            return;
        }

        setDateError(null);
        setDateRange(newRange);
        // We will call handleRefresh in a useEffect that watches dateRange
    };

    useEffect(() => {
        handleRefresh();
    }, [range, dateRange.start, dateRange.end]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    {['24h', '7d', '30d', '90d'].map((r) => (
                        <button 
                            key={r}
                            onClick={() => {
                                setRange(r);
                                const end = new Date();
                                const start = new Date();
                                if (r === '24h') start.setHours(start.getHours() - 24);
                                else if (r === '7d') start.setDate(start.getDate() - 7);
                                else if (r === '30d') start.setDate(start.getDate() - 30);
                                else if (r === '90d') start.setDate(start.getDate() - 90);
                                setDateRange({
                                    start: start.toISOString().split('T')[0],
                                    end: end.toISOString().split('T')[0]
                                });
                            }}
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
                <>
                    {/* PRO PERFORMANCE INSIGHTS - KEY METRICS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {/* Total Views */}
                        <Card className="p-6 border-slate-50 shadow-sm bg-white hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Views</p>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{data.totalViews.toLocaleString('id-ID')}</h3>
                                    <p className="text-[9px] text-emerald-600 font-bold mt-2">↑ 12% dari periode lalu</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <span className="text-lg">👁️</span>
                                </div>
                            </div>
                        </Card>

                        {/* Total Clicks */}
                        <Card className="p-6 border-slate-50 shadow-sm bg-white hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Clicks</p>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{data.totalClicks.toLocaleString('id-ID')}</h3>
                                    <p className="text-[9px] text-emerald-600 font-bold mt-2">↑ 8% dari periode lalu</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <span className="text-lg">🖱️</span>
                                </div>
                            </div>
                        </Card>

                        {/* Conversion Rate */}
                        <Card className="p-6 border-slate-50 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-50/30 hover:shadow-lg transition-shadow border-emerald-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Conversion Rate</p>
                                    <h3 className="text-3xl font-black text-emerald-600 tracking-tighter">{data.conversionRate}</h3>
                                    <p className="text-[9px] text-emerald-600 font-bold mt-2">↑ 0.5% dari periode lalu</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <span className="text-lg">📈</span>
                                </div>
                            </div>
                        </Card>

                        {/* Total Revenue */}
                        <Card className="p-6 border-slate-50 shadow-sm bg-gradient-to-br from-amber-50 to-amber-50/30 hover:shadow-lg transition-shadow border-amber-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Revenue</p>
                                    <h3 className="text-3xl font-black text-amber-600 tracking-tighter">Rp {((data.totalRevenue || 0) / 1000000).toFixed(1)}M</h3>
                                    <p className="text-[9px] text-emerald-600 font-bold mt-2">↑ 24% dari periode lalu</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <span className="text-lg">💰</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* SECONDARY METRICS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {/* Total Orders */}
                        <Card className="p-6 border-slate-50 shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Total Orders</p>
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{data.totalOrders}</h3>
                                    <p className="text-[9px] text-slate-500 mt-1">transaksi berhasil</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-emerald-600">+18%</p>
                                </div>
                            </div>
                        </Card>

                        {/* Average Order Value */}
                        <Card className="p-6 border-slate-50 shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Avg Order Value</p>
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Rp {(data.avgOrderValue / 1000).toFixed(0)}K</h3>
                                    <p className="text-[9px] text-slate-500 mt-1">per transaksi</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-emerald-600">+5%</p>
                                </div>
                            </div>
                        </Card>

                        {/* CTR */}
                        <Card className="p-6 border-slate-50 shadow-sm">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Click-Through Rate</p>
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{data.avgCTR}</h3>
                                    <p className="text-[9px] text-slate-500 mt-1">engagement rate</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-emerald-600">+3%</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* PERFORMANCE BREAKDOWN */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 transition-opacity duration-300">
                        
                        {/* Device Segmentation Chart */}
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
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f6af3b" strokeDasharray={`${data.devices[0]?.percentage || 0}, 100`} strokeWidth="4" className="transition-all duration-1000"></path>
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#465f89" strokeDasharray={`${data.devices[1]?.percentage || 0}, 100`} strokeDashoffset={`-${data.devices[0]?.percentage || 0}`} strokeWidth="4" className="transition-all duration-1000"></path>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{data.devices[0]?.percentage || 0}%</span>
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
                </>
            )}
        </div>
    );
};
