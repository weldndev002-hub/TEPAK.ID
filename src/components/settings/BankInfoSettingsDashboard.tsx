import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
    ShieldCheckIcon, 
    EyeIcon, 
    CheckCircleIcon, 
    LockClosedIcon,
    CheckIcon 
} from '@heroicons/react/24/outline';

export const BankInfoSettingsDashboard = () => {
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

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setError(null);
        
        // Validation: Account Number must be numeric only
        if (!/^\d+$/.test(formData.accountNumber)) {
            setError("Nomor rekening hanya boleh berisi angka");
            return;
        }

        if (!formData.ownerName) {
            setError("Nama pemilik rekening wajib diisi");
            return;
        }

        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));

        setBankData({
            bankName: formData.bankName === 'BCA' ? 'Bank Central Asia (BCA)' : formData.bankName,
            accountNumber: formData.accountNumber,
            ownerName: formData.ownerName,
            isVerified: true
        });

        alert("Informasi bank berhasil diperbarui!");
        setLoading(false);
    };
    return (
        <div className="flex-1 p-8 min-h-screen bg-slate-50 ">
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="mb-10">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Earnings & Payouts</span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Payout Method</h2>
                    <nav className="flex gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                        <a href="/settings" className="hover:text-primary transition-colors">Settings</a>
                        <span className="text-slate-200">/</span>
                        <span className="text-primary">Payout Method</span>
                    </nav>
                </div>

                {/* Information Banner */}
                <div className="bg-slate-900 rounded-3xl p-8 mb-12 flex items-start gap-6 shadow-sm relative overflow-hidden">
                    <div className="bg-white/10 p-4 rounded-2xl relative z-10 backdrop-blur-sm">
                        <ShieldCheckIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-white font-black uppercase tracking-tight mb-2">Transaction Security</h3>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-xl">This bank information is used to securely process your earnings payouts. Please ensure the data you enter is correct to avoid disbursement issues.</p>
                    </div>
                    <ShieldCheckIcon className="absolute -right-10 -bottom-10 w-48 h-48 text-white/[0.03] rotate-12" />
                </div>

                <div className="grid grid-cols-1 gap-10">
                    {/* Section: Bank Terdaftar */}
                    <section>
                        <h4 className="text-[10px] font-black text-slate-400 mb-6 flex items-center gap-4 uppercase tracking-[0.2em]">
                            Registered Bank
                            <span className="h-[1px] flex-grow bg-slate-100"></span>
                        </h4>
                        <Card className="p-8 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm border-slate-100 rounded-3xl transition-all hover:border-primary/20 hover:shadow-md group cursor-pointer active:scale-[0.99]">
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                                    <div className="bg-[#005BAB] text-white font-black px-3 py-1 rounded-lg text-[10px] italic tracking-tighter uppercase">{bankData.bankName.includes('BCA') ? 'BCA' : bankData.bankName.substring(0,3)}</div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{bankData.bankName}</p>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl font-black text-slate-900 tracking-tight">••••••••{bankData.accountNumber.slice(-4)}</span>
                                        <button className="text-slate-300 hover:text-primary transition-colors focus:outline-none">
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">a.n. {bankData.ownerName}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 mt-6 sm:mt-0">
                                <Badge variant={bankData.isVerified ? 'pro' : 'ghost'} className="inline-flex items-center gap-2 px-4 py-2 font-black text-[10px] tracking-widest">
                                    <CheckCircleIcon className="w-4 h-4" />
                                    {bankData.isVerified ? 'VERIFIED' : 'PENDING'}
                                </Badge>
                            </div>
                        </Card>
                    </section>

                    {/* Section: Ubah Informasi Bank */}
                    <section>
                        <h4 className="text-[10px] font-black text-slate-400 mb-6 flex items-center gap-4 uppercase tracking-[0.2em]">
                            Update Bank Information
                            <span className="h-[1px] flex-grow bg-slate-100"></span>
                        </h4>
                        <Card className="p-10 shadow-sm border-slate-100 rounded-[2.5rem] bg-white relative">
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Bank</label>
                                        <Select 
                                            value={formData.bankName} 
                                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                            className="rounded-xl border-slate-100 font-black text-xs uppercase tracking-tight bg-slate-50/50"
                                        >
                                            <option value="BCA">Bank Central Asia (BCA)</option>
                                            <option value="Mandiri">Bank Mandiri</option>
                                            <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
                                            <option value="BNI">Bank Negara Indonesia (BNI)</option>
                                            <option value="HSBC">HSBC Bank</option>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Number</label>
                                        <Input 
                                            type="text" 
                                            placeholder="Enter your account number" 
                                            value={formData.accountNumber}
                                            onChange={(e) => {
                                                setFormData({ ...formData, accountNumber: e.target.value });
                                                setError(null);
                                            }}
                                            className="rounded-xl border-slate-100 font-black text-xs uppercase tracking-tight bg-slate-50/50" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Owner Name</label>
                                    <Input 
                                        type="text" 
                                        placeholder="As it appears on your bank statement" 
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                        className="rounded-xl border-slate-100 font-black text-xs uppercase tracking-tight bg-slate-50/50" 
                                    />
                                </div>
                            </div>
                            {error && (
                                <p className="mt-8 p-4 bg-rose-50 border border-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-2xl">{error}</p>
                            )}
                        </Card>
                    </section>

                    {/* Security Note */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-start gap-5 shadow-sm">
                        <div className="p-2 bg-slate-50 rounded-xl">
                            <LockClosedIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-tight pt-1">Your banking data is encrypted using standard industry protocols (AES-256). Tepak.id never stores full card information or has direct access to your account outside of automated transfer processing needs.</p>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end pt-6">
                        <Button 
                            className="bg-primary text-white px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            <CheckIcon className="w-5 h-5" />
                            {loading ? 'Saving...' : 'Save Bank Information'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

