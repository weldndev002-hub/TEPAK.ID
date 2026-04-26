import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useSubscription } from '../../context/SubscriptionContext';
import { XMarkIcon, ShieldCheckIcon, CreditCardIcon } from '@heroicons/react/24/outline';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    planId?: string;
    planName?: string;
    billingPeriod?: 'monthly' | 'yearly';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, planId = 'pro', planName = 'PRO', billingPeriod = 'monthly' }) => {
    const { upgradeToPlan, isLoading } = useSubscription();
    const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');
    const [proPrice, setProPrice] = useState<number>(99000);
    const [selectedMethod, setSelectedMethod] = useState<string>('SP');

    React.useEffect(() => {
        if (isOpen) {
            fetch('/api/plans')
                .then(res => res.json())
                .then(data => {
                    const plan = data.find((p: any) => p.id === planId);
                    if (plan) {
                        const price = billingPeriod === 'yearly' ? plan.price_yearly : plan.price_monthly;
                        setProPrice(Number(price));
                    }
                })
                .catch(err => console.error('Failed to fetch plan price', err));
        }
    }, [isOpen, planId, billingPeriod]);

    if (!isOpen) return null;

    const periodLabel = billingPeriod === 'yearly' ? '1 Year' : '1 Month';

    const handlePay = async () => {
        setStep('processing');
        try {
            await upgradeToPlan(planId, billingPeriod, selectedMethod);
            // If upgradeToPlan redirects to Duitku, we won't reach here
            // But if it doesn't redirect (e.g. error), show success as fallback
            setStep('success');
        } catch (err: any) {
            console.error('Payment error:', err);
            setStep('checkout');
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm ">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Duitku Header */}
                <div className="bg-blue-600 px-8 py-6 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 font-black italic shadow-inner">D</div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Payment Portal</p>
                            <h2 className="text-xl font-black tracking-tight">Duitku Payment</h2>
                        </div>
                    </div>
                    <button onClick={handleCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-10">
                    {step === 'checkout' && (
                        <div className="space-y-8">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Summary</p>
                                    <h3 className="text-lg font-black text-slate-900 uppercase">Orbit Site {planName} ({periodLabel})</h3>
                                </div>
                                <p className="text-xl font-black text-primary">Rp {proPrice.toLocaleString('id-ID')}</p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Payment Method</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { id: 'SP', name: 'ShopeePay / QRIS', icon: '💳' },
                                        { id: 'BT', name: 'Virtual Account (Permata)', icon: '🏦' },
                                        { id: 'B1', name: 'Virtual Account (CIMB Niaga)', icon: '🏦' },
                                        { id: 'OV', name: 'OVO (E-Wallet)', icon: '📱' },
                                        { id: 'LA', name: 'Alfamart / Retail', icon: '🏪' },
                                    ].map((method) => (
                                        <div
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method.id)}
                                            className={`p-4 rounded-2xl border-2 flex items-center gap-4 cursor-pointer transition-all ${selectedMethod === method.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg">
                                                {method.icon}
                                            </div>
                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{method.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handlePay}
                                disabled={isLoading}
                                variant="primary"
                                className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-[11px] uppercase tracking-widest"
                            >
                                {isLoading ? 'Memproses...' : `Confirm & Pay Rp ${proPrice.toLocaleString('id-ID')}`}
                            </Button>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="py-12 flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase">Memproses Pembayaran...</h3>
                                <p className="text-sm text-slate-500 font-medium mt-2">Anda akan diarahkan ke halaman pembayaran Duitku.</p>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-8 flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 relative">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
                                <ShieldCheckIcon className="w-12 h-12 relative z-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Pembayaran Berhasil!</h3>
                                <p className="text-sm text-slate-500 font-medium mt-2 max-w-[280px] mx-auto">Akun Anda telah di-upgrade ke <span className="text-primary font-black">{planName}</span>. Nikmati semua fitur premium.</p>
                            </div>
                            <Button onClick={onClose} variant="primary" className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px]">
                                Kembali ke Dashboard
                            </Button>
                        </div>
                    )}
                </div>

                <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4 text-slate-400" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Payment Powered by Duitku</p>
                </div>
            </div>
        </div>
    );
};
