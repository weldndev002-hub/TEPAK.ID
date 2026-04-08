import React from 'react';
import { cn } from '../../lib/utils';
import Input from '../ui/Input';

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
        color: 'bg-primary-container text-on-primary-container',
        orders: 12,
        ltv: 'Rp 4.250.000'
    },
    { 
        id: 2, 
        name: 'Siti Nurhaliza', 
        email: 'siti@personal.id', 
        initials: 'SN', 
        color: 'bg-secondary/10 text-secondary',
        orders: 5,
        ltv: 'Rp 1.200.000'
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
        
        {/* Header Action Bar */}
        <div className="flex justify-between items-end mb-4 sm:flex-row flex-col gap-4 sm:gap-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary hidden md:block opacity-0">...</h2>
            <div className="relative w-full sm:w-auto mt-auto">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
                <input 
                    className="w-full sm:w-64 pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                    placeholder="Search customers..." 
                    type="text" 
                />
            </div>
        </div>

        {/* Table Body */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">LTV</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {customers.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold", c.color)}>
                                            {c.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 leading-tight">{c.name}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{c.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-700">{c.orders} Orders</td>
                                <td className="px-6 py-4 text-sm font-bold text-emerald-600">{c.ltv}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-xs font-bold text-primary hover:underline hover:text-amber-600 transition-colors">
                                        Lihat Detail
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
