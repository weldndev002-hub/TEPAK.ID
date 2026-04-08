import React from 'react';
import { Card } from '../ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Button } from '../ui/Button';
import { FilterTabs } from '../ui/FilterTabs';
import { Pagination } from '../ui/Pagination';
import { 
    ArrowDownTrayIcon, 
    UsersIcon, 
    BanknotesIcon, 
    ChartBarIcon,
    FunnelIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

export const CustomersDashboard = () => {
    const filterTabsData = [
        { label: 'All', value: 'all' },
        { label: 'This Month', value: 'this_month' },
        { label: '30 Days', value: '30_days' },
        { label: 'Biggest', value: 'biggest' },
    ];

    return (
        <div className="flex-1 p-8 min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
            {/* Header Action Area */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Crm Insights</span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Customer Management</h2>
                </div>
                <div className="flex items-center gap-3">
                    <FilterTabs tabs={filterTabsData} activeTab="all" />
                    
                    <Button variant="primary" className="px-5 py-2.5 rounded-xl text-[11px] font-black flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all bg-primary hover:bg-primary/90 text-white uppercase tracking-wider">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Summary Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Total Pelanggan */}
                <Card className="p-8 shadow-sm flex flex-col justify-between h-44 border-slate-100 rounded-3xl">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <UsersIcon className="w-6 h-6" />
                        </div>
                        <span className="text-emerald-500 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">+12%</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Customers</p>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">128</h3>
                    </div>
                </Card>

                {/* Total LTV */}
                <Card className="p-8 shadow-sm flex flex-col justify-between h-44 border-slate-100 rounded-3xl">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <BanknotesIcon className="w-6 h-6" />
                        </div>
                        <span className="text-emerald-500 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">+8.4%</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total LTV</p>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">$24.5<span className="text-xl">k</span></h3>
                    </div>
                </Card>

                {/* Avg. Belanja */}
                <Card className="p-8 shadow-sm flex flex-col justify-between h-44 border-slate-100 rounded-3xl">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                            <ChartBarIcon className="w-6 h-6" />
                        </div>
                        <span className="text-rose-500 text-[10px] font-black bg-rose-50 px-2 py-1 rounded-lg uppercase tracking-wider">-2.1%</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Avg. Spend</p>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">$191</h3>
                    </div>
                </Card>
            </div>

            {/* Customer Table Block */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 flex justify-between items-center border-b border-slate-50">
                    <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Recent Customers List</h4>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                            <FunnelIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                            <EllipsisVerticalIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30">
                                <TableHead className="px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Customer</TableHead>
                                <TableHead className="px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Total Spend</TableHead>
                                <TableHead className="px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] text-center">Transactions</TableHead>
                                <TableHead className="px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Last Order</TableHead>
                                <TableHead className="px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Row 1 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">MS</div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors uppercase tracking-tight">Michael Smith</p>
                                            <p className="text-[10px] text-slate-400 font-medium tracking-tight">michael.smith@gmail.com</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 font-black text-slate-900">$245.00</TableCell>
                                <TableCell className="px-8 text-center">
                                    <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase">12</span>
                                </TableCell>
                                <TableCell className="px-8 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Oct 14, 2023</TableCell>
                                <TableCell className="px-8 text-right">
                                    <button className="text-[10px] font-black text-primary hover:underline transition-all uppercase tracking-widest">VIEW DETAIL</button>
                                </TableCell>
                            </TableRow>

                            {/* Row 2 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">SJ</div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors uppercase tracking-tight">Sarah Johnson</p>
                                            <p className="text-[10px] text-slate-400 font-medium tracking-tight">sarah.j@outlook.com</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 font-black text-slate-900">$112.00</TableCell>
                                <TableCell className="px-8 text-center">
                                    <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase">5</span>
                                </TableCell>
                                <TableCell className="px-8 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Oct 12, 2023</TableCell>
                                <TableCell className="px-8 text-right">
                                    <button className="text-[10px] font-black text-primary hover:underline transition-all uppercase tracking-widest">VIEW DETAIL</button>
                                </TableCell>
                            </TableRow>

                            {/* Row 3 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">AD</div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors uppercase tracking-tight">Andrew Davis</p>
                                            <p className="text-[10px] text-slate-400 font-medium tracking-tight">andrew.d@tepak.id</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 font-black text-slate-900">$89.00</TableCell>
                                <TableCell className="px-8 text-center">
                                    <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase">3</span>
                                </TableCell>
                                <TableCell className="px-8 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Oct 10, 2023</TableCell>
                                <TableCell className="px-8 text-right">
                                    <button className="text-[10px] font-black text-primary hover:underline transition-all uppercase tracking-widest">VIEW DETAIL</button>
                                </TableCell>
                            </TableRow>

                            {/* Row 4 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">LC</div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors uppercase tracking-tight">Linda Chen</p>
                                            <p className="text-[10px] text-slate-400 font-medium tracking-tight">linda.chen@gmail.com</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 font-black text-slate-900">$456.00</TableCell>
                                <TableCell className="px-8 text-center">
                                    <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase">28</span>
                                </TableCell>
                                <TableCell className="px-8 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Oct 08, 2023</TableCell>
                                <TableCell className="px-8 text-right">
                                    <button className="text-[10px] font-black text-primary hover:underline transition-all uppercase tracking-widest">VIEW DETAIL</button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                
                {/* Pagination */}
                <Pagination 
                    currentPage={1} 
                    totalPages={4} 
                    totalItems={128} 
                    itemsPerPage={32} 
                    className="bg-slate-50/30 rounded-b-3xl border-t border-slate-50"
                />
            </div>
        </div>
    );
};

