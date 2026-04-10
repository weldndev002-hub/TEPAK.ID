import React from 'react';
import { cn } from '../../lib/utils';
import { 
    LinkIcon, 
    ShoppingBagIcon, 
    CalendarDaysIcon, 
    WalletIcon,
    RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface ActionItem {
    icon: React.ElementType;
    label: string;
    color: string;
}

const actions: ActionItem[] = [
    { icon: LinkIcon, label: 'Tambah Link', color: 'text-blue-500' },
    { icon: ShoppingBagIcon, label: 'Buat Produk', color: 'text-orange-500' },
    { icon: CalendarDaysIcon, label: 'Buat Event', color: 'text-rose-500' },
    { icon: WalletIcon, label: 'Tarik Saldo', color: 'text-emerald-500' },
];

export const QuickActions: React.FC = () => {
    return (
        <section className="space-y-8 ">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-6">
                {actions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                        <button 
                            key={i}
                            className="bg-white p-10 rounded-[2.5rem] flex flex-col items-center gap-6 hover:bg-slate-900 group transition-all duration-500 border border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-slate-900/10"
                        >
                            <div className={cn(
                                "w-16 h-16 rounded-[1.25rem] bg-slate-50 flex items-center justify-center group-hover:bg-white/10 group-hover:rotate-12 transition-all duration-500",
                                action.color
                            )}>
                                <Icon className="w-7 h-7 group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">{action.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* UPGRADE PROMO */}
            <div className="mt-12 bg-amber-50 rounded-[3rem] p-10 border border-amber-100/50 flex flex-col md:flex-row gap-8 items-center shadow-lg shadow-amber-500/5 group/promo">
                <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm group-hover/promo:scale-110 transition-transform duration-500 border border-amber-100/30">
                    <RocketLaunchIcon className="w-10 h-10 text-amber-600" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h5 className="text-[11px] font-black text-amber-900 uppercase tracking-widest mb-1">Upgrade ke Pro</h5>
                    <p className="text-amber-700/70 text-[10px] font-black uppercase tracking-tight italic">Buka fitur analytics mendalam dan domain kustom.</p>
                </div>
                <button className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl transition-all hover:scale-[1.05]">
                    Pelajari Selengkapnya
                </button>
            </div>
        </section>
    );
};

export default QuickActions;
