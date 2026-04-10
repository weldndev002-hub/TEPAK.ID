import React from 'react';
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
import { CustomerDetailModal } from './CustomerDetailModal';
import { Input } from '../ui/Input';

export const CustomersDashboard = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [toast, setToast] = React.useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };

    const customersData = [
        { id: '1', name: 'Michael Smith', email: 'michael.smith@gmail.com', totalSpend: '$245.00', transactions: '12', lastOrder: 'Oct 14, 2023', location: 'Jakarta', status: 'Active' },
        { id: '2', name: 'Sarah Johnson', email: 'sarah.j@outlook.com', totalSpend: '$112.00', transactions: '5', lastOrder: 'Oct 12, 2023', location: 'Bandung', status: 'Pending' },
        { id: '3', name: 'Andrew Davis', email: 'andrew.d@tepak.id', totalSpend: '$89.00', transactions: '3', lastOrder: 'Oct 10, 2023', location: 'Surabaya', status: 'Active' },
        { id: '4', name: 'Linda Chen', email: 'linda.chen@gmail.com', totalSpend: '$456.00', transactions: '28', lastOrder: 'Oct 08, 2023', location: 'Medan', status: 'Active' },
    ];

    const filteredCustomers = customersData.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExportCSV = () => {
        const headers = ["ID", "Name", "Email", "Total Spend", "Transactions", "Last Order", "Location", "Status"];
        const rows = filteredCustomers.map(c => [c.id, c.name, c.email, c.totalSpend, c.transactions, c.lastOrder, c.location, c.status]);
        
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "tepak_customers_export.csv");
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
        <div className="flex-1 p-8 min-h-screen bg-slate-50 relative">
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
                    <FilterTabs tabs={filterTabsData} activeTab="all" />
                    
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
                        <span className="text-emerald-500 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">+12%</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Customers</p>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">128</h3>
                    </div>
                </Card>

                {/* Total LTV */}
                <Card className="p-8 shadow-sm flex flex-col justify-between h-44 border-slate-100 rounded-3xl">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <BanknotesIcon className="w-6 h-6" />
                        </div>
                        <span className="text-emerald-500 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">+8.4%</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total LTV</p>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">$24.5<span className="text-xl">k</span></h3>
                    </div>
                </Card>

                {/* Avg. Belanja */}
                <Card className="p-8 shadow-sm flex flex-col justify-between h-44 border-slate-100 rounded-3xl">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                            <ChartBarIcon className="w-6 h-6" />
                        </div>
                        <span className="text-rose-500 text-[10px] font-black bg-rose-50 px-2 py-1 rounded-lg uppercase tracking-wider">-2.1%</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Avg. Spend</p>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">$191</h3>
                    </div>
                </Card>
            </div>

            {/* Customer Table Block */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-50 gap-4">
                    <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Recent Customers List</h4>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Input 
                            placeholder="Search name, location, or email..." 
                            className="h-10 text-xs w-full sm:w-64"
                            iconLeft={MagnifyingGlassIcon}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                                <FunnelIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30">
                                <TableHead className="px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Customer</TableHead>
                                <TableHead className="px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Total Spend</TableHead>
                                <TableHead className="px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] text-center">Transactions</TableHead>
                                <TableHead className="px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Last Order</TableHead>
                                <TableHead className="px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                                <TableRow key={customer.id} className="cursor-pointer group hover:bg-slate-50/50 transition-colors">
                                    <TableCell 
                                        className="px-8 py-5"
                                        onClick={() => {
                                            setSelectedCustomer(customer);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs text-center">
                                                {customer.name.split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors uppercase tracking-tight">{customer.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium tracking-tight uppercase">{customer.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-black text-slate-900">{customer.totalSpend}</TableCell>
                                    <TableCell className="px-8 text-center">
                                        <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase">{customer.transactions}</span>
                                    </TableCell>
                                    <TableCell className="px-8 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{customer.lastOrder}</TableCell>
                                    <TableCell className="px-8 text-right">
                                        <button 
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                setIsModalOpen(true);
                                            }}
                                            className="text-[10px] font-black text-primary hover:underline transition-all uppercase tracking-widest"
                                        >
                                            VIEW DETAIL
                                        </button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <FaceFrownIcon className="w-12 h-12" />
                                            <div>
                                                <p className="font-black text-slate-900 uppercase tracking-widest">Tidak ada data pelanggan ditemukan</p>
                                                <p className="text-xs font-medium uppercase mt-1">Coba kata kunci lain atau bersihkan pencarian</p>
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
                    totalPages={4} 
                    totalItems={128} 
                    itemsPerPage={32} 
                    className="bg-slate-50/30 rounded-b-3xl border-t border-slate-50"
                />
            </div>
            <CustomerDetailModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                customer={selectedCustomer}
            />
        </div>
    );
};

