import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { QrCodeIcon, CheckCircleIcon, ArrowPathIcon, XMarkIcon, ShieldCheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface DuitkuPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (netIncome: number) => void;
    grossAmount: number;
    orderId: string;
    productDetails: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    merchantCode: string;
    merchantKey: string;
    paymentMethod?: string;
}

type PaymentStatus = 'pending' | 'processing' | 'success' | 'error' | 'expired';

export const DuitkuPaymentModal: React.FC<DuitkuPaymentModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    grossAmount,
    orderId,
    productDetails,
    buyerName,
    buyerEmail,
    buyerPhone,
    merchantCode,
    merchantKey,
    paymentMethod = 'QRIS'
}) => {
    const [status, setStatus] = useState<PaymentStatus>('pending');
    const [qrUrl, setQrUrl] = useState<string>('');
    const [paymentUrl, setPaymentUrl] = useState<string>('');
    const [reference, setReference] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

    // Perhitungan biaya (DuitKu QRIS: 0,7%)
    const duitkuFee = Math.round(grossAmount * 0.007);
    const netIncome = grossAmount - duitkuFee;

    // Inisialisasi pembayaran saat komponen di-mount
    useEffect(() => {
        if (isOpen && status === 'pending') {
            initiatePayment();
        }
    }, [isOpen]);

    // Bersihkan polling saat unmount
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);

    const initiatePayment = async () => {
        try {
            setStatus('processing');
            setErrorMessage('');

            // Dapatkan URL return dari domain saat ini
            const returnUrl = `${window.location.origin}/orders/${orderId}`;
            const callbackUrl = `${window.location.origin}/callback`;

            // Panggil API kami untuk membuat pembayaran DuitKu
            const response = await fetch('/api/payments/duitku/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    amount: grossAmount,
                    productDetails,
                    customerName: buyerName,
                    customerEmail: buyerEmail,
                    customerPhone: buyerPhone,
                    merchantCode,
                    merchantKey,
                    paymentMethod,
                    returnUrl,
                    callbackUrl,
                    expiryPeriod: 60, // 60 menit
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Gagal membuat pembayaran');
            }

            const data = await response.json();

            if (data.statusCode !== '00') {
                throw new Error(data.statusMessage || 'Pembuatan pembayaran gagal');
            }

            // Atur detail pembayaran
            setQrUrl(data.qrUrl || '');
            setPaymentUrl(data.paymentUrl || '');
            setReference(data.reference || orderId);

            // Mulai polling untuk status pembayaran setiap 5 detik
            const interval = setInterval(() => checkPaymentStatus(), 5000);
            setPollingInterval(interval);

            setStatus('pending');
        } catch (error: any) {
            console.error('Kesalahan inisiasi pembayaran:', error);
            setErrorMessage(error.message || 'Terjadi kesalahan saat membuat pembayaran');
            setStatus('error');
        }
    };

    const checkPaymentStatus = async () => {
        try {
            const response = await fetch('/api/payments/duitku/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    amount: grossAmount,
                    merchantCode,
                    merchantKey,
                }),
            });

            if (!response.ok) {
                throw new Error('Gagal memeriksa status');
            }

            const data = await response.json();

            // Kode status: 00 = sukses, 01 = tertunda, 02 = dibatalkan, 03 = kedaluwarsa
            if (data.statusCode === '00') {
                // Pembayaran berhasil!
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                    setPollingInterval(null);
                }
                setStatus('success');
                
                // Tunggu 1,5 detik sebelum memanggil onSuccess
                setTimeout(() => {
                    onSuccess(netIncome);
                }, 1500);
            } else if (data.statusCode === '03') {
                // Pembayaran kedaluwarsa
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                    setPollingInterval(null);
                }
                setStatus('expired');
                setErrorMessage('Transaksi Anda telah kedaluwarsa. Silakan buat pembayaran baru.');
            }
        } catch (error: any) {
            console.error('Kesalahan pemeriksaan status:', error);
            // Lanjutkan polling meskipun pemeriksaan gagal
        }
    };

    const handleRetry = () => {
        setQrUrl('');
        setPaymentUrl('');
        setReference('');
        setErrorMessage('');
        initiatePayment();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <Card className="max-w-md w-full p-8 space-y-8 bg-white rounded-[2.5rem] shadow-2xl relative overflow-hidden border-none text-center">
                
                {status !== 'success' && (
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                )}

                {/* PENDING STATE */}
                {status === 'pending' && qrUrl && (
                    <>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">QRIS DUITKU</h3>
                            <p className="text-xs text-slate-500 font-medium">Scan QR di bawah untuk menyelesaikan pembayaran</p>
                        </div>

                        <div className="aspect-square bg-slate-50 rounded-3xl border-2 border-slate-100 p-8 relative group">
                            <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                                {qrUrl ? (
                                    <img
                                        src={qrUrl}
                                        alt="QRIS Code"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <>
                                        <QrCodeIcon className="w-48 h-48 text-slate-400 opacity-20" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl pointer-events-none">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm">Siap Dipindai</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pembayaran</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">Rp {grossAmount.toLocaleString('id-ID')}</p>
                                <p className="text-[10px] text-slate-500 font-medium mt-2">Referensi: {reference}</p>
                            </div>

                            <div className="flex gap-2">
                                {paymentUrl && (
                                    <Button
                                        as="a"
                                        href={paymentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-6 rounded-2xl bg-secondary text-white font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-secondary/20"
                                    >
                                        Bayar Sekarang → 
                                    </Button>
                                )}
                                <Button
                                    onClick={handleRetry}
                                    variant="ghost"
                                    className="flex-1 py-6 rounded-2xl border-2 border-slate-200 text-slate-600 font-black uppercase text-[11px] tracking-widest hover:bg-slate-50"
                                >
                                    Refresh QR
                                </Button>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-xl flex gap-2">
                            <ShieldCheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                                Pembayaran diproses melalui DuitKu yang aman dan terpercaya. Transaksi ini berlaku selama 60 menit.
                            </p>
                        </div>
                    </>
                )}

                {/* PROCESSING STATE */}
                {status === 'processing' && !qrUrl && (
                    <div className="py-12 space-y-6">
                        <ArrowPathIcon className="w-16 h-16 text-primary animate-spin mx-auto" />
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mempersiapkan...</h3>
                            <p className="text-xs text-slate-500 font-medium">Tunggu sebentar, kami sedang membuat kode pembayaran Anda</p>
                        </div>
                    </div>
                )}

                {/* SUCCESS STATE */}
                {status === 'success' && (
                    <div className="py-12 space-y-6 animate-in fade-in duration-300">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto animate-bounce">
                            <CheckCircleIcon className="w-12 h-12 text-emerald-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-emerald-600 uppercase tracking-tight">Pembayaran Berhasil!</h3>
                            <p className="text-xs text-slate-500 font-medium">Pesanan Anda sedang diproses. Link akses akan dikirim ke email Anda segera.</p>
                        </div>
                    </div>
                )}

                {/* ERROR STATE */}
                {status === 'error' && (
                    <div className="py-12 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
                            <ExclamationCircleIcon className="w-12 h-12 text-rose-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-rose-600 uppercase tracking-tight">Terjadi Kesalahan</h3>
                            <p className="text-xs text-slate-600 font-medium">{errorMessage}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleRetry}
                                className="flex-1 py-6 rounded-2xl bg-primary text-white font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Coba Lagi
                            </Button>
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                className="flex-1 py-6 rounded-2xl border-2 border-slate-200 text-slate-600 font-black uppercase text-[11px] tracking-widest"
                            >
                                Batal
                            </Button>
                        </div>
                    </div>
                )}

                {/* EXPIRED STATE */}
                {status === 'expired' && (
                    <div className="py-12 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                            <ExclamationCircleIcon className="w-12 h-12 text-amber-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-amber-600 uppercase tracking-tight">Pembayaran Kedaluwarsa</h3>
                            <p className="text-xs text-slate-600 font-medium">{errorMessage}</p>
                        </div>
                        <Button
                            onClick={handleRetry}
                            className="w-full py-6 rounded-2xl bg-primary text-white font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Buat Pembayaran Baru
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DuitkuPaymentModal;
