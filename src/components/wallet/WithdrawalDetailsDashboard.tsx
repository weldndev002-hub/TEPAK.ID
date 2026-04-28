import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
    BuildingLibraryIcon,
    DocumentTextIcon,
    ArrowTopRightOnSquareIcon,
    ArrowLeftIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

export const WithdrawalDetailsDashboard = () => {
    const [withdrawal, setWithdrawal] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
            fetchWithdrawal(id);
        } else {
            setError("ID Penarikan tidak ditemukan.");
            setIsLoading(false);
        }
    }, []);

    const fetchWithdrawal = async (id: string) => {
        try {
            const res = await fetch(`/api/withdrawals/${id}`);
            if (res.ok) {
                const data = await res.json();
                setWithdrawal(data);
            } else {
                setError("Gagal mengambil detail penarikan.");
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError("Koneksi bermasalah.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !withdrawal) {
        return (
            <div className="text-center p-20 space-y-4">
                <h3 className="text-xl font-bold text-slate-800">{error || "Detail tidak ditemukan"}</h3>
                <Button onClick={() => window.location.href = '/wallet'}>Kembali ke Dompet</Button>
            </div>
        );
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="max-w-3xl w-full mx-auto space-y-10 ">
            <div className="mb-10 flex items-center gap-4">
                <a href="/wallet" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
                </a>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-1 uppercase tracking-tighter">Withdrawal Details</h1>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none">Comprehensive transaction log for your earnings disbursement.</p>
                </div>
            </div>

            {/* Detail Card Container */}
            <div className="flex justify-center">
                <Card className="w-full bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 flex flex-col items-center">
                    {/* Status Badge */}
                    <div className={`px-8 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] mb-10 border ${withdrawal.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        withdrawal.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            withdrawal.status === 'processing' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                withdrawal.status === 'failed' || withdrawal.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                        {withdrawal.status === 'completed' ? 'BERHASIL' :
                            withdrawal.status === 'pending' ? 'MENUNGGU PERSETUJUAN' :
                                withdrawal.status === 'processing' ? 'DIPROSES' :
                                    withdrawal.status === 'failed' ? 'GAGAL' :
                                        withdrawal.status === 'rejected' ? 'DITOLAK' :
                                            withdrawal.status.toUpperCase()}
                    </div>

                    {/* Pending Status Info Banner */}
                    {withdrawal.status === 'pending' && (
                        <div className="w-full bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-10 flex items-start gap-4">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                                <ClockIcon className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-amber-700 uppercase tracking-tight">Menunggu Persetujuan Admin</h4>
                                <p className="text-[11px] text-amber-600/80 font-medium leading-relaxed mt-1">
                                    Permintaan penarikan Anda sedang menunggu review dan persetujuan dari Admin.
                                    Proses transfer akan dilakukan secara manual setelah disetujui.
                                    Status akan diperbarui secara otomatis.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Rejected Status Info Banner */}
                    {withdrawal.status === 'rejected' && (
                        <div className="w-full bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-10 flex items-start gap-4">
                            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                                <DocumentTextIcon className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-rose-700 uppercase tracking-tight">Penarikan Ditolak</h4>
                                <p className="text-[11px] text-rose-600/80 font-medium leading-relaxed mt-1">
                                    {withdrawal.notes ? withdrawal.notes.replace(/^Rejected:\s*/i, '') : 'Permintaan penarikan ditolak oleh Admin.'}
                                    Saldo telah dikembalikan ke Virtual Balance Anda.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Amount */}
                    <div className="text-center mb-12">
                        <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">{formatCurrency(withdrawal.amount)}</h2>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full">TRANS-ID: {withdrawal.id.substring(0, 12).toUpperCase()}</span>
                    </div>

                    {/* Breakdown Table */}
                    <div className="w-full bg-slate-50/50 rounded-[2rem] p-8 space-y-5 mb-10 border border-slate-100/50">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disbursement Amount</span>
                            <span className="text-xs font-black text-slate-600">{formatCurrency(withdrawal.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Fee</span>
                            <span className="text-xs font-black text-rose-500">Free</span>
                        </div>
                        <div className="h-[2px] bg-slate-100 w-full rounded-full"></div>
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100/50">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Net Settlement</span>
                            <span className="text-lg font-black text-slate-900">{formatCurrency(withdrawal.amount)}</span>
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
                                <p className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">{withdrawal.bank_accounts?.account_name || withdrawal.bank_accounts?.bank_name || 'Bank Account'}</p>
                                <p className="text-[10px] font-black text-slate-400 mt-0.5 tracking-widest">{withdrawal.bank_accounts?.bank_name} • {withdrawal.bank_accounts?.account_number || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-5 p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm group hover:border-primary/20 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                                <DocumentTextIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5 leading-none">Disbursement Info</p>
                                {withdrawal.notes ? (
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">{withdrawal.notes}</p>
                                ) : withdrawal.proof_url ? (
                                    <a className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-2 uppercase tracking-widest group/link transition-colors" href={withdrawal.proof_url} target="_blank">
                                        View Receipt
                                        <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                    </a>
                                ) : (
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menunggu konfirmasi</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button variant="primary" className="w-full h-16 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center font-black uppercase text-[11px] tracking-[0.3em]" onClick={() => window.location.href = '/wallet'}>
                        Back to Wallet
                    </Button>
                </Card>
            </div>

            <footer className="mt-16 text-center text-slate-300">
                <p className="text-[9px] font-black uppercase tracking-[0.4em]">© 2024 TEPAK.ID — ECOSYSTEM SECURED & MONITORED.</p>
            </footer>
        </div>
    );
};

