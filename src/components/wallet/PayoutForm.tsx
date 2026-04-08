import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

export interface PayoutFormProps {
  className?: string;
}

export const PayoutForm: React.FC<PayoutFormProps> = ({ className }) => {
  const [amount, setAmount] = useState(1000000);
  const balance = 2450000;

  return (
    <div className={cn("max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-100 shadow-sm", className)}>
      
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>
            account_balance_wallet
        </span>
        <h3 className="text-xl font-bold text-slate-900">Tarik Saldo</h3>
      </div>

      <div className="bg-amber-50 p-4 rounded-xl mb-6 border border-amber-100/50">
        <div className="flex justify-between items-center">
          <span className="text-sm text-amber-900 font-medium">Available Balance</span>
          <span className="text-xl font-black text-amber-900">
            Rp {balance.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-600 mb-2">Pilih Bank Tujuan</label>
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-11 h-7 bg-slate-200 rounded flex items-center justify-center font-bold text-[10px] text-slate-600">
                  BCA
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Bank Central Asia</p>
                <p className="text-xs text-slate-500">8840****21 - Budi S.</p>
              </div>
            </div>
            <button className="text-primary text-sm font-bold hover:underline">Ubah</button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-600 mb-2">Nominal Penarikan</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-primary transition-colors">Rp</span>
            <input 
                type="number" 
                className="w-full pl-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-lg font-bold text-slate-900 outline-none transition-all" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
             <span>MINIMAL: Rp 50.000</span>
             <span>BIAYA: Rp 6.500</span>
          </div>
        </div>

        <Button variant="primary" className="w-full py-4 rounded-xl text-base shadow-md mt-4">
            Tarik Saldo Sekarang
        </Button>
      </div>

    </div>
  );
};

export default PayoutForm;
