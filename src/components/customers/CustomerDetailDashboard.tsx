import React, { useState, useEffect } from 'react';
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
    const [customer, setCustomer] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', email: '', phone: '', address_text: '' });
    const [notes, setNotes] = useState('');

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
            fetchCustomer(id);
        }
    }, []);

    const fetchCustomer = async (id: string) => {
        try {
            const res = await fetch(`/api/customers/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCustomer(data);
                setEditData({ 
                    name: data.name, 
                    email: data.email, 
                    phone: data.phone || '',
                    address_text: data.address_text || ''
                });
                setNotes(data.notes || '');
            }
        } catch (error) {
            console.error('Error fetching customer:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!customer) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/customers/${customer.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });
            if (res.ok) {
                const updated = await res.json();
                setCustomer({ ...customer, ...updated });
                setIsEditing(false);
                showToast("Profil berhasil diperbarui");
            }
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!customer) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/customers/${customer.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes })
            });
            if (res.ok) {
                showToast("Catatan berhasil disimpan");
            }
        } catch (error) {
            console.error('Error saving notes:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendMessage = () => {
        if (!customer) return;
        if (customer.phone) {
            const cleanPhone = customer.phone.replace(/\D/g, '');
            const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
            window.open(`https://wa.me/${waPhone}`, '_blank');
        } else {
            window.open(`mailto:${customer.email}`, '_blank');
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] p-8 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Pelanggan Tidak Ditemukan</h3>
                <p className="text-slate-500 mb-6">Profil pelanggan tidak tersedia.</p>
                <a href="/customers" className="px-6 py-2 bg-primary text-white rounded-xl font-bold">Kembali ke Pelanggan</a>
            </div>
        );
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    const totalSpend = customer.orders?.reduce((sum: number, o: any) => sum + (o.status === 'paid' || o.status === 'success' ? Number(o.amount) : 0), 0) || 0;
    const avgOrderValue = customer.orders?.length > 0 ? totalSpend / customer.orders.length : 0;

    const statusColor: Record<string, string> = {
        paid: 'bg-emerald-50 text-emerald-600',
        success: 'bg-emerald-50 text-emerald-600',
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
                        onClick={handleSendMessage}
                    >
                        <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                        {customer.phone ? 'WhatsApp' : 'Send Email'}
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
                                {customer.name?.charAt(0) || 'C'}
                            </div>
                            {/* Info */}
                            <div className="flex-1">
                                {isEditing ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                                            <input 
                                                value={editData.name}
                                                onChange={(e) => setEditData({...editData, name: e.target.value})}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                                            <input 
                                                value={editData.email}
                                                onChange={(e) => setEditData({...editData, email: e.target.value})}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nomor Telepon</label>
                                            <input 
                                                value={editData.phone}
                                                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                                placeholder="628123xxxx"
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1 sm:col-span-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alamat Lengkap</label>
                                            <textarea 
                                                value={editData.address_text}
                                                onChange={(e) => setEditData({...editData, address_text: e.target.value})}
                                                placeholder="Masukan alamat lengkap..."
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px]"
                                            />
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <button 
                                                onClick={handleSaveProfile}
                                                disabled={isSaving}
                                                className="px-6 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                            >
                                                Simpan
                                            </button>
                                            <button 
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">{customer.name}</h3>
                                            <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                                                {totalSpend > 500000 ? 'VIP Customer' : 'Customer'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium mb-4">Customer since {new Date(customer.created_at).toLocaleDateString()}</p>
                                        <div className="flex flex-wrap gap-6">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <EnvelopeIcon className="w-4 h-4" />
                                                <span className="text-xs font-medium">{customer.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <PhoneIcon className="w-4 h-4" />
                                                <span className="text-xs font-medium">{customer.phone || 'No phone'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <MapPinIcon className="w-4 h-4" />
                                                <span className="text-xs font-medium">{customer.address_text || 'No address'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <CalendarDaysIcon className="w-4 h-4" />
                                                <span className="text-xs font-medium">Joined {new Date(customer.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* Rating & Action */}
                            <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                <div className="flex items-center gap-1 text-amber-400">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <StarIcon key={s} className="w-4 h-4 fill-current" />
                                    ))}
                                    <span className="text-xs font-black text-slate-700 ml-1">5.0</span>
                                </div>
                                <button 
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    <EllipsisVerticalIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] flex flex-col justify-between group hover:scale-[1.02] transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                    <BanknotesIcon className="w-5 h-5" />
                                </div>
                                <ArrowTrendingUpIcon className="w-5 h-5 text-blue-200" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Total Spend</p>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(totalSpend)}</h4>
                            </div>
                        </Card>

                        <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] flex flex-col justify-between group hover:scale-[1.02] transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform">
                                    <ShoppingBagIcon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{customer.orders?.length} Orders</span>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Order Count</p>
                                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{customer.orders?.length || 0}</h4>
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
                                <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(avgOrderValue)}</h4>
                            </div>
                        </Card>
                    </div>

                    {/* Order History */}
                    <Card className="border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                <h3 className="text-base font-extrabold tracking-tight text-primary">Purchase History</h3>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{customer.orders?.length || 0} Orders Total</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Invoice ID</th>
                                        <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Product</th>
                                        <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Date</th>
                                        <th className="px-8 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Amount</th>
                                        <th className="px-8 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Status</th>
                                        <th className="px-8 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customer.orders?.length > 0 ? (
                                        customer.orders.map((order: any) => (
                                            <tr key={order.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <span className="font-black text-primary text-xs uppercase tracking-tight">#{order.invoice_id}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="font-black text-slate-800 text-xs uppercase tracking-tight">{order.products?.title}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{new Date(order.created_at).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <span className="font-black text-slate-900 text-xs">{formatCurrency(order.amount)}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-center">
                                                        <span className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] ${statusColor[order.status] || 'bg-slate-100'}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <a href={`/order-detail?id=${order.id}`} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                                                        View →
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-10 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                                Belum ada riwayat pesanan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Notes Section */}
                    <Card className="border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] p-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                            <h3 className="text-base font-extrabold tracking-tight text-primary">Internal Notes</h3>
                        </div>
                        <div className="space-y-4">
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full h-32 bg-amber-50 border border-amber-100 rounded-2xl p-5 text-xs text-amber-800 font-medium leading-relaxed focus:ring-2 focus:ring-amber-200 outline-none resize-none"
                                placeholder="Tulis catatan internal untuk pelanggan ini... (Misal: Pelanggan VIP, berikan layanan prioritas)"
                            />
                            <button 
                                onClick={handleSaveNotes}
                                disabled={isSaving}
                                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline disabled:opacity-50"
                            >
                                {isSaving ? 'Menyimpan...' : 'Simpan Catatan'}
                            </button>
                        </div>
                    </Card>

                </div>
            </main>
        </div>
    );
};
