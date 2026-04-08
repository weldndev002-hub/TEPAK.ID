import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';

export const UserManagementDashboard = () => {
    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#005ab4] tracking-tight">Manage Users</h2>
                    <p className="text-slate-500 mt-1">Management of user data and active license status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="flex items-center gap-2 border-slate-200 bg-white">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        <span>Export CSV</span>
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-50 p-4 rounded-xl mb-6 flex flex-wrap items-center gap-4 border border-slate-100">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan:</span>
                    <select className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none">
                        <option>All Plans</option>
                        <option>Standard</option>
                        <option>PRO</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                    <select className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Banned</option>
                    </select>
                </div>
                <button className="ml-auto text-sm text-[#465f89] font-bold hover:underline">Reset Filter</button>
            </div>

            {/* User Table Card */}
            <Card className="rounded-2xl overflow-hidden shadow-sm border-slate-100">
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">User</TableHead>
                                <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Plan</TableHead>
                                <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</TableHead>
                                <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Joined Date</TableHead>
                                <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Total Transacted</TableHead>
                                <TableHead className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Row 1 */}
                            <TableRow className="hover:bg-slate-50/30 transition-colors">
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200">
                                            <img className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0RhVyi2iF5klyOMuW_RccFsb4UWRLcJTl_I_ofxk7NkkthrdCZUWmno9lRwChCD7a2tXeOHuwYz0-1YxRNHllesN5LsNs8_U921gFUUveU0gK7CsbjEmseVui0XjMK8jMPftwQncQkujiE8nXsE_-ktgrd9uiiJKwJ1ELM4iToQ6yUR200hN0Q90bq5zLtVhFg25vLCg-WmIbZlWEpLgOGlvgrUiyg-6Yl7XwxOtoF-jyQWK3e1mx5VMO1tOyAIGmk6LcJkvcPcxO" alt="Aditya Pratama" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#005ab4]">Aditya Pratama</div>
                                            <div className="text-xs text-slate-500">aditya.p@email.com</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <Badge variant="primary" className="bg-[#b7cfff] text-[#405882] border-none font-bold text-[10px]">PRO</Badge>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Active
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-sm text-slate-500">Oct 12, 2023</TableCell>
                                <TableCell className="px-6 py-4 text-sm font-bold text-[#005ab4] text-right">$165.00</TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" className="px-3 py-1.5 text-xs font-bold text-[#465f89] border border-[#465f89] rounded-lg hover:bg-[#465f89] hover:text-white transition-all">Login As</Button>
                                        <Button variant="ghost" className="px-3 py-1.5 text-xs font-bold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-600 hover:text-white transition-all">Ban</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                            {/* Row 2 */}
                            <TableRow className="hover:bg-slate-50/30 transition-colors">
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200">
                                            <img className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw77mcSdQDKafRkkApgI1JELBWQTgarwyuyNk5WNNPnoJzqAF8ha7TmtHcUIN277UEsiIDsTkXVh0Xpn53_JF7XToO13VVoMO9-AQtj3N0DROz5YxJaEtLnIFygI6S6N4XknR-x-RyP-W0rFCF7tSQY1_zTumKPx_GvFEE0m3V6EnfGCwoP3l6Igpo11LN9liyYE2O9NCPOv7LLvE55ZnRPCNuhlD2tqwBf0wVvjsgq_gbj8us9Q8yQTdmc1NxmNsLAQ65hKL132A9" alt="Siti Rahma" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#005ab4]">Siti Rahma</div>
                                            <div className="text-xs text-slate-500">siti.rahma@email.com</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <Badge variant="ghost" className="bg-slate-100 text-slate-500 border-none font-bold text-[10px]">STANDARD</Badge>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Active
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-sm text-slate-500">Nov 25, 2023</TableCell>
                                <TableCell className="px-6 py-4 text-sm font-bold text-[#005ab4] text-right">$28.00</TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" className="px-3 py-1.5 text-xs font-bold text-[#465f89] border border-[#465f89] rounded-lg hover:bg-[#465f89] hover:text-white transition-all">Login As</Button>
                                        <Button variant="ghost" className="px-3 py-1.5 text-xs font-bold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-600 hover:text-white transition-all">Ban</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs text-slate-500">Showing <span className="font-bold text-[#005ab4]">1 - 2</span> of <span className="font-bold text-[#005ab4]">1,248</span> users</span>
                    <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-[#465f89] text-white text-xs font-bold">1</button>
                        <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-700 text-xs font-bold">2</button>
                        <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-700 text-xs font-bold">3</button>
                        <span className="px-1 text-slate-400">...</span>
                        <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-700 text-xs font-bold">250</button>
                        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>
            </Card>

            {/* Asymmetric Dashboard Section: Quick Stats */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-[#005ab4] text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-xl shadow-[#005ab4]/10">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold tracking-tight mb-1">User Growth</h3>
                        <p className="text-blue-200 text-sm">Averaging 24 new creators per day this month.</p>
                    </div>
                    <div className="relative z-10 flex items-end gap-2 mt-4">
                        <span className="text-5xl font-extrabold tracking-tighter text-[#ffddb2]">+12.4%</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">Vs Last Month</span>
                    </div>
                    {/* Abstract Design Decor */}
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute right-8 top-8 opacity-10">
                        <span className="material-symbols-outlined !text-[120px]">trending_up</span>
                    </div>
                </div>
                <div className="lg:col-span-4 bg-white p-8 rounded-3xl flex flex-col justify-center border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Plans Split</span>
                        <span className="material-symbols-outlined text-[#465f89]">pie_chart</span>
                    </div>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700">PRO Account</span>
                                <span className="text-sm font-black text-[#005ab4]">65%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#465f89] h-full w-[65%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700">Standard Plan</span>
                                <span className="text-sm font-black text-slate-500">35%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-slate-300 h-full w-[35%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
