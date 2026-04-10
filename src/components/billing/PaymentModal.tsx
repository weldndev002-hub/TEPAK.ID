import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useSubscription } from '../../context/SubscriptionContext';
import { XMarkIcon, ShieldCheckIcon, CreditCardIcon } from '@heroicons/react/24/outline';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
    const { addTransaction, updateTransactionStatus } = useSubscription();
    const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');
    const [activeTxId, setActiveTxId] = useState('');

    if (!isOpen) return null;

    const handlePay = () => {
        const txId = `INV-${Math.floor(Math.random() * 900000) + 100000}`;
        setActiveTxId(txId);
        addTransaction(txId, 'PRO', '99.000', 'PENDING');
        setStep('processing');

        // Simulate Webhook Delay
        setTimeout(() => {
            updateTransactionStatus(txId, 'SUCCESS');
            setStep('success');
        }, 2500);
    };

    const handleCancel = () => {
        if (step === 'checkout') {
            const txId = `INV-${Math.floor(Math.random() * 900000) + 100000}`;
            addTransaction(txId, 'PRO', '99.000', 'CANCELED');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm ">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Duitku Simulation Header */}
                <div className="bg-blue-600 px-8 py-6 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 font-black italic shadow-inner">D</div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Payment Portal</p>
                            <h2 className="text-xl font-black tracking-tight">Duitku Simulation</h2>
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
                                    <h3 className="text-lg font-black text-slate-900 uppercase">Orbit Site PRO (1 Month)</h3>
                                </div>
                                <p className="text-xl font-black text-primary">Rp 99.000</p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Payment Method</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {['QRIS / E-Wallet', 'Virtual Account (BCA/Bank)', 'Credit Card'].map((method, i) => (
                                        <div key={method} className={`p-4 rounded-2xl border-2 flex items-center gap-4 cursor-pointer transition-all ${i === 0 ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}>
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                                <CreditCardIcon className={`w-5 h-5 ${i === 0 ? 'text-primary' : 'text-slate-400'}`} />
                                            </div>
                                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{method}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button onClick={handlePay} variant="primary" className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-[11px] uppercase tracking-widest">
                                Confirm & Pay Now
                            </Button>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="py-12 flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase">Processing Payment...</h3>
                                <p className="text-sm text-slate-500 font-medium mt-2">Waiting for simulation webhook response...</p>
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
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Payment Successful!</h3>
                                <p className="text-sm text-slate-500 font-medium mt-2 max-w-[280px] mx-auto">Your account has been upgraded to <span className="text-primary font-black">PRO</span>. Enjoy all premium features.</p>
                            </div>
                            <Button onClick={onClose} variant="primary" className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px]">
                                Back to Dashboard
                            </Button>
                        </div>
                    )}
                </div>

                <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4 text-slate-400" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Payment Powered by Duitku Simulation</p>
                </div>
            </div>
        </div>
    );
};
