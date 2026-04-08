import React from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

export interface OrderStatusProps {
  status: 'success' | 'pending';
  invoiceId?: string;
  timeLimit?: string;
  className?: string;
}

export const OrderStatus: React.FC<OrderStatusProps> = ({ 
  status, invoiceId = "INV-2023901", timeLimit = "01:59:45", className 
}) => {
  if (status === 'success') {
    return (
      <div className={cn("bg-white p-12 rounded-[2.5rem] border border-slate-50 flex flex-col items-center text-center shadow-2xl shadow-slate-900/5 font-['Plus_Jakarta_Sans',sans-serif]", className)}>
        <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-8 border border-emerald-100/50 shadow-inner group">
          <CheckCircleIcon className="text-emerald-500 w-12 h-12 group-hover:scale-110 transition-transform duration-500" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Payment Successful</h3>
        <p className="text-[11px] text-slate-400 mt-4 mb-10 font-black uppercase tracking-widest italic opacity-70">
            Order <span className="text-slate-900">#{invoiceId}</span> confirmed. <br/> Your assets are ready for deployment.
        </p>
        <Button variant="primary" className="bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 px-10 py-4 h-auto active:scale-95 transition-all">
          Download Assets
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("bg-white p-12 rounded-[2.5rem] border border-slate-50 flex flex-col items-center text-center shadow-2xl shadow-slate-900/5 font-['Plus_Jakarta_Sans',sans-serif]", className)}>
      <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mb-8 border border-amber-100/50 shadow-inner group">
        <ClockIcon className="text-amber-500 w-12 h-12 group-hover:rotate-12 transition-transform duration-500" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Payment Pending</h3>
      <p className="text-[11px] text-slate-400 mt-4 mb-10 font-black uppercase tracking-widest italic opacity-70">
        Waiting for internal gateway confirmation. <br/> Please finish before the gate closes.
      </p>
      <div className="bg-slate-50 px-8 py-4 rounded-2xl font-black text-[11px] border border-slate-100 text-slate-600 tracking-[0.3em] shadow-inner uppercase italic">
        EXPIRING IN <span className="text-amber-600 ml-2 animate-pulse">{timeLimit}</span>
      </div>
    </div>
  );
};

export default OrderStatus;
