import React from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

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
      <div className={cn("bg-white p-8 rounded-2xl border border-emerald-500/20 flex flex-col items-center text-center shadow-sm", className)}>
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-emerald-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Payment Successful</h3>
        <p className="text-slate-500 mt-2 mb-6">
          Order #{invoiceId} has been confirmed. Your download is ready.
        </p>
        <Button variant="primary" className="bg-slate-900 text-white rounded-lg font-bold text-sm shadow-none hover:bg-slate-800 transition-colors px-6 py-2 h-auto">
          Download Asset
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("bg-white p-8 rounded-2xl border border-amber-500/20 flex flex-col items-center text-center shadow-sm", className)}>
      <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-amber-500 text-4xl" style={{ fontVariationSettings: "'FILL' 0" }}>
          schedule
        </span>
      </div>
      <h3 className="text-xl font-bold text-slate-900">Payment Pending</h3>
      <p className="text-slate-500 mt-2 mb-6">
        We are waiting for your payment. Please finish the process before the time limit.
      </p>
      <div className="bg-slate-50 px-4 py-2 rounded-lg font-mono text-sm border border-slate-100 font-bold text-slate-600 tracking-wide">
        EXPIRING IN <span className="text-amber-600">{timeLimit}</span>
      </div>
    </div>
  );
};

export default OrderStatus;
