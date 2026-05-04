import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Badge } from '../ui/Badge';
import { 
    GlobeAltIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ArrowPathIcon,
    TrashIcon,
    ClipboardIcon,
    ServerIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

export const DomainSettingsDashboard = () => {
    const [domain, setDomain] = useState('');
    const [status, setStatus] = useState<'none' | 'pending' | 'active' | 'failed'>('none');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isPro, setIsPro] = useState(false);
    const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
    const [countdown, setCountdown] = useState(0);

    // Target domain for CNAME - using the proxy origin for SaaS automation
    const TARGET_CNAME = 'origin.weorbit.site';

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => { 
        setToast({msg, type}); 
        setTimeout(() => setToast(null), 4000); 
    };

    useEffect(() => {
        fetchDomainData();
    }, []);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const fetchDomainData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/settings/domain');
            if (res.ok) {
                const data = await res.json();
                setDomain(data.domain_name || '');
                setStatus(data.domain_verified ? 'active' : (data.domain_name ? 'pending' : 'none'));
            }

            // Check if PRO
            const subRes = await fetch('/api/onboarding/data'); // Using a robust route to check status
            if (subRes.ok) {
                // For now assuming all creators can access this in this context, 
                // or you can implement actual plan check here.
                setIsPro(true); 
            }
        } catch (error) {
            console.error('Failed to fetch domain data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetup = async () => {
        if (!domain) return;
        
        const cleanDomain = domain.replace(/https?:\/\//, '').replace(/\/$/, '').toLowerCase();
        
        setIsSaving(true);
        try {
            const res = await fetch('/api/settings/domain', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain_name: cleanDomain })
            });

            const data = await res.json();
            if (res.ok) {
                showToast('Domain terdaftar! Silakan atur DNS Anda.', 'success');
                setStatus('pending');
                setDomain(cleanDomain);
            } else {
                showToast(data.error || 'Gagal mendaftarkan domain', 'error');
            }
        } catch (err) {
            showToast('Kesalahan jaringan', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleVerify = async () => {
        if (countdown > 0) return;

        setIsVerifying(true);
        try {
            const res = await fetch('/api/settings/domain/verify', { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                showToast('Domain berhasil diverifikasi!', 'success');
                setStatus('active');
                setCountdown(60);
            } else {
                showToast(data.error || 'DNS belum siap, tunggu sebentar lagi.', 'error');
                setCountdown(30);
            }
        } catch (err) {
            showToast('Gagal memverifikasi', 'error');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus domain ini?')) return;

        try {
            const res = await fetch('/api/settings/domain', { method: 'DELETE' });
            if (res.ok) {
                showToast('Domain dihapus');
                setDomain('');
                setStatus('none');
            }
        } catch (err) {
            showToast('Gagal menghapus', 'error');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Tersalin!');
    };

    if (isLoading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center space-y-4 pt-10">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menyiapkan Pengaturan...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-10 pb-20">
            {toast && (
                <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold animate-in slide-in-from-right duration-300 ${
                    toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-rose-500 text-white'
                }`}>
                    {toast.type === 'success' ? <CheckCircleIcon className="w-5 h-5 text-emerald-400" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
                    {toast.msg}
                </div>
            )}

            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Custom Domain</h2>
                <p className="text-slate-500 font-medium text-sm">Gunakan nama domain Anda sendiri agar terlihat lebih profesional.</p>
            </div>

            {status === 'none' ? (
                <Card className="p-10 border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -mr-8 -mt-8 -z-0"></div>
                    
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                                <GlobeAltIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg">Hubungkan Domain</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Langkah 1: Masukkan Alamat Domain</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Domain Name</label>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <Input 
                                        className="h-16 bg-white border-slate-200 rounded-2xl font-bold text-base focus:ring-4 focus:ring-primary/10 transition-all px-6 flex-1 shadow-sm"
                                        value={domain} 
                                        onChange={(e) => setDomain(e.target.value)}
                                        placeholder="contoh: www.brandanda.com"
                                    />
                                    <Button 
                                        variant="primary" 
                                        className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 active:scale-95"
                                        onClick={handleSetup}
                                        disabled={isSaving || !domain}
                                    >
                                        {isSaving ? 'Memproses...' : 'Lanjut Konfigurasi'}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">
                                    <InformationCircleIcon className="w-4 h-4" />
                                    <span>Gunakan format domain.com atau www.domain.com</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="space-y-8">
                    {/* Status Card */}
                    <Card className="p-8 border-slate-100 shadow-xl rounded-[2.5rem] bg-white">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg ${
                                    status === 'active' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'
                                }`}>
                                    <ShieldCheckIcon className="w-10 h-10" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase">{domain}</h3>
                                        <Badge variant={status === 'active' ? 'success' : 'warning'} className="h-6 px-3 text-[9px] font-black tracking-widest">
                                            {status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {status === 'active' ? 'Domain Anda sudah aktif dan aman dengan SSL.' : 'Menunggu konfigurasi DNS Anda terdeteksi.'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {status !== 'active' && (
                                    <Button 
                                        variant="primary" 
                                        className="flex-1 md:flex-none rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8 shadow-lg shadow-primary/20"
                                        onClick={handleVerify}
                                        disabled={isVerifying || countdown > 0}
                                    >
                                        {isVerifying ? <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" /> : <ArrowPathIcon className="w-4 h-4 mr-2" />}
                                        {countdown > 0 ? `Cek Lagi (${countdown}s)` : 'Verifikasi DNS'}
                                    </Button>
                                )}
                                <Button 
                                    variant="ghost" 
                                    className="rounded-2xl w-14 h-14 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                                    onClick={handleDelete}
                                    title="Hapus Domain"
                                >
                                    <TrashIcon className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Step-by-Step DNS Guide */}
                    {status === 'pending' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">2</div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight">Atur DNS Records</h3>
                                </div>

                                <Card className="overflow-hidden border-slate-100 shadow-2xl rounded-[2rem]">
                                    <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <ServerIcon className="w-5 h-5 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Konfigurasi CNAME</span>
                                        </div>
                                        <Badge variant="outline" className="border-white/20 text-white opacity-60">DNS Settings</Badge>
                                    </div>
                                    <div className="p-0">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-widest">Type</th>
                                                    <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-widest">Name</th>
                                                    <th className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-widest">Content / Target</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                <tr className="group hover:bg-slate-50/50 transition-all">
                                                    <td className="px-8 py-6">
                                                        <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">CNAME</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <code className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                                            {domain.includes('www.') ? 'www' : '@'}
                                                        </code>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <code className="font-mono font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                                                                {TARGET_CNAME}
                                                            </code>
                                                            <button 
                                                                onClick={() => copyToClipboard(TARGET_CNAME)} 
                                                                className="p-2 hover:bg-slate-200 rounded-xl transition-all active:scale-90"
                                                                title="Copy Target"
                                                            >
                                                                <ClipboardIcon className="w-5 h-5 text-slate-400" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>

                                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                                        <ShieldCheckIcon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-emerald-900 uppercase">Sertifikat SSL Otomatis</p>
                                        <p className="text-[10px] text-emerald-700/80 leading-relaxed font-bold">
                                            Setelah DNS terhubung, sistem akan otomatis menerbitkan sertifikat SSL (HTTPS) dalam beberapa menit. Tidak perlu pengaturan tambahan.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                    <InformationCircleIcon className="w-5 h-5 text-primary" />
                                    Tips Bantuan
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Waktu Propagasi</p>
                                        <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                                            Perubahan DNS biasanya memakan waktu <span className="font-black text-slate-900">5-30 menit</span>, namun pada beberapa provider bisa hingga 24 jam.
                                        </p>
                                    </div>
                                    <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Cloudflare Proxy</p>
                                        <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                                            Jika Anda menggunakan Cloudflare, pastikan status proxy adalah <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-black">DNS ONLY</span> (Grey Cloud) untuk verifikasi awal.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DomainSettingsDashboard;
