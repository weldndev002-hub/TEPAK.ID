import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const WithdrawalDetailsDashboard = () => {
    return (
        <div className="max-w-3xl w-full mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-[#005ab4] mb-2">Detail Penarikan Dana</h1>
                <p className="text-slate-500 font-medium">Informasi lengkap transaksi pencairan pendapatan Anda.</p>
            </div>

            {/* Detail Card Container */}
            <div className="flex justify-center">
                <Card className="w-full bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-none p-10 flex flex-col items-center">
                    {/* Status Badge */}
                    <div className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest mb-6 border border-emerald-100">
                        SUKSES
                    </div>

                    {/* Amount */}
                    <div className="text-center mb-8">
                        <h2 className="text-5xl font-extrabold text-[#005ab4] mb-2 tracking-tight">Rp 1.500.000</h2>
                        <p className="text-slate-400 font-medium text-sm tracking-wide">ID Transaksi: TP-9821340912</p>
                    </div>

                    {/* Breakdown Table */}
                    <div className="w-full bg-slate-50 rounded-xl p-6 space-y-4 mb-8">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Jumlah Pencairan</span>
                            <span className="font-bold text-[#005ab4]">Rp 1.505.000</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Biaya Layanan</span>
                            <span className="font-bold text-red-500">- Rp 5.000</span>
                        </div>
                        <div className="h-px bg-slate-200 w-full"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-[#005ab4] text-lg">Total Net</span>
                            <span className="font-extrabold text-[#465f89] text-xl">Rp 1.500.000</span>
                        </div>
                    </div>

                    {/* Info Sections Grid */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-[#005ab4]/5 flex items-center justify-center text-[#005ab4] flex-shrink-0">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bank Tujuan</p>
                                <p className="text-sm font-bold text-[#005ab4] leading-tight">Bank Mandiri<br/><span className="text-slate-500 font-medium">123-xxx-456</span></p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-[#465f89]/5 flex items-center justify-center text-[#465f89] flex-shrink-0">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bukti Transfer</p>
                                <a className="text-sm font-bold text-[#465f89] hover:underline flex items-center gap-1 group" href="#">
                                    Lihat Bukti Transfer 
                                    <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">open_in_new</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button variant="secondary" className="w-full bg-[#465f89] hover:bg-[#344d77] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        Tutup Detail
                    </Button>
                </Card>
            </div>
            
            <footer className="mt-12 text-center text-slate-400 text-sm">
                <p>© 2024 Tepak.id Digital Solutions. Semua sistem terpantau aman.</p>
            </footer>
        </div>
    );
};
