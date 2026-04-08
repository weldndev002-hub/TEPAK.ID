import React from 'react';

const transactions = [
    { id: 1, product: 'E-book Arch 101', buyer: 'andi.wijaya@mail.com', amount: 'Rp 150.000', status: 'SUCCESS' },
    { id: 2, product: 'Custom Presets', buyer: 'sara.smith@site.co', amount: 'Rp 225.000', status: 'PENDING' },
    { id: 3, product: 'Premium Domain', buyer: 'budi.santoso@biz.id', amount: 'Rp 450.000', status: 'SUCCESS' },
    { id: 4, product: 'Advanced Styling', buyer: 'rina.wati@design.io', amount: 'Rp 85.000', status: 'FAILED' },
];

export const TransactionTable: React.FC = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 transition-all hover:shadow-md">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-extrabold text-[#0b1c30] text-sm uppercase tracking-wider">Recent Transactions</h3>
                <button className="text-[10px] font-bold text-primary flex items-center hover:underline">
                    View All <span className="material-symbols-outlined text-[12px] ml-1">arrow_forward</span>
                </button>
            </div>
            
            <table className="w-full text-left">
                <thead className="bg-[#f8f9ff] text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <tr>
                        <th className="px-6 py-4">Produk</th>
                        <th className="px-6 py-4">Pembeli</th>
                        <th className="px-6 py-4">Jumlah</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-xs font-semibold">{t.product}</td>
                            <td className="px-6 py-4 text-xs text-slate-500">{t.buyer}</td>
                            <td className="px-6 py-4 text-xs font-bold">{t.amount}</td>
                            <td className="px-6 py-4">
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[9px] font-bold",
                                    t.status === 'SUCCESS' ? "bg-green-100 text-green-700" :
                                    t.status === 'PENDING' ? "bg-amber-100 text-amber-700" :
                                    "bg-red-100 text-red-700"
                                )}>
                                    {t.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Utility cn import inside the file for self-containment if needed, or import from ../lib/utils
import { cn } from '../../lib/utils';

export default TransactionTable;
