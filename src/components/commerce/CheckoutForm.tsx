import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import Input from '../ui/Input';
import { 
    QrCodeIcon, 
    BuildingLibraryIcon, 
    WalletIcon, 
    CheckCircleIcon 
} from '@heroicons/react/24/outline';

export interface CheckoutFormProps {
  className?: string;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ className }) => {
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va' | 'ewallet'>('qris');

  const PaymentOption = ({ 
      id, icon: Icon, label 
  }: { id: 'qris' | 'va' | 'ewallet'; icon: any; label: string }) => {
      const isSelected = paymentMethod === id;
      return (
        <label 
            className={cn(
                "block group cursor-pointer border-2 p-6 rounded-2xl transition-all duration-300",
                isSelected 
                    ? "border-primary bg-amber-50 shadow-xl shadow-amber-500/5 scale-[1.02]" 
                    : "border-slate-50 hover:border-slate-200 bg-white"
            )}
        >
            <input 
                type="radio" 
                name="payment" 
                className="hidden" 
                checked={isSelected}
                onChange={() => setPaymentMethod(id)}
            />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                        isSelected ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:text-slate-600"
                    )}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <span className={cn("text-xs font-black uppercase tracking-widest", isSelected ? "text-slate-900" : "text-slate-500")}>{label}</span>
                </div>
                <div className={cn(
                    "w-5 h-5 rounded-full border-2 transition-all",
                    isSelected ? "border-primary bg-primary ring-4 ring-primary/10" : "border-slate-200 bg-white"
                )}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full m-auto mt-1"></div>}
                </div>
            </div>
        </label>
      );
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-12 font-['Plus_Jakarta_Sans',sans-serif]", className)}>
        
        {/* Left: Form Area */}
        <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-50">
                <header className="mb-10">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Payment Info</h3>
                    <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest italic leading-none">Secure transaction gateway</p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <PaymentOption id="qris" icon={QrCodeIcon} label="QRIS" />
                    <PaymentOption id="va" icon={BuildingLibraryIcon} label="Virtual Account" />
                    <PaymentOption id="ewallet" icon={WalletIcon} label="E-Wallet" />
                </div>
                
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Full Name</label>
                        <Input 
                            defaultValue="Budi Santoso" 
                            className="h-16 rounded-2xl bg-slate-50/50 border-slate-100 shadow-inner"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Email Address</label>
                        <Input 
                            type="email" 
                            defaultValue="budi@example.com" 
                            className="h-16 rounded-2xl bg-slate-50/50 border-slate-100 shadow-inner"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-900/5 border border-slate-50 sticky top-24">
                <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tighter uppercase leading-none border-b border-slate-50 pb-6">Summary</h3>
                
                <div className="flex items-center gap-6 mb-8 group">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-50 group-hover:scale-105 transition-transform">
                        <img 
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjsu1iNETY3zY7uaFLgTrFsmycwYpOVn2YlNxHoR1nqKC5tzQa2GXrmQ2b297p-GsB04lppiZx87-YLTmG_NtfJfDtTuqlxSADXea0WnMJp0WUwg1ZIATMyD-j29rVgTiqCR7GyjCLaV8gkuUTXxIeQ7pq8Hc9yX65cY06I7SFL6MKpX6HwDr8JG6o0QfsCwPjmNrHfGuCM_AwEjHrwuKroJBH7odFjIi8Jb370xiY_j6_u4Ns1-XlQx7JMGV1nEdHaQR5XhAkoycR" 
                            alt="Product" 
                        />
                    </div>
                    <div>
                        <p className="font-black text-xs text-slate-900 uppercase tracking-tight leading-tight">Mastering UI Design e-Book</p>
                        <p className="text-primary font-black mt-2 text-sm tracking-widest">Rp 150.000</p>
                    </div>
                </div>
                
                <div className="space-y-4 py-6 border-y border-slate-50">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                        <span className="text-xs font-black text-slate-900">Rp 150.000</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax (11%)</span>
                        <span className="text-xs font-black text-slate-900">Rp 16.500</span>
                    </div>
                </div>
                
                <div className="flex justify-between items-center py-8">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Total Pay</span>
                    <span className="font-black text-2xl text-primary tracking-tighter italic">Rp 166.500</span>
                </div>
                
                <button className="w-full h-16 bg-gradient-to-br from-primary to-amber-600 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                    Checkout Now
                </button>

                <div className="mt-8 flex items-center justify-center gap-2 opacity-30 italic">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Encrypted Payment</span>
                </div>
            </div>
        </div>

    </div>
  );
};

export default CheckoutForm;
