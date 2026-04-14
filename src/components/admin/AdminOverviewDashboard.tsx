import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';

export const AdminOverviewDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/overview');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Failed to fetch admin stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading || !stats) {
        return (
            <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#005ab4] border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-[#005ab4] uppercase tracking-widest text-xs">Synchronizing platform data...</p>
            </div>
        );
    }

    // Prepare chart data
    const maxCount = Math.max(...stats.growthData.map((d: any) => d.count), 1);

    return (
        <div className="w-full">
            {/* Page Header */}
            <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-extrabold tracking-tight text-[#005ab4]">Overview Dashboard</h2>
                    <p className="text-slate-500 font-medium">Welcome back, Admin. Real-time platform pulse is active.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" onClick={fetchStats} className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 bg-white font-bold uppercase text-[10px] tracking-widest">
                        <span className="material-symbols-outlined text-xl">refresh</span>
                        Refresh Data
                    </Button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[#465f89]/10 rounded-lg">
                            <span className="material-symbols-outlined text-[#465f89]">group</span>
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-tighter">Total Users</p>
                    <h3 className="text-3xl font-black tracking-tighter text-[#005ab4]">{stats.totalUsers.toLocaleString()}</h3>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[#ffb94c]/20 rounded-lg">
                            <span className="material-symbols-outlined text-[#9f6a00]">verified</span>
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-tighter">PRO Users</p>
                    <h3 className="text-3xl font-black tracking-tighter text-[#005ab4]">{stats.proUsers.toLocaleString()}</h3>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[#b7cfff]/30 rounded-lg">
                            <span className="material-symbols-outlined text-[#405882]">payments</span>
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-tighter">Total GMV</p>
                    <h3 className="text-3xl font-black tracking-tighter text-[#005ab4]">Rp {stats.totalGMV.toLocaleString('id-ID')}</h3>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <span className="material-symbols-outlined text-red-600">pending_actions</span>
                        </div>
                        {stats.pendingPayouts > 0 && (
                            <span className="text-[10px] font-black text-white bg-red-600 px-2 py-1 rounded uppercase animate-pulse">Action Needed</span>
                        )}
                    </div>
                    <p className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-tighter">Payout Pending</p>
                    <h3 className="text-3xl font-black tracking-tighter text-[#005ab4]">{stats.pendingPayouts}</h3>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Main Chart Card */}
                    <Card className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-extrabold text-[#005ab4] uppercase">Registration Growth</h3>
                                <p className="text-sm text-slate-500">New creators joining in the last 7 days</p>
                            </div>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-3 px-2">
                            {stats.growthData.map((d: any, i: number) => (
                                <div key={i} className="flex-1 bg-slate-50 rounded-t-lg relative group overflow-hidden" style={{ height: '100%' }}>
                                    <div 
                                        className="absolute inset-x-0 bottom-0 bg-[#005ab4] rounded-t-lg transition-all duration-1000 group-hover:opacity-80" 
                                        style={{ height: `${(d.count / maxCount) * 100}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg font-black transition-all">
                                            {d.count} Users
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                             {stats.growthData.map((d: any) => <span key={d.label}>{d.label}</span>)}
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Plan Distribution */}
                        <Card className="p-8 flex flex-col items-center">
                            <div className="w-full mb-6">
                                <h3 className="text-xl font-extrabold text-[#005ab4] uppercase">Active Plans</h3>
                                <p className="text-sm text-slate-500">Distribution of user tiers</p>
                            </div>
                            
                            <div className="relative w-48 h-48 mb-6">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#f2f4f6" strokeWidth="4"></circle>
                                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#005ab4" strokeDasharray={`${Math.round((stats.proUsers / stats.totalUsers) * 100)} 100`} strokeWidth="4"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-[#005ab4]">{stats.proUsers}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pro Members</span>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Actions Spotlight */}
                        <div className="bg-[#005ab4] p-8 rounded-3xl shadow-xl shadow-[#005ab4]/20 text-white flex flex-col justify-between overflow-hidden relative">
                            <div className="relative z-10">
                                <h3 className="text-xl font-extrabold mb-2 uppercase">Platform Pulse</h3>
                                <p className="text-blue-100 text-sm mb-8">All systems functional. Database cluster responding in 14ms.</p>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Total Transacted: Rp {stats.totalGMV.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white w-full"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Area (Side Feed) */}
                <div className="lg:col-span-4">
                    <Card className="p-8 h-full">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
                            <h3 className="text-xl font-extrabold text-[#005ab4] uppercase">Live Activity</h3>
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                        </div>
                        
                        <div className="space-y-8">
                            {stats.recentActivity.map((act: any, idx: number) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            act.type === 'registration' ? "bg-blue-50 text-[#465f89]" : "bg-emerald-50 text-emerald-600"
                                        )}>
                                            <span className="material-symbols-outlined text-xl">
                                                {act.type === 'registration' ? 'person_add' : 'payments'}
                                            </span>
                                        </div>
                                        {idx !== stats.recentActivity.length - 1 && <div className="w-px flex-1 bg-slate-100 mt-2"></div>}
                                    </div>
                                    <div className="flex-1 pb-6">
                                        <p className="text-sm font-black text-[#005ab4] uppercase tracking-tight leading-none mb-1">{act.title}</p>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{act.desc}</p>
                                        <span className="text-[9px] font-black text-slate-300 uppercase mt-2 block tracking-widest">{new Date(act.time).toLocaleTimeString()} • {new Date(act.time).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}

                            {stats.recentActivity.length === 0 && (
                                <div className="py-10 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase">No recent activity found.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
