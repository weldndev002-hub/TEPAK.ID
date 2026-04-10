import React from 'react';
import { WalletIcon } from '@heroicons/react/24/outline';

export const WalletCard: React.FC = () => {
    return (
        <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[360px] border border-white/5 shadow-primary/10 ">
            <div className="relative z-10">
                <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-3">Dompet Tepak</p>
                <h4 className="text-4xl lg:text-5xl font-black mb-2 tracking-tighter uppercase tabular-nums">Rp 12,850,000</h4>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic opacity-80">Available for withdrawal</p>
            </div>
            
            <div className="relative z-10 space-y-6">
                <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl text-[10px] font-bold text-slate-300 leading-relaxed border border-white/10 uppercase tracking-tight">
                    Dana ditarik akan masuk ke rekening terdaftar dalam <span className="text-primary">1-2 hari kerja</span>.
                </div>
                <button className="w-full bg-primary text-white font-black py-5 rounded-[1.25rem] hover:bg-primary/90 transition-all transform active:scale-95 shadow-2xl shadow-primary/20 uppercase tracking-[0.2em] text-[10px]">
                    Tarik Saldo
                </button>
            </div>
            
            {/* Decorative background icon */}
            <WalletIcon className="absolute -right-20 -bottom-20 w-80 h-80 text-white/[0.03] rotate-12 select-none pointer-events-none" />
        </div>
    );
};

export default WalletCard;
