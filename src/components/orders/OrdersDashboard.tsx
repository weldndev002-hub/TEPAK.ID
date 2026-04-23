import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FilterTabs } from '../ui/FilterTabs';
// import { Pagination } from '../ui/Pagination'; // Temporarily disable if not fully implemented or needed
import { 
    ShoppingCartIcon, 
    CheckCircleIcon, 
    ClockIcon, 
    BanknotesIcon, 
    ArrowTrendingUpIcon, 
    CalendarIcon, 
    FunnelIcon, 
    BuildingLibraryIcon, 
    CreditCardIcon, 
    WalletIcon,
} from '@heroicons/react/24/outline';

const filterTabsData = [
    { label: 'Semua', value: 'all' },
    { label: 'Tersedia', value: 'success' },
    { label: 'Tunda', value: 'pending' },
    { label: 'Gagal', value: 'failed' },
];

export const OrdersDashboard = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [stats, setStats] = useState({
        total_orders: 0,
        successful_orders: 0,
        pending_orders: 0,
        total_revenue: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [ordersRes, statsRes] = await Promise.all([
                fetch('/api/orders'),
                fetch('/api/orders/stats')
            ]);
            
            if (ordersRes.ok) setOrders(await ordersRes.json());
            if (statsRes.ok) setStats(await statsRes.json());
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOrders = activeTab === 'all' 
        ? orders 
        : orders.filter(o => o.status === activeTab || (activeTab === 'success' && o.status === 'paid'));

    if (isLoading) {
        return (
            <div className="flex-1 p-10 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 px-10 pt-24 pb-12 min-h-screen bg-[#f8f9fb] ">
            {/* Breadcrumb / Section Header */}
            <div className="mb-12">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 uppercase">Pesanan Saya</h3>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none">Kelola semua pembelian produk digital Anda dalam satu tampilan.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <Card className="p-8 border-none rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:scale-[1.02] transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-primary/5 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                            <ShoppingCartIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2 leading-none">Total Pesanan</p>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{stats.total_orders}</h4>
                    </div>
                </Card>
                
                <Card className="p-8 border-none rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:scale-[1.02] transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                            <CheckCircleIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2 leading-none">Tersedia</p>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{stats.successful_orders}</h4>
                    </div>
                </Card>
                
                <Card className="p-8 border-none rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:scale-[1.02] transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                            <ClockIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2 leading-none">Tunda</p>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{stats.pending_orders}</h4>
                    </div>
                </Card>
                
                <Card className="p-8 border-none rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:scale-[1.02] transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <BanknotesIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2 leading-none">Pendapatan Bersih</p>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">Rp {stats.total_revenue.toLocaleString('id-ID')}</h4>
                    </div>
                </Card>
            </div>

            {/* Filter & Table Section */}
            <Card className="overflow-hidden border-none rounded-[3rem] shadow-sm bg-white">
                <div className="px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border-b border-slate-50 gap-6">
                    <div className="-ml-4">
                         <FilterTabs tabs={filterTabsData} activeTab={activeTab} onTabChange={setActiveTab} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="px-10 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">No. Pesanan</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">Tanggal</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">Produk</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">Pembeli</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">Metode</TableHead>
                                <TableHead className="font-black text-slate-400 uppercase tracking-[0.2em] text-[9px] text-right">Total</TableHead>
                                <TableHead className="px-10 font-black text-slate-400 uppercase tracking-[0.2em] text-[9px] text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-20">
                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Belum ada pesanan</p>
                                    </TableCell>
                                </TableRow>
                            ) : filteredOrders.map((order) => (
                                <TableRow 
                                    key={order.id} 
                                    className="cursor-pointer group hover:bg-slate-50/50 border-slate-50 transition-all border-b"
                                    onClick={() => window.location.href = `/order-detail?id=${order.id}`}
                                >
                                    <TableCell className="px-10 py-8 font-black text-primary text-xs uppercase tracking-tight">#{order.invoice_id}</TableCell>
                                    <TableCell className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shadow-sm">
                                                {order.products?.cover_url ? (
                                                    <img alt="Product" className="w-full h-full object-cover" src={order.products.cover_url} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingCartIcon className="w-6 h-6"/></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 leading-tight text-xs uppercase tracking-tight">{order.products?.title || 'Unknown Product'}</p>
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">{order.products?.type}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-slate-600 text-[10px] uppercase tracking-tight">{order.customers?.name || 'Guest'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <CreditCardIcon className="w-4 h-4" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{order.payment_method}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-black text-slate-900 text-right text-xs">Rp {Number(order.amount).toLocaleString('id-ID')}</TableCell>
                                    <TableCell className="px-10">
                                        <div className="flex justify-center">
                                            <Badge 
                                                variant={(order.status === 'success' || order.status === 'paid') ? 'success' : order.status === 'pending' ? 'warning' : 'danger'} 
                                                className="px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em]"
                                            >
                                                {order.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};

