import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FilterTabs } from '../ui/FilterTabs';
import { Pagination } from '../ui/Pagination';

export const OrdersDashboard = () => {
    const filterTabsData = [
        { label: 'All', value: 'all' },
        { label: 'Paid', value: 'paid' },
        { label: 'Pending', value: 'pending' },
        { label: 'Expired', value: 'expired' },
    ];

    return (
        <div className="flex-1 p-8 min-h-screen bg-[#f8f9fb] font-sans">
            {/* Breadcrumb / Section Header */}
            <div className="mb-10">
                <h3 className="text-3xl font-extrabold text-[#005ab4] tracking-tighter mb-2">Order Management</h3>
                <p className="text-slate-500 text-sm font-medium">Manage all your business transactions in a single editorial view.</p>
            </div>

            {/* Stats Grid (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <Card className="p-6 border-b-4 border-[#465f89]/20 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <span className="p-2 bg-[#465f89]/10 rounded-lg">
                            <span className="material-symbols-outlined text-[#465f89]">shopping_cart</span>
                        </span>
                        <span className="text-xs font-bold text-[#465f89] bg-[#465f89]/10 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Orders</p>
                        <h4 className="text-2xl font-extrabold text-[#005ab4]">128</h4>
                    </div>
                </Card>
                
                <Card className="p-6 border-b-4 border-green-500/20 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <span className="p-2 bg-green-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                        </span>
                        <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-full">92%</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Successful</p>
                        <h4 className="text-2xl font-extrabold text-[#005ab4]">112</h4>
                    </div>
                </Card>
                
                <Card className="p-6 border-b-4 border-amber-500/20 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <span className="p-2 bg-amber-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-amber-600">schedule</span>
                        </span>
                        <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded-full">Low</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Pending</p>
                        <h4 className="text-2xl font-extrabold text-[#005ab4]">10</h4>
                    </div>
                </Card>
                
                <Card className="p-6 border-b-4 border-[#005ab4]/20 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <span className="p-2 bg-[#005ab4]/5 rounded-lg">
                            <span className="material-symbols-outlined text-[#005ab4]">payments</span>
                        </span>
                        <span className="material-symbols-outlined text-[#005ab4]/30">trending_up</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                        <h4 className="text-2xl font-extrabold text-[#005ab4]">$24.5k</h4>
                    </div>
                </Card>
            </div>

            {/* Filter & Table Section */}
            <Card className="overflow-hidden">
                {/* Tabs & Filter Bar */}
                <div className="px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 border-b border-slate-100 gap-4">
                    <div className="-ml-6 -mb-2">
                         <FilterTabs tabs={filterTabsData} activeTab="all" />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex items-center gap-2 bg-white text-sm">
                            <span className="material-symbols-outlined text-lg">calendar_today</span>
                            Last 30 Days
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2 bg-white text-sm">
                            <span className="material-symbols-outlined text-lg">filter_list</span>
                            More Filters
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-8 font-bold text-slate-500 uppercase tracking-widest">Order ID</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-widest">Date</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-widest">Product</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-widest">Buyer</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-widest">Method</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-right">Total</TableHead>
                                <TableHead className="px-8 font-bold text-slate-500 uppercase tracking-widest text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Row 1 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50 transition-colors">
                                <TableCell className="px-8 font-bold text-[#005ab4]">#TPK-88210</TableCell>
                                <TableCell className="text-slate-500">Oct 12, 2023, 14:20</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img alt="Product Thumb" className="w-10 h-10 rounded-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVu3w-lMjxZqZAoxZnpDbEZ-dOlMVvPptZKZait0hPH7T-ctQNBzWOhCupxGRkKW8NpuIxf9XaBENqEHCOyaV9vZZ8dOW5jgEgATTh9eh576eRmS11Q1bmJekjSWWk44HVmS20U4KN6QOJdc2-t6b-umeqk2JH0aLoV1Pb3SfTosVZLQY-3p84_Mg_UnrxM9mPEtRM8_xtwFgn0NC6dfOT0A5EscBrAOzFfL-jh38l90p2wXDCb73gXfOZCSxBP1qJ8RSBEVc0KxNC"/>
                                        <div>
                                            <p className="font-bold text-[#005ab4] leading-tight">Elite Digital Watch</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Electronics</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-[#465f89]/10 text-[#465f89] rounded-full flex items-center justify-center text-[10px] font-bold">AS</div>
                                        <span className="font-medium text-[#005ab4]">Aaron Smith</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">account_balance</span> QRIS
                                    </span>
                                </TableCell>
                                <TableCell className="font-bold text-[#005ab4] text-right">$45.00</TableCell>
                                <TableCell className="px-8">
                                    <div className="flex justify-center">
                                        <Badge variant="success">PAID</Badge>
                                    </div>
                                </TableCell>
                            </TableRow>

                            {/* Row 2 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50 transition-colors">
                                <TableCell className="px-8 font-bold text-[#005ab4]">#TPK-88211</TableCell>
                                <TableCell className="text-slate-500">Oct 12, 2023, 15:45</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img alt="Product Thumb" className="w-10 h-10 rounded-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCK5hhBwfPUX9kCydSsR-hZjs8sv8oq1ZK7zKKP7Ys7EBXzdrlhoQj-tSsQGrA7gWSw--SmbTnGy027FgHOD76ADe1ST_uvvt3SLVHFH1o8uMZBCcJx0f_4-K8Z670x1Mvx93pXlA3v9A_hQkPYDi5kPaTidgc7tRJhreyyC4wTj1dnrvPi-7VpcOEkMb09sMMxDjFbBRji_VACQ2xpFGApjRNvH1gVtZL710JAB469MuIUsdo74FoYtFpI5aYavF3xftZc3XGtUR8L"/>
                                        <div>
                                            <p className="font-bold text-[#005ab4] leading-tight">Pro Runner X1</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Footwear</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center text-[10px] font-bold">BR</div>
                                        <span className="font-medium text-[#005ab4]">Brian Richards</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">credit_card</span> CC
                                    </span>
                                </TableCell>
                                <TableCell className="font-bold text-[#005ab4] text-right">$125.00</TableCell>
                                <TableCell className="px-8">
                                    <div className="flex justify-center">
                                        <Badge variant="pending">PENDING</Badge>
                                    </div>
                                </TableCell>
                            </TableRow>

                            {/* Row 3 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50 transition-colors">
                                <TableCell className="px-8 font-bold text-[#005ab4]">#TPK-88212</TableCell>
                                <TableCell className="text-slate-500">Oct 12, 2023, 16:10</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img alt="Product Thumb" className="w-10 h-10 rounded-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_0D4SPHKSujipivkQmFcSkRSOIYFxHx9Ru3tBuRVbJ5WAvkedk2pDyZ98T-gJgr2rRdrLYkKEPN39ts68FwJe54tqV62c0CijFuOzbH5HYPoAI5SlE2Ia8IRkAe_X7oHpLxjFOK-gtmpQuxaiYOFC_eLCVGhxmobeic6tTR3z4Bgq7Q8iUX4ohs-ELQ0cxp5haIj9L1cYvQofc1Tl2cvNGTiw1qHA0BEvC1w8EEbYLOmHonbjGlOCsOdAtSJySLLWu_bfa4lI82Mt"/>
                                        <div>
                                            <p className="font-bold text-[#005ab4] leading-tight">Studio Sound Elite</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Audio</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-purple-500/10 text-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold">LW</div>
                                        <span className="font-medium text-[#005ab4]">Laura Williams</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">account_balance_wallet</span> PayPal
                                    </span>
                                </TableCell>
                                <TableCell className="font-bold text-[#005ab4] text-right">$89.00</TableCell>
                                <TableCell className="px-8">
                                    <div className="flex justify-center">
                                        <Badge variant="success">PAID</Badge>
                                    </div>
                                </TableCell>
                            </TableRow>

                            {/* Row 4 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50 transition-colors">
                                <TableCell className="px-8 font-bold text-[#005ab4]">#TPK-88213</TableCell>
                                <TableCell className="text-slate-500">Oct 13, 2023, 09:12</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img alt="Product Thumb" className="w-10 h-10 rounded-lg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhJf88m19F6sJJ8FfhGFWlPbIaQsGf5g1HbkqrWQ_WeKsSksvneynSKIO3QVa4BRouS_ysuoMrV75QHrNLA2XTB5bVQNaCCA5-5tZ65AeBNb0RGZWQx9hPCYowTsG3DmK07lJz3dGPbKRsEjIb-UFNMxKmydHY3mh_u_URwPBavYbTem5ekltVnpsQq8p9vG_iaTkPH60qjurb4Lc_V1dKak-W7fh1WbBBN9-3qonVWUq3-SBpP9n16VjJ61Ct-KbjRhI1tDFUJ2-c"/>
                                        <div>
                                            <p className="font-bold text-[#005ab4] leading-tight">Retro Cam Mark II</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Photography</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center text-[10px] font-bold">DK</div>
                                        <span className="font-medium text-[#005ab4]">Daniel King</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">payments</span> Bank Transfer
                                    </span>
                                </TableCell>
                                <TableCell className="font-bold text-[#005ab4] text-right">$210.00</TableCell>
                                <TableCell className="px-8">
                                    <div className="flex justify-center">
                                        <Badge variant="failed" className="bg-red-100 text-red-700 hover:bg-red-100 uppercase font-extrabold tracking-widest">EXPIRED</Badge>
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
                    className="rounded-b-none border-t border-slate-100"
                />
            </Card>

            {/* Floating Action Button (FAB) */}
            <button className="fixed bottom-10 right-10 w-14 h-14 bg-[#005ab4] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group z-50 shadow-blue-500/30">
                <span className="material-symbols-outlined text-2xl">add</span>
                <span className="absolute right-full mr-4 px-3 py-1 bg-[#162138] text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">Create Manual Order</span>
            </button>
        </div>
    );
};
