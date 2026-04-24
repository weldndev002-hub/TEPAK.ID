import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import AvatarUpload from '../ui/AvatarUpload';
import { Toggle } from '../ui/Toggle';
import { z } from 'zod';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

const feeSchema = z.number().min(0, "Fee tidak boleh negatif").max(100, "Fee tidak boleh lebih dari 100%");

export const AdminGeneralSettings = () => {
    const [settings, setSettings] = React.useState<any>({
        site_name: 'Orbit Site',
        site_tagline: 'The Digital Hub for Creators',
        logo_url: '',
        favicon_url: '',
        primary_color: '#005ab4',
        support_email: 'support@orbitsite.com',
        whatsapp_number: '+62 812 3456 7890',
        office_address: 'Studio Nusantara Hub, 4th Floor, Jl. Sudirman No. 12, Jakarta',
        platform_fee: 5,
        maintenance_mode: false,
        registration_enabled: true,
        payouts_enabled: true,
        seo_description: "Transform your creative potential into a sustainable digital career with Orbit Site"
    });

    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
    const [isUploadingFavicon, setIsUploadingFavicon] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const faviconInputRef = React.useRef<HTMLInputElement>(null);
    const [feeError, setFeeError] = React.useState<string | null>(null);
    const [saveConfirm, setSaveConfirm] = React.useState(false);
    const [discardConfirm, setDiscardConfirm] = React.useState(false);

    // Toast
    const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                if (!res.ok) throw new Error('Failed to fetch settings');
                const data = await res.json();

                // Merge default state with DB data
                setSettings((prev: any) => ({
                    ...prev,
                    ...data
                }));
            } catch (err) {
                console.error('[Settings Fetch Error]', err);
                showToast('error', 'Gagal memuat pengaturan. Menggunakan data default.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleFeeChange = (value: number) => {
        setSettings({ ...settings, platform_fee: value });
        // Real-time validation
        try {
            feeSchema.parse(value);
            setFeeError(null);
        } catch (err: any) {
            setFeeError(err.errors[0].message);
        }
    };

    const handleSave = () => {
        try {
            feeSchema.parse(Number(settings.platform_fee));
            setFeeError(null);
            setSaveConfirm(true);
        } catch (err: any) {
            setFeeError(err.errors[0].message);
        }
    };

    const executeSave = async () => {
        setSaveConfirm(false);
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!res.ok) throw new Error('Failed to update settings');

            showToast('success', `Pengaturan platform berhasil diperbarui.`);
        } catch (err) {
            console.error('[Settings Update Error]', err);
            showToast('error', 'Gagal menyimpan perubahan ke database.');
        } finally {
            setIsSaving(false);
        }
    };

    const executeDiscard = () => {
        setDiscardConfirm(false);
        window.location.reload();
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingLogo(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload-logo', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Failed to upload logo');
            const data = await res.json();

            setSettings({ ...settings, logo_url: data.url });
            showToast('success', 'Logo uploaded successfully!');
        } catch (err: any) {
            console.error('[Logo Upload Error]', err);
            showToast('error', 'Gagal mengunggah logo.');
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingFavicon(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/upload-logo', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Failed to upload favicon');
            const data = await res.json();

            setSettings({ ...settings, favicon_url: data.url });
            showToast('success', 'Favicon uploaded successfully!');
        } catch (err: any) {
            console.error('[Favicon Upload Error]', err);
            showToast('error', 'Gagal mengunggah favicon.');
        } finally {
            setIsUploadingFavicon(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Memuat Konfigurasi...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Toast */}
            {toast && (
                <div className={cn(
                    "fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold animate-in fade-in slide-in-from-top-4",
                    toast.type === 'success' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                )}>
                    {toast.type === 'success'
                        ? <CheckCircleIcon className="w-5 h-5 shrink-0" />
                        : <XCircleIcon className="w-5 h-5 shrink-0" />
                    }
                    {toast.message}
                </div>
            )}
            {/* Breadcrumb & Sub Nav */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00458d] tracking-widest uppercase mb-4">
                    <span>Platform Settings</span>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-[#465f89]">General Settings</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-3xl font-extrabold text-primary tracking-tight">General Settings</h2>
                    <div className="flex gap-3">
                        <Button variant="ghost" className="bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all text-sm font-semibold border-transparent" onClick={() => setDiscardConfirm(true)}>
                            Discard Changes
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} variant="primary" className="bg-[#465f89] text-white hover:shadow-lg hover:shadow-[#465f89]/20 transition-all text-sm font-semibold shadow-sm">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                {/* Internal Sub-Navigation */}
                <div className="flex overflow-x-auto no-scrollbar gap-8 mt-8 border-b border-slate-200">
                    <button className="pb-4 text-sm font-bold text-primary relative whitespace-nowrap">
                        General Settings
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form Section */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Site Identity Card */}
                    <Card className="p-8 border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">branding_watermark</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-primary">Branding & Identity</h3>
                                <p className="text-sm text-slate-500">How the platform appears to your creators and customers.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Platform Name</label>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#465f89] outline-none transition-all font-semibold"
                                        type="text"
                                        value={settings.site_name || ''}
                                        onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Slogan / Tagline</label>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#465f89] outline-none transition-all font-semibold"
                                        type="text"
                                        value={settings.site_tagline || ''}
                                        onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider block">Official Logo</label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                    />
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn(
                                            "w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 relative group cursor-pointer overflow-hidden transition-all",
                                            isUploadingLogo && "opacity-50 cursor-wait"
                                        )}
                                    >
                                        {settings.logo_url ? (
                                            <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="text-2xl font-black text-primary">Logo</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            {isUploadingLogo ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <span className="material-symbols-outlined text-white">upload</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">PNG or SVG, Min 256x256px</p>
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider block">Platform Favicon</label>
                                        <input
                                            type="file"
                                            ref={faviconInputRef}
                                            className="hidden"
                                            accept="image/x-icon,image/png,image/svg+xml"
                                            onChange={handleFaviconUpload}
                                        />
                                        <div
                                            onClick={() => faviconInputRef.current?.click()}
                                            className={cn(
                                                "w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 relative group cursor-pointer overflow-hidden transition-all",
                                                isUploadingFavicon && "opacity-50 cursor-wait"
                                            )}
                                        >
                                            {settings.favicon_url ? (
                                                <img src={settings.favicon_url} alt="Favicon" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <div className="text-[10px] font-black text-slate-400">ICO</div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                {isUploadingFavicon ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <span className="material-symbols-outlined text-white text-sm">upload</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-medium">ICO, PNG, or SVG (Square Recommended)</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Primary System Theme (HSL/Hex)</label>
                                        <div className="flex gap-4 items-center">
                                            <input
                                                type="color"
                                                className="w-10 h-10 rounded-full border-none cursor-pointer"
                                                value={settings.primary_color || ''}
                                                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                                            />
                                            <span className="text-xs font-mono text-slate-500 uppercase">{settings.primary_color}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Support & Contact Card */}
                    <Card className="p-8 border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-[#ffddb2] rounded-lg flex items-center justify-center text-[#7e5300]">
                                <span className="material-symbols-outlined">headset_mic</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#005ab4]">Contact & Support</h3>
                                <p className="text-sm text-slate-500">Channels for creator support and system inquiries.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Support Email Address</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#465f89] outline-none transition-all font-semibold"
                                        type="email"
                                        value={settings.support_email || ''}
                                        onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">WhatsApp Support Number</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">chat</span>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#465f89] outline-none transition-all font-semibold"
                                        type="text"
                                        value={settings.whatsapp_number || ''}
                                        onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Physical Office Address</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#465f89] outline-none transition-all font-semibold h-24 resize-none"
                                    value={settings.office_address || ''}
                                    onChange={(e) => setSettings({ ...settings, office_address: e.target.value })}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Fees & Commission Card */}
                    <Card className="p-8 border-slate-100 shadow-xl shadow-blue-500/5 bg-blue-50/20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-primary uppercase tracking-tight">Platform Fee Management</h3>
                                <p className="text-xs text-[#465f89] font-medium">Global commission rate for digital product sales.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Global Transaction Fee (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className={`w-full bg-white border ${feeError ? 'border-rose-500 ring-4 ring-rose-500/5' : 'border-slate-200'} rounded-xl py-3 px-4 text-sm font-black text-[#005ab4] focus:ring-4 focus:ring-blue-600/5 outline-none transition-all`}
                                        value={settings.platform_fee || 0}
                                        onChange={(e) => handleFeeChange(Number(e.target.value))}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                                </div>
                                {feeError && <p className="text-[10px] font-bold text-rose-500 px-1">{feeError}</p>}
                                <p className="text-[10px] text-[#465f89] font-medium italic mt-2">
                                    *Nilai ini akan langsung memotong "Net Amount" pada setiap transaksi baru berikutnya.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-blue-100 space-y-4">
                                <h4 className="text-[10px] font-black text-[#005ab4] uppercase tracking-widest">Fee Impact Projection</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Product Sale Price</span>
                                        <span className="font-bold text-slate-900">Rp 100.000</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium font-bold">Platform Fee ({settings.platform_fee}%)</span>
                                        <span className="font-bold text-rose-500">-Rp {(100000 * settings.platform_fee / 100).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-primary uppercase">Creator Gets</span>
                                        <span className="text-lg font-black text-emerald-600">Rp {(100000 - (100000 * settings.platform_fee / 100)).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Platform Status & Meta */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Platform Mode Card */}
                    <Card className="p-8 border-slate-200/60 shadow-sm overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-[#005ab4] mb-1">Platform Mode</h3>
                            <p className="text-xs text-slate-500 mb-6 font-medium">Control global accessibility</p>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Maintenance Mode</p>
                                        <p className="text-[10px] text-slate-500">Stop all traffic except Admin</p>
                                    </div>
                                    <Toggle
                                        checked={settings.maintenance_mode}
                                        onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">New Registration</p>
                                        <p className="text-[10px] text-slate-500">Allow new creators to join</p>
                                    </div>
                                    <Toggle
                                        checked={settings.registration_enabled}
                                        onChange={(e) => setSettings({ ...settings, registration_enabled: e.target.checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Payout Requests</p>
                                        <p className="text-[10px] text-slate-500">Pause wallet withdrawals</p>
                                    </div>
                                    <Toggle
                                        checked={settings.payouts_enabled}
                                        onChange={(e) => setSettings({ ...settings, payouts_enabled: e.target.checked })}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 border-t border-slate-100 pt-6">
                                <div className="flex items-center gap-3 text-emerald-600">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs font-bold tracking-widest uppercase">System Online</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">Synced with Database</p>
                            </div>
                        </div>

                        {/* Decorative BG element */}
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
                    </Card>

                    {/* Meta & SEO Spotlight */}
                    <Card className="p-8 bg-slate-900 border-none shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">SEO Spotlight</span>
                                <span className="material-symbols-outlined text-blue-400 text-lg">search_insights</span>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-4">Meta Optimization</h4>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">Ensure your platform is indexed correctly by search engines to attract organic creators.</p>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Default Meta Description</p>
                                    <textarea
                                        className="w-full p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-slate-300 italic group-hover:border-blue-500/30 transition-colors resize-none h-20 outline-none focus:ring-1 focus:ring-blue-500/50"
                                        value={settings.seo_description || ''}
                                        onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="absolute right-0 bottom-0 opacity-[0.05] pointer-events-none transform translate-x-1/4 translate-y-1/4">
                            <span className="material-symbols-outlined text-[180px]">public</span>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Save Confirm Modal */}
            {saveConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden">
                        <div className="p-8">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-100 mb-4">
                                <CheckCircleIcon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Save All Changes?</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Konfigurasi platform akan diperbarui di database. Perubahan biaya menjadi <strong className="text-primary">{settings.platform_fee}%</strong> akan langsung berlaku.
                            </p>
                        </div>
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button className="px-5 py-2.5 rounded-xl font-black text-slate-500 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest" onClick={() => setSaveConfirm(false)}>Cancel</button>
                            <button className="px-6 py-2.5 rounded-xl font-black bg-[#465f89] hover:bg-[#3a4f75] text-white shadow-lg shadow-[#465f89]/20 transition-all text-[10px] uppercase tracking-widest" onClick={executeSave}>Yes, Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Discard Confirm Modal */}
            {discardConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden">
                        <div className="p-8">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-100 mb-4">
                                <XCircleIcon className="w-6 h-6 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Discard Changes?</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Semua perubahan yang belum disimpan akan hilang. Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button className="px-5 py-2.5 rounded-xl font-black text-slate-500 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest" onClick={() => setDiscardConfirm(false)}>Cancel</button>
                            <button className="px-6 py-2.5 rounded-xl font-black bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all text-[10px] uppercase tracking-widest" onClick={executeDiscard}>Yes, Discard</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
