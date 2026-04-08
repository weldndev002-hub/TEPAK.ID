import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { Badge } from '../ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';

export const PlanManagementDashboard = () => {
    return (
        <div className="w-full">
            {/* Breadcrumb & Global Actions */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#00458d] tracking-widest uppercase mb-2">
                        <span>Platform Management</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-[#465f89]">Plans & Pricing</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-[#005ab4] tracking-tight">Subscription Plans</h2>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm">
                        Discard Changes
                    </Button>
                    <Button variant="primary" className="bg-[#465f89] text-white hover:shadow-lg hover:shadow-[#465f89]/20 transition-all font-bold text-sm">
                        Apply Global Prices
                    </Button>
                </div>
            </div>

            {/* Plan Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Standard Plan Card */}
                <Card className="p-8 border-slate-200/60 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-slate-100 transition-colors"></div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                                <span className="material-symbols-outlined text-2xl">eco</span>
                            </div>
                            <Badge variant="ghost" className="bg-slate-100 text-slate-600 border-none font-black text-[10px]">CURRENT DEFAULTS</Badge>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Standard Plan</h3>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed">Essential features for creators starting their digital journey.</p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                                    <input type="number" defaultValue="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-7 pr-3 text-lg font-black text-slate-900 focus:ring-2 focus:ring-[#465f89] outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yearly Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                                    <input type="number" defaultValue="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-7 pr-3 text-lg font-black text-slate-900 focus:ring-2 focus:ring-[#465f89] outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* PRO Plan Card */}
                <Card className="p-8 border-[#d6e3ff] bg-gradient-to-br from-white to-[#f8faff] shadow-xl shadow-blue-500/5 relative group overflow-hidden border">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#d6e3ff]/30 rounded-full -mr-16 -mt-16 group-hover:bg-[#d6e3ff]/50 transition-colors"></div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-[#005ab4] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                            </div>
                            <Badge className="bg-[#005ab4] text-white border-none font-black text-[10px] animate-pulse">MOST POPULAR</Badge>
                        </div>
                        <h3 className="text-2xl font-black text-[#005ab4] mb-2">PRO Plan</h3>
                        <p className="text-sm text-blue-900/60 mb-8 leading-relaxed">Advanced tools, deeper analytics, and premium integrations.</p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#00458d] uppercase tracking-widest">Monthly Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-sm">$</span>
                                    <input type="number" defaultValue="29" className="w-full bg-white border-[#d6e3ff] rounded-xl py-2.5 pl-7 pr-3 text-lg font-black text-[#005ab4] focus:ring-2 focus:ring-[#005ab4] outline-none shadow-sm" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#00458d] uppercase tracking-widest">Yearly Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-sm">$</span>
                                    <input type="number" defaultValue="290" className="w-full bg-white border-[#d6e3ff] rounded-xl py-2.5 pl-7 pr-3 text-lg font-black text-[#005ab4] focus:ring-2 focus:ring-[#005ab4] outline-none shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Feature Matrix Matrix */}
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#005ab4]">Feature Management</h3>
                    <Button variant="ghost" className="text-xs font-bold text-[#465f89] hover:bg-slate-100">+ Add Global Feature</Button>
                </div>

                <Card className="overflow-hidden border-slate-100 shadow-sm p-0">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-none">
                                <TableHead className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Feature Capability</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Standard</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">PRO Tier</TableHead>
                                <TableHead className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Category</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="font-bold text-slate-700">Landing Page Builder</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Core drag-and-drop editor access</div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={true} onChange={() => {}} /></div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={true} onChange={() => {}} /></div>
                                </TableCell>
                                <TableCell className="px-8 text-right">
                                    <Badge variant="ghost" className="bg-blue-50 text-blue-600 border-none text-[9px] font-black">CORE</Badge>
                                </TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="font-bold text-slate-700">Digital Product Sales</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Sell PDF, Videos, or Files</div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={false} onChange={() => {}} /></div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={true} onChange={() => {}} /></div>
                                </TableCell>
                                <TableCell className="px-8 text-right">
                                    <Badge variant="ghost" className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black">COMMERCE</Badge>
                                </TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="font-bold text-slate-700">Custom Domain (CNAME)</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Connect external domains</div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={false} onChange={() => {}} /></div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={true} onChange={() => {}} /></div>
                                </TableCell>
                                <TableCell className="px-8 text-right">
                                    <Badge variant="ghost" className="bg-purple-50 text-purple-600 border-none text-[9px] font-black">PREMIUM</Badge>
                                </TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="font-bold text-slate-700">WhatsApp Notification</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Direct order alerts to W.A</div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={false} onChange={() => {}} /></div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={true} onChange={() => {}} /></div>
                                </TableCell>
                                <TableCell className="px-8 text-right">
                                    <Badge variant="ghost" className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black">INTEGRATION</Badge>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
};
