import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';

export const AdminOverviewDashboard = () => {
    return (
        <div className="w-full">
            {/* Page Header */}
            <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-extrabold tracking-tight text-[#005ab4]">Overview Dashboard</h2>
                    <p className="text-slate-500 font-medium">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 bg-white">
                        <span className="material-symbols-outlined text-xl">download</span>
                        Export Report
                    </Button>
                    <Button variant="primary" className="bg-gradient-to-br from-[#465f89] to-[#b7cfff] text-white shadow-xl shadow-[#465f89]/20 hover:scale-[1.02] active:opacity-90 transition-all font-bold">
                        Generate Analytics
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
                        <span className="text-xs font-bold text-[#465f89] bg-[#465f89]/10 px-2 py-1 rounded">+12%</span>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold mb-1">Total Users</p>
                    <h3 className="text-3xl font-black tracking-tighter text-[#005ab4]">24,592</h3>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[#ffb94c]/20 rounded-lg">
                            <span className="material-symbols-outlined text-[#9f6a00]">verified</span>
                        </div>
                        <span className="text-xs font-bold text-[#9f6a00] bg-[#ffddb2]/30 px-2 py-1 rounded">+5.4%</span>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold mb-1">PRO Users</p>
                    <h3 className="text-3xl font-black tracking-tighter text-[#005ab4]">1,208</h3>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[#b7cfff]/30 rounded-lg">
                            <span className="material-symbols-outlined text-[#405882]">payments</span>
                        </div>
                        <span className="text-xs font-bold text-[#405882] bg-[#b7cfff]/30 px-2 py-1 rounded">+21%</span>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold mb-1">Total GMV</p>
                    <h3 className="text-3xl font-black tracking-tighter text-[#005ab4]">Rp 21 Miliar</h3>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <span className="material-symbols-outlined text-red-600">pending_actions</span>
                        </div>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Action Needed</span>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold mb-1">Payout Pending</p>
                    <h3 className="text-3xl font-black tracking-tighter text-[#005ab4]">142</h3>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Main Chart Card */}
                    <Card className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-extrabold text-[#005ab4]">Registration Growth</h3>
                                <p className="text-sm text-slate-500">Daily user signups across all platforms</p>
                            </div>
                            <select className="bg-slate-50 border-none rounded-lg text-sm font-bold text-slate-700 px-4 py-2 focus:ring-2 focus:ring-[#465f89]/20 outline-none cursor-pointer">
                                <option>Last 30 Days</option>
                                <option>Last 6 Months</option>
                            </select>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-2 px-2">
                            <div className="flex-1 bg-[#465f89]/5 rounded-t-lg relative group h-[40%]">
                                <div className="absolute inset-x-0 bottom-0 bg-[#465f89]/20 h-full rounded-t-lg group-hover:bg-[#465f89]/40 transition-all"></div>
                            </div>
                            <div className="flex-1 bg-[#465f89]/5 rounded-t-lg relative group h-[60%]">
                                <div className="absolute inset-x-0 bottom-0 bg-[#465f89]/20 h-full rounded-t-lg group-hover:bg-[#465f89]/40 transition-all"></div>
                            </div>
                            <div className="flex-1 bg-[#465f89]/5 rounded-t-lg relative group h-[55%]">
                                <div className="absolute inset-x-0 bottom-0 bg-[#465f89]/20 h-full rounded-t-lg group-hover:bg-[#465f89]/40 transition-all"></div>
                            </div>
                            <div className="flex-1 bg-[#465f89]/5 rounded-t-lg relative group h-[85%]">
                                <div className="absolute inset-x-0 bottom-0 bg-[#465f89]/20 h-full rounded-t-lg group-hover:bg-[#465f89]/40 transition-all"></div>
                            </div>
                            <div className="flex-1 bg-[#465f89]/5 rounded-t-lg relative group h-[70%]">
                                <div className="absolute inset-x-0 bottom-0 bg-[#465f89]/20 h-full rounded-t-lg group-hover:bg-[#465f89]/40 transition-all"></div>
                            </div>
                            <div className="flex-1 bg-[#465f89]/5 rounded-t-lg relative group h-[95%]">
                                <div className="absolute inset-x-0 bottom-0 bg-[#465f89] h-full rounded-t-lg group-hover:opacity-90 transition-all"></div>
                            </div>
                            <div className="flex-1 bg-[#465f89]/5 rounded-t-lg relative group h-[80%]">
                                <div className="absolute inset-x-0 bottom-0 bg-[#465f89]/20 h-full rounded-t-lg group-hover:bg-[#465f89]/40 transition-all"></div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase tracking-tighter px-2">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </Card>

                    {/* Lower Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Plan Distribution */}
                        <Card className="p-8 flex flex-col items-center">
                            <div className="w-full mb-6">
                                <h3 className="text-xl font-extrabold text-[#005ab4]">Plan Distribution</h3>
                                <p className="text-sm text-slate-500">Active subscription split</p>
                            </div>
                            
                            <div className="relative w-48 h-48 mb-6">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#f2f4f6" strokeWidth="4"></circle>
                                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#005ab4" strokeDasharray="70 100" strokeWidth="4"></circle>
                                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#465f89" strokeDasharray="20 100" strokeDashoffset="-70" strokeWidth="4"></circle>
                                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#b7cfff" strokeDasharray="10 100" strokeDashoffset="-90" strokeWidth="4"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-[#005ab4]">1.2K</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Subscribers</span>
                                </div>
                            </div>

                            <div className="w-full space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-[#005ab4]"></span>
                                        <span className="font-bold text-slate-700">Pro Creator</span>
                                    </div>
                                    <span className="font-black">70%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-[#465f89]"></span>
                                        <span className="font-bold text-slate-700">Agency</span>
                                    </div>
                                    <span className="font-black">20%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-[#b7cfff]"></span>
                                        <span className="font-bold text-slate-700">Enterprise</span>
                                    </div>
                                    <span className="font-black">10%</span>
                                </div>
                            </div>
                        </Card>

                        {/* Quick Actions Spotlight */}
                        <div className="bg-[#005ab4] p-8 rounded-xl shadow-xl shadow-[#005ab4]/20 text-white flex flex-col justify-between overflow-hidden relative">
                            <div className="relative z-10">
                                <h3 className="text-xl font-extrabold mb-2">Platform Health</h3>
                                <p className="text-blue-100 text-sm mb-8">All systems are currently operational in New York (NY-1) and London (LON-2).</p>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">API Uptime: 99.9%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white w-full"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <button className="relative z-10 w-full mt-10 py-3 bg-white text-[#005ab4] font-bold rounded-lg hover:bg-slate-50 active:scale-[0.98] transition-all">
                                View System Logs
                            </button>
                            
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Area (Side Feed) */}
                <div className="lg:col-span-4">
                    <Card className="p-8 h-full">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-extrabold text-[#005ab4]">Recent Activity</h3>
                            <button className="text-[#465f89] text-xs font-bold uppercase tracking-widest hover:underline">See All</button>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="flex gap-4 group">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-[#465f89]/10 flex items-center justify-center text-[#465f89]">
                                        <span className="material-symbols-outlined text-xl">person_add</span>
                                    </div>
                                    <div className="w-px flex-1 bg-slate-100 mt-2"></div>
                                </div>
                                <div className="flex-1 pb-8">
                                    <p className="text-sm font-bold text-[#005ab4]">New creator registered</p>
                                    <p className="text-sm text-slate-500">Alex Saunders joined as a Pro Creator.</p>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 block">2 minutes ago</span>
                                </div>
                            </div>

                            <div className="flex gap-4 group">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <span className="material-symbols-outlined text-xl">check_circle</span>
                                    </div>
                                    <div className="w-px flex-1 bg-slate-100 mt-2"></div>
                                </div>
                                <div className="flex-1 pb-8">
                                    <p className="text-sm font-bold text-[#005ab4]">Payout approved</p>
                                    <p className="text-sm text-slate-500">Payout ID #TRX-9902 approved for Rp 63.000.000.</p>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 block">45 minutes ago</span>
                                </div>
                            </div>

                            <div className="flex gap-4 group">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                        <span className="material-symbols-outlined text-xl">star</span>
                                    </div>
                                    <div className="w-px flex-1 bg-slate-100 mt-2"></div>
                                </div>
                                <div className="flex-1 pb-8">
                                    <p className="text-sm font-bold text-[#005ab4]">New Plan Created</p>
                                    <p className="text-sm text-slate-500">Premium Holiday Bundle live on marketplace.</p>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 block">2 hours ago</span>
                                </div>
                            </div>

                            <div className="flex gap-4 group">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                        <span className="material-symbols-outlined text-xl">warning</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-[#005ab4]">Failed Login Attempt</p>
                                    <p className="text-sm text-slate-500">Multiple attempts from IP 182.25.1.xx.</p>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 block">5 hours ago</span>
                                </div>
                            </div>
                        </div>

                        {/* Payout Glaze Card */}
                        <div className="mt-12 bg-slate-50 border border-slate-100 p-6 rounded-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Pending Payouts</p>
                                <h4 className="text-2xl font-black text-[#005ab4] mb-4">Rp 1.237.500.000</h4>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    Next processing: Tomorrow, 09:00 AM
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-[0.03] transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-9xl">payments</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
