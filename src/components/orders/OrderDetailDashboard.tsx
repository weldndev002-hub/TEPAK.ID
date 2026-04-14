import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
    ArrowLeftIcon,
    CalendarDaysIcon,
    BuildingLibraryIcon,
    UserCircleIcon,
    DocumentTextIcon,
    PrinterIcon,
    ArrowDownTrayIcon,
    CheckCircleIcon,
    ClockIcon,
    MapPinIcon,
    EnvelopeIcon,
    PhoneIcon,
    ShoppingBagIcon,
} from '@heroicons/react/24/outline';

export const OrderDetailDashboard = () => {
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
            fetchOrder(id);
        }
    }, []);

    const fetchOrder = async (id: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] p-8 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Pesanan Tidak Ditemukan</h3>
                <p className="text-slate-500 mb-6">Pesanan yang Anda cari tidak tersedia atau ID salah.</p>
                <a href="/orders" className="px-6 py-2 bg-primary text-white rounded-xl font-bold">Kembali ke Pesanan</a>
            </div>
        );
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    const isPaid = order.status === 'paid' || order.status === 'success';

    const timeline = [
        { status: 'Order Created', time: new Date(order.created_at).toLocaleString(), done: true },
        { status: 'Payment Confirmed', time: isPaid ? 'Done' : 'Waiting...', done: isPaid },
        { status: 'Completed', time: isPaid ? 'Yes' : 'No', done: isPaid },
    ];

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
                    <a href="/orders" className="text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-lg hover:bg-slate-100">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </a>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-0.5">Orders</p>
                        <h2 className="text-xl font-extrabold text-[#162138] tracking-tight">Order #{order.invoice_id}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-sm text-slate-600 transition-all"
                        onClick={() => showToast("Mempersiapkan invoice untuk dicetak...")}
                    >
                        <PrinterIcon className="w-4 h-4" />
                        Print Invoice
                    </button>
                    <button 
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#465f89] hover:bg-[#344d77] rounded-xl font-bold text-sm text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                        onClick={() => showToast("Mengekspor data pesanan ke PDF...")}
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-8">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Status Banner */}
                    <div className={`flex items-center justify-between p-6 rounded-3xl border ${isPaid ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                {isPaid ? <CheckCircleIcon className="w-6 h-6" /> : <ClockIcon className="w-6 h-6" />}
                            </div>
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>Payment Status</p>
                                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{order.status.toUpperCase()} — {isPaid ? 'Successful' : 'Processing'}</h3>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Total Amount</p>
                            <p className="text-3xl font-black text-[#005ab4]">{formatCurrency(order.amount)}</p>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left — Order Summary */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Order Items */}
                            <Card className="border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-50 flex items-center space-x-3">
                                    <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                    <h3 className="text-base font-extrabold tracking-tight text-[#005ab4]">Order Items</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    {/* Product Row */}
                                    <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl">
                                        <img
                                            src={order.products?.cover_url || 'https://via.placeholder.com/150'}
                                            alt="Product"
                                            className="w-16 h-16 rounded-2xl object-cover shadow-sm flex-shrink-0"
                                        />
                                        <div className="flex-1">
                                            <a href={`/product-detail?id=${order.products?.id}`} className="font-black text-slate-800 text-sm uppercase tracking-tight hover:text-primary transition-colors">{order.products?.title}</a>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Digital Product • {order.products?.type || 'File'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-[#005ab4] text-base">{formatCurrency(order.amount)}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Qty: 1</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Totals */}
                                <div className="px-6 pt-2 pb-6 space-y-2 border-t border-slate-50">
                                    <div className="flex justify-between text-xs font-bold text-slate-500 py-1">
                                        <span>Subtotal</span><span>{formatCurrency(order.amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 py-1">
                                        <span>Platform Fee (0%)</span><span>IDR 0</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-black text-slate-900 py-2 border-t border-slate-100 mt-1">
                                        <span className="uppercase tracking-tight">Total</span>
                                        <span className="text-[#005ab4]">{formatCurrency(order.amount)}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Payment Information */}
                            <Card className="border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] p-8">
                                <div className="flex items-center space-x-3 mb-6">
                                    <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                    <h3 className="text-base font-extrabold tracking-tight text-[#005ab4]">Payment Information</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { label: 'Payment Method', value: order.payment_method || 'QRIS', icon: BuildingLibraryIcon },
                                        { label: 'Transaction ID', value: order.id.split('-')[0].toUpperCase(), icon: DocumentTextIcon },
                                        { label: 'Order Date', value: new Date(order.created_at).toLocaleString(), icon: CalendarDaysIcon },
                                        { label: 'Invoice ID', value: order.invoice_id, icon: ClockIcon },
                                    ].map(({ label, value, icon: Icon }) => (
                                        <div key={label} className="flex items-start gap-3">
                                            <div className="p-2 bg-slate-50 rounded-xl text-slate-400 flex-shrink-0 mt-0.5">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">{label}</p>
                                                <p className="text-sm font-bold text-slate-800">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Order Timeline */}
                            <Card className="border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] p-8">
                                <div className="flex items-center space-x-3 mb-8">
                                    <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                    <h3 className="text-base font-extrabold tracking-tight text-[#005ab4]">Order Timeline</h3>
                                </div>
                                <div className="relative pl-6">
                                    <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-100"></div>
                                    {timeline.map((item, idx) => (
                                        <div key={idx} className="relative flex items-start gap-4 mb-6 last:mb-0">
                                            <div className={`absolute -left-[1.15rem] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200'}`}>
                                                {item.done && <CheckCircleIcon className="w-3 h-3 text-white stroke-[3]" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.status}</p>
                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Right — Customer Info */}
                        <div className="space-y-8">
                            {/* Customer Card */}
                            <Card className="border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                    <h3 className="text-base font-extrabold tracking-tight text-[#005ab4]">Customer</h3>
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-lg font-black flex-shrink-0">
                                        {order.customers?.name?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 uppercase tracking-tight">{order.customers?.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Customer since {new Date(order.customers?.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
                                        <span className="text-xs font-medium">{order.customers?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                                        <span className="text-xs font-medium">{order.customers?.phone || 'No phone'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                                        <span className="text-xs font-medium">Indonesia</span>
                                    </div>
                                </div>
                                <a href={`/customer-detail?id=${order.customers?.id}`} className="mt-6 block text-center text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                                    View Customer Profile →
                                </a>
                            </Card>

                            {/* Order Meta */}
                            <Card className="border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                    <h3 className="text-base font-extrabold tracking-tight text-[#005ab4]">Order Info</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Order ID', value: `#${order.invoice_id}` },
                                        { label: 'Status', value: order.status.toUpperCase() },
                                        { label: 'Platform', value: 'Tepak.id' },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                                            <span className="text-xs font-bold text-slate-700">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};
