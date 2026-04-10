import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
    ArrowLeftIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarDaysIcon,
    ShoppingBagIcon,
    BanknotesIcon,
    ArrowTrendingUpIcon,
    StarIcon,
    EllipsisVerticalIcon,
    ArrowDownTrayIcon,
    ChatBubbleLeftEllipsisIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export const CustomerDetailDashboard = () => {
    const [toast, setToast] = React.useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };

    const orderHistory = [
        { id: '#TPK-88210', product: 'Elite Digital Watch', date: 'Oct 12, 2023', amount: '$45.00', status: 'paid' },
        { id: '#TPK-88198', product: 'Pro Runner X1', date: 'Sep 28, 2023', amount: '$125.00', status: 'paid' },
        { id: '#TPK-88180', product: 'Studio Sound Elite', date: 'Sep 14, 2023', amount: '$89.00', status: 'expired' },
        { id: '#TPK-88155', product: 'Retro Cam Mark II', date: 'Aug 30, 2023', amount: '$210.00', status: 'paid' },
    ];

    const statusColor: Record<string, string> = {
        paid: 'bg-emerald-50 text-emerald-600',
        pending: 'bg-amber-50 text-amber-600',
        expired: 'bg-rose-50 text-rose-600',
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] relative">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold bg-emerald-500 text-white animate-in slide-in-from-right duration-300">
                    <CheckCircleIcon className="w-5 h-5 shrink-0" />
                    {toast}
                </div>
            )}
            {/* Contextual Header */}
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md flex justify-between items-center w-full px-8 py-4 shadow-[0px_20px_40px_rgba(16,27,50,0.06)] border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <a href="/customers" className="text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-lg hover:bg-slate-100">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </a>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-0.5">Customers</p>
                        <h2 className="text-xl font-extrabold text-[#162138] tracking-tight">Customer Profile</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-sm text-slate-600 transition-all"
                        onClick={() => showToast("Mengekspor data profil pelanggan...")}
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Export Data
                    </button>
                    <button 
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#465f89] hover:bg-[#344d77] rounded-xl font-bold text-sm text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                        onClick={() => showToast("Pesan telah dikirim ke pelanggan!")}
                    >
                        <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                        Send Message
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-8">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Profile Card */}
                    <Card className="border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 flex items-center justify-center text-2xl font-black flex-shrink-0 shadow-inner">
                                MS
                            </div>
                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">Michael Smith</h3>
                                    <span className="px-3 py-1 bg-blue-50 text-[#005ab4] text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-100">VIP Customer</span>
                                </div>
                                <p className="text-xs text-slate-400 font-medium mb-4">Customer since September 2023</p>
                                <div className="flex flex-wrap gap-6">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <EnvelopeIcon className="w-4 h-4" />
                                        <span className="text-xs font-medium">michael.smith@gmail.com</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <PhoneIcon className="w-4 h-4" />
                                        <span className="text-xs font-medium">+62 812-3456-7890</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <MapPinIcon className="w-4 h-4" />
                                        <span className="text-xs font-medium">Jakarta, Indonesia</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <CalendarDaysIcon className="w-4 h-4" />
                                        <span className="text-xs font-medium">Joined Sep 01, 2023</span>
                                    </div>
                                </div>
                            </div>
                            {/* Rating & Action */}
                            <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                <div className="flex items-center gap-1 text-amber-400">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <StarIcon key={s} className="w-4 h-4 fill-current" />
                                    ))}
                                    <span className="text-xs font-black text-slate-700 ml-1">5.0</span>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                                    <EllipsisVerticalIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] flex flex-col justify-between group hover:scale-[1.02] transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-[#005ab4] rounded-2xl text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    <BanknotesIcon className="w-5 h-5" />
                                </div>
                                <ArrowTrendingUpIcon className="w-5 h-5 text-blue-200" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Total Spend</p>
                                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">$245.00</h4>
                            </div>
                        </Card>

                        <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] flex flex-col justify-between group hover:scale-[1.02] transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform">
                                    <ShoppingBagIcon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">All Paid</span>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Total Orders</p>
                                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">12</h4>
                            </div>
                        </Card>

                        <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] flex flex-col justify-between group hover:scale-[1.02] transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                                    <BanknotesIcon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Avg.</span>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Avg. Order Value</p>
                                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">$20.42</h4>
                            </div>
                        </Card>
                    </div>

                    {/* Order History */}
                    <Card className="border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                <h3 className="text-base font-extrabold tracking-tight text-[#005ab4]">Purchase History</h3>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">12 Orders Total</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Order ID</th>
                                        <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Product</th>
                                        <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Date</th>
                                        <th className="px-8 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Amount</th>
                                        <th className="px-8 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Status</th>
                                        <th className="px-8 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderHistory.map((order) => (
                                        <tr key={order.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <span className="font-black text-primary text-xs uppercase tracking-tight">{order.id}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="font-black text-slate-800 text-xs uppercase tracking-tight">{order.product}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{order.date}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className="font-black text-slate-900 text-xs">{order.amount}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex justify-center">
                                                    <span className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] ${statusColor[order.status]}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <a href="/order-detail" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                                                    View →
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Notes Section */}
                    <Card className="border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                            <h3 className="text-base font-extrabold tracking-tight text-[#005ab4]">Internal Notes</h3>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                            <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                VIP customer, frequently purchases high-value items. Has expressed interest in bundle deals. Provided positive review on Mastering UI Design ebook.
                            </p>
                        </div>
                        <button className="mt-4 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                            + Add Note
                        </button>
                    </Card>

                </div>
            </main>
        </div>
    );
};
