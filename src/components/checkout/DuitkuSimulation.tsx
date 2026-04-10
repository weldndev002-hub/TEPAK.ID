import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { QrCodeIcon, CheckCircleIcon, ArrowPathIcon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface DuitkuSimulationProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (netIncome: number) => void;
    grossAmount: number;
}

export const DuitkuSimulation: React.FC<DuitkuSimulationProps> = ({ 
    isOpen, onClose, onSuccess, grossAmount 
}) => {
    const [status, setStatus] = useState<'pending' | 'processing' | 'success'>('pending');
    
    // Fee Config
    const MDR_PERCENTAGE = 0.007; // 0.7% for QRIS
    const MERCHANT_FEE_PERCENTAGE = 0.05; // 5%

    const calculateNet = (gross: number) => {
        const mdr = Math.round(gross * MDR_PERCENTAGE);
        const merchantFee = Math.round(gross * MERCHANT_FEE_PERCENTAGE);
        return gross - mdr - merchantFee;
    };

    const handleSimulatePayment = async () => {
        setStatus('processing');
        // Simulate Webhook Delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const netIncome = calculateNet(grossAmount);
        setStatus('success');
        
        setTimeout(() => {
            onSuccess(netIncome);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm ">
            <Card className="max-w-md w-full p-8 space-y-8 bg-white rounded-[2.5rem] shadow-2xl relative overflow-hidden border-none text-center">
                
                {status !== 'success' && (
                    <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                )}

                {status === 'pending' && (
                    <>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">QRIS DUITKU</h3>
                            <p className="text-xs text-slate-500 font-medium">Scan QR di bawah untuk menyelesaikan pembayaran</p>
                        </div>

                        <div className="aspect-square bg-slate-50 rounded-3xl border-2 border-slate-100 p-8 relative group">
                            <div className="w-full h-full bg-slate-200 rounded-xl flex items-center justify-center relative overflow-hidden">
                                <QrCodeIcon className="w-48 h-48 text-slate-400 opacity-20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-inner">
                                        <img 
                                            src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=tepak_duitku_simulation" 
                                            alt="QRIS Simulation"
                                            className="w-full h-full grayscale"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl pointer-events-none">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm">Ready to Scan</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Tagihan</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">Rp {grossAmount.toLocaleString('id-ID')}</p>
                            </div>

                            <Button 
                                className="w-full py-6 rounded-2xl bg-primary text-white font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
                                onClick={handleSimulatePayment}
                            >
                                Simulate Scan (Dev)
                            </Button>
                        </div>
                    </>
                )}

                {status === 'processing' && (
                    <div className="py-12 space-y-6">
                        <ArrowPathIcon className="w-16 h-16 text-primary animate-spin mx-auto" />
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Menunggu Webhook...</h3>
                            <p className="text-xs text-slate-500 font-medium">Sistem sedang memverifikasi pembayaran Anda</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-12 space-y-8 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-600">
                            <CheckCircleIcon className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Pembayaran Sukses!</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto">
                                Pendapatan bersih sebesar <b>Rp {calculateNet(grossAmount).toLocaleString('id-ID')}</b> telah diteruskan ke Wallet Kreator.
                            </p>
                        </div>
                        <div className="pt-4 flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                <ShieldCheckIcon className="w-4 h-4" />
                                Secured by Duitku
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-8 border-t border-slate-50 flex items-center justify-center gap-4 opacity-50">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn-Kx-kPBPxU2p_uX-O4E8Yh3VYY_3UfLpxpXG9Y_B_Z_M_Z_M_Z_M_Z_M" className="h-4 grayscale" alt="Payment Method Icons" />
                </div>
            </Card>
        </div>
    );
};
