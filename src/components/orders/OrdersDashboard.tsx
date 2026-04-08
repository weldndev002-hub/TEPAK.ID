import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FilterTabs } from '../ui/FilterTabs';
import { Pagination } from '../ui/Pagination';
import { 
    ShoppingCartIcon, 
    CheckCircleIcon, 
    ClockIcon, 
    BanknotesIcon, 
    ArrowTrendingUpIcon, 
    CalendarIcon, 
    FunnelIcon, 
    BuildingLibraryIcon, 
    CreditCardIcon, 
    WalletIcon, 
    PlusIcon 
} from '@heroicons/react/24/outline';

export const OrdersDashboard = () => {
    const filterTabsData = [
        { label: 'All', value: 'all' },
        { label: 'Paid', value: 'paid' },
        { label: 'Pending', value: 'pending' },
        { label: 'Expired', value: 'expired' },
    ];

    return (
        <div className="flex-1 p-10 min-h-screen bg-[#f8f9fb] font-['Plus_Jakarta_Sans',sans-serif]">
            {/* Breadcrumb / Section Header */}
            <div className="mb-12">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 uppercase">Order Management</h3>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none">Manage all your business transactions in a single editorial view.</p>
            </div>

            {/* Stats Grid (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <Card className="p-8 border-none rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:scale-[1.02] transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-primary/5 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                            <ShoppingCartIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">+12%</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2 leading-none">Total Orders</p>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">128</h4>
                    </div>
                </Card>
                
                <Card className="p-8 border-none rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:scale-[1.02] transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                            <CheckCircleIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">92%</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2 leading-none">Successful</p>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">112</h4>
                    </div>
                </Card>
                
                <Card className="p-8 border-none rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:scale-[1.02] transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                            <ClockIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full">LOW</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2 leading-none">Pending</p>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">10</h4>
                    </div>
                </Card>
                
                <Card className="p-8 border-none rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:scale-[1.02] transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <BanknotesIcon className="w-6 h-6" />
                        </div>
                        <ArrowTrendingUpIcon className="w-6 h-6 text-primary/20" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2 leading-none">Total Revenue</p>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">$24.5k</h4>
                    </div>
                </Card>
            </div>

            {/* Filter & Table Section */}
            <Card className="overflow-hidden border-none rounded-[3rem] shadow-sm bg-white">
                {/* Tabs & Filter Bar */}
                <div className="px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border-b border-slate-50 gap-6">
                    <div className="-ml-4">
                         <FilterTabs tabs={filterTabsData} activeTab="all" />
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="flex items-center gap-2 bg-white text-[10px] font-black uppercase tracking-widest border-slate-100 rounded-xl px-6 py-4">
                            <CalendarIcon className="w-4 h-4" />
                            Last 30 Days
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2 bg-white text-[10px] font-black uppercase tracking-widest border-slate-100 rounded-xl px-6 py-4">
                            <FunnelIcon className="w-4 h-4" />
                            More Filters
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="px-10 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">Order ID</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">Date</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">Product</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">Buyer</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">Method</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px] text-right">Total</TableHead>
                                <TableHead className="px-10 font-black text-slate-400 uppercase tracking-[0.2em] text-[9px] text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Row 1 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50/50 border-slate-50 transition-all border-b">
                                <TableCell className="px-10 py-8 font-black text-primary text-xs uppercase tracking-tight">#TPK-88210</TableCell>
                                <TableCell className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Oct 12, 2023, 14:20</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <img alt="Product Thumb" className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVu3w-lMjxZqZAoxZnpDbEZ-dOlMVvPptZKZait0hPH7T-ctQNBzWOhCupxGRkKW8NpuIxf9XaBENqEHCOyaV9vZZ8dOW5jgEgATTh9eh576eRmS11Q1bmJekjSWWk44HVmS20U4KN6QOJdc2-t6b-umeqk2JH0aLoV1Pb3SfTosVZLQY-3p84_Mg_UnrxM9mPEtRM8_xtwFgn0NC6dfOT0A5EscBrAOzFfL-jh38l90p2wXDCb73gXfOZCSxBP1qJ8RSBEVc0KxNC"/>
                                        <div>
                                            <p className="font-black text-slate-900 leading-tight text-xs uppercase tracking-tight">Elite Digital Watch</p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Electronics</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/5 text-primary rounded-xl flex items-center justify-center text-[9px] font-black shadow-inner">AS</div>
                                        <span className="font-black text-slate-600 text-[10px] uppercase tracking-tight">Aaron Smith</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <BuildingLibraryIcon className="w-4 h-4" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">QRIS</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-black text-slate-900 text-right text-xs">$45.00</TableCell>
                                <TableCell className="px-10">
                                    <div className="flex justify-center">
                                        <Badge variant="success" className="px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border-none bg-emerald-50 text-emerald-600 shadow-sm">PAID</Badge>
                                    </div>
                                </TableCell>
                            </TableRow>

                            {/* Row 2 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50/50 border-slate-50 transition-all border-b">
                                <TableCell className="px-10 py-8 font-black text-primary text-xs uppercase tracking-tight">#TPK-88211</TableCell>
                                <TableCell className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Oct 12, 2023, 15:45</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <img alt="Product Thumb" className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCK5hhBwfPUX9kCydSsR-hZjs8sv8oq1ZK7zKKP7Ys7EBXzdrlhoQj-tSsQGrA7gWSw--SmbTnGy027FgHOD76ADe1ST_uvvt3SLVHFH1o8uMZBCcJx0f_4-K8Z670x1Mvx93pXlA3v9A_hQkPYDi5kPaTidgc7tRJhreyyC4wTj1dnrvPi-7VpcOEkMb09sMMxDjFbBRji_VACQ2xpFGApjRNvH1gVtZL710JAB469MuIUsdo74FoYtFpI5aYavF3xftZc3XGtUR8L"/>
                                        <div>
                                            <p className="font-black text-slate-900 leading-tight text-xs uppercase tracking-tight">Pro Runner X1</p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Footwear</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-[9px] font-black shadow-inner">BR</div>
                                        <span className="font-black text-slate-600 text-[10px] uppercase tracking-tight">Brian Richards</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <CreditCardIcon className="w-4 h-4" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">CC</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-black text-slate-900 text-right text-xs">$125.00</TableCell>
                                <TableCell className="px-10">
                                    <div className="flex justify-center">
                                        <Badge variant="pending" className="px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border-none bg-amber-50 text-amber-600 shadow-sm">PENDING</Badge>
                                    </div>
                                </TableCell>
                            </TableRow>

                            {/* Row 3 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50/50 border-slate-50 transition-all border-b">
                                <TableCell className="px-10 py-8 font-black text-primary text-xs uppercase tracking-tight">#TPK-88212</TableCell>
                                <TableCell className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Oct 12, 2023, 16:10</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <img alt="Product Thumb" className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_0D4SPHKSujipivkQmFcSkRSOIYFxHx9Ru3tBuRVbJ5WAvkedk2pDyZ98T-gJgr2rRdrLYkKEPN39ts68FwJe54tqV62c0CijFuOzbH5HYPoAI5SlE2Ia8IRkAe_X7oHpLxjFOK-gtmpQuxaiYOFC_eLCVGhxmobeic6tTR3z4Bgq7Q8iUX4ohs-ELQ0cxp5haIj9L1cYvQofc1Tl2cvNGTiw1qHA0BEvC1w8EEbYLOmHonbjGlOCsOdAtSJySLLWu_bfa4lI82Mt"/>
                                        <div>
                                            <p className="font-black text-slate-900 leading-tight text-xs uppercase tracking-tight">Studio Sound Elite</p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Audio</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-[9px] font-black shadow-inner">LW</div>
                                        <span className="font-black text-slate-600 text-[10px] uppercase tracking-tight">Laura Williams</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <WalletIcon className="w-4 h-4" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">PayPal</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-black text-slate-900 text-right text-xs">$89.00</TableCell>
                                <TableCell className="px-10">
                                    <div className="flex justify-center">
                                        <Badge variant="success" className="px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border-none bg-emerald-50 text-emerald-600 shadow-sm">PAID</Badge>
                                    </div>
                                </TableCell>
                            </TableRow>

                            {/* Row 4 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50/50 border-transparent transition-all">
                                <TableCell className="px-10 py-8 font-black text-primary text-xs uppercase tracking-tight">#TPK-88213</TableCell>
                                <TableCell className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Oct 13, 2023, 09:12</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <img alt="Product Thumb" className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhJf88m19F6sJJ8FfhGFWlPbIaQsGf5g1HbkqrWQ_WeKsSksvneynSKIO3QVa4BRouS_ysuoMrV75QHrNLA2XTB5bVQNaCCA5-5tZ65AeBNb0RGZWQx9hPCYowTsG3DmK07lJz3dGPbKRsEjIb-UFNMxKmydHY3mh_u_URwPBavYbTem5ekltVnpsQq8p9vG_iaTkPH60qjurb4Lc_V1dKak-W7fh1WbBBN9-3qonVWUq3-SBpP9n16VjJ61Ct-KbjRhI1tDFUJ2-c"/>
                                        <div>
                                            <p className="font-black text-slate-900 leading-tight text-xs uppercase tracking-tight">Retro Cam Mark II</p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Photography</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-[9px] font-black shadow-inner">DK</div>
                                        <span className="font-black text-slate-600 text-[10px] uppercase tracking-tight">Daniel King</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <BanknotesIcon className="w-4 h-4" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Bank Transfer</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-black text-slate-900 text-right text-xs">$210.00</TableCell>
                                <TableCell className="px-10">
                                    <div className="flex justify-center">
                                        <Badge variant="failed" className="px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border-none bg-rose-50 text-rose-600 shadow-sm uppercase font-extrabold tracking-widest">EXPIRED</Badge>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                
                {/* Pagination */}
                <Pagination 
                    currentPage={1} 
                    totalPages={13} 
                    totalItems={128} 
                    itemsPerPage={10} 
                    className="rounded-b-none border-t border-slate-50 py-8 px-10"
                />
            </Card>

            {/* Floating Action Button (FAB) */}
            <button className="fixed bottom-12 right-12 w-16 h-16 bg-primary text-white rounded-3xl shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group z-50">
                <PlusIcon className="w-8 h-8 stroke-[3]" />
                <span className="absolute right-full mr-6 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none shadow-2xl">Create Manual Order</span>
            </button>
        </div>
    );
};

