import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import { WalletIcon } from '@heroicons/react/24/outline';

export interface PayoutFormProps {
  className?: string;
}

export const PayoutForm: React.FC<PayoutFormProps> = ({ className }) => {
  const [amount, setAmount] = useState(1000000);
  const balance = 2450000;

  return (
    <div className={cn("max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm font-['Plus_Jakarta_Sans',sans-serif]", className)}>
      
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
            <div className="flex items-center gap-4">
              <div className="w-10 h-7 bg-white border border-slate-100 rounded-lg flex items-center justify-center font-black text-[9px] text-slate-900 shadow-sm">
                  BCA
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Bank Central Asia</p>
                <p className="text-[10px] font-medium text-slate-400 tracking-widest">8840****21 • BUDI S.</p>
              </div>
            </div>
            <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline underline-offset-4 pr-1">Change</button>
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
             <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">MIN: RP 50.000</span>
             <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">FEE: RP 6.500</span>
          </div>
        </div>

        <Button variant="primary" className="w-full h-16 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-black uppercase text-[11px] tracking-[0.3em] mt-6">
            Initiate Withdrawal
        </Button>
      </div>

    </div>
  );
};

export default PayoutForm;
