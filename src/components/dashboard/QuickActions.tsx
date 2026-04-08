import React from 'react';
import { cn } from '../../lib/utils';

interface ActionItem {
    icon: string;
    label: string;
    color: string;
}

const actions: ActionItem[] = [
    { icon: 'link', label: 'Tambah Link', color: 'text-blue-500' },
    { icon: 'add_shopping_cart', label: 'Buat Produk', color: 'text-orange-500' },
    { icon: 'event', label: 'Buat Event', color: 'text-rose-500' },
    { icon: 'account_balance_wallet', label: 'Tarik Saldo', color: 'text-emerald-500' },
];

export const QuickActions: React.FC = () => {
    return (
        <section className="space-y-8">
            <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-6">
                {actions.map((action, i) => (
                    <button 
                        key={i}
                        className="bg-white p-8 rounded-[2.5rem] flex flex-col items-center gap-4 hover:bg-slate-900 group transition-all duration-500 border border-slate-50 shadow-sm"
                    >
                        <div className={cn(
                            "w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white/10 group-hover:rotate-12 transition-all duration-500",
                            action.color
                        )}>
                            <span className="material-symbols-outlined text-2xl group-hover:text-white">{action.icon}</span>
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest group-hover:text-white transition-colors">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* UPGRADE PROMO */}
            <div className="mt-12 bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100/50 flex flex-col md:flex-row gap-6 items-center shadow-lg shadow-amber-500/5">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-amber-600 text-3xl">rocket_launch</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h5 className="text-[12px] font-black text-amber-900 uppercase tracking-widest mb-1">Upgrade ke Pro</h5>
                    <p className="text-amber-700/70 text-xs font-medium">Buka fitur analytics mendalam dan domain kustom.</p>
                </div>
                <button className="text-amber-900 text-[10px] font-black uppercase tracking-widest underline decoration-2 underline-offset-8 hover:text-amber-600 transition-colors shrink-0">
                    Pelajari Selengkapnya
                </button>
            </div>
        </section>
    );
};

export default QuickActions;
