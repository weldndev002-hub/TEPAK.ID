import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { 
    ShieldCheckIcon, 
    CheckCircleIcon, 
    LockClosedIcon,
    CheckIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    ExclamationTriangleIcon,
    CreditCardIcon,
    InformationCircleIcon,
    BanknotesIcon,
    KeyIcon,
    UserMinusIcon
} from '@heroicons/react/24/outline';
import { 
    ShieldCheckIcon as ShieldCheckIconSolid,
    CheckCircleIcon as CheckCircleIconSolid,
    TrashIcon as TrashIconSolid
} from '@heroicons/react/24/solid';
import { useSubscription, SubscriptionProvider } from '../../context/SubscriptionContext';

export const UnifiedSettings = ({ defaultTab = 'account' }: { defaultTab?: 'account' | 'bank' }) => {
    return (
        <SubscriptionProvider>
            <UnifiedSettingsContent defaultTab={defaultTab} />
        </SubscriptionProvider>
    );
};

const UnifiedSettingsContent = ({ defaultTab = 'account' }: { defaultTab?: 'account' | 'bank' }) => {
    const [activeTab, setActiveTab] = useState<'account' | 'bank'>(defaultTab);
    const { plan } = useSubscription();
    
    // --- Account State ---
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isTerminating, setIsTerminating] = useState(false);
    const [terminateError, setTerminateError] = useState<string | null>(null);
    const isPro = plan !== 'free';

    // --- Bank State ---
    const [bankData, setBankData] = useState({
        bankName: 'Bank Central Asia (BCA)',
        accountNumber: '57219908',
        ownerName: 'John Doe',
        isVerified: true
    });
    const [formData, setFormData] = useState({
        bankName: 'BCA',
        accountNumber: '',
        ownerName: ''
    });
    const [bankLoading, setBankLoading] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

    const handleSaveBank = async () => {
        setBankLoading(true);
        setShowSaveConfirm(false);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBankData({
            ...bankData,
            bankName: formData.bankName === 'BCA' ? 'Bank Central Asia (BCA)' : formData.bankName,
            accountNumber: formData.accountNumber || bankData.accountNumber,
            ownerName: formData.ownerName || bankData.ownerName,
        });
        setBankLoading(false);
        showToast('Informasi bank berhasil diperbarui!');
    };

    const handleTerminate = async () => {
        if (!password) {
            setTerminateError('Konfirmasi password diperlukan untuk menghapus akun.');
            return;
        }

        setIsTerminating(true);
        setTerminateError(null);

        try {
            const res = await fetch('/api/profile', { 
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }) // Optional: backend could verify password again if needed
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Gagal menghapus akun');
            }

            // Success! Redirect to login
            window.location.href = '/login?deleted=true'; 
        } catch (err: any) {
            setTerminateError(err.message);
            setIsTerminating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 relative">
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold bg-emerald-500 text-white animate-in slide-in-from-right duration-300">
                    <CheckCircleIcon className="w-5 h-5 shrink-0" />{toast}
                </div>
            )}
            {/* Header */}
            <div className="mb-12">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">System Configuration</span>
                <h2 className="text-4xl font-black tracking-tighter mb-2 text-slate-900 uppercase">Settings & Account</h2>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none">Manage your security architecture and disbursement protocols.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex p-1.5 bg-slate-100 rounded-[2rem] w-fit mb-10">
                <button 
                    onClick={() => setActiveTab('account')}
                    className={cn(
                        "flex items-center gap-3 px-8 py-4 rounded-[1.5rem] transition-all font-black uppercase tracking-widest text-[11px]",
                        activeTab === 'account' ? "bg-white text-slate-900 shadow-xl shadow-slate-200" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <KeyIcon className="w-4 h-4" />
                    Security & Account
                </button>
                <button 
                    onClick={() => setActiveTab('bank')}
                    className={cn(
                        "flex items-center gap-3 px-8 py-4 rounded-[1.5rem] transition-all font-black uppercase tracking-widest text-[11px]",
                        activeTab === 'bank' ? "bg-white text-slate-900 shadow-xl shadow-slate-200" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <BanknotesIcon className="w-4 h-4" />
                    Payout Method
                </button>
            </div>

            {/* TAB CONTENT: ACCOUNT & SECURITY */}
            {activeTab === 'account' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="flex flex-col border-none rounded-[3rem] shadow-sm overflow-hidden bg-white">
                        <div className="bg-rose-50 p-10 border-b border-rose-100/50">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-rose-100 rounded-[1.5rem] flex items-center justify-center text-rose-600 shadow-sm">
                                    <TrashIconSolid className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">Permanent Termination</h3>
                                    <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest mt-1">Danger Zone</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="bg-rose-50/30 border-l-[6px] border-rose-500 p-8 rounded-2xl">
                                <p className="text-rose-600 font-black text-xs uppercase tracking-widest mb-4">Assets that will be purged:</p>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-4 text-rose-600 text-[10px] font-black uppercase tracking-tight">
                                        <CheckCircleIconSolid className="w-4 h-4 opacity-40" />
                                        All generated pages
                                    </li>
                                    <li className="flex items-center gap-4 text-rose-600 text-[10px] font-black uppercase tracking-tight">
                                        <CheckCircleIconSolid className="w-4 h-4 opacity-40" />
                                        Analytics History
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Verify Password</label>
                                <Input 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="Enter current password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-14 rounded-xl bg-slate-50 border-slate-100"
                                    iconRight={
                                        <button onClick={() => setShowPassword(!showPassword)} className="p-2 text-slate-300">
                                            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                        </button>
                                    }
                                />
                                <button 
                                    className={cn(
                                        "w-full h-14 bg-rose-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl shadow-lg shadow-rose-600/10 hover:opacity-90 transition-all flex items-center justify-center gap-2",
                                        isTerminating && "opacity-50 cursor-not-allowed"
                                    )}
                                    disabled={isTerminating}
                                    onClick={() => {
                                        if (!password) {
                                            setTerminateError('Masukkan password Anda untuk melanjutkan.');
                                            return;
                                        }
                                        setShowTerminateConfirm(true);
                                    }}
                                >
                                    {isTerminating ? 'Processing...' : 'Terminate Account'}
                                </button>
                                {terminateError && (
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center animate-shake">
                                        {terminateError}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="flex flex-col border-none rounded-[3rem] shadow-sm overflow-hidden bg-white">
                        <div className="bg-slate-50 p-10 border-b border-slate-100 font-black">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-slate-300 border border-slate-100">
                                    <LockClosedIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">Security Lock</h3>
                                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Status: Restricted</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-10 flex flex-col items-center justify-center flex-1 text-center space-y-6">
                            <ShieldCheckIconSolid className="w-20 h-20 text-slate-100" />
                            <div className="space-y-2">
                                <h4 className="text-lg font-black text-slate-900 uppercase">Pro Protection Active</h4>
                                <p className="text-[10px] text-slate-400 font-black uppercase leading-relaxed max-w-[240px]">
                                    Subscription must be terminated via the Billing Hub before account deletion can proceed.
                                </p>
                            </div>
                            <Button variant="ghost" className="w-full h-14 border border-slate-100 rounded-xl text-slate-400 font-black uppercase text-[10px] tracking-widest cursor-not-allowed" disabled>
                                Disconnect Billing
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* TAB CONTENT: BANK PAYOUT */}
            {activeTab === 'bank' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900 rounded-[3rem] p-10 flex items-start gap-8 shadow-2xl relative overflow-hidden">
                        <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md relative z-10">
                            <ShieldCheckIcon className="w-10 h-10 text-white" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-white text-xl font-black uppercase tracking-tight mb-3">Safe Disbursement Architecture</h3>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">Your banking data is encrypted and used only for automated earnings payouts. We never store full account details on our primary servers.</p>
                        </div>
                        <ShieldCheckIcon className="absolute -right-10 -top-10 w-64 h-64 text-white/[0.02] rotate-12" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Current Bank Info */}
                        <div className="lg:col-span-5">
                            <h4 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em] ml-1">Current Payout Method</h4>
                            <Card className="p-8 border-none bg-blue-50/50 rounded-[2.5rem] shadow-sm border border-white">
                                <div className="space-y-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                                        <BanknotesIcon className="w-8 h-8 text-[#005BAB]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{bankData.bankName}</p>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">•••• •••• {bankData.accountNumber.slice(-4)}</h3>
                                        <p className="text-[11px] font-black text-slate-900/40 uppercase mt-2 tracking-widest">a.n. {bankData.ownerName}</p>
                                    </div>
                                    <Badge variant="pro" className="px-4 py-2 font-black text-[10px]">VERIFIED METHOD</Badge>
                                </div>
                            </Card>
                        </div>

                        {/* Update Bank Form */}
                        <div className="lg:col-span-7">
                            <h4 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em] ml-1">Update Bank Data</h4>
                            <Card className="p-10 border-none rounded-[3rem] shadow-sm bg-white space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Institution</label>
                                        <Select 
                                            value={formData.bankName}
                                            onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                                            className="h-14 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                        >
                                            <option value="BCA">Bank Central Asia (BCA)</option>
                                            <option value="Mandiri">Bank Mandiri</option>
                                            <option value="BNI">Bank Negara Indonesia (BNI)</option>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                                        <Input 
                                            placeholder="Ex: 5721..." 
                                            value={formData.accountNumber}
                                            onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                                            className="h-14 rounded-xl bg-slate-50 border-slate-100" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Owner Name</label>
                                    <Input 
                                        placeholder="Full name as written on bank book" 
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                                        className="h-14 rounded-xl bg-slate-50 border-slate-100" 
                                    />
                                </div>
                                <Button 
                                    onClick={handleSaveBank}
                                    disabled={bankLoading}
                                    className="w-full bg-primary text-white h-14 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
                                >
                                    {bankLoading ? 'Processing...' : 'Securely Save Payout Data'}
                                </Button>
                            </Card>
                        </div>
                    </div>
                </div>
            )}


            {/* Account Termination Confirmation */}
            {showTerminateConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-rose-100 mx-auto mb-4">
                                <TrashIcon className="w-9 h-9 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Hapus Akun Permanen?</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Seluruh data, konten, dan riwayat transaksi Anda akan <strong className="text-rose-600">dihapus selamanya</strong>. Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div className="px-8 py-5 bg-rose-50 border-t border-rose-100 flex items-center justify-end gap-3">
                            <button className="px-5 py-2.5 rounded-xl font-black text-slate-600 hover:bg-white transition-all text-[10px] uppercase tracking-widest" onClick={() => setShowTerminateConfirm(false)}>Batal</button>
                            <button 
                                className={cn(
                                    "px-6 py-2.5 rounded-xl font-black bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2",
                                    isTerminating && "opacity-50"
                                )} 
                                disabled={isTerminating}
                                onClick={handleTerminate}
                            >
                                {isTerminating && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                Ya, Hapus Akun Permanen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
