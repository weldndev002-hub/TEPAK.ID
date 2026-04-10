import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
    XMarkIcon, 
    BanknotesIcon, 
    ShoppingBagIcon, 
    CalendarDaysIcon,
    ArrowDownTrayIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: any;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ isOpen, onClose, customer }) => {
    if (!isOpen || !customer) return null;

    const orderHistory = [
        { id: '#TPK-88210', product: 'Elite Digital Watch', date: 'Oct 12, 2023', amount: '$45.00', status: 'paid' },
        { id: '#TPK-88198', product: 'Pro Runner X1', date: 'Sep 28, 2023', amount: '$125.00', status: 'paid' },
        { id: '#TPK-88180', product: 'Studio Sound Elite', date: 'Sep 14, 2023', amount: '$89.00', status: 'expired' },
    ];

    const statusColor: Record<string, string> = {
        paid: 'pro',
        pending: 'ghost',
        expired: 'ghost',
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 ">
            <Card className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border-none">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-sm">
                            {customer.name && customer.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{customer.name}</h3>
                            <p className="text-[10px] text-slate-400 font-medium tracking-tight uppercase">{customer.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    
                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <BanknotesIcon className="w-3 h-3" /> Total LTV
                            </p>
                            <p className="text-xl font-black text-slate-900">{customer.totalSpend}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <ShoppingBagIcon className="w-3 h-3" /> Orders
                            </p>
                            <p className="text-xl font-black text-slate-900">{customer.transactions}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <CalendarDaysIcon className="w-3 h-3" /> Last Order
                            </p>
                            <p className="text-[11px] font-black text-slate-900 uppercase">{customer.lastOrder}</p>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction History</h4>
                            <button className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
                                <ArrowDownTrayIcon className="w-3 h-3" /> Export List
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {orderHistory.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                            <DocumentTextIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{order.product}</p>
                                            <p className="text-[9px] text-slate-400 font-medium tracking-tight uppercase">{order.id} • {order.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <p className="text-xs font-black text-slate-900">{order.amount}</p>
                                        <Badge variant={statusColor[order.status] as any} className="text-[8px] px-2 py-0.5 uppercase tracking-widest">
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex justify-end gap-3">
                    <Button variant="outline" className="px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-100" onClick={onClose}>
                        Close Window
                    </Button>
                </div>
            </Card>
        </div>
    );
};
