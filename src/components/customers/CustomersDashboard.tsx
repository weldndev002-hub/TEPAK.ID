import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Button } from '../ui/Button';
import { FilterTabs } from '../ui/FilterTabs';
import { Pagination } from '../ui/Pagination';
import { 
    ArrowDownTrayIcon, 
    UsersIcon, 
    BanknotesIcon, 
    ChartBarIcon,
    FunnelIcon,
    EllipsisVerticalIcon,
    MagnifyingGlassIcon,
    FaceFrownIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Input } from '../ui/Input';
import { useSubscription } from '../../context/SubscriptionContext';

export const CustomersDashboard = () => {
    const { hasFeature, isLoading: subLoading } = useSubscription();

    useEffect(() => {
        // Block access if feature is disabled in Admin
        if (!subLoading && !hasFeature('Customer Management')) {
            window.location.replace('/dashboard');
        }
    }, [hasFeature, subLoading]);

    const [searchTerm, setSearchTerm] = useState('');
    const [allCustomers, setAllCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('all');

    if (subLoading) {
        return (
            <div className="flex-1 px-8 pt-24 pb-12 min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!hasFeature('Customer Management')) {
        return null; // Will redirect via useEffect
    }

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        fetchCustomers(activeTab);
        fetchStats();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/orders/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchCustomers = async (filter = 'all') => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/customers?filter=${filter}`);
            if (res.ok) {
                const data = await res.json();
                setAllCustomers(data);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    const filteredCustomers = allCustomers.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteCustomer = async (id: string, name: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus pelanggan "${name}"? Data pesanan akan tetap ada namun tidak lagi terhubung ke pelanggan ini.`)) return;
        
        setIsDeleting(id);
        try {
            const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast(`Pelanggan ${name} berhasil dihapus`);
                setAllCustomers(allCustomers.filter(c => c.id !== id));
            } else {
                alert('Gagal menghapus pelanggan');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Terjadi kesalahan saat menghapus pelanggan');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleExportCSV = () => {
        const headers = ["ID", "Name", "Email", "Phone", "Location", "Joined Date", "Total Orders", "Total Spent (IDR)"];
        const rows = filteredCustomers.map(c => [
            c.id, 
            `"${c.name || ''}"`, 
            c.email, 
            `'${c.phone || ''}`, // Prepend apostrophe to prevent Excel from converting to scientific notation
            "Indonesia", 
            new Date(c.created_at).toLocaleDateString(),
            c.order_count || 0,
            c.total_spent || 0
        ]);
        
        // Use semicolon for better European/Global Excel compatibility, or comma for standard CSV
        const csvContent = headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
            
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `tepak_customers_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filterTabsData = [
        { label: 'All', value: 'all' },
        { label: 'This Month', value: 'this_month' },
        { label: '30 Days', value: '30_days' },
        { label: 'Biggest', value: 'biggest' },
    ];

    return (
        <div className="flex-1 px-8 pt-24 pb-12 min-h-screen bg-slate-50 relative">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold bg-emerald-500 text-white animate-in slide-in-from-right duration-300">
                    <CheckCircleIcon className="w-5 h-5 shrink-0" />
                    {toast}
                </div>
            )}
            {/* Header Action Area */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Crm Insights</span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Customer Management</h2>
                </div>
                <div className="flex items-center gap-3">
                    <FilterTabs 
                        tabs={filterTabsData} 
                        activeTab={activeTab} 
                        onTabChange={(val) => setActiveTab(val)}
                    />
                    
                    <Button 
                        variant="primary" 
                        className="px-5 py-2.5 rounded-xl text-[11px] font-black flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all bg-primary hover:bg-primary/90 text-white uppercase tracking-wider"
                        onClick={handleExportCSV}
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Export Excel
                    </Button>
                </div>
            </div>

            {/* Summary Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Total Pelanggan */}
                <Card className="p-8 shadow-sm flex flex-col justify-between h-44 border-slate-100 rounded-3xl">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <UsersIcon className="w-6 h-6" />
                        </div>
                        <span className="text-emerald-500 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">LIVE</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Customers</p>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{allCustomers.length}</h3>
                    </div>
                </Card>

                {/* Total LTV */}
                <Card className="p-8 shadow-sm flex flex-col justify-between h-44 border-slate-100 rounded-3xl">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <BanknotesIcon className="w-6 h-6" />
                        </div>
                        <span className="text-emerald-500 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">LTV</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Lifetime Value</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                            {stats ? formatCurrency(stats.total_revenue) : '...'}
                        </h3>
                    </div>
                </Card>

                {/* Growth Rate */}
                <Card className="p-8 shadow-sm flex flex-col justify-between h-44 border-slate-100 rounded-3xl">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                            <ChartBarIcon className="w-6 h-6" />
                        </div>
                        <span className="text-amber-500 text-[10px] font-black bg-amber-50 px-2 py-1 rounded-lg uppercase tracking-wider">HEALTH</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Successful Orders</p>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                            {stats ? stats.successful_orders : '...'}
                        </h3>
                    </div>
                </Card>
            </div>

            {/* Customer Table Block */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-50 gap-4">
                    <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Recent Customers List</h4>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Input 
                            placeholder="Search name or email..." 
                            className="h-10 text-xs w-full sm:w-64"
                            iconLeft={MagnifyingGlassIcon}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30">
                                <TableHead className="px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Customer</TableHead>
                                <TableHead className="px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Location</TableHead>
                                <TableHead className="px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Date Joined</TableHead>
                                <TableHead className="px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-20 text-center">
                                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                                <TableRow key={customer.id} className="cursor-pointer group hover:bg-slate-50/50 transition-colors">
                                    <TableCell 
                                        className="px-8 py-5"
                                        onClick={() => window.location.href = `/customer-detail?id=${customer.id}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs text-center">
                                                {customer.name?.charAt(0) || 'C'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors uppercase tracking-tight">{customer.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium tracking-tight uppercase">{customer.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-black text-slate-400 text-[10px] uppercase">Indonesia</TableCell>
                                    <TableCell className="px-8 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="px-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <a 
                                                href={`/customer-detail?id=${customer.id}`}
                                                className="text-[10px] font-black text-primary hover:underline transition-all uppercase tracking-widest"
                                            >
                                                VIEW
                                            </a>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCustomer(customer.id, customer.name);
                                                }}
                                                disabled={isDeleting === customer.id}
                                                className="text-[10px] font-black text-rose-500 hover:text-rose-700 transition-all uppercase tracking-widest disabled:opacity-50"
                                            >
                                                {isDeleting === customer.id ? '...' : 'HAPUS'}
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <FaceFrownIcon className="w-12 h-12" />
                                            <div>
                                                <p className="font-black text-slate-900 uppercase tracking-widest">Tidak ada data pelanggan ditemukan</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {/* Pagination */}
                <Pagination 
                    currentPage={1} 
                    totalPages={1} 
                    totalItems={filteredCustomers.length} 
                    itemsPerPage={50} 
                    className="bg-slate-50/30 rounded-b-3xl border-t border-slate-50"
                />
            </div>
        </div>
    );
};

