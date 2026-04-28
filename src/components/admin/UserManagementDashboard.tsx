import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';
import {
    UsersIcon,
    UserPlusIcon,
    ShieldCheckIcon,
    NoSymbolIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChartPieIcon,
    XCircleIcon,
    XMarkIcon,
    ArrowDownTrayIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    ArrowRightEndOnRectangleIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

// Reusable Warning/Confirm Modal
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    confirmStyle = 'danger',
    icon,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmLabel?: string;
    confirmStyle?: 'danger' | 'warning' | 'primary';
    icon?: React.ReactNode;
}) => {
    if (!isOpen) return null;
    const confirmClass = {
        danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
        primary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20',
    }[confirmStyle];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden">
                <div className="p-8">
                    {icon && <div className="mb-4">{icon}</div>}
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{title}</h3>
                    <div className="text-sm text-slate-500 font-medium leading-relaxed">{message}</div>
                </div>
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        className="px-5 py-2.5 rounded-xl font-black text-slate-500 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className={cn("px-6 py-2.5 rounded-xl font-black shadow-lg transition-all text-[10px] uppercase tracking-widest", confirmClass)}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const UserManagementDashboard = () => {
    const [users, setUsers] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedUser, setSelectedUser] = React.useState<any>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // Confirm modals state
    const [banConfirm, setBanConfirm] = React.useState<{ open: boolean; userId: string | null }>({ open: false, userId: null });
    const [loginAsConfirm, setLoginAsConfirm] = React.useState<{ open: boolean; user: any | null }>({ open: false, user: null });

    // Toast notification state
    const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const confirmBan = async () => {
        if (!banConfirm.userId) return;

        const target = users.find(u => u.id === banConfirm.userId);
        const isBanningNow = target ? !target.is_banned : false;

        try {
            const res = await fetch('/api/admin/users/ban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: banConfirm.userId, isBanned: isBanningNow })
            });

            if (res.ok) {
                await fetchUsers(); // Refresh the list
                showToast('success', isBanningNow ? 'Akun berhasil di-suspend' : 'Akses akun berhasil dipulihkan');
            } else {
                const errorData = await res.json();
                showToast('error', errorData.error || 'Gagal memperbarui status ban');
            }
        } catch (err) {
            console.error('Ban error:', err);
            showToast('error', 'Kesalahan jaringan. Silakan coba lagi.');
        } finally {
            setBanConfirm({ open: false, userId: null });
        }
    };

    const executeLoginAs = (user: any) => {
        localStorage.setItem('impersonating_user', JSON.stringify({ name: user.name, id: user.id }));
        document.cookie = `impersonate_user_id=${user.id}; path=/; max-age=3600; SameSite=Lax`;
        window.dispatchEvent(new Event('impersonation-change'));
        window.location.href = '/dashboard';
    };

    const handleLoginAsClick = (user: any) => {
        setLoginAsConfirm({ open: true, user });
    };

    const openDetails = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const banTarget = users.find(u => u.id === banConfirm.userId);
    const isCurrentlyBanning = banTarget ? !banTarget.is_banned : false;

    // Stats Calculation
    const proCount = users.filter(u => u.plan === 'PRO' || u.plan === 'ENTERPRISE').length;
    const proPercentage = users.length > 0 ? Math.round((proCount / users.length) * 100) : 0;
    const freePercentage = 100 - proPercentage;

    const handleExportCSV = () => {
        const headers = ['Name', 'Email', 'Username', 'Plan', 'Status', 'Joined Date'];
        const csvContent = [
            headers.join(','),
            ...users.map(user => [
                `"${user.name}"`,
                `"${user.email}"`,
                `"${user.username}"`,
                `"${user.plan}"`,
                `"${user.status}"`,
                `"${user.joined}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `tepak_users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full ">
            {/* Toast Notification */}
            {toast && (
                <div className={cn(
                    "fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold transition-all",
                    toast.type === 'success' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                )}>
                    {toast.type === 'success'
                        ? <CheckCircleIcon className="w-5 h-5 shrink-0" />
                        : <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                    }
                    {toast.message}
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Admin Control</span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Manage Users</h2>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 border-slate-100 bg-white font-black text-[11px] uppercase tracking-wider"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span>Export CSV</span>
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl mb-8 flex flex-wrap items-center gap-4 border border-slate-100">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan:</span>
                    <select className="bg-transparent border-none text-[11px] font-black uppercase focus:ring-0 cursor-pointer outline-none">
                        <option>All Plans</option>
                        <option>Standard</option>
                        <option>PRO</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status:</span>
                    <select className="bg-transparent border-none text-[11px] font-black uppercase focus:ring-0 cursor-pointer outline-none">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Banned</option>
                    </select>
                </div>
                <button className="ml-auto text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-primary transition-colors">Reset Filter</button>
            </div>

            {/* User Table Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="bg-slate-50/30">
                                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Transacted</TableHead>
                                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Users...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-100 font-black text-slate-400 text-xs uppercase cursor-pointer hover:bg-slate-200 transition-colors"
                                                onClick={() => openDetails(user)}
                                            >
                                                {user.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                            </div>
                                            <div className="cursor-pointer" onClick={() => openDetails(user)}>
                                                <div className="font-black text-slate-900 uppercase tracking-tight text-sm hover:text-primary transition-colors">{user.name}</div>
                                                <div className="text-[10px] text-slate-400 font-medium tracking-tight">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 py-5">
                                        <Badge variant={user.plan?.toLowerCase() === 'pro' ? 'pro' : 'ghost'}>{user.plan || 'FREE'}</Badge>
                                    </TableCell>
                                    <TableCell className="px-8 py-5">
                                        <div className={cn(
                                            "flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider",
                                            user.is_banned ? "text-rose-500" : "text-emerald-500"
                                        )}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full", user.is_banned ? "bg-rose-500" : "bg-emerald-500")}></span>
                                            {user.status}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 py-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{user.joined}</TableCell>
                                    <TableCell className="px-8 py-5 text-sm font-black text-slate-900 text-right">{user.total}</TableCell>
                                    <TableCell className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {user.role !== 'admin' ? (
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleLoginAsClick(user)}
                                                    className="px-4 py-2 text-[10px] font-black text-slate-900 border border-slate-100 rounded-xl hover:bg-slate-50 uppercase tracking-widest"
                                                >
                                                    Login As
                                                </Button>
                                            ) : (
                                                <Badge variant="ghost" className="px-3 py-1.5 text-[9px] font-black uppercase bg-blue-50 text-blue-600 border-blue-100">
                                                    Admin
                                                </Badge>
                                            )}
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    // Get current user from some global state if possible, 
                                                    // but for now we rely on the backend validation.
                                                    // For a better UX, we can compare with current session user email if we had it here.
                                                    setBanConfirm({ open: true, userId: user.id });
                                                }}
                                                className={cn(
                                                    "px-4 py-2 text-[10px] font-black border rounded-xl uppercase tracking-widest transition-all",
                                                    user.is_banned
                                                        ? "text-emerald-500 border-emerald-100 hover:bg-emerald-50"
                                                        : "text-rose-500 border-rose-100 hover:bg-rose-50"
                                                )}
                                            >
                                                {user.is_banned ? 'Unban' : 'Ban'}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {/* Pagination */}
                <div className="px-8 py-4 flex items-center justify-between border-t border-slate-50 bg-slate-50/30">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing <span className="text-primary tracking-tight">{users.length}</span> users</span>
                    <div className="flex items-center gap-1">
                        <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-300">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button className="w-8 h-8 rounded-xl bg-slate-900 text-white text-[10px] font-black">1</button>
                        <button className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 text-[10px] font-black transition-all">2</button>
                        <button className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 text-[10px] font-black transition-all">3</button>
                        <span className="px-1 text-slate-200">...</span>
                        <button className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 text-[10px] font-black transition-all">250</button>
                        <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-300">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Asymmetric Dashboard Section: Quick Stats */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-slate-900 text-white p-10 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-sm">
                    <div className="relative z-10">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Performance</span>
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-2">User Growth</h3>
                        <p className="text-slate-400 text-sm font-medium">Averaging 24 new creators per day this month.</p>
                    </div>
                    <div className="relative z-10 flex items-end gap-2 mt-4">
                        <span className="text-5xl font-black tracking-tighter text-white uppercase">+12.4%</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Vs Last Month</span>
                    </div>
                    {/* Abstract Design Decor */}
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
                    <div className="absolute right-8 top-8 opacity-10">
                        <ArrowTrendingUpIcon className="w-32 h-32" />
                    </div>
                </div>
                <div className="lg:col-span-4 bg-white p-10 rounded-3xl flex flex-col justify-center border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Plans Split</span>
                        <ChartPieIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">PRO Account</span>
                                <span className="text-[11px] font-black text-primary uppercase">{proPercentage}%</span>
                            </div>
                            <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${proPercentage}%` }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Standard Plan</span>
                                <span className="text-[11px] font-black text-slate-300 uppercase">{freePercentage}%</span>
                            </div>
                            <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-slate-200 h-full rounded-full transition-all duration-1000" style={{ width: `${freePercentage}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Detail Modal */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-slate-900 font-black text-white text-sm uppercase">
                                    {selectedUser.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedUser.name}</h2>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedUser.email}</p>
                                </div>
                            </div>
                            <button
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <XCircleIcon className="w-6 h-6 text-slate-300" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Username</p>
                                    <p className="text-sm font-black text-slate-900">@{selectedUser.username}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Since</p>
                                    <p className="text-sm font-black text-slate-900">{selectedUser.joined}</p>
                                </div>
                                {/* Active Plan */}
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Plan</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={selectedUser.plan?.toLowerCase() === 'pro' ? 'pro' : 'ghost'}>{selectedUser.plan || 'FREE'}</Badge>
                                        <span className="text-[10px] text-slate-400 font-medium tracking-tighter">EXP: {selectedUser.planExpiry}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Status</p>
                                    <div className={cn(
                                        "flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider",
                                        selectedUser.is_banned ? "text-rose-500" : "text-emerald-500"
                                    )}>
                                        <span className={cn("w-1.5 h-1.5 rounded-full", selectedUser.is_banned ? "bg-rose-500" : "bg-emerald-500")}></span>
                                        {selectedUser.status}
                                    </div>
                                </div>

                                {/* Plan Package & Capabilities */}
                                <div className="col-span-2 space-y-4 pt-4 border-t border-slate-50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Plan Package Details</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Core Features</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedUser.plan?.toLowerCase() === 'pro' ? (
                                                    ['Custom Domain', 'WhatsApp Integration', 'Priority Support', 'Advanced Analytics'].map(f => (
                                                        <Badge key={f} variant="ghost" className="bg-blue-50 text-blue-600 border-none text-[8px] px-1.5">{f}</Badge>
                                                    ))
                                                ) : (
                                                    ['Basic Landing Page', 'Product Sales', 'Standard Analytics'].map(f => (
                                                        <Badge key={f} variant="ghost" className="bg-slate-100 text-slate-500 border-none text-[8px] px-1.5">{f}</Badge>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Allowed Blocks</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedUser.plan?.toLowerCase() === 'pro' ? (
                                                    ['Countdown', 'Testimonials', 'FAQ', 'Custom Code', 'WhatsApp Button'].map(f => (
                                                        <Badge key={f} variant="ghost" className="bg-emerald-50 text-emerald-600 border-none text-[8px] px-1.5">{f}</Badge>
                                                    ))
                                                ) : (
                                                    ['Hero', 'About', 'Pricing', 'Order Form'].map(f => (
                                                        <Badge key={f} variant="ghost" className="bg-slate-100 text-slate-500 border-none text-[8px] px-1.5">{f}</Badge>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* NEW STATS */}
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Pages</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">auto_stories</span>
                                        </div>
                                        <p className="text-sm font-black text-slate-900">{selectedUser.stats?.pages || 0} Pages</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Products</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">shopping_bag</span>
                                        </div>
                                        <p className="text-sm font-black text-slate-900">{selectedUser.stats?.products || 0} Products</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => setBanConfirm({ open: true, userId: selectedUser.id })}
                                className={cn(
                                    "font-black text-[10px] uppercase tracking-widest px-6",
                                    selectedUser.is_banned ? "text-emerald-500 hover:bg-emerald-50" : "text-rose-500 hover:bg-rose-50"
                                )}
                            >
                                {selectedUser.is_banned ? 'Unban Account' : 'Suspend Account'}
                            </Button>
                            <div className="flex gap-3">
                                <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest px-6" onClick={() => setIsModalOpen(false)}>Close</Button>
                                {selectedUser.role !== 'admin' ? (
                                    <Button
                                        variant="primary"
                                        onClick={() => handleLoginAsClick(selectedUser)}
                                        className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-8 shadow-xl shadow-slate-900/20"
                                    >
                                        Login As User
                                    </Button>
                                ) : (
                                    <div className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                        <ShieldCheckIcon className="w-3 h-3" />
                                        Admin Account
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ban / Unban Confirm Modal */}
            <ConfirmModal
                isOpen={banConfirm.open}
                onClose={() => setBanConfirm({ open: false, userId: null })}
                onConfirm={confirmBan}
                title={isCurrentlyBanning ? 'Suspend Account?' : 'Restore Account?'}
                confirmLabel={isCurrentlyBanning ? 'Yes, Suspend' : 'Yes, Restore'}
                confirmStyle={isCurrentlyBanning ? 'danger' : 'primary'}
                icon={
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", isCurrentlyBanning ? "bg-rose-100" : "bg-emerald-100")}>
                        <NoSymbolIcon className={cn("w-6 h-6", isCurrentlyBanning ? "text-rose-500" : "text-emerald-500")} />
                    </div>
                }
                message={
                    isCurrentlyBanning
                        ? <>Are you sure you want to <strong>suspend</strong> the account of <strong>{banTarget?.name}</strong>? This will immediately block their access to all platform features.</>
                        : <>Are you sure you want to <strong>restore access</strong> for <strong>{banTarget?.name}</strong>? They will regain full access immediately.</>
                }
            />

            {/* Login As Confirm Modal */}
            <ConfirmModal
                isOpen={loginAsConfirm.open}
                onClose={() => setLoginAsConfirm({ open: false, user: null })}
                onConfirm={() => { executeLoginAs(loginAsConfirm.user); setLoginAsConfirm({ open: false, user: null }); }}
                title="Impersonate User?"
                confirmLabel="Continue to Dashboard"
                confirmStyle="warning"
                icon={
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100">
                        <ArrowRightEndOnRectangleIcon className="w-6 h-6 text-amber-600" />
                    </div>
                }
                message={
                    <>You are about to log in as <strong>{loginAsConfirm.user?.name}</strong>. You will be redirected to their dashboard and can see all their data. Use the impersonation banner to return to your admin account.</>
                }
            />
        </div>
    );
};

