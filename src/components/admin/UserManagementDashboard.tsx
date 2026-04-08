import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { 
    ArrowDownTrayIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    ArrowTrendingUpIcon, 
    ChartPieIcon 
} from '@heroicons/react/24/outline';

export const UserManagementDashboard = () => {
    return (
        <div className="w-full font-['Plus_Jakarta_Sans',sans-serif]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Admin Control</span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Manage Users</h2>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="flex items-center gap-2 border-slate-100 bg-white font-black text-[11px] uppercase tracking-wider">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span>Export CSV</span>
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl mb-8 flex flex-wrap items-center gap-4 border border-slate-100">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan:</span>
                    <select className="bg-transparent border-none text-[11px] font-black uppercase focus:ring-0 cursor-pointer outline-none">
                        <option>All Plans</option>
                        <option>Standard</option>
                        <option>PRO</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status:</span>
                    <select className="bg-transparent border-none text-[11px] font-black uppercase focus:ring-0 cursor-pointer outline-none">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Banned</option>
                    </select>
                </div>
                <button className="ml-auto text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-primary transition-colors">Reset Filter</button>
            </div>

            {/* User Table Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="bg-slate-50/30">
                                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Transacted</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Row 1 */}
                            <TableRow className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-100 font-black text-slate-400 text-xs uppercase">AP</div>
                                        <div>
                                            <div className="font-black text-slate-900 uppercase tracking-tight text-sm">Aditya Pratama</div>
                                            <div className="text-[10px] text-slate-400 font-medium tracking-tight">aditya.p@email.com</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-5">
                                    <Badge variant="pro">PRO</Badge>
                                </TableCell>
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Active
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Oct 12, 2023</TableCell>
                                <TableCell className="px-8 py-5 text-sm font-black text-slate-900 text-right">$165.00</TableCell>
                                <TableCell className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" className="px-4 py-2 text-[10px] font-black text-slate-900 border border-slate-100 rounded-xl hover:bg-slate-50 uppercase tracking-widest">Login As</Button>
                                        <Button variant="ghost" className="px-4 py-2 text-[10px] font-black text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-50 uppercase tracking-widest">Ban</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                            {/* Row 2 */}
                            <TableRow className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-100 font-black text-slate-400 text-xs uppercase">SR</div>
                                        <div>
                                            <div className="font-black text-slate-900 uppercase tracking-tight text-sm">Siti Rahma</div>
                                            <div className="text-[10px] text-slate-400 font-medium tracking-tight">siti.rahma@email.com</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-5">
                                    <Badge variant="ghost">STANDARD</Badge>
                                </TableCell>
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Active
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nov 25, 2023</TableCell>
                                <TableCell className="px-8 py-5 text-sm font-black text-slate-900 text-right">$28.00</TableCell>
                                <TableCell className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" className="px-4 py-2 text-[10px] font-black text-slate-900 border border-slate-100 rounded-xl hover:bg-slate-50 uppercase tracking-widest">Login As</Button>
                                        <Button variant="ghost" className="px-4 py-2 text-[10px] font-black text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-50 uppercase tracking-widest">Ban</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                {/* Pagination */}
                <div className="px-8 py-4 flex items-center justify-between border-t border-slate-50 bg-slate-50/30">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing <span className="text-primary tracking-tight">1 - 2</span> of <span className="text-primary tracking-tight">1,248</span> users</span>
                    <div className="flex items-center gap-1">
                        <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-300">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button className="w-8 h-8 rounded-xl bg-slate-900 text-white text-[10px] font-black">1</button>
                        <button className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 text-[10px] font-black transition-all">2</button>
                        <button className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 text-[10px] font-black transition-all">3</button>
                        <span className="px-1 text-slate-200">...</span>
                        <button className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 text-[10px] font-black transition-all">250</button>
                        <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-300">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Asymmetric Dashboard Section: Quick Stats */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-slate-900 text-white p-10 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-sm">
                    <div className="relative z-10">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Performance</span>
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-2">User Growth</h3>
                        <p className="text-slate-400 text-sm font-medium">Averaging 24 new creators per day this month.</p>
                    </div>
                    <div className="relative z-10 flex items-end gap-2 mt-4">
                        <span className="text-5xl font-black tracking-tighter text-white uppercase">+12.4%</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Vs Last Month</span>
                    </div>
                    {/* Abstract Design Decor */}
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
                    <div className="absolute right-8 top-8 opacity-10">
                        <ArrowTrendingUpIcon className="w-32 h-32" />
                    </div>
                </div>
                <div className="lg:col-span-4 bg-white p-10 rounded-3xl flex flex-col justify-center border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Plans Split</span>
                        <ChartPieIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">PRO Account</span>
                                <span className="text-[11px] font-black text-primary uppercase">65%</span>
                            </div>
                            <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[65%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Standard Plan</span>
                                <span className="text-[11px] font-black text-slate-300 uppercase">35%</span>
                            </div>
                            <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-slate-200 h-full w-[35%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

