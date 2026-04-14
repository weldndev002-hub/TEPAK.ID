import React from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { 
    ChevronRightIcon, 
    LanguageIcon, 
    CheckBadgeIcon, 
    ServerStackIcon, 
    CheckCircleIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    TrashIcon,
    ExclamationCircleIcon,
    ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { z } from 'zod';
import { cn } from '../../lib/utils';

export const DomainSettingsDashboard = () => {
    const [domainInput, setDomainInput] = React.useState('');
    const [status, setStatus] = React.useState<'idle' | 'pending' | 'active'>('idle');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState('');
    const [toast, setToast] = React.useState<string | null>(null);
    const [deleteModal, setDeleteModal] = React.useState(false);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const domainSchema = z.string()
        .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, "Format domain tidak valid, gunakan format: domainku.com")
        .refine(val => !val.startsWith('http'), "Gunakan format domain yang benar, tanpa http/https");

    React.useEffect(() => {
        fetchDomain();
    }, []);

    const fetchDomain = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/settings/domain');
            if (res.ok) {
                const data = await res.json();
                if (data.domain_name) {
                    setDomainInput(data.domain_name);
                    setStatus(data.domain_verified ? 'active' : 'pending');
                } else {
                    setStatus('idle');
                }
            }
        } catch (err) {
            console.error('Fetch domain error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDomain = async () => {
        const result = domainSchema.safeParse(domainInput);
        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }
        setError('');
        setIsSaving(true);
        try {
            const res = await fetch('/api/settings/domain', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain_name: domainInput })
            });

            if (res.ok) {
                setStatus('active'); // Immediate active as per user request
                showToast('Domain successfully connected!');
            } else {
                const err = await res.json();
                setError(err.error || 'Failed to save domain');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/settings/domain', { method: 'DELETE' });
            if (res.ok) {
                setDomainInput('');
                setStatus('idle');
                setDeleteModal(false);
                showToast('Domain removed');
            }
        } catch (err) {
            showToast('Failed to remove domain');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <ArrowPathIcon className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Settings...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 p-8 min-h-screen bg-slate-50 ">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-[11px] font-black uppercase tracking-widest bg-emerald-500 text-white animate-in slide-in-from-right duration-300">
                    <CheckCircleIcon className="w-5 h-5" /> {toast}
                </div>
            )}

            <div className="max-w-5xl mx-auto">
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[10px] mb-8 font-black uppercase tracking-widest">
                    <a href="/settings" className="text-slate-400 hover:text-primary transition-colors">Settings</a>
                    <ChevronRightIcon className="w-3 h-3 text-slate-300" />
                    <span className="text-primary">Custom Domain</span>
                </div>

                {/* Page Header */}
                <div className="mb-12">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Brand Identity</span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Custom Domain</h2>
                    <p className="text-slate-500 max-w-2xl leading-relaxed font-medium mt-2">Manage your brand identity by connecting a custom domain. These settings help your audience find your work easier.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        
                        {/* Subdomain Status Card */}
                        <Card className="p-8 shadow-sm border-slate-100 rounded-3xl">
                            <div className="flex items-center gap-3 mb-6">
                                <LanguageIcon className="w-5 h-5 text-primary" />
                                <h3 className="font-black text-slate-900 tracking-tight uppercase text-sm">Default Subdomain</h3>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
                                <p className="text-[11px] font-black text-primary break-all uppercase tracking-tight">creator.tepak.id</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Active</span>
                            </div>
                        </Card>

                        {/* Decorative Branding Block */}
                        <div className="bg-slate-900 p-8 rounded-3xl relative overflow-hidden text-white shadow-sm">
                            <div className="relative z-10">
                                <h4 className="text-lg font-black mb-2 uppercase tracking-tight leading-tight">Elevate Your Branding</h4>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">Use a custom domain to look more professional to clients and collaborators.</p>
                            </div>
                            <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                                <CheckBadgeIcon className="w-32 h-32" />
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        
                        {/* Custom Domain Config Card */}
                        <Card className="p-8 shadow-sm border-slate-100 rounded-3xl">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1 uppercase">Connect New Domain</h3>
                                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Follow the steps below to connect your domain.</p>
                                </div>
                                <Badge variant="pro">Configuration</Badge>
                            </div>
                            
                            <div className="space-y-8">
                                {/* Input Step */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Domain Name</label>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <Input 
                                                type="text" 
                                                placeholder="my-store.com" 
                                                className={cn(
                                                    "rounded-xl border-slate-100 uppercase text-xs font-black tracking-tight",
                                                    error ? "ring-2 ring-rose-500" : ""
                                                )}
                                                value={domainInput}
                                                onChange={(e) => {
                                                    setDomainInput(e.target.value.toLowerCase());
                                                    if(error) setError('');
                                                }}
                                                disabled={status !== 'idle' || isSaving}
                                            />
                                        </div>
                                        {status === 'idle' && (
                                            <Button 
                                                variant="primary" 
                                                className="px-8 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 rounded-xl"
                                                onClick={handleSaveDomain}
                                                isLoading={isSaving}
                                            >
                                                Save
                                            </Button>
                                        )}
                                        {status !== 'idle' && (
                                            <Button 
                                                variant="ghost" 
                                                className="px-6 font-black text-[11px] uppercase tracking-widest rounded-xl border border-slate-100"
                                                onClick={() => { setStatus('idle'); setDomainInput(''); }}
                                                disabled={isSaving}
                                            >
                                                Change
                                            </Button>
                                        )}
                                    </div>
                                    {error && <p className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3"/> {error}</p>}
                                </div>

                                {/* DNS Settings Instruction */}
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                                    <h4 className="text-[11px] font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                                        <ServerStackIcon className="w-4 h-4 text-primary" />
                                        DNS Settings Instructions
                                    </h4>
                                    
                                    <div className="overflow-x-auto bg-white border border-slate-50 rounded-xl overflow-hidden mb-6">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-widest px-6">Type</TableHead>
                                                    <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-widest px-6">Name/Host</TableHead>
                                                    <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-widest px-6">Value</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow className="hover:bg-white bg-white">
                                                    <TableCell className="font-black text-[11px] text-slate-900 px-6 uppercase tracking-tight">CNAME</TableCell>
                                                    <TableCell className="font-black text-[11px] text-slate-900 px-6 uppercase tracking-tight">@ or www</TableCell>
                                                    <TableCell className="font-black text-[11px] text-primary px-6 uppercase tracking-tight">custom.tepak.id</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                                        <p className="text-[10px] text-primary font-black uppercase tracking-tight leading-relaxed">
                                            💡 Harap atur DNS CNAME Anda ke <span className="underline italic">custom.tepak.id</span> agar domain dapat terhubung dengan server kami.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Active Custom Domain Card */}
                        {status === 'active' && (
                            <Card className="p-8 shadow-sm border-slate-100 rounded-3xl animate-in fade-in zoom-in duration-500">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 text-emerald-500">
                                            <ShieldCheckIcon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">{domainInput}</h3>
                                            <div className="flex items-center gap-4 mt-2 flex-wrap">
                                                <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                    Active & Connected
                                                </span>
                                                <span className="text-slate-100">•</span>
                                                <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <LockClosedIcon className="w-3.5 h-3.5" />
                                                    SSL Secured
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shrink-0 active:scale-95"
                                        onClick={() => setDeleteModal(true)}
                                        disabled={isSaving}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Delete Domain
                                    </Button>
                                </div>
                            </Card>
                        )}

                    </div>
                </div>
            </div>
        </div>

        {/* Delete Domain Confirm Modal */}
        {deleteModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-8">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-100 mb-4">
                            <TrashIcon className="w-6 h-6 text-rose-500" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Delete Domain?</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Domain <strong className="text-slate-900">{domainInput}</strong> akan dihapus dari akun Anda. Pengunjung tidak lagi bisa mengakses halaman Anda melalui domain ini.
                        </p>
                    </div>
                    <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button className="px-5 py-2.5 rounded-xl font-black text-slate-500 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest" onClick={() => setDeleteModal(false)}>Cancel</button>
                        <button className="px-6 py-2.5 rounded-xl font-black bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all text-[10px] uppercase tracking-widest" onClick={handleDelete} disabled={isSaving}>Yes, Delete</button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

