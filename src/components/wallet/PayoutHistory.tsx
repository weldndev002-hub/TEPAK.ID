import React from 'react';
import { cn } from '../../lib/utils';
import Badge from '../ui/Badge';

export interface PayoutHistoryProps {
  className?: string;
}

export const PayoutHistory: React.FC<PayoutHistoryProps> = ({ className }) => {
  const payouts = [
      { id: 'WD-99212', amount: 'Rp 1.000.000', bank: 'BCA (****421)', status: 'success', date: '24 Mei 2023' },
      { id: 'WD-99211', amount: 'Rp 500.000', bank: 'Mandiri (****119)', status: 'pending', date: '25 Mei 2023' },
      { id: 'WD-99210', amount: 'Rp 2.000.000', bank: 'BCA (****421)', status: 'failed', date: '22 Mei 2023' },
  ];

  return (
    <div className={cn("bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm", className)}>
        <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bank</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {payouts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-slate-600">{p.id}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">{p.amount}</td>
                            <td className="px-6 py-4 text-sm text-slate-700">{p.bank}</td>
                            <td className="px-6 py-4">
                                <Badge 
                                    variant={
                                        p.status === 'success' ? 'success' : 
                                        p.status === 'pending' ? 'pending' : 'failed'
                                    }
                                >
                                    {p.status === 'success' ? 'Sukses' : p.status === 'pending' ? 'Pending' : 'Gagal'}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400 text-right">{p.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default PayoutHistory;
