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
    ClipboardIcon
} from '@heroicons/react/24/outline';

export const DomainSettingsDashboard = () => {
    const [domain, setDomain] = useState('');
    const [status, setStatus] = useState<'none' | 'pending' | 'active' | 'failed'>('none');
    const [config, setConfig] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isPro, setIsPro] = useState(false);
    const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
    const [countdown, setCountdown] = useState(0);

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
            // Get profile data
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                const settings = data.settings || {};
                setDomain(settings.domain_name || '');
                setStatus(settings.domain_verified ? 'active' : (settings.domain_name ? 'pending' : 'none'));
                setConfig(settings.custom_domain_config || {});
            }

            // Check if PRO
            const subRes = await fetch('/api/subscription/status');
            if (subRes.ok) {
                const subData = await subRes.json();
                setIsPro(subData.plan_status === 'pro');
            }
        } catch (error) {
            console.error('Failed to fetch domain data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetup = async () => {
        if (!domain) return;
        
        // Simple client-side validation
        if (domain.includes('http://') || domain.includes('https://')) {
            showToast('Gunakan format domain yang benar, tanpa http/https', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/domain/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain })
            });

            const data = await res.json();
            if (res.ok) {
                showToast('Domain berhasil didaftarkan!', 'success');
                setStatus('pending');
                setConfig(data);
                fetchDomainData(); // Refresh
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
            const res = await fetch('/api/domain/verify', { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                if (data.status === 'active') {
                    showToast('Domain Anda sudah aktif!', 'success');
                } else {
                    showToast('DNS belum terverifikasi. Harap tunggu proses propagasi.', 'error');
                }
                setStatus(data.status);
                setCountdown(60); // 1 minute rate limit
                fetchDomainData();
            } else if (res.status === 429) {
                showToast(data.error, 'error');
                setCountdown(60);
            } else {
                showToast(data.error || 'Gagal memverifikasi domain', 'error');
            }
        } catch (err) {
            showToast('Kesalahan jaringan', 'error');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus domain ini?')) return;

        try {
            const res = await fetch('/api/domain', { method: 'DELETE' });
            if (res.ok) {
                showToast('Domain berhasil dihapus');
                setDomain('');
                setStatus('none');
                setConfig(null);
            }
        } catch (err) {
            showToast('Gagal menghapus domain', 'error');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Tersalin ke clipboard!');
    };

    if (isLoading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading domain settings...</p>
            </div>
        );
    }

    if (!isPro) {
        return (
            <Card className="p-12 border-slate-100 shadow-sm text-center space-y-6 rounded-[2.5rem] bg-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-primary to-amber-400"></div>
                <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto text-amber-500">
                    <GlobeAltIcon className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <Badge variant="pro" className="mx-auto">PREMIUM FEATURE</Badge>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Custom Domain Support</h3>
                    <p className="text-slate-500 max-w-sm mx-auto font-medium">
                        Hubungkan domain kustom Anda sendiri (misal: brand.com) untuk tampilan yang lebih profesional.
                    </p>
                </div>
                <Button variant="primary" className="px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px]" onClick={() => window.location.href = '/settings/billing'}>
                    Upgrade to PRO
                </Button>
            </Card>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {toast && (
                <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold animate-in slide-in-from-right duration-300 ${
                    toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                    {toast.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
                    {toast.msg}
                </div>
            )}

            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Custom Domain</h2>
                <p className="text-slate-500 font-medium text-sm">Personalize your page URL with your own domain name.</p>
            </div>

            {status === 'none' ? (
                <Card className="p-8 border-slate-100 shadow-sm space-y-8 rounded-3xl bg-white">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                            <GlobeAltIcon className="w-6 h-6" />
                        </div>
                        <div className="space-y-6 flex-1">
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">Set Up Your Domain</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect your branding to your profile</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Domain Name</label>
                                    <div className="flex gap-3">
                                        <Input 
                                            className="h-14 bg-slate-50/50 border-slate-100 rounded-xl font-bold text-sm focus:bg-white transition-all px-6 flex-1"
                                            value={domain} 
                                            onChange={(e) => setDomain(e.target.value)}
                                            placeholder="e.g. www.brand.com"
                                        />
                                        <Button 
                                            variant="primary" 
                                            className="h-14 px-8 rounded-xl font-black uppercase tracking-widest text-[11px]"
                                            onClick={handleSetup}
                                            disabled={isSaving || !domain}
                                        >
                                            {isSaving ? 'Registering...' : 'Register Domain'}
                                        </Button>
                                    </div>
                                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tight italic ml-1">
                                        Input format: domain.com or www.domain.com (without http/https)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="space-y-8">
                    {/* Current Domain Info */}
                    <Card className="p-8 border-slate-100 shadow-sm rounded-3xl bg-white">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                    status === 'active' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'
                                }`}>
                                    <GlobeAltIcon className="w-7 h-7" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-black text-slate-900 text-lg tracking-tight uppercase">{domain}</h3>
                                        <Badge variant={status === 'active' ? 'success' : 'warning'}>
                                            {status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {status === 'active' ? 'Your domain is live and working' : 'Awaiting DNS propagation and verification'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {status !== 'active' && (
                                    <Button 
                                        variant="outline" 
                                        className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-5 border-slate-100 hover:bg-slate-50"
                                        onClick={handleVerify}
                                        disabled={isVerifying || countdown > 0}
                                    >
                                        {isVerifying ? <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {countdown > 0 ? `Check again in ${countdown}s` : 'Verify DNS Now'}
                                    </Button>
                                )}
                                <Button 
                                    variant="ghost" 
                                    className="rounded-xl p-2.5 text-rose-500 hover:bg-rose-50"
                                    onClick={handleDelete}
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Verification Instructions */}
                    {status === 'pending' && (
                        <Card className="p-8 border-amber-100 bg-amber-50/30 rounded-3xl space-y-8 animate-pulse-subtle">
                            <div className="flex items-start gap-4">
                                <InformationCircleIcon className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                                <div className="space-y-6 flex-1">
                                    <div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">DNS Configuration Required</h3>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Add the following record to your DNS provider</p>
                                    </div>

                                    <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 border-b border-amber-100">
                                                <tr>
                                                    <th className="px-6 py-4 font-black uppercase text-[10px] text-slate-400">Type</th>
                                                    <th className="px-6 py-4 font-black uppercase text-[10px] text-slate-400">Name (Host)</th>
                                                    <th className="px-6 py-4 font-black uppercase text-[10px] text-slate-400">Value (Target)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-amber-50">
                                                    <td className="px-6 py-5"><Badge variant="outline">CNAME</Badge></td>
                                                    <td className="px-6 py-5 font-mono font-bold text-slate-900">
                                                        {domain.split('.')[0] === 'www' ? 'www' : '@'}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <code className="font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                                                                weorbit.site
                                                            </code>
                                                            <button onClick={() => copyToClipboard('weorbit.site')} className="p-1 hover:bg-slate-100 rounded transition-colors">
                                                                <ClipboardIcon className="w-4 h-4 text-slate-400" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="p-5 bg-white border border-amber-100 rounded-2xl flex items-start gap-4">
                                        <InformationCircleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-black text-slate-900 uppercase">Proses Aktivasi Manual</p>
                                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                                Setelah Anda mengarahkan CNAME ke weorbit.site, admin akan memverifikasi dan mengaktifkan domain Anda dalam 1x24 jam.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};
