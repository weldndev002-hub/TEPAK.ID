import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import Input from '../ui/Input';

export interface CheckoutFormProps {
  className?: string;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ className }) => {
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va' | 'ewallet'>('qris');

  const PaymentOption = ({ 
      id, icon, label 
  }: { id: 'qris' | 'va' | 'ewallet'; icon: string; label: string }) => {
      const isSelected = paymentMethod === id;
      return (
        <label 
            className={cn(
                "block group cursor-pointer border-2 p-4 rounded-xl transition-all",
                isSelected 
                    ? "border-primary bg-amber-50" 
                    : "border-slate-100 hover:border-primary/40 bg-white"
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
                <div className="flex items-center gap-3">
                    <span className={cn(
                        "material-symbols-outlined",
                        isSelected ? "text-primary" : "text-slate-400"
                    )}>{icon}</span>
                    <span className={cn("font-bold", isSelected ? "text-slate-900" : "text-slate-600")}>{label}</span>
                </div>
                <div className={cn(
                    "w-4 h-4 rounded-full border-2",
                    isSelected ? "border-primary bg-primary ring-2 ring-white inset-ring" : "border-slate-200 bg-white"
                )}></div>
            </div>
        </label>
      );
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-8", className)}>
        
        {/* Left: Form Area */}
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Payment Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <PaymentOption id="qris" icon="qr_code_2" label="QRIS" />
                    <PaymentOption id="va" icon="account_balance" label="Virtual Account" />
                    <PaymentOption id="ewallet" icon="account_balance_wallet" label="E-Wallet" />
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                        <Input defaultValue="Budi Santoso" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                        <Input type="email" defaultValue="budi@example.com" />
                    </div>
                </div>
            </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h3>
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                        <img 
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjsu1iNETY3zY7uaFLgTrFsmycwYpOVn2YlNxHoR1nqKC5tzQa2GXrmQ2b297p-GsB04lppiZx87-YLTmG_NtfJfDtTuqlxSADXea0WnMJp0WUwg1ZIATMyD-j29rVgTiqCR7GyjCLaV8gkuUTXxIeQ7pq8Hc9yX65cY06I7SFL6MKpX6HwDr8JG6o0QfsCwPjmNrHfGuCM_AwEjHrwuKroJBH7odFjIi8Jb370xiY_j6_u4Ns1-XlQx7JMGV1nEdHaQR5XhAkoycR" 
                            alt="Product" 
                        />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-slate-900 leading-tight">Mastering UI Design e-Book</p>
                        <p className="text-primary font-bold mt-1">Rp 150.000</p>
                    </div>
                </div>
                
                <div className="space-y-3 py-4 border-y border-slate-100 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-medium">Rp 150.000</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Tax (11%)</span>
                        <span className="font-medium">Rp 16.500</span>
                    </div>
                </div>
                
                <div className="flex justify-between py-6">
                    <span className="font-bold text-slate-900">Total Pay</span>
                    <span className="font-black text-xl text-primary">Rp 166.500</span>
                </div>
                
                <button className="w-full bg-gradient-to-br from-primary to-amber-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                    Checkout Now
                </button>
            </div>
        </div>

    </div>
  );
};

export default CheckoutForm;
