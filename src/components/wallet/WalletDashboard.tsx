import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Card, CardContent } from '../ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import {
    BanknotesIcon,
    BuildingLibraryIcon,
    ArrowTrendingUpIcon,
    CreditCardIcon,
    ChartBarIcon,
    ArrowRightIcon,
    BoltIcon,
    ChevronDownIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { SubscriptionProvider, useSubscription } from '../../context/SubscriptionContext';

const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn("animate-pulse bg-slate-200 rounded-xl", className)} />
);

const WalletDashboardContent = () => {
    const { transactions: subscriptionTx, syncStatus, isLoading: isLoadingSub } = useSubscription();
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [balanceData, setBalanceData] = useState<any>({ available: 0, pending: 0, total_net: 0, payout_fee: 5000, min_withdrawal: 50000 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isBankInfoComplete, setIsBankInfoComplete] = useState(true);
    const [showBankWarning, setShowBankWarning] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

    const fetchData = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        try {
            const [statsRes, withdrawalsRes, ordersRes, bankRes] = await Promise.all([
                fetch('/api/wallet/stats'),
                fetch('/api/withdrawals'),
                fetch('/api/orders'),
                fetch('/api/bank-accounts')
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setBalanceData(statsData);
            }
            if (withdrawalsRes.ok) setWithdrawals(await withdrawalsRes.json());
            if (ordersRes.ok) setRecentOrders((await ordersRes.json()).slice(0, 5));

            if (bankRes.ok) {
                const bankData = await bankRes.json();
                if (!bankData.exists) {
                    setIsBankInfoComplete(false);
                }
            }
        } catch (err) {
            console.error('Wallet Fetch Error:', err);
            setError("Gagal mengambil data saldo, silakan coba lagi nanti.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Auto-refresh balance when page regains focus (e.g., after admin approval, returning from withdraw page)
    useEffect(() => {
        const handleFocus = () => {
            fetchData(false); // silent refresh without loading spinner
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    // Periodic refresh every 30 seconds to catch admin approval updates
    useEffect(() => {
        const interval = setInterval(() => {
            fetchData(false);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const minWithdrawal = balanceData.min_withdrawal || 50000;

    if (loading) {
        return (
            <div className="max-w-7xl w-full mx-auto space-y-12 p-8">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Skeleton className="h-60" />
                    <Skeleton className="h-60" />
                    <Skeleton className="h-60" />
                </div>
            </div>
        );
    }

    // Note: error state is now handled inline below (showing balances with disabled withdraw)
    // rather than replacing the entire page, per BDD spec

    return (
        <>
            <div className="max-w-7xl w-full mx-auto space-y-8 ">
                {/* Toast Notification */}
                {toast && (
                    <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold bg-emerald-500 text-white animate-in slide-in-from-right duration-300">
                        <CheckCircleIcon className="w-5 h-5 shrink-0" />{toast}
                    </div>
                )}
                {/* Error Banner - shown inline instead of replacing entire page */}
                {error && (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
                            <ExclamationTriangleIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black text-rose-700 uppercase tracking-tight">{error}</p>
                            <p className="text-[10px] text-rose-500 font-medium mt-1">Beberapa data mungkin tidak akurat. Tombol tarik dinonaktifkan sementara.</p>
                        </div>
                        <Button variant="outline" size="sm" className="shrink-0" onClick={() => {
                            showToast('Memuat ulang data...');
                            window.location.reload();
                        }}>
                            <ArrowPathIcon className="w-3.5 h-3.5 mr-1" /> Coba Lagi
                        </Button>
                    </div>
                )}

                {/* Page Header */}
                <header className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Dompet & Pendapatan</h1>
                    <p className="text-slate-500 font-medium">Kelola saldo, penarikan, dan pantau riwayat transaksi Anda secara real-time.</p>
                </header>

                {/* Top Section: Enhanced Balance Metrics */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Available Balance - Primary Focus */}
                    <div className="md:col-span-1 relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl shadow-slate-900/20 group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BuildingLibraryIcon className="w-32 h-32 text-white" />
                        </div>
                        <div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Available Balance</p>
                            <h2 className="text-4xl font-black text-white tracking-tight uppercase">
                                Rp {balanceData.available.toLocaleString('id-ID')}
                            </h2>
                        </div>
                        <div className="mt-8">
                            <Button
                                variant="outline"
                                className="w-full bg-white text-slate-900 hover:bg-slate-50 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 border-none uppercase text-[11px] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                                disabled={balanceData.available < minWithdrawal || !!error}
                                onClick={() => {
                                    if (!isBankInfoComplete) {
                                        setShowBankWarning(true);
                                        return;
                                    }
                                    window.location.href = '/withdraw';
                                }}
                            >
                                <BuildingLibraryIcon className="w-4 h-4" />
                                {error ? 'Tarik Dinonaktifkan' : balanceData.available < minWithdrawal ? 'Saldo Tidak Cukup' : 'Tarik Dana'}
                            </Button>
                        </div>
                    </div>

                    {/* Total Balance Card */}
                    <Card className="p-8 border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col justify-between hover:border-primary/10 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                <ChartBarIcon className="w-5 h-5" />
                            </div>
                            <Badge variant="ghost">All-time Net</Badge>
                        </div>
                        <div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Total Net Balance</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                Rp {(balanceData.total_net || 0).toLocaleString('id-ID')}
                            </h3>
                        </div>
                        <div className="pt-6 mt-6 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 font-medium italic">*Sudah dipotong Platform Fee (5%) dan PG Fee sesuai pengaturan sistem</p>
                        </div>
                    </Card>

                    {/* Pending Balance Card */}
                    <Card className="p-8 border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col justify-between bg-amber-50/30">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                                <ArrowPathIcon className="w-5 h-5" />
                            </div>
                            <Badge variant="pending">Clearing</Badge>
                        </div>
                        <div>
                            <p className="text-amber-800/60 font-bold uppercase tracking-widest text-[10px] mb-2">Pending Balance</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                Rp {balanceData.pending.toLocaleString('id-ID')}
                            </h3>
                        </div>
                        <div className="pt-6 mt-6 border-t border-amber-200/50">
                            <p className="text-[10px] text-amber-800/60 font-medium leading-relaxed uppercase tracking-tighter">Dalam masa garansi transaksi</p>
                        </div>
                    </Card>
                </section>

                {/* Middle Section: Two-column layout */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Withdrawal History) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Riwayat Penarikan</h3>
                            <button className="text-primary text-[11px] font-black hover:underline uppercase tracking-widest">Lihat Semua</button>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="uppercase text-[10px] font-black tracking-widest">Request ID</TableHead>
                                        <TableHead className="uppercase text-[10px] font-black tracking-widest">Bank</TableHead>
                                        <TableHead className="uppercase text-[10px] font-black tracking-widest">Amount</TableHead>
                                        <TableHead className="uppercase text-[10px] font-black tracking-widest">Date</TableHead>
                                        <TableHead className="uppercase text-[10px] font-black tracking-widest">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {withdrawals.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-slate-400 font-medium italic text-xs uppercase tracking-widest">Belum ada riwayat penarikan</TableCell>
                                        </TableRow>
                                    ) : withdrawals.map(wd => (
                                        <TableRow key={wd.id} className={wd.status === 'pending' ? 'bg-amber-50/40' : ''}>
                                            <TableCell className="text-primary font-black">
                                                <span className="hover:underline cursor-pointer" onClick={() => window.location.href = `/withdrawal-details?id=${wd.id}`}>
                                                    #{wd.id.substring(0, 8).toUpperCase()}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-slate-600 font-bold">{wd.bank_accounts?.bank_name || 'Bank'}</TableCell>
                                            <TableCell className="text-slate-900 font-black">Rp {Number(wd.amount).toLocaleString('id-ID')}</TableCell>
                                            <TableCell className="text-slate-400 text-[11px] font-medium">
                                                {new Date(wd.requested_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell>
                                                {wd.status === 'pending' ? (
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="pending" className="flex items-center gap-1 w-fit">
                                                            <ClockIcon className="w-3 h-3" />
                                                            Pending
                                                        </Badge>
                                                        <span className="text-[9px] text-amber-600 font-medium uppercase tracking-wider">Menunggu Admin</span>
                                                    </div>
                                                ) : wd.status === 'processing' ? (
                                                    <Badge variant="pending">
                                                        <span className="flex items-center gap-1"><ArrowPathIcon className="w-3 h-3" /> Diproses</span>
                                                    </Badge>
                                                ) : wd.status === 'completed' ? (
                                                    <Badge variant="success">Berhasil</Badge>
                                                ) : wd.status === 'rejected' ? (
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="failed">Ditolak</Badge>
                                                        {wd.notes && (
                                                            <span className="text-[9px] text-rose-500 font-medium uppercase tracking-wider truncate max-w-[120px] block" title={wd.notes}>
                                                                {wd.notes.replace(/^Rejected:\s*/i, '').substring(0, 30)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Badge variant="failed">{wd.status.toUpperCase()}</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Right Column (Wallet Actions) */}
                    <div className="space-y-6">
                        {/* Billing/Subscription History Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Riwayat Berlangganan</h3>
                                <button
                                    onClick={syncStatus}
                                    disabled={isLoadingSub}
                                    className="flex items-center gap-2 text-primary text-[10px] font-black hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest border border-primary/20 disabled:opacity-50"
                                >
                                    <ArrowPathIcon className={cn("w-3.5 h-3.5", isLoadingSub && "animate-spin")} />
                                    {isLoadingSub ? 'Syncing...' : 'Sync Status'}
                                </button>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                {subscriptionTx && subscriptionTx.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <p className="text-slate-400 font-medium text-sm">Belum ada riwayat pembayaran paket.</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="uppercase text-[10px] font-black tracking-widest">Plan</TableHead>
                                                <TableHead className="uppercase text-[10px] font-black tracking-widest">Amount</TableHead>
                                                <TableHead className="uppercase text-[10px] font-black tracking-widest">Date</TableHead>
                                                <TableHead className="uppercase text-[10px] font-black tracking-widest">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subscriptionTx && subscriptionTx.map(tx => (
                                                <TableRow key={tx.id}>
                                                    <TableCell className="font-black text-slate-900 uppercase text-xs">Orbit {tx.plan_id}</TableCell>
                                                    <TableCell className="font-bold text-slate-600">Rp {Number(tx.amount).toLocaleString('id-ID')}</TableCell>
                                                    <TableCell className="text-slate-400 text-[11px]">
                                                        {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                tx.status === 'SUCCESS' ? 'success' :
                                                                    tx.status === 'PENDING' ? 'pending' : 'failed'
                                                            }
                                                        >
                                                            {tx.status === 'SUCCESS' ? 'Berhasil' :
                                                                tx.status === 'PENDING' ? 'Diproses' : 'Gagal'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bottom Section: Detailed Transaction History (Riwayat Transaksi) */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Riwayat Transaksi</h3>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" className="bg-white border border-slate-100 uppercase tracking-widest text-[10px]">Filter</Button>
                            <Button variant="ghost" size="sm" className="bg-white border border-slate-100 uppercase tracking-widest text-[10px]">Export .CSV</Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                        {recentOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-24 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                    <ChartBarIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Belum ada riwayat transaksi</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">Mulai bagikan link toko Anda untuk mulai mendapatkan komisi.</p>
                                </div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="uppercase text-[10px] font-black tracking-widest">Nama Produk/Event</TableHead>
                                        <TableHead className="text-right uppercase text-[10px] font-black tracking-widest">Nominal Bersih</TableHead>
                                        <TableHead className="text-center uppercase text-[10px] font-black tracking-widest">Status</TableHead>
                                        <TableHead className="text-right uppercase text-[10px] font-black tracking-widest">Tanggal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.map((tx: any) => {
                                        const netAmount = Number(tx.net_amount || 0);
                                        const isSettled = (tx.status === 'success' || tx.status === 'paid');
                                        const isCancelled = (tx.status === 'failed' || tx.status === 'cancelled' || tx.status === 'expired');
                                        // Map status to display labels per BDD spec
                                        const statusLabel =
                                            tx.status === 'success' || tx.status === 'paid' ? 'Success' :
                                                tx.status === 'pending' ? 'Pending' :
                                                    tx.status === 'cancelled' ? 'Cancelled' :
                                                        tx.status === 'expired' ? 'Expired' :
                                                            tx.status === 'failed' ? 'Failed' : tx.status;
                                        const statusVariant = isSettled ? 'success' :
                                            tx.status === 'pending' ? 'pending' : 'failed';
                                        return (
                                            <TableRow key={tx.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-primary/5 rounded-lg flex items-center justify-center text-primary shrink-0">
                                                            <CreditCardIcon className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-900 font-black text-[11px] uppercase tracking-tight">{tx.products?.title || 'Produk'}</p>
                                                            <p className="text-[9px] text-slate-400 font-medium leading-none">{tx.customers?.name || 'Guest'}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className={cn("text-right font-black text-sm tracking-tight", isCancelled ? 'text-slate-300 line-through' : (isSettled ? 'text-emerald-500' : 'text-amber-500'))}>
                                                    {isCancelled ? '- ' : '+ '}Rp {netAmount.toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={statusVariant}
                                                        className="font-black text-[9px] px-3 py-1 rounded-lg uppercase tracking-widest"
                                                    >
                                                        {statusLabel}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-slate-400 text-[10px] font-medium uppercase tracking-tighter italic">
                                                    {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </section>

                {/* Footer Info (Minimalistic) */}
                <footer className="py-8 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
                    Powered by Tepak.id Digital Solutions © 2024. All Rights Reserved.
                </footer>

                {/* Bank Info Warning Modal */}
                {showBankWarning && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-8">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100 mb-4">
                                    <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Info Bank Belum Lengkap</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">Harap lengkapi informasi bank rekening payout Anda terlebih dahulu sebelum melakukan penarikan saldo.</p>
                            </div>
                            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button className="px-5 py-2.5 rounded-xl font-black text-slate-500 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest" onClick={() => setShowBankWarning(false)}>Tutup</button>
                                <button className="px-6 py-2.5 rounded-xl font-black bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all text-[10px] uppercase tracking-widest" onClick={() => {
                                    sessionStorage.setItem('bank_info_toast', 'Harap lengkapi informasi bank Anda');
                                    window.location.href = '/bank-info';
                                }}>Lengkapi Sekarang</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export const WalletDashboard = () => {
    return (
        <SubscriptionProvider>
            <WalletDashboardContent />
        </SubscriptionProvider>
    );
};

