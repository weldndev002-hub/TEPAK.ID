import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { 
    ArrowDownTrayIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    ArrowTrendingUpIcon, 
    ChartPieIcon,
    ExclamationTriangleIcon,
    ArrowRightEndOnRectangleIcon,
    NoSymbolIcon,
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
    const [users, setUsers] = React.useState([
        { id: 1, name: 'Aditya Pratama', email: 'aditya.p@email.com', phone: '+62 812-3456-7890', socials: '@aditya_p', plan: 'PRO', planExpiry: 'Oct 12, 2024', status: 'Active', joined: 'Oct 12, 2023', total: '$165.00', pagesCount: 12, productsCount: 8, is_banned: false },
        { id: 2, name: 'Siti Rahma', email: 'siti.rahma@email.com', phone: '+62 856-9876-5432', socials: '@sitirahma', plan: 'STANDARD', planExpiry: 'Nov 25, 2024', status: 'Active', joined: 'Nov 25, 2023', total: '$28.00', pagesCount: 3, productsCount: 1, is_banned: false },
        { id: 3, name: 'Root Admin', email: 'admin@tepak.id', phone: '-', socials: '-', plan: 'PRO', planExpiry: 'Lifetime', status: 'Active', joined: 'Jan 01, 2023', total: '$0.00', pagesCount: 0, productsCount: 0, is_banned: false }
    ]);
    const [selectedUser, setSelectedUser] = React.useState<any>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // Confirm modals state
    const [banConfirm, setBanConfirm] = React.useState<{ open: boolean; userId: number | null }>({ open: false, userId: null });
    const [loginAsConfirm, setLoginAsConfirm] = React.useState<{ open: boolean; user: any | null }>({ open: false, user: null });

    const executeBan = (userId: number) => {
        const user = users.find(u => u.id === userId);
        if (user?.email === 'admin@tepak.id') return;
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                const newStatus = u.is_banned ? 'Active' : 'Banned';
                return { ...u, is_banned: !u.is_banned, status: newStatus };
            }
            return u;
        }));
        // Update selectedUser if modal is open
        setSelectedUser((prev: any) => {
            if (prev && prev.id === userId) {
                const updated = users.find(u => u.id === userId);
                if (updated) return { ...updated, is_banned: !updated.is_banned, status: !updated.is_banned ? 'Active' : 'Banned' };
            }
            return prev;
        });
    };

    const handleBanClick = (userId: number) => {
        const user = users.find(u => u.id === userId);
        if (user?.email === 'admin@tepak.id') return;
        setBanConfirm({ open: true, userId });
    };

    const confirmBan = () => {
        if (banConfirm.userId !== null) executeBan(banConfirm.userId);
        setBanConfirm({ open: false, userId: null });
    };

    const executeLoginAs = (user: any) => {
        localStorage.setItem('impersonating_user', JSON.stringify({ name: user.name, id: user.id }));
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
    const isBanning = banTarget ? !banTarget.is_banned : false;

    // Sync selectedUser with users state
    const liveSelectedUser = selectedUser ? users.find(u => u.id === selectedUser.id) ?? selectedUser : null;

    const handleExportCSV = () => {
        const headers = ['Name', 'Email', 'Phone', 'Social Media', 'Plan', 'Status', 'Joined Date', 'Total Transacted'];
        const csvContent = [
            headers.join(','),
            ...users.map(user => [
                `"${user.name}"`,
                `"${user.email}"`,
                `"${user.phone}"`,
                `"${user.socials}"`,
                `"${user.plan}"`,
                `"${user.status}"`,
                `"${user.joined}"`,
                `"${user.total}"`
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
                            {users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-100 font-black text-slate-400 text-xs uppercase cursor-pointer hover:bg-slate-200 transition-colors" 
                                                onClick={() => openDetails(user)}
                                            >
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="cursor-pointer" onClick={() => openDetails(user)}>
                                                <div className="font-black text-slate-900 uppercase tracking-tight text-sm hover:text-primary transition-colors">{user.name}</div>
                                                <div className="text-[10px] text-slate-400 font-medium tracking-tight">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 py-5">
                                        <Badge variant={user.plan.toLowerCase() === 'pro' ? 'pro' : 'ghost'}>{user.plan}</Badge>
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
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => handleLoginAsClick(user)}
                                                className="px-4 py-2 text-[10px] font-black text-slate-900 border border-slate-100 rounded-xl hover:bg-slate-50 uppercase tracking-widest"
                                            >
                                                Login As
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => handleBanClick(user.id)}
                                                disabled={user.email === 'admin@tepak.id'}
                                                className={cn(
                                                    "px-4 py-2 text-[10px] font-black border rounded-xl uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed",
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
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing <span className="text-primary tracking-tight">1 - 2</span> of <span className="text-primary tracking-tight">1,248</span> users</span>
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
                                <span className="text-[11px] font-black text-primary uppercase">65%</span>
                            </div>
                            <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[65%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Standard Plan</span>
                                <span className="text-[11px] font-black text-slate-300 uppercase">35%</span>
                            </div>
                            <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-slate-200 h-full w-[35%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Detail Modal */}
            {isModalOpen && liveSelectedUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-slate-900 font-black text-white text-sm uppercase">
                                    {liveSelectedUser.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{liveSelectedUser.name}</h2>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{liveSelectedUser.email}</p>
                                </div>
                            </div>
                            <button 
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Username</p>
                                    <p className="text-sm font-black text-slate-900">@{liveSelectedUser.email.split('@')[0]}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Since</p>
                                    <p className="text-sm font-black text-slate-900">{liveSelectedUser.joined}</p>
                                </div>
                                {/* Active Plan */}
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Plan</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={liveSelectedUser.plan.toLowerCase() === 'pro' ? 'pro' : 'ghost'}>{liveSelectedUser.plan}</Badge>
                                        <span className="text-[10px] text-slate-400 font-medium">Exp: {liveSelectedUser.planExpiry}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Stats</p>
                                    <div className="flex items-center gap-3">
                                        <div className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase">{liveSelectedUser.pagesCount} Pages</div>
                                        <div className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase">{liveSelectedUser.productsCount} Products</div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Status</p>
                                    <div className={cn(
                                        "flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider",
                                        liveSelectedUser.is_banned ? "text-rose-500" : "text-emerald-500"
                                    )}>
                                        <span className={cn("w-1.5 h-1.5 rounded-full", liveSelectedUser.is_banned ? "bg-rose-500" : "bg-emerald-500")}></span>
                                        {liveSelectedUser.status}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Transacted</p>
                                    <p className="text-sm font-black text-slate-900">{liveSelectedUser.total}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Recent Activity</h3>
                                <div className="space-y-4">
                                    {[
                                        { action: 'Login from New IP', date: '2 hours ago', detail: 'IP: 182.25.1.xx (Jakarta, ID)' },
                                        { action: 'Payout Requested', date: '1 day ago', detail: 'Amount: $25.00 to BCA' },
                                        { action: 'Plan Upgraded to PRO', date: 'Oct 12, 2023', detail: 'Annual subscription started' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5"></div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.action}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">{item.detail}</p>
                                                <p className="text-[9px] font-black text-slate-300 uppercase mt-1">{item.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <Button 
                                variant="ghost" 
                                onClick={() => handleBanClick(liveSelectedUser.id)}
                                disabled={liveSelectedUser.email === 'admin@tepak.id'}
                                className={cn(
                                    "font-black text-[10px] uppercase tracking-widest px-6 disabled:opacity-30 disabled:cursor-not-allowed",
                                    liveSelectedUser.is_banned ? "text-emerald-500 hover:bg-emerald-50" : "text-rose-500 hover:bg-rose-50"
                                )}
                            >
                                {liveSelectedUser.is_banned ? 'Unban Account' : 'Suspend Account'}
                            </Button>
                            <div className="flex gap-3">
                                <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest px-6" onClick={() => setIsModalOpen(false)}>Close</Button>
                                <Button 
                                    variant="primary" 
                                    onClick={() => handleLoginAsClick(liveSelectedUser)}
                                    className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-8 shadow-xl shadow-slate-900/20"
                                >
                                    Login As User
                                </Button>
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
                title={isBanning ? 'Suspend Account?' : 'Restore Account?'}
                confirmLabel={isBanning ? 'Yes, Suspend' : 'Yes, Restore'}
                confirmStyle={isBanning ? 'danger' : 'primary'}
                icon={
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", isBanning ? "bg-rose-100" : "bg-emerald-100")}>
                        <NoSymbolIcon className={cn("w-6 h-6", isBanning ? "text-rose-500" : "text-emerald-500")} />
                    </div>
                }
                message={
                    isBanning
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

