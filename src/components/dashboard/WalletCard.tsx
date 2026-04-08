import React from 'react';

export const WalletCard: React.FC = () => {
    return (
        <div className="bg-navy-dark text-white p-8 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px] border border-navy-muted shadow-primary/10">
            <div className="relative z-10">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Dompet Tepak</p>
                <h4 className="text-4xl font-extrabold mb-1">Rp 12.850.000</h4>
                <p className="text-xs text-slate-400 italic">Available for withdrawal</p>
            </div>
            
            <div className="relative z-10 space-y-4">
                <div className="p-4 bg-navy-muted/30 backdrop-blur-sm rounded-xl text-[11px] text-slate-300 leading-relaxed border border-white/5">
                    Dana ditarik akan masuk ke rekening terdaftar dalam 1-2 hari kerja.
                </div>
                <button className="w-full bg-white text-navy-dark font-bold py-3 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all transform active:scale-95 shadow-lg">
                    Tarik Saldo
                </button>
            </div>
            
            {/* Decorative background icon */}
            <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-[12rem] text-slate-800/30 rotate-12 select-none pointer-events-none">
                account_balance_wallet
            </span>
        </div>
    );
};

export default WalletCard;
