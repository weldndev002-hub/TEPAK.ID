import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const transactions = [
    { id: 1, product: 'E-book Arch 101', buyer: 'andi.wijaya@mail.com', amount: 'Rp 150.000', status: 'SUCCESS' },
    { id: 2, product: 'Custom Presets', buyer: 'sara.smith@site.co', amount: 'Rp 225.000', status: 'PENDING' },
    { id: 3, product: 'Premium Domain', buyer: 'budi.santoso@biz.id', amount: 'Rp 450.000', status: 'SUCCESS' },
    { id: 4, product: 'Advanced Styling', buyer: 'rina.wati@design.io', amount: 'Rp 85.000', status: 'FAILED' },
];

export const TransactionTable: React.FC = () => {
    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Recent Transactions</h3>
                    <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest italic leading-none">Latest incoming payments</p>
                </div>
                <button className="px-6 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest flex items-center transition-all hover:scale-[1.05]">
                    View All <ArrowRightIcon className="w-3.5 h-3.5 ml-2" />
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#fcfdff] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">
                        <tr>
                            <th className="px-8 py-5">Produk</th>
                            <th className="px-8 py-5">Pembeli</th>
                            <th className="px-8 py-5">Jumlah</th>
                            <th className="px-8 py-5">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                                <td className="px-8 py-5 text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-primary transition-colors">{t.product}</td>
                                <td className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">{t.buyer}</td>
                                <td className="px-8 py-5 text-xs font-black text-slate-900 tracking-tighter uppercase">{t.amount}</td>
                                <td className="px-8 py-5">
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                        t.status === 'SUCCESS' ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" :
                                        t.status === 'PENDING' ? "bg-amber-50 text-amber-600 border-amber-100/50" :
                                        "bg-rose-50 text-rose-600 border-rose-100/50"
                                    )}>
                                        {t.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionTable;
