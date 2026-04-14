import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { Badge } from '../ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';
import { z } from 'zod';
import { cn } from '../../lib/utils';
import { ExclamationCircleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

// Reusable Confirm Modal
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    confirmStyle = 'primary',
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

// Available page blocks / modules
const ALL_BLOCKS = [
    { id: 'hero', label: 'Hero Section', category: 'Layout', desc: 'Full-width banner with headline' },
    { id: 'about', label: 'About Section', category: 'Layout', desc: 'Profile or brand info block' },
    { id: 'testimonial', label: 'Testimonial Block', category: 'Social Proof', desc: 'Customer reviews grid' },
    { id: 'faq', label: 'FAQ Accordion', category: 'Content', desc: 'Collapsible Q&A section' },
    { id: 'gallery', label: 'Photo Gallery', category: 'Media', desc: 'Image grid with lightbox' },
    { id: 'video', label: 'Video Embed', category: 'Media', desc: 'YouTube / custom video player' },
    { id: 'countdown', label: 'Countdown Timer', category: 'Marketing', desc: 'Urgency timer for offers' },
    { id: 'pricing', label: 'Pricing Table', category: 'Commerce', desc: 'Multi-tier pricing display' },
    { id: 'order_form', label: 'Order Form', category: 'Commerce', desc: 'Inline order / checkout form' },
    { id: 'whatsapp_btn', label: 'WhatsApp Button', category: 'Integration', desc: 'Floating WA contact button' },
    { id: 'pixel_tracking', label: 'Pixel / Analytics', category: 'Integration', desc: 'FB Pixel, GA4, TikTok Ads' },
    { id: 'custom_code', label: 'Custom Code Block', category: 'Advanced', desc: 'Inject HTML/CSS/JS snippet' },
];

export const PlanManagementDashboard = () => {
    const [plans, setPlans] = React.useState<any[]>([]);
    const [subStats, setSubStats] = React.useState<any>({ free: 0, pro: 0, enterprise: 0 });
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [saveConfirm, setSaveConfirm] = React.useState(false);
    const [discardConfirm, setDiscardConfirm] = React.useState(false);

    // New plan modal state
    const [newPlan, setNewPlan] = React.useState({
        id: '',
        name: '',
        badge: '',
        price_monthly: 0,
        price_yearly: 0,
        description: '',
        features: [] as string[],
        config: { allowed_blocks: [] as string[] },
    });

    const [errors, setErrors] = React.useState<Record<string, string>>({});

    // Toast
    const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [plansRes, statsRes] = await Promise.all([
                fetch('/api/admin/plans'),
                fetch('/api/admin/subscriptions')
            ]);
            if (plansRes.ok) {
                const data = await plansRes.json();
                setPlans(data);
            }
            if (statsRes.ok) {
                const stats = await statsRes.json();
                setSubStats(stats);
            }
        } catch (err) {
            console.error('Failed to fetch plan data:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handlePriceChange = (planId: string, type: 'price_monthly' | 'price_yearly', value: string) => {
        const numVal = parseFloat(value);
        if (isNaN(numVal)) return;

        setPlans(prev => prev.map(p => p.id === planId ? { ...p, [type]: numVal } : p));
    };

    const handleFeatureToggle = (planId: string, feature: string) => {
        setPlans(prev => prev.map(p => {
            if (p.id !== planId) return p;
            const features = p.features || [];
            return {
                ...p,
                features: features.includes(feature)
                    ? features.filter((f: string) => f !== feature)
                    : [...features, feature]
            };
        }));
    };

    const handleSaveChanges = () => {
        setSaveConfirm(true);
    };

    const executeSave = async () => {
        setSaveConfirm(false);
        try {
            const res = await fetch('/api/admin/plans/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(plans)
            });
            if (!res.ok) throw new Error('Failed to save plans');
            showToast('success', 'Pricing and configuration updated successfully across the platform!');
            fetchData();
        } catch (err: any) {
            showToast('error', err.message);
        }
    };

    const executeDiscard = () => {
        setDiscardConfirm(false);
        fetchData();
    };

    const toggleFeature = (feature: string) => {
        setNewPlan(prev => {
            const features = prev.features || [];
            return {
                ...prev,
                features: features.includes(feature)
                    ? features.filter(f => f !== feature)
                    : [...features, feature]
            };
        });
    };

    const toggleBlock = (blockId: string) => {
        setNewPlan(prev => {
            const blocks = prev.config?.allowed_blocks || [];
            return {
                ...prev,
                config: {
                    ...prev.config,
                    allowed_blocks: blocks.includes(blockId)
                        ? blocks.filter(b => b !== blockId)
                        : [...blocks, blockId]
                }
            };
        });
    };

    const blocksByCategory = ALL_BLOCKS.reduce((acc, block) => {
        if (!acc[block.category]) acc[block.category] = [];
        acc[block.category].push(block);
        return acc;
    }, {} as Record<string, typeof ALL_BLOCKS>);

    if (loading && plans.length === 0) {
        return (
            <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-[#005ab4] border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-[#005ab4] uppercase tracking-widest text-xs">Loading Plan Configurations...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Toast */}
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

            {/* Breadcrumb & Global Actions */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#00458d] tracking-widest uppercase mb-2">
                        <span>Platform Management</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-[#465f89]">Plans & Pricing</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-[#005ab4] tracking-tight">Subscription Plans</h2>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm" onClick={() => setDiscardConfirm(true)}>
                        Discard Changes
                    </Button>
                    <Button variant="primary" className="bg-[#465f89] text-white hover:shadow-lg hover:shadow-[#465f89]/20 transition-all font-bold text-sm px-6" onClick={handleSaveChanges}>
                        Save All Changes
                    </Button>
                    <Button variant="ghost" className="bg-slate-50 text-slate-900 border-none font-bold text-sm px-4" onClick={() => setIsModalOpen(true)}>
                        + New Plan
                    </Button>
                </div>
            </div>

            {/* Plan Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {plans.map((plan) => (
                    <Card key={plan.id} className={cn(
                        "p-8 relative group overflow-hidden border transition-all",
                        plan.id === 'pro' 
                            ? "border-[#d6e3ff] bg-gradient-to-br from-white to-[#f8faff] shadow-xl shadow-blue-500/5" 
                            : "border-slate-200/60 shadow-sm"
                    )}>
                        <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:transition-colors",
                            plan.id === 'pro' ? "bg-[#d6e3ff]/30 group-hover:bg-[#d6e3ff]/50" : "bg-slate-50 group-hover:bg-slate-100"
                        )}></div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all",
                                    plan.id === 'pro' ? "bg-[#005ab4] text-white shadow-blue-500/20" : "bg-slate-100 text-slate-500 shadow-transparent"
                                )}>
                                    <span className="material-symbols-outlined text-2xl">{plan.id === 'pro' ? 'rocket_launch' : 'eco'}</span>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant="ghost" className={cn(
                                        "border-none font-black text-[10px]",
                                        plan.id === 'pro' ? "bg-[#005ab4] text-white animate-pulse" : "bg-slate-100 text-slate-600"
                                    )}>{plan.badge || 'DEFAULT'}</Badge>
                                    <span className="text-[9px] font-black text-slate-400 tracking-widest">{subStats[plan.id] || 0} SUBSCRIBERS</span>
                                </div>
                            </div>
                            <h3 className={cn("text-2xl font-black mb-2", plan.id === 'pro' ? "text-[#005ab4]" : "text-slate-900")}>{plan.name}</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-[200px]">{plan.description}</p>
                            
                            <div className="grid grid-cols-2 gap-4 mt-auto">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly (Rp)</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={plan.price_monthly} 
                                            onChange={(e) => handlePriceChange(plan.id, 'price_monthly', e.target.value)}
                                            className={cn(
                                                "w-full border rounded-xl py-2.5 px-3 text-lg font-black focus:ring-2 outline-none transition-all",
                                                plan.id === 'pro' ? "bg-white border-[#d6e3ff] text-[#005ab4] focus:ring-[#005ab4]/20" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#465f89]/20"
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yearly (Rp)</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={plan.price_yearly} 
                                            onChange={(e) => handlePriceChange(plan.id, 'price_yearly', e.target.value)}
                                            className={cn(
                                                "w-full border rounded-xl py-2.5 px-3 text-lg font-black focus:ring-2 outline-none transition-all",
                                                plan.id === 'pro' ? "bg-white border-[#d6e3ff] text-[#005ab4] focus:ring-[#005ab4]/20" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#465f89]/20"
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Feature Matrix */}
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#005ab4]">Feature Management</h3>
                    <Button variant="ghost" className="text-xs font-bold text-[#465f89] hover:bg-slate-100">+ Add Global Feature</Button>
                </div>

                <Card className="overflow-hidden border-slate-100 shadow-sm p-0">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-none">
                                <TableHead className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Feature Capability</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Standard</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">PRO Tier</TableHead>
                                <TableHead className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Category</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="font-bold text-slate-700">Landing Page Builder</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Core drag-and-drop editor access</div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={true} onChange={() => {}} /></div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={true} onChange={() => {}} /></div>
                                </TableCell>
                                <TableCell className="px-8 text-right">
                                    <Badge variant="ghost" className="bg-blue-50 text-blue-600 border-none text-[9px] font-black">CORE</Badge>
                                </TableCell>
                            </TableRow>
                             <TableRow className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="font-bold text-slate-700">Digital Product Sales</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Sell PDF, Videos, or Files</div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={plans.find(p=>p.id==='free')?.features?.includes('Digital Product Sales')} onChange={() => handleFeatureToggle('free', 'Digital Product Sales')} /></div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={plans.find(p=>p.id==='pro')?.features?.includes('Digital Product Sales')} onChange={() => handleFeatureToggle('pro', 'Digital Product Sales')} /></div>
                                </TableCell>
                                <TableCell className="px-8 text-right">
                                    <Badge variant="ghost" className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black">COMMERCE</Badge>
                                </TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="font-bold text-slate-700">Custom Domain (CNAME)</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Connect external domains</div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={plans.find(p=>p.id==='free')?.features?.includes('Custom Domain (CNAME)')} onChange={() => handleFeatureToggle('free', 'Custom Domain (CNAME)')} /></div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={plans.find(p=>p.id==='pro')?.features?.includes('Custom Domain (CNAME)')} onChange={() => handleFeatureToggle('pro', 'Custom Domain (CNAME)')} /></div>
                                </TableCell>
                                <TableCell className="px-8 text-right">
                                    <Badge variant="ghost" className="bg-purple-50 text-purple-600 border-none text-[9px] font-black">PREMIUM</Badge>
                                </TableCell>
                            </TableRow>
                            <TableRow className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8 py-5">
                                    <div className="font-bold text-slate-700">WhatsApp Notification</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Direct order alerts to W.A</div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={plans.find(p=>p.id==='free')?.features?.includes('WhatsApp Notification')} onChange={() => handleFeatureToggle('free', 'WhatsApp Notification')} /></div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={plans.find(p=>p.id==='pro')?.features?.includes('WhatsApp Notification')} onChange={() => handleFeatureToggle('pro', 'WhatsApp Notification')} /></div>
                                </TableCell>
                                <TableCell className="px-8 text-right">
                                    <Badge variant="ghost" className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black">INTEGRATION</Badge>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* Add Plan Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#005ab4]/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-[#005ab4]">Create New Plan</h2>
                                <p className="text-sm text-slate-500 font-medium">Define a new subscription tier for your creators.</p>
                            </div>
                            <button 
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto space-y-8">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#00458d] uppercase tracking-widest">Plan Name</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#005ab4]/20 outline-none transition-all font-bold text-slate-900" 
                                        placeholder="e.g. Agency Plus" 
                                        type="text" 
                                        value={newPlan.name}
                                        onChange={e => setNewPlan(p => ({...p, name: e.target.value}))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#00458d] uppercase tracking-widest">Badge Label</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#005ab4]/20 outline-none transition-all font-bold text-slate-900" 
                                        placeholder="e.g. BUSINESS" 
                                        type="text"
                                        value={newPlan.badge}
                                        onChange={e => setNewPlan(p => ({...p, badge: e.target.value}))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#00458d] uppercase tracking-widest">Pricing Structure</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-[#005ab4]/20 outline-none transition-all font-black text-slate-900" 
                                            placeholder="Monthly price" 
                                            type="number" 
                                            value={newPlan.price_monthly}
                                            onChange={e => setNewPlan(p => ({...p, price_monthly: Number(e.target.value)}))}
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-[#005ab4]/20 outline-none transition-all font-black text-slate-900" 
                                            placeholder="Yearly price" 
                                            type="number"
                                            value={newPlan.price_yearly}
                                            onChange={e => setNewPlan(p => ({...p, price_yearly: Number(e.target.value)}))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#00458d] uppercase tracking-widest">Short Description</label>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#005ab4]/20 outline-none transition-all font-medium text-slate-900 h-20 resize-none" 
                                    placeholder="Explain the value proposition..."
                                    value={newPlan.description}
                                    onChange={e => setNewPlan(p => ({...p, description: e.target.value}))}
                                />
                            </div>

                            {/* Core Feature Access */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div>
                                    <label className="text-[10px] font-black text-[#005ab4] uppercase tracking-widest">Core Feature Access</label>
                                    <p className="text-[10px] text-slate-400 mt-1">Select which platform features are included in this plan.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Custom Domain', 'Unlimited Products', 'Priority Support', 'API Access', 'White-labeling', 'Advanced Analytics'].map(feature => (
                                        <label key={feature} className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                                            (newPlan.features || []).includes(feature)
                                                ? "bg-blue-50 border-[#005ab4]/30 text-[#005ab4]"
                                                : "bg-slate-50 border-transparent hover:bg-slate-100 text-slate-700"
                                        )}>
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-slate-300 text-[#005ab4] focus:ring-[#005ab4]/20"
                                                checked={(newPlan.features || []).includes(feature)}
                                                onChange={() => toggleFeature(feature)}
                                            />
                                            <span className="text-xs font-bold">{feature}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Page Blocks / Modules */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div>
                                    <label className="text-[10px] font-black text-[#005ab4] uppercase tracking-widest">Allowed Page Blocks</label>
                                    <p className="text-[10px] text-slate-400 mt-1">Choose which blocks/sections users on this plan can add to their pages.</p>
                                </div>
                                <div className="space-y-5">
                                    {Object.entries(blocksByCategory).map(([category, blocks]) => (
                                        <div key={category}>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{category}</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {blocks.map(block => (
                                                    <label key={block.id} className={cn(
                                                        "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                                                        (newPlan.config?.allowed_blocks || []).includes(block.id)
                                                            ? "bg-blue-50 border-[#005ab4]/30"
                                                            : "bg-slate-50 border-transparent hover:bg-slate-100"
                                                    )}>
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-4 h-4 rounded border-slate-300 text-[#005ab4] focus:ring-[#005ab4]/20 mt-0.5 shrink-0"
                                                            checked={(newPlan.config?.allowed_blocks || []).includes(block.id)}
                                                            onChange={() => toggleBlock(block.id)}
                                                        />
                                                        <div>
                                                            <span className={cn("text-xs font-bold block", (newPlan.config?.allowed_blocks || []).includes(block.id) ? "text-[#005ab4]" : "text-slate-700")}>{block.label}</span>
                                                            <span className="text-[9px] text-slate-400">{block.desc}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-[10px] text-slate-400 font-medium">
                                {(newPlan.config?.allowed_blocks || []).length} blocks · {(newPlan.features || []).length} features selected
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-xs uppercase tracking-widest"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="px-8 py-2.5 rounded-xl bg-[#465f89] text-white font-bold shadow-lg shadow-[#465f89]/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        showToast('success', `Plan "${newPlan.name || 'New Plan'}" berhasil dibuat dan dipublikasikan.`);
                                    }}
                                >
                                    Publish Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Confirm Modal */}
            <ConfirmModal
                isOpen={saveConfirm}
                onClose={() => setSaveConfirm(false)}
                onConfirm={executeSave}
                title="Save All Changes?"
                confirmLabel="Yes, Save Changes"
                confirmStyle="primary"
                icon={
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-100">
                        <CheckCircleIcon className="w-6 h-6 text-[#005ab4]" />
                    </div>
                }
                message="Perubahan harga dan konfigurasi akan langsung diterapkan ke seluruh platform. Pastikan semua nilai sudah benar sebelum menyimpan."
            />

            {/* Discard Confirm Modal */}
            <ConfirmModal
                isOpen={discardConfirm}
                onClose={() => setDiscardConfirm(false)}
                onConfirm={executeDiscard}
                title="Discard All Changes?"
                confirmLabel="Yes, Discard"
                confirmStyle="danger"
                icon={
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-100">
                        <XCircleIcon className="w-6 h-6 text-rose-500" />
                    </div>
                }
                message="Semua perubahan yang belum disimpan akan hilang. Tindakan ini tidak dapat dibatalkan."
            />
        </div>
    );
};
