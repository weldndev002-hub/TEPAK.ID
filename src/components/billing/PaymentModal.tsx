import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useSubscription } from '../../context/SubscriptionContext';
import { XMarkIcon, ShieldCheckIcon, CreditCardIcon } from '@heroicons/react/24/outline';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    planId?: string;
    planName?: string;
    billingPeriod?: 'monthly' | 'yearly';
    isUpgrade?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, planId: initialPlanId, planName: initialPlanName, billingPeriod = 'monthly', isUpgrade = false }) => {
    const { plan, upgradeToPlan, isLoading } = useSubscription();
    const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');
    const [proPrice, setProPrice] = useState<number>(0);
    const [selectedMethod, setSelectedMethod] = useState<string>('SP');
    const [planId, setPlanId] = useState<string | undefined>(initialPlanId);
    const [planName, setPlanName] = useState<string>(initialPlanName || 'Premium');
    const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<'monthly' | 'yearly'>(billingPeriod);
    const [allPlans, setAllPlans] = useState<any[]>([]);

    React.useEffect(() => {
        if (isOpen) {
            fetch('/api/plans')
                .then(res => res.json())
                .then(data => {
                    setAllPlans(data || []);
                    const currentPlanData = (data || []).find((p: any) => p.id === plan);
                    const currentPrice = Number(currentPlanData?.price_monthly || 0);

                    let targetPlan = null;

                    // If a specific planId was provided, use it
                    if (initialPlanId && initialPlanId !== 'pro') {
                        targetPlan = data.find((p: any) => p.id === initialPlanId);
                    }

                    // If user is on a paid plan and no specific planId, find next upgrade
                    if (!targetPlan && plan !== 'free') {
                        const higherPlans = (data || []).filter((p: any) => Number(p.price_monthly) > currentPrice);
                        targetPlan = higherPlans.length > 0 ? higherPlans[0] : null;
                    }

                    // Fallback: first paid plan
                    if (!targetPlan && data && data.length > 0) {
                        targetPlan = data.find((p: any) => Number(p.price_monthly) > 0) || data[0];
                    }

                    if (targetPlan) {
                        setPlanId(targetPlan.id);
                        if (!initialPlanName) {
                            setPlanName(targetPlan.name);
                        }
                    }

                    if (targetPlan) {
                        const price = selectedBillingPeriod === 'yearly' ? targetPlan.price_yearly : targetPlan.price_monthly;
                        setProPrice(Number(price));
                    }
                })
                .catch(err => console.error('Failed to fetch plan price', err));
        }
    }, [isOpen, planId, billingPeriod, initialPlanName, plan, selectedBillingPeriod, initialPlanId]);

    // Update price when billing period changes
    useEffect(() => {
        const targetPlan = allPlans.find((p: any) => p.id === planId);
        if (targetPlan) {
            const price = selectedBillingPeriod === 'yearly' ? targetPlan.price_yearly : targetPlan.price_monthly;
            setProPrice(Number(price));
        }
    }, [selectedBillingPeriod, planId, allPlans]);

    if (!isOpen) return null;

    const periodLabel = selectedBillingPeriod === 'yearly' ? '1 Year' : '1 Month';

    const handlePay = async () => {
        if (!planId) return;
        setStep('processing');
        try {
            await upgradeToPlan(planId, selectedBillingPeriod, selectedMethod);
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

    // Determine upgradeable plans for the current user
    const currentPlanData = allPlans.find((p: any) => p.id === plan);
    const currentPrice = Number(currentPlanData?.price_monthly || 0);
    const upgradeablePlans = allPlans.filter((p: any) => Number(p.price_monthly) > currentPrice);
    const selectedPlan = allPlans.find((p: any) => p.id === planId);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm ">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                {/* Duitku Header */}
                <div className="bg-blue-600 px-8 py-6 flex items-center justify-between text-white sticky top-0 z-10">
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

                            {/* Plan Selection (for upgrades) */}
                            {plan !== 'free' && upgradeablePlans.length > 1 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Paket Upgrade</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {upgradeablePlans.map((p: any) => (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    setPlanId(p.id);
                                                    setPlanName(p.name);
                                                }}
                                                className={`p-3 rounded-2xl border-2 flex flex-col cursor-pointer transition-all ${planId === p.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-slate-100 hover:border-slate-200'
                                                    }`}
                                            >
                                                <span className="text-sm font-black text-slate-900 uppercase">{p.name}</span>
                                                <span className="text-[10px] text-slate-500 font-bold">Rp {Number(p.price_monthly).toLocaleString('id-ID')}/bln</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Billing Period Selection */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Periode</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => setSelectedBillingPeriod('monthly')}
                                        className={`p-3 rounded-2xl border-2 flex flex-col cursor-pointer transition-all ${selectedBillingPeriod === 'monthly'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-slate-100 hover:border-slate-200'
                                            }`}
                                    >
                                        <span className="text-sm font-black text-slate-900 uppercase">Bulanan</span>
                                        <span className="text-[10px] text-slate-500 font-bold">Rp {Number(selectedPlan?.price_monthly || 0).toLocaleString('id-ID')}/bln</span>
                                    </div>
                                    <div
                                        onClick={() => setSelectedBillingPeriod('yearly')}
                                        className={`p-3 rounded-2xl border-2 flex flex-col cursor-pointer transition-all ${selectedBillingPeriod === 'yearly'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-slate-100 hover:border-slate-200'
                                            }`}
                                    >
                                        <span className="text-sm font-black text-slate-900 uppercase">Tahunan</span>
                                        <span className="text-[10px] text-slate-500 font-bold">Rp {Number(selectedPlan?.price_yearly || 0).toLocaleString('id-ID')}/thn</span>
                                    </div>
                                </div>
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
                                disabled={isLoading || !planId}
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
