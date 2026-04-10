import React from 'react';
import { cn } from '../../lib/utils';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export interface CustomerTableProps {
  className?: string;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({ className }) => {
  const customers = [
    { 
        id: 1, 
        name: 'Aditya Rahman', 
        email: 'aditya@work.com', 
        initials: 'AR', 
        color: 'bg-primary/10 text-primary',
        orders: 12,
        ltv: 'Rp 4.250.000'
    },
    { 
        id: 2, 
        name: 'Siti Nurhaliza', 
        email: 'siti@personal.id', 
        initials: 'SN', 
        color: 'bg-amber-50 text-amber-600',
        orders: 5,
        ltv: 'Rp 1.200.000'
    }
  ];

  return (
    <div className={cn("space-y-6 ", className)}>
        
        {/* Header Action Bar */}
        <div className="flex justify-between items-center mb-6 sm:flex-row flex-col gap-6 sm:gap-0">
            <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Database Pelanggan</h2>
                <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest italic leading-none">Insight & Customer Records</p>
            </div>
            <div className="relative w-full sm:w-auto">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    className="w-full sm:w-80 pl-12 pr-6 py-4 border border-slate-50 rounded-[1.5rem] text-sm bg-white shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-slate-300 placeholder:font-bold placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest" 
                    placeholder="Cari nama atau email..." 
                    type="text" 
                />
            </div>
        </div>

        {/* Table Body */}
        <div className="bg-white rounded-[2.5rem] border border-slate-50 overflow-hidden shadow-2xl shadow-slate-900/5">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left whitespace-nowrap">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-50">
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Customer Data</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Engagement</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Lifetime Value</th>
                            <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Action Gate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {customers.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/50 transition-all duration-300 cursor-pointer group">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-5">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-110 transition-transform", c.color)}>
                                            {c.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">{c.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tight">{c.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="inline-flex items-center px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{c.orders} Orders</span>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <span className="text-sm font-black text-slate-900 tracking-tight italic">{c.ltv}</span>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <button className="text-[10px] font-black text-primary hover:bg-primary/10 px-6 py-3 rounded-xl transition-all uppercase tracking-[0.2em] border border-transparent hover:border-primary/20">
                                        View Detail
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default CustomerTable;
