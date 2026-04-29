import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { WalletIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export interface PayoutFormProps {
    className?: string;
}

interface WithdrawResult {
    success: boolean;
    withdrawalId: string;
    status: 'completed' | 'pending' | 'failed';
    accountName: string;
    amount: number;
    fee: number;
    netTransfer: number;
    newBalance: number;
    error?: string;
}

export const PayoutForm: React.FC<PayoutFormProps> = ({ className }) => {
    const [balance, setBalance] = useState(0);
    const [bankInfo, setBankInfo] = useState<any>(null);
    const [amount, setAmount] = useState(50000);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(true);
    const [successModal, setSuccessModal] = useState<WithdrawResult | null>(null);
    const [payoutsEnabled, setPayoutsEnabled] = useState(true);

    // Dynamic fees from platform_configs (fetched via /api/wallet/stats)
    const [fee, setFee] = useState(5000);
    const [minWithdrawal, setMinWithdrawal] = useState(50000);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletRes, bankRes] = await Promise.all([
                    fetch('/api/wallet/stats'),
                    fetch('/api/bank-accounts')
                ]);

                if (walletRes.ok) {
                    const wallet = await walletRes.json();
                    setBalance(wallet.available);
                    // Set dynamic fees from platform config
                    if (wallet.payout_fee) setFee(wallet.payout_fee);
                    if (wallet.min_withdrawal) setMinWithdrawal(wallet.min_withdrawal);
                }
                if (bankRes.ok) {
                    const bank = await bankRes.json();
                    if (bank.exists) {
                        setBankInfo(bank.details);
                    }
                }
                const publicRes = await fetch('/api/public/settings');
                if (publicRes.ok) {
                    const publicSettings = await publicRes.json();
                    setPayoutsEnabled(publicSettings.payouts_enabled !== false);
                }
            } catch (err) {
                console.error('Failed to fetch payout data:', err);
            } finally {
                setInitLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleWithdraw = async () => {
        setError(null);
        setLoading(true);

        if (!bankInfo) {
            setError("Harap daftarkan rekening bank terlebih dahulu di Pengaturan.");
            setLoading(false);
            return;
        }

        if (amount < minWithdrawal) {
            setError(`Minimal penarikan adalah Rp ${minWithdrawal.toLocaleString('id-ID')}`);
            setLoading(false);
            return;
        }

        if (amount > balance) {
            setError("Saldo tidak mencukupi untuk penarikan.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/wallet/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amount,
                    bankAccountId: bankInfo.id
                })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Gagal memproses penarikan');
            }

            // Update balance dari response server (sudah dikurangi)
            if (data.newBalance !== undefined) {
                setBalance(data.newBalance);
            } else {
                setBalance(prev => prev - amount);
            }

            setSuccessModal(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (initLoading) {
        return (
            <div className={cn("max-w-xl mx-auto bg-white p-20 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4", className)}>
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-primary uppercase tracking-widest text-xs">Authenticating Wallet...</p>
            </div>
        );
    }

    return (
        <>
            <div className={cn("max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm", className)}>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <WalletIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Withdraw Balance</h3>
                </div>

                <div className="bg-amber-50 rounded-2xl mb-8 p-6 border border-amber-100/50">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-amber-900 font-black uppercase tracking-widest leading-none">Available Balance</span>
                        <span className="text-2xl font-black text-amber-900 tracking-tighter">
                            Rp {balance.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Destination Bank</label>
                        <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-primary/20 transition-all cursor-pointer group shadow-sm">
                            {bankInfo ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-7 bg-white border border-slate-100 rounded-lg flex items-center justify-center font-black text-[9px] text-slate-900 shadow-sm uppercase">
                                        {bankInfo.bank_name}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{bankInfo.bank_name}</p>
                                        <p className="text-[10px] font-medium text-slate-400 tracking-widest">{bankInfo.account_number} • {bankInfo.account_name}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-rose-500">error</span>
                                    <p className="text-xs font-bold text-rose-500 uppercase tracking-tight">Belum ada rekening bank</p>
                                </div>
                            )}
                            <a href="/bank-info" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline underline-offset-4 pr-1">Manage</a>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Withdrawal Amount</label>
                        <div className="relative group">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-primary transition-colors text-lg">Rp</span>
                            <input
                                type="number"
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white text-xl font-black text-slate-900 outline-none transition-all uppercase tracking-tight shadow-sm"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                            />
                        </div>
                        <div className="flex justify-between mt-3 px-1">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">MIN: RP {minWithdrawal.toLocaleString('id-ID')}</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">FEE: RP {fee.toLocaleString('id-ID')}</span>
                        </div>
                        {error && (
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl leading-relaxed">
                                {error}
                            </p>
                        )}
                    </div>

                    {payoutsEnabled ? (
                        <Button
                            variant="primary"
                            className="w-full h-16 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-black uppercase text-[11px] tracking-[0.3em] mt-6"
                            onClick={handleWithdraw}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Initiate Withdrawal'}
                        </Button>
                    ) : (
                        <div className="mt-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                            <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-xl">pause_circle</span>
                            </div>
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Penarikan Ditangguhkan</h4>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-tight">
                                Maaf, proses penarikan saldo sedang ditangguhkan sementara untuk pemeliharaan sistem. Silakan coba lagi nanti.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Withdrawal Result Modal */}
            {successModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            {successModal.status === 'completed' ? (
                                <>
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-100 mx-auto mb-4">
                                        <CheckCircleIcon className="w-9 h-9 text-emerald-500" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Transfer Berhasil!</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                        Penarikan sebesar <strong className="text-slate-900">Rp {successModal.amount.toLocaleString('id-ID')}</strong> berhasil ditransfer ke<br />
                                        <strong className="text-emerald-600">{successModal.accountName}</strong>
                                    </p>
                                    <div className="mt-4 p-3 bg-slate-50 rounded-xl text-left space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Nominal Penarikan</span>
                                            <span className="font-bold text-slate-700">Rp {successModal.amount.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Biaya Transfer</span>
                                            <span className="font-bold text-rose-500">- Rp {(successModal.fee || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between text-xs border-t border-slate-200 pt-1 mt-1">
                                            <span className="text-slate-900 font-black">Dana Diterima</span>
                                            <span className="font-black text-emerald-600">Rp {(successModal.netTransfer || (successModal.amount - (successModal.fee || 0))).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </>
                            ) : successModal.status === 'pending' ? (
                                <>
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-amber-100 mx-auto mb-4">
                                        <ClockIcon className="w-9 h-9 text-amber-500" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Permintaan Dikirim!</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                        Penarikan sebesar <strong className="text-slate-900">Rp {successModal.amount.toLocaleString('id-ID')}</strong> sedang menunggu persetujuan Admin.
                                    </p>
                                    <div className="mt-4 p-3 bg-slate-50 rounded-xl text-left space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Nominal Penarikan</span>
                                            <span className="font-bold text-slate-700">Rp {successModal.amount.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Biaya Transfer</span>
                                            <span className="font-bold text-rose-500">- Rp {(successModal.fee || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between text-xs border-t border-slate-200 pt-1 mt-1">
                                            <span className="text-slate-900 font-black">Dana Akan Diterima</span>
                                            <span className="font-black text-amber-600">Rp {(successModal.netTransfer || (successModal.amount - (successModal.fee || 0))).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium mt-3 leading-relaxed">
                                        Admin akan memproses transfer secara manual. Status akan diperbarui setelah bukti transfer diunggah.
                                    </p>
                                </>
                            ) : successModal.status === 'processing' ? (
                                <>
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-amber-100 mx-auto mb-4">
                                        <ClockIcon className="w-9 h-9 text-amber-500" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Permintaan Sedang Diproses</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                        Penarikan sebesar <strong className="text-slate-900">Rp {successModal.amount.toLocaleString('id-ID')}</strong> sedang diproses ke<br />
                                        <strong className="text-amber-600">{successModal.accountName}</strong>
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-3 leading-relaxed">
                                        Admin sedang memproses transfer Anda secara manual. Status akan diperbarui setelah bukti transfer diunggah.
                                    </p>
                                    <div className="mt-4 p-3 bg-slate-50 rounded-xl text-left space-y-1">
                                         <div className="flex justify-between text-xs">
                                             <span className="text-slate-400">Nominal Penarikan</span>
                                             <span className="font-bold text-slate-700">Rp {successModal.amount.toLocaleString('id-ID')}</span>
                                         </div>
                                         <div className="flex justify-between text-xs">
                                             <span className="text-slate-400">Biaya Transfer</span>
                                             <span className="font-bold text-rose-500">- Rp {(successModal.fee || 0).toLocaleString('id-ID')}</span>
                                         </div>
                                         <div className="flex justify-between text-xs border-t border-slate-200 pt-1 mt-1">
                                             <span className="text-slate-900 font-black">Dana Diterima</span>
                                             <span className="font-black text-amber-600">Rp {(successModal.netTransfer || (successModal.amount - (successModal.fee || 0))).toLocaleString('id-ID')}</span>
                                         </div>
                                     </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-rose-100 mx-auto mb-4">
                                        <ExclamationCircleIcon className="w-9 h-9 text-rose-500" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Transfer Gagal</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                        {successModal.error || 'Transfer gagal diproses. Saldo telah dikembalikan.'}
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-center">
                            <button
                                className={`px-8 py-2.5 rounded-xl font-black text-white shadow-lg transition-all text-[10px] uppercase tracking-widest ${successModal.status === 'completed'
                                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                                        : successModal.status === 'pending'
                                            ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                                            : successModal.status === 'processing'
                                                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                                                : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                                    }`}
                                onClick={() => {
                                    setSuccessModal(null);
                                    // Redirect to wallet page to see updated balance
                                    window.location.href = '/wallet';
                                }}
                            >
                                OK, Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PayoutForm;
