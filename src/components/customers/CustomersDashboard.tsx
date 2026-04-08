import React from 'react';
import { Card } from '../ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Button } from '../ui/Button';
import { FilterTabs } from '../ui/FilterTabs';
import { Pagination } from '../ui/Pagination';

export const CustomersDashboard = () => {
    const filterTabsData = [
        { label: 'All', value: 'all' },
        { label: 'This Month', value: 'this_month' },
        { label: '30 Days', value: '30_days' },
        { label: 'Biggest', value: 'biggest' },
    ];

    return (
        <div className="flex-1 p-8 min-h-screen bg-[#f8f9fb] font-sans">
            {/* Header Action Area */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-[#005ab4] tracking-tight mb-1">Customer Management</h2>
                    <p className="text-slate-500 font-medium">Manage and monitor your customer base growth</p>
                </div>
                <div className="flex items-center gap-3">
                    <FilterTabs tabs={filterTabsData} activeTab="all" />
                    
                    <Button variant="secondary" className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-transform bg-[#005ab4] hover:bg-[#004a94] text-white">
                        <span className="material-symbols-outlined text-sm">download</span>
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Summary Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Pelanggan */}
                <Card className="p-6 shadow-[0px_20px_40px_rgba(16,27,50,0.06)] flex flex-col justify-between h-40 border-none">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#005ab4]">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                        </div>
                        <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Customers</p>
                        <h3 className="text-4xl font-extrabold text-[#005ab4] tracking-tighter">128</h3>
                    </div>
                </Card>

                {/* Total LTV */}
                <Card className="p-6 shadow-[0px_20px_40px_rgba(16,27,50,0.06)] flex flex-col justify-between h-40 border-none">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#0873df]">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                        </div>
                        <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">+8.4%</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total LTV</p>
                        <h3 className="text-4xl font-extrabold text-[#005ab4] tracking-tighter">$24.5<span className="text-xl">k</span></h3>
                    </div>
                </Card>

                {/* Avg. Belanja */}
                <Card className="p-6 shadow-[0px_20px_40px_rgba(16,27,50,0.06)] flex flex-col justify-between h-40 border-none">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                        </div>
                        <span className="text-rose-500 text-xs font-bold bg-rose-50 px-2 py-1 rounded-lg">-2.1%</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Avg. Spend</p>
                        <h3 className="text-4xl font-extrabold text-[#005ab4] tracking-tighter">$191</h3>
                    </div>
                </Card>
            </div>

            {/* Customer Table Block */}
            <Card className="overflow-hidden border-none shadow-[0px_20px_40px_rgba(16,27,50,0.06)]">
                <div className="p-6 flex justify-between items-center bg-white border-b border-slate-100">
                    <h4 className="font-bold text-[#005ab4]">Recent Customers List</h4>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-500">
                            <span className="material-symbols-outlined">filter_list</span>
                        </button>
                        <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-500">
                            <span className="material-symbols-outlined">more_vert</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead className="px-8 font-bold text-slate-500 uppercase tracking-widest">Customer</TableHead>
                                <TableHead className="px-8 font-bold text-slate-500 uppercase tracking-widest">Total Spend</TableHead>
                                <TableHead className="px-8 font-bold text-slate-500 uppercase tracking-widest text-center">Transactions</TableHead>
                                <TableHead className="px-8 font-bold text-slate-500 uppercase tracking-widest">Last Order</TableHead>
                                <TableHead className="px-8 font-bold text-slate-500 uppercase tracking-widest text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Row 1 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50/70 transition-colors">
                                <TableCell className="px-8">
                                    <div className="flex items-center gap-4">
                                        <img alt="Budi Martono" className="w-10 h-10 rounded-full bg-slate-100 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyE0wKFdGWXdqD2q65eEKgy34-BrIx3ugWTIl7HXfoSuZ02q9YRBaiHPFP8gQeuX6-w0hTALEWpLCHVRHcGHdW1yM4HZ_TTUzwX-mMwW-22rS7Re3RHCq3J4ndJuF_IfrNbXAIuFhcNIG0Qap0Gvtq4nT5ICzjONMoVcVEFOmCshxfc_OePYflxnhMplAEeLgQa-OKRGo1iybwXYo2HhQ_Q0YU4fIMl01WwY7K7cHDQjHLG6NpdGy_QMVFIw9Tc2SR7JeZF975V4Ao"/>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 group-hover:text-[#005ab4] transition-colors">Michael Smith</p>
                                            <p className="text-xs text-slate-500">michael.smith@gmail.com</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 font-bold text-slate-800">$245.00</TableCell>
                                <TableCell className="px-8 text-center">
                                    <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-[#005ab4]">12</span>
                                </TableCell>
                                <TableCell className="px-8 text-xs font-medium text-slate-500">Oct 14, 2023</TableCell>
                                <TableCell className="px-8 text-right">
                                    <a href="#" className="text-xs font-extrabold text-[#005ab4] hover:underline transition-all">VIEW DETAIL</a>
                                </TableCell>
                            </TableRow>

                            {/* Row 2 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50/70 transition-colors">
                                <TableCell className="px-8">
                                    <div className="flex items-center gap-4">
                                        <img alt="Siti Pertiwi" className="w-10 h-10 rounded-full bg-slate-100 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDylrIVNmWwv68Xwz-MA6uwZBkm-aGqfP7J3bZpJnXGeBeNPDa0WGjAez5vxt4if8wEPr9HkVsLFxOYs9_WEfDMiqmw8CwzAiQLSZSl1K51tn1hejlCdsUf-yNHygt4iVBwU9rWquK3IiBEU5M7VQ3TR_nRoPWqWBWl0Llf_ZZOl-bLE5kRQAwd0Ks14DB5wxkgyc-_dmAfcQSHF1qa25MOsnakDkvegBlp_SnSm3iD_EIQRCqvlXVU-WvJGsbhXLXUM-LYrhPhoHVJ"/>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 group-hover:text-[#005ab4] transition-colors">Sarah Johnson</p>
                                            <p className="text-xs text-slate-500">sarah.j@outlook.com</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 font-bold text-slate-800">$112.00</TableCell>
                                <TableCell className="px-8 text-center">
                                    <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-[#005ab4]">5</span>
                                </TableCell>
                                <TableCell className="px-8 text-xs font-medium text-slate-500">Oct 12, 2023</TableCell>
                                <TableCell className="px-8 text-right">
                                    <a href="#" className="text-xs font-extrabold text-[#005ab4] hover:underline transition-all">VIEW DETAIL</a>
                                </TableCell>
                            </TableRow>

                            {/* Row 3 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50/70 transition-colors">
                                <TableCell className="px-8">
                                    <div className="flex items-center gap-4">
                                        <img alt="Andi Dermawan" className="w-10 h-10 rounded-full bg-slate-100 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQq8eDohlhzNtTrwA-UoW9HTG2ULzkYM9S8mQKiMC68OUuMEcAliv8EkyJy6MOz9t37pVxUoml_uAR4sOrBtsjO0l6gE5I9RLbBwK6Sjuyn3ZHBc4dssFUoE3949DeRYtFrPl4c_tog2tPCOgZNe5gU1x9WEBS9_JSJQZIME85c-6dFYbJ9a2j6by0WUpJZLdPbPlZMJhOXS5d9Nk0CsVm4Pqnyey0kZ1INP5TKDaGByB_bwscgSZ_YIXwuxJvN1BjNCY2IZkaMApx"/>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 group-hover:text-[#005ab4] transition-colors">Andrew Davis</p>
                                            <p className="text-xs text-slate-500">andrew.d@tepak.id</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 font-bold text-slate-800">$89.00</TableCell>
                                <TableCell className="px-8 text-center">
                                    <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-[#005ab4]">3</span>
                                </TableCell>
                                <TableCell className="px-8 text-xs font-medium text-slate-500">Oct 10, 2023</TableCell>
                                <TableCell className="px-8 text-right">
                                    <a href="#" className="text-xs font-extrabold text-[#005ab4] hover:underline transition-all">VIEW DETAIL</a>
                                </TableCell>
                            </TableRow>

                            {/* Row 4 */}
                            <TableRow className="cursor-pointer group hover:bg-slate-50/70 transition-colors">
                                <TableCell className="px-8">
                                    <div className="flex items-center gap-4">
                                        <img alt="Lina Kusuma" className="w-10 h-10 rounded-full bg-slate-100 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZTsVTlraQZvZXo2gG_9H1u7j9vNHpfCO9v9rxWHQRlnFnSyjHYapgnvLrFtzlGOY4MIrTrfAofN1TfPmnyyq_njNEazlfvBS_RHQOaYHf34MICQCR4TwP6l5pzuQA0SrI2lGO3e5waPwg9I2rrtt3Md5GHEOym8XCGQV4NJ_G82TT6SWE9v-4St41_s4EMiZ-Js5ZdvLetpKJrvMfjz12-1gbkVPibTdxibMhs78aaEfBoudcr-fN_GxsX_5lpYA8oHU0NLk3ksv9"/>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 group-hover:text-[#005ab4] transition-colors">Linda Chen</p>
                                            <p className="text-xs text-slate-500">linda.chen@gmail.com</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 font-bold text-slate-800">$456.00</TableCell>
                                <TableCell className="px-8 text-center">
                                    <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-[#005ab4]">28</span>
                                </TableCell>
                                <TableCell className="px-8 text-xs font-medium text-slate-500">Oct 08, 2023</TableCell>
                                <TableCell className="px-8 text-right">
                                    <a href="#" className="text-xs font-extrabold text-[#005ab4] hover:underline transition-all">VIEW DETAIL</a>
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
                    className="bg-slate-50/50 rounded-b-2xl border-t border-slate-100"
                />
            </Card>

            {/* Quick action FAB replacement since we don't have a floating FAB component globally, but we can just use HTML absolute wrapper like we did in Orders */}
        </div>
    );
};
