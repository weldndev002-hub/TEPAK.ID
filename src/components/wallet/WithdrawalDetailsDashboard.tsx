import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { 
    BuildingLibraryIcon, 
    DocumentTextIcon, 
    ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline';

export const WithdrawalDetailsDashboard = () => {
    return (
        <div className="max-w-3xl w-full mx-auto space-y-10 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Withdrawal Details</h1>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none">Comprehensive transaction log for your earnings disbursement.</p>
            </div>

            {/* Detail Card Container */}
            <div className="flex justify-center">
                <Card className="w-full bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 flex flex-col items-center">
                    {/* Status Badge */}
                    <div className="bg-emerald-50 text-emerald-600 px-8 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] mb-10 border border-emerald-100/50">
                        SUCCESSFUL
                    </div>

                    {/* Amount */}
                    <div className="text-center mb-12">
                        <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">Rp 1.500.000</h2>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full">TRANS-ID: TP-9821340912</span>
                    </div>

                    {/* Breakdown Table */}
                    <div className="w-full bg-slate-50/50 rounded-[2rem] p-8 space-y-5 mb-10 border border-slate-100/50">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disbursement Amount</span>
                            <span className="text-xs font-black text-slate-600">Rp 1.505.000</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Fee</span>
                            <span className="text-xs font-black text-rose-500">- Rp 5.000</span>
                        </div>
                        <div className="h-[2px] bg-slate-100 w-full rounded-full"></div>
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100/50">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Net Settlement</span>
                            <span className="text-lg font-black text-slate-900">Rp 1.500.000</span>
                        </div>
                    </div>

                    {/* Info Sections Grid */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="flex items-start gap-5 p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm group hover:border-primary/20 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                                <BuildingLibraryIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5 leading-none">Recipient Account</p>
                                <p className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">Bank Mandiri</p>
                                <p className="text-[10px] font-black text-slate-400 mt-0.5 tracking-widest">123-xxx-456</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-5 p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm group hover:border-primary/20 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                                <DocumentTextIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5 leading-none">Proof of Payment</p>
                                <a className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-2 uppercase tracking-widest group/link transition-colors" href="#">
                                    View Receipt 
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button variant="primary" className="w-full h-16 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center font-black uppercase text-[11px] tracking-[0.3em]">
                        Close Details
                    </Button>
                </Card>
            </div>
            
            <footer className="mt-16 text-center text-slate-300">
                <p className="text-[9px] font-black uppercase tracking-[0.4em]">© 2024 TEPAK.ID — ECOSYSTEM SECURED & MONITORED.</p>
            </footer>
        </div>
    );
};

