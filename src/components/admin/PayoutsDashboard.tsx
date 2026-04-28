import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

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
    confirmStyle?: 'danger' | 'warning' | 'success' | 'primary';
    icon?: React.ReactNode;
}) => {
    if (!isOpen) return null;
    const confirmClass = {
        danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
        success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20',
        primary: 'bg-[#465f89] hover:bg-[#3a4f75] text-white shadow-[#465f89]/20',
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

export const PayoutsDashboard = () => {
    const [payouts, setPayouts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedPayout, setSelectedPayout] = React.useState<any>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'pending' | 'completed' | 'rejected'>('pending');

    // Action States
    const [proofFile, setProofFile] = React.useState<File | null>(null);
    const [proofPreview, setProofPreview] = React.useState<string>('');
    const [rejectReason, setRejectReason] = React.useState('');
    const [showAccountNumber, setShowAccountNumber] = React.useState(false);

    // Confirm modal states
    const [approveConfirm, setApproveConfirm] = React.useState(false);
    const [rejectConfirm, setRejectConfirm] = React.useState(false);
    const [processing, setProcessing] = React.useState(false);

    // Dynamic fee from platform_configs
    const [payoutFee, setPayoutFee] = React.useState<number>(5000);

    // Success/Error toast
    const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const [payoutsRes, configRes] = await Promise.all([
                fetch('/api/admin/payouts'),
                fetch('/api/public/settings')
            ]);
            if (payoutsRes.ok) {
                const data = await payoutsRes.json();
                setPayouts(data);
            }
            if (configRes.ok) {
                const config = await configRes.json();
                if (config.payout_fee) setPayoutFee(Number(config.payout_fee));
            }
        } catch (err) {
            console.error('Failed to fetch payouts:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchPayouts();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofFile(file);
            const url = URL.createObjectURL(file);
            setProofPreview(url);
        }
    };

    const executeUpdate = async (id: string, status: string, notes: string) => {
        setProcessing(true);
        try {
            let proof_url = '';

            // Upload proof if completing
            if (status === 'completed' && proofFile) {
                const fileExt = proofFile.name.split('.').pop();
                const fileName = `${id}-${Date.now()}.${fileExt}`;
                const filePath = `receipts/${fileName}`;

                const { data, error: uploadError } = await supabase.storage
                    .from('payout-proofs')
                    .upload(filePath, proofFile);

                if (uploadError) throw new Error(`Upload bukti gagal: ${uploadError.message}`);

                const { data: { publicUrl } } = supabase.storage
                    .from('payout-proofs')
                    .getPublicUrl(filePath);

                proof_url = publicUrl;
            }

            const res = await fetch('/api/admin/payouts/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, notes, proof_url })
            });

            if (!res.ok) throw new Error('Failed to update payout status');

            showToast('success', `Payout successfully marked as ${status}.`);
            fetchPayouts();
            setIsModalOpen(false);
        } catch (err: any) {
            showToast('error', err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleApproveClick = () => {
        if (!proofFile) {
            showToast('error', 'Harap upload Bukti Transfer terlebih dahulu.');
            return;
        }
        setApproveConfirm(true);
    };

    const handleRejectClick = () => {
        if (!rejectReason.trim()) {
            showToast('error', 'Harap masukkan alasan penolakan terlebih dahulu.');
            return;
        }
        setRejectConfirm(true);
    };

    const filteredPayouts = payouts.filter(p => p.status === activeTab);
    const totalPendingAmount = payouts
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const openDetails = (payout: any) => {
        setSelectedPayout(payout);
        setIsModalOpen(true);
        setShowAccountNumber(false);
        setProofFile(null);
        setProofPreview('');
        setRejectReason('');
    };

    if (loading && payouts.length === 0) {
        return (
            <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-primary uppercase tracking-widest text-xs">Loading Payout Requests...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Toast Notification */}
            {toast && (
                <div className={cn(
                    "fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold transition-all",
                    toast.type === 'success' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                )}>
                    {toast.type === 'success'
                        ? <CheckCircleIcon className="w-5 h-5 shrink-0" />
                        : <XCircleIcon className="w-5 h-5 shrink-0" />
                    }
                    {toast.message}
                </div>
            )}

            {/* Page Title & Stats Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-primary mb-2">Payout Processing</h2>
                    <p className="text-slate-500 max-w-md">Manage creator withdrawal requests carefully and quickly to maintain ecosystem trust.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Total Pending</p>
                        <p className="text-2xl font-black text-[#465f89]">Rp {totalPendingAmount.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Queue Size</p>
                        <p className="text-2xl font-black text-primary">{payouts.filter(p => p.status === 'pending').length} Requests</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-8 mb-8 border-b border-slate-100">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-4 text-sm font-bold transition-all px-2 ${activeTab === 'pending' ? 'text-[#465f89] border-b-2 border-[#465f89]' : 'text-slate-400 hover:text-[#005ab4]'}`}
                >
                    Pending ({payouts.filter(p => p.status === 'pending').length})
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`pb-4 text-sm font-bold transition-all px-2 ${activeTab === 'completed' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}
                >
                    Successful ({payouts.filter(p => p.status === 'completed').length})
                </button>
                <button
                    onClick={() => setActiveTab('rejected')}
                    className={`pb-4 text-sm font-bold transition-all px-2 ${activeTab === 'rejected' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                >
                    Failed/Rejected ({payouts.filter(p => p.status === 'rejected').length})
                </button>
            </div>

            {/* Payout Table Container */}
            <Card className="rounded-2xl overflow-hidden shadow-sm border-slate-100">
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Creator</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Amount Details</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Destination Bank</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Request Date</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayouts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-16 text-slate-400 font-medium text-sm">
                                        No {activeTab.toLowerCase()} payouts.
                                    </TableCell>
                                </TableRow>
                            ) : filteredPayouts.map((payout) => (
                                <TableRow key={payout.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 cursor-pointer" onClick={() => openDetails(payout)}>
                                                <img alt={payout.profiles?.full_name} src={payout.profiles?.avatar_url || 'https://via.placeholder.com/40'} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="cursor-pointer" onClick={() => openDetails(payout)}>
                                                <p className="font-bold text-[#005ab4] hover:underline uppercase tracking-tight text-xs">{payout.profiles?.full_name || payout.profiles?.username}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase">{payout.profiles?.username}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-6">
                                        <div className="space-y-1">
                                            <p className="font-black text-slate-900">Rp {Number(payout.amount).toLocaleString('id-ID')}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded tracking-tighter">Net: Rp {(Number(payout.amount) - payoutFee).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-6">
                                        <div>
                                            <p className="font-bold text-slate-900 text-xs uppercase">{payout.bank_accounts?.bank_name}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">AN. {payout.bank_accounts?.account_name}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        {new Date(payout.requested_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="px-6 py-6">
                                        <div className="flex justify-end gap-2">
                                            {payout.status === 'pending' ? (
                                                <>
                                                    <Button onClick={() => openDetails(payout)} variant="ghost" className="px-4 py-2 text-rose-500 hover:bg-rose-50 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-100">Review</Button>
                                                    <Button onClick={() => openDetails(payout)} variant="primary" className="px-4 py-2 bg-[#465f89] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#465f89]/20">Process</Button>
                                                </>
                                            ) : (
                                                <Badge className={payout.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-none' : 'bg-rose-50 text-rose-600 border-none font-bold'}>
                                                    {payout.status.toUpperCase()}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Payout Detail Modal */}
            {isModalOpen && selectedPayout && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#005ab4]/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-primary">Payout Request Details</h2>
                                <p className="text-sm text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[400px]">ID: {selectedPayout.id}</p>
                            </div>
                            <button
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                {/* Amount Breakdown */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Withdrawal Breakdown</p>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Request amount</span>
                                            <span className="font-bold text-slate-900">Rp {Number(selectedPayout.amount).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Processing fee</span>
                                            <span className="font-bold text-rose-500">-Rp {payoutFee.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                            <span className="text-xs font-black text-primary uppercase tracking-wider">Net to Transfer</span>
                                            <span className="text-xl font-black text-primary">Rp {(Number(selectedPayout.amount) - payoutFee).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Details — with unmask toggle */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient Bank Information</p>
                                        <button
                                            onClick={() => setShowAccountNumber(v => !v)}
                                            className="flex items-center gap-1.5 text-[9px] font-black text-[#005ab4] uppercase tracking-widest hover:underline"
                                        >
                                            {showAccountNumber
                                                ? <><EyeSlashIcon className="w-3.5 h-3.5" /> Hide</>
                                                : <><EyeIcon className="w-3.5 h-3.5" /> Reveal Number</>
                                            }
                                        </button>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Bank Provider</p>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedPayout.bank_accounts?.bank_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Account Number</p>
                                            <div className="flex items-center gap-2">
                                                <p className={cn(
                                                    "text-sm font-black text-slate-900 tracking-widest transition-all duration-300 select-all",
                                                    !showAccountNumber && "blur-sm select-none"
                                                )}>
                                                    {selectedPayout.bank_accounts?.account_number}
                                                </p>
                                                {showAccountNumber && (
                                                    <span className="text-[8px] font-black text-emerald-500 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">Revealed</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Account Holder Name</p>
                                            <p className="text-sm font-black text-slate-900 uppercase">{selectedPayout.bank_accounts?.account_name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedPayout.status === 'pending' && (
                                <>
                                    {/* Upload Proof of Transfer */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                                Bukti Transfer <span className="text-rose-400">*</span>
                                            </label>
                                            <label className={cn(
                                                "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl cursor-pointer transition-all h-[120px]",
                                                proofFile ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-slate-50 hover:border-[#005ab4]/40 hover:bg-blue-50/20"
                                            )}>
                                                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                                                {proofFile ? (
                                                    <>
                                                        {proofPreview && proofFile.type.startsWith('image/') ? (
                                                            <img src={proofPreview} alt="proof" className="h-16 w-auto object-contain rounded-lg" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-emerald-500 text-3xl">description</span>
                                                        )}
                                                        <span className="text-[10px] font-black text-emerald-600 uppercase">{proofFile.name}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowUpTrayIcon className="w-6 h-6 text-slate-300" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to Upload</span>
                                                        <span className="text-[9px] text-slate-300">JPG, PNG, PDF – Max 5MB</span>
                                                    </>
                                                )}
                                            </label>
                                            <p className="text-[9px] text-slate-400 italic px-1">*Wajib diisi sebelum Approve & Process.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">Alasan Penolakan</label>
                                            <textarea
                                                className="w-full bg-rose-50/30 border border-rose-100 rounded-xl py-3 px-4 text-xs font-medium focus:ring-2 focus:ring-rose-500/10 outline-none transition-all h-[120px] resize-none"
                                                placeholder="No. Rekening tidak terdaftar / Salah bank..."
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 mb-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20">
                                                <span className="material-symbols-outlined font-black">warning</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-amber-600 uppercase tracking-tight">Financial Warning</h4>
                                                <p className="text-[11px] text-amber-700/70 font-medium leading-relaxed">Pastikan nominal transfer ke <strong>{selectedPayout.bank_accounts?.account_name}</strong> adalah <strong>Rp {(Number(selectedPayout.amount) - payoutFee).toLocaleString('id-ID')}</strong>. Biaya transfer dibebankan ke Admin (Rp {payoutFee.toLocaleString('id-ID')}).</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {selectedPayout.status !== 'pending' && (
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Processing Notes</p>
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{selectedPayout.notes || 'No notes provided.'}"</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Processed At</p>
                                        <p className="text-sm font-bold text-slate-900">{new Date(selectedPayout.processed_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            {selectedPayout.status === 'pending' ? (
                                <>
                                    <button
                                        className="px-6 py-2.5 rounded-xl font-black text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100 text-[10px] uppercase tracking-widest"
                                        onClick={handleRejectClick}
                                        disabled={processing}
                                    >
                                        Reject Request
                                    </button>
                                    <div className="flex gap-3">
                                        <button className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest" onClick={() => setIsModalOpen(false)}>Close</button>
                                        <button
                                            className="px-8 py-2.5 rounded-xl bg-[#465f89] text-white font-black shadow-lg shadow-[#465f89]/20 hover:scale-[1.02] active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                                            onClick={handleApproveClick}
                                            disabled={processing}
                                        >
                                            {processing ? 'Processing...' : 'Approve & Process'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full flex justify-center">
                                    <button className="px-10 py-2.5 rounded-xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest" onClick={() => setIsModalOpen(false)}>Close Overview</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Confirm Modal */}
            <ConfirmModal
                isOpen={approveConfirm}
                onClose={() => setApproveConfirm(false)}
                onConfirm={() => { setApproveConfirm(false); executeUpdate(selectedPayout?.id, 'completed', 'Transfer Successful'); }}
                title="Confirm Payout Approval"
                confirmLabel="Yes, Approve & Process"
                confirmStyle="success"
                icon={
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-100">
                        <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                    </div>
                }
                message={
                    <>Anda akan menyetujui transfer sebesar <strong>Rp {(Number(selectedPayout?.amount) - payoutFee).toLocaleString('id-ID')}</strong> ke rekening <strong>{selectedPayout?.bank_accounts?.bank_name} {selectedPayout?.bank_accounts?.account_name}</strong>. Tindakan ini tidak bisa dibatalkan.</>
                }
            />

            {/* Reject Confirm Modal */}
            <ConfirmModal
                isOpen={rejectConfirm}
                onClose={() => setRejectConfirm(false)}
                onConfirm={() => { setRejectConfirm(false); executeUpdate(selectedPayout?.id, 'rejected', rejectReason); }}
                title="Confirm Payout Rejection"
                confirmLabel="Yes, Reject"
                confirmStyle="danger"
                icon={
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-100">
                        <XCircleIcon className="w-6 h-6 text-rose-500" />
                    </div>
                }
                message={
                    <>Anda akan <strong>menolak</strong> permintaan payout dari <strong>{selectedPayout?.profiles?.full_name}</strong>. Saldo sebesar <strong>Rp {Number(selectedPayout?.amount).toLocaleString('id-ID')}</strong> akan di-refund ke Virtual Balance kreator.</>
                }
            />
        </div>
    );
};
