import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';

export const PayoutsDashboard = () => {
    return (
        <div className="w-full">
            {/* Page Title & Stats Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-[#005ab4] mb-2">Payout Processing</h2>
                    <p className="text-slate-500 max-w-md">Manage creator withdrawal requests carefully and quickly to maintain ecosystem trust.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Total Pending</p>
                        <p className="text-2xl font-black text-[#465f89]">$12,450.00</p>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Queue Size</p>
                        <p className="text-2xl font-black text-[#005ab4]">5 Requests</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-8 mb-8 border-b border-slate-100">
                <button className="pb-4 text-sm font-bold text-[#465f89] border-b-2 border-[#465f89] px-2">Pending (5)</button>
                <button className="pb-4 text-sm font-medium text-slate-400 hover:text-[#005ab4] px-2 transition-colors">Successful</button>
                <button className="pb-4 text-sm font-medium text-slate-400 hover:text-[#005ab4] px-2 transition-colors">Failed/Rejected</button>
            </div>

            {/* Payout Table Container */}
            <Card className="rounded-2xl overflow-hidden shadow-sm border-slate-100">
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Creator</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Amount Details</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Destination Bank</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Request Date</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Table Row 1 */}
                            <TableRow className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-6 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                                            <img alt="Ahmad Fauzi" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-SIkJhYUowdY-ll6gbXfshU1rALh3em60TJM3tQuCkY9MY10OmrXrHSDzwi8-wOGvNFHoQJBdIZfeV6qqeQzlU_0C4xU6mKPsG4Xwi9acBFRsKC0o5Fdtc0aypnJdo0pBLuFCA7VzU1OFCQPvIT0Dl4Ls_iPaQR8-YBbg9Juz_NOiQ4LjVNiG9Z6_rCpacLrLHmHvY1hHE0rcFIrj4XKFvmwV7MOkNKwT5iraLbi1y1_yBpQjhlR8uc0i97piqeKAnOM4UN85pY89" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#005ab4]">Ahmad Fauzi</p>
                                            <p className="text-xs text-slate-500">ahmad.fauzi@email.com</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-6">
                                    <div className="space-y-1">
                                        <p className="font-bold text-[#005ab4]">$250.00</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400">Fees: $5.00</span>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Net: $245.00</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-6">
                                    <div>
                                        <p className="font-bold text-[#005ab4]">BCA ••••5678</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-tighter">AN. AHMAD FAUZI</p>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-6 text-sm text-slate-500">
                                    Oct 12, 2023, 14:30
                                </TableCell>
                                <TableCell className="px-6 py-6">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" className="px-4 py-2 text-rose-500 hover:bg-rose-50 text-xs font-bold rounded-xl border border-rose-100">Reject</Button>
                                        <Button variant="primary" className="px-4 py-2 bg-[#465f89] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#465f89]/20 hover:brightness-110 active:scale-95 transition-all outline-none">Mark Success</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                            {/* Table Row 2 */}
                             <TableRow className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-6 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                                            <img alt="Riska Amelia" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPlPjPxAMkvRRVzHmiBhvbAWaH-K3tMYyz0elNIw1aCo3PZfmDT1fSAHOYXAtz86zcEF_AC1lgDEXpYZ-Y1PLldZO2iwTU6BMye9wv75xPQXJEfF6BrVs8QRDw4eYau5d_iAasdUX7215-6ScY476dlvODPKAb83A5TQgl4145YvyKdcVAwrq-60MAngS4ItfdN9vsC9YMg8-3ZV8WiJFqHiyhMWcYaDnDvSPId2CWe8rgT_lcIuCHHjr1PpV2Q-jb7nXVGP-5FNNL" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#005ab4]">Riska Amelia</p>
                                            <p className="text-xs text-slate-500">riska.ml@example.com</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-6">
                                    <div className="space-y-1">
                                        <p className="font-bold text-[#005ab4]">$1,200.00</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400">Fees: $5.00</span>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Net: $1,195.00</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-6">
                                    <div>
                                        <p className="font-bold text-[#005ab4]">Mandiri ••••1122</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-tighter">AN. RISKA AMELIA</p>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-6 text-sm text-slate-500">
                                    Oct 12, 2023, 15:45
                                </TableCell>
                                <TableCell className="px-6 py-6">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" className="px-4 py-2 text-rose-500 hover:bg-rose-50 text-xs font-bold rounded-xl border border-rose-100">Reject</Button>
                                        <Button variant="primary" className="px-4 py-2 bg-[#465f89] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#465f89]/20 hover:brightness-110 active:scale-95 transition-all outline-none">Mark Success</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                            {/* Table Row 3 */}
                            <TableRow className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-6 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                                            <img alt="Budi Santoso" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8Ha_c9uw2xRRy41qNLcBZee4unv_9eG7SauD40C776cJAUOUL0lJ2uzuZunhwEL8cWRiw8oIkn945Vb-fsFk5gPYBnjrinSDkkhZoqJufZ-8E5Fl-7UhSOtVVftmf3VA8aorucnzPbvRAtytrKeRlNeSZtvnhpTwkJZVT-N-wu1B5hEv1UkpaVF-41nHrbEk0AxoVxNME4DMNLmRUzYOl_8fN1z9D-6rdsUHcTmG-Vkyjkd-6dw93PKP4FCZkc1XTNtALAJvGItGm" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#005ab4]">Budi Santoso</p>
                                            <p className="text-xs text-slate-500">budi.san@web.id</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-6">
                                    <div className="space-y-1">
                                        <p className="font-bold text-[#005ab4]">$5,000.00</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400">Fees: $5.00</span>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Net: $4,995.00</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-6">
                                    <div>
                                        <p className="font-bold text-[#005ab4]">BNI ••••9900</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-tighter">AN. BUDI SANTOSO</p>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-6 text-sm text-slate-500">
                                    Oct 13, 2023, 08:20
                                </TableCell>
                                <TableCell className="px-6 py-6">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" className="px-4 py-2 text-rose-500 hover:bg-rose-50 text-xs font-bold rounded-xl border border-rose-100">Reject</Button>
                                        <Button variant="primary" className="px-4 py-2 bg-[#465f89] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#465f89]/20 hover:brightness-110 active:scale-95 transition-all outline-none">Mark Success</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Footer Pagination Info */}
            <div className="mt-8 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">Showing 3 of 42 payout requests</p>
                <div className="flex gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#005ab4] transition-all">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#465f89] text-white font-bold shadow-md">1</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">2</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">3</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#005ab4] transition-all">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
