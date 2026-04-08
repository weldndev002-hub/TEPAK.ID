import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';

export const AdminSettingsDashboard = () => {
    return (
        <div className="w-full">
            {/* Breadcrumb & Sub Nav */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00458d] tracking-widest uppercase mb-4">
                    <span>Platform Settings</span>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-[#465f89]">Transaction Fee</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-3xl font-extrabold text-[#005ab4] tracking-tight">Transaction Fee</h2>
                    <div className="flex gap-3">
                        <Button variant="ghost" className="bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all text-sm font-semibold border-transparent">
                            Discard Changes
                        </Button>
                        <Button variant="primary" className="bg-[#465f89] text-white hover:shadow-lg hover:shadow-[#465f89]/20 transition-all text-sm font-semibold shadow-sm">
                            Save Parameters
                        </Button>
                    </div>
                </div>

                {/* Internal Sub-Navigation */}
                <div className="flex overflow-x-auto no-scrollbar gap-8 mt-8 border-b border-slate-200">
                    <a href="/admin/general-settings" className="pb-4 text-sm font-medium text-slate-500 hover:text-[#465f89] transition-colors whitespace-nowrap relative">General Settings</a>
                    <button className="pb-4 text-sm font-bold text-[#465f89] relative whitespace-nowrap">
                        Transaction Fee
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-[#465f89] rounded-t-full"></span>
                    </button>
                    <button className="pb-4 text-sm font-medium text-slate-500 hover:text-[#465f89] transition-colors whitespace-nowrap relative">Payment Gateways</button>
                    <button className="pb-4 text-sm font-medium text-slate-500 hover:text-[#465f89] transition-colors whitespace-nowrap relative">Webhook URLs</button>
                    <button className="pb-4 text-sm font-medium text-slate-500 hover:text-[#465f89] transition-colors whitespace-nowrap relative">Security Policy</button>
                </div>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-8">
                {/* Left Column: Inputs (Asymmetric Span 7) */}
                <div className="w-full xl:col-span-7 space-y-8">
                    {/* Merchant Fee Card */}
                    <Card className="p-8 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-[#d6e3ff] rounded-lg flex items-center justify-center text-[#465f89] mr-4">
                                    <span className="material-symbols-outlined">storefront</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#005ab4]">Merchant Fee</h3>
                                    <p className="text-sm text-slate-500">Global fee applied to every successful transaction.</p>
                                </div>
                            </div>
                            <div className="bg-[#d6e3ff] text-[#001b3e] text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Active System</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Percentage (%)</label>
                                <div className="relative group">
                                    <input className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-[#465f89] outline-none transition-all font-semibold" type="number" defaultValue="2.5" />
                                    <span className="absolute right-4 top-3 text-slate-400 font-bold">%</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Fixed Fee (USD)</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">$</span>
                                    <input className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-8 pr-4 focus:ring-2 focus:ring-[#465f89] outline-none transition-all font-semibold" type="number" defaultValue="1.50" step="0.01" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Payout Fee Card */}
                    <Card className="p-8 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-[#d6e3ff] rounded-lg flex items-center justify-center text-[#465f89] mr-4">
                                <span className="material-symbols-outlined">outbox</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#005ab4]">Payout Fee</h3>
                                <p className="text-sm text-slate-500">Flat fee deducted per withdrawal request.</p>
                            </div>
                        </div>
                        <div className="space-y-2 max-w-sm">
                            <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Flat Charge per Payout</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">$</span>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-8 pr-4 focus:ring-2 focus:ring-[#465f89] outline-none transition-all font-semibold" type="number" defaultValue="4.50" step="0.01" />
                            </div>
                        </div>
                    </Card>

                    {/* Minimum Withdrawal Card */}
                    <Card className="p-8 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-[#d6e3ff] rounded-lg flex items-center justify-center text-[#465f89] mr-4">
                                <span className="material-symbols-outlined">home_mini</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#005ab4]">Minimum Withdrawal</h3>
                                <p className="text-sm text-slate-500">Threshold required to initiate a payout request.</p>
                            </div>
                        </div>
                        <div className="space-y-2 max-w-sm">
                            <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Minimum Amount</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">$</span>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-8 pr-4 focus:ring-2 focus:ring-[#465f89] outline-none transition-all font-semibold" type="number" defaultValue="50.00" step="0.01" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Preview & History (Asymmetric Span 5) */}
                <div className="w-full xl:col-span-5 space-y-8">
                    {/* Amber Live Formula Preview Card */}
                    <Card className="p-8 bg-[#ffddb2] border-none shadow-lg relative overflow-hidden group">
                        {/* Decorate Background */}
                        <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#ffb94c]/30 rounded-full blur-3xl"></div>
                        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-[#624000]/10 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-[#291800] font-black uppercase tracking-tighter text-sm">Live Formula Preview</h4>
                                <span className="material-symbols-outlined text-[#624000]" style={{ fontVariationSettings: "'FILL' 1" }}>calculate</span>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end border-b border-[#624000]/20 pb-4">
                                    <span className="text-[#624000] text-sm font-medium">Sample Transaction</span>
                                    <span className="text-[#291800] text-xl font-extrabold tracking-tight">$1,000.00</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#624000]">Merchant Fee (2.5% + $1.50)</span>
                                        <span className="text-[#291800] font-bold">-$26.50</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#624000]">Gateway Platform Margin</span>
                                        <span className="text-[#291800] font-bold">-$2.00</span>
                                    </div>
                                </div>
                                <div className="bg-[#9f6a00] text-[#ffddb2] p-6 rounded-xl mt-4">
                                    <div className="text-[10px] uppercase font-bold tracking-widest text-[#fffbff] mb-2">Net Merchant Revenue</div>
                                    <div className="text-3xl font-black tracking-tight">$971.50</div>
                                    <div className="mt-4 flex items-center text-[11px] text-[#fffbff] font-medium opacity-90">
                                        <span className="material-symbols-outlined text-xs mr-1">info</span>
                                        Calculations based on current unsaved input values.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Fee Change History Table */}
                    <Card className="p-0 border-slate-200/60 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-[#005ab4]">Fee Change History</h3>
                            <button className="text-[#465f89] text-xs font-bold hover:underline">Export Logs</button>
                        </div>
                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest w-28">Date</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest w-24">Type</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Value</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Admin</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="text-xs text-slate-900 font-medium">Oct 12, 2023</TableCell>
                                        <TableCell>
                                            <span className="text-[10px] bg-[#d6e3ff] text-[#001b3e] font-bold px-2 py-0.5 rounded uppercase">Merchant</span>
                                        </TableCell>
                                        <TableCell className="text-xs font-bold">2.5% + $1.50</TableCell>
                                        <TableCell className="text-xs text-slate-500 text-right">R. Pratama</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="text-xs text-slate-900 font-medium">Sep 05, 2023</TableCell>
                                        <TableCell>
                                            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded uppercase">Payout</span>
                                        </TableCell>
                                        <TableCell className="text-xs font-bold">$4.50</TableCell>
                                        <TableCell className="text-xs text-slate-500 text-right">M. Sari</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="text-xs text-slate-900 font-medium">Aug 22, 2023</TableCell>
                                        <TableCell>
                                            <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded uppercase">Min WD</span>
                                        </TableCell>
                                        <TableCell className="text-xs font-bold">$50.00</TableCell>
                                        <TableCell className="text-xs text-slate-500 text-right">R. Pratama</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="text-xs text-slate-900 font-medium">Jul 18, 2023</TableCell>
                                        <TableCell>
                                            <span className="text-[10px] bg-[#d6e3ff] text-[#001b3e] font-bold px-2 py-0.5 rounded uppercase">Merchant</span>
                                        </TableCell>
                                        <TableCell className="text-xs font-bold">2.2% + $1.00</TableCell>
                                        <TableCell className="text-xs text-slate-500 text-right">System</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
