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
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [saveConfirm, setSaveConfirm] = React.useState(false);
    const [discardConfirm, setDiscardConfirm] = React.useState(false);

    // New plan modal state
    const [newPlan, setNewPlan] = React.useState({
        name: '',
        badge: '',
        priceMonthly: '',
        priceYearly: '',
        description: '',
        selectedFeatures: [] as string[],
        selectedBlocks: [] as string[],
    });

    const [prices, setPrices] = React.useState({
        standardMonthly: 0,
        standardYearly: 0,
        proMonthly: 29,
        proYearly: 290
    });
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    // Toast
    const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const priceSchema = z.number({ 
        invalid_type_error: "Price must be a number",
        required_error: "Required"
    }).nonnegative("Must be 0 or greater").finite();

    const handlePriceChange = (key: keyof typeof prices, value: string) => {
        const numVal = parseFloat(value);
        const result = priceSchema.safeParse(numVal);
        
        if (!result.success) {
            setErrors(prev => ({ ...prev, [key]: result.error.issues[0].message }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[key];
                return newErrors;
            });
            setPrices(prev => ({ ...prev, [key]: numVal }));
        }
    };

    const handleSaveChanges = () => {
        if (Object.keys(errors).length > 0) {
            showToast('error', 'Please fix validation errors before saving.');
            return;
        }
        setSaveConfirm(true);
    };

    const executeSave = () => {
        setSaveConfirm(false);
        showToast('success', 'Pricing and configuration updated successfully across the platform!');
    };

    const executeDiscard = () => {
        setDiscardConfirm(false);
        window.location.reload();
    };

    const toggleFeature = (feature: string) => {
        setNewPlan(prev => ({
            ...prev,
            selectedFeatures: prev.selectedFeatures.includes(feature)
                ? prev.selectedFeatures.filter(f => f !== feature)
                : [...prev.selectedFeatures, feature]
        }));
    };

    const toggleBlock = (blockId: string) => {
        setNewPlan(prev => ({
            ...prev,
            selectedBlocks: prev.selectedBlocks.includes(blockId)
                ? prev.selectedBlocks.filter(b => b !== blockId)
                : [...prev.selectedBlocks, blockId]
        }));
    };

    const blocksByCategory = ALL_BLOCKS.reduce((acc, block) => {
        if (!acc[block.category]) acc[block.category] = [];
        acc[block.category].push(block);
        return acc;
    }, {} as Record<string, typeof ALL_BLOCKS>);

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
                {/* Standard Plan Card */}
                <Card className="p-8 border-slate-200/60 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-slate-100 transition-colors"></div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                                <span className="material-symbols-outlined text-2xl">eco</span>
                            </div>
                            <Badge variant="ghost" className="bg-slate-100 text-slate-600 border-none font-black text-[10px]">CURRENT DEFAULTS</Badge>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Standard Plan</h3>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed">Essential features for creators starting their digital journey.</p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                                    <input 
                                        type="text" 
                                        defaultValue={prices.standardMonthly} 
                                        onChange={(e) => handlePriceChange('standardMonthly', e.target.value)}
                                        className={cn(
                                            "w-full bg-slate-50 border rounded-xl py-2.5 pl-7 pr-3 text-lg font-black text-slate-900 focus:ring-2 outline-none transition-all",
                                            errors.standardMonthly ? "border-rose-500 focus:ring-rose-500/20" : "border-slate-200 focus:ring-[#465f89]/20"
                                        )}
                                    />
                                    {errors.standardMonthly && <p className="text-[9px] font-black text-rose-500 uppercase mt-1 flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3"/> {errors.standardMonthly}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yearly Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                                    <input 
                                        type="text" 
                                        defaultValue={prices.standardYearly} 
                                        onChange={(e) => handlePriceChange('standardYearly', e.target.value)}
                                        className={cn(
                                            "w-full bg-slate-50 border rounded-xl py-2.5 pl-7 pr-3 text-lg font-black text-slate-900 focus:ring-2 outline-none transition-all",
                                            errors.standardYearly ? "border-rose-500 focus:ring-rose-500/20" : "border-slate-200 focus:ring-[#465f89]/20"
                                        )}
                                    />
                                    {errors.standardYearly && <p className="text-[9px] font-black text-rose-500 uppercase mt-1 flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3"/> {errors.standardYearly}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* PRO Plan Card */}
                <Card className="p-8 border-[#d6e3ff] bg-gradient-to-br from-white to-[#f8faff] shadow-xl shadow-blue-500/5 relative group overflow-hidden border">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#d6e3ff]/30 rounded-full -mr-16 -mt-16 group-hover:bg-[#d6e3ff]/50 transition-colors"></div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-[#005ab4] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                            </div>
                            <Badge className="bg-[#005ab4] text-white border-none font-black text-[10px] animate-pulse">MOST POPULAR</Badge>
                        </div>
                        <h3 className="text-2xl font-black text-[#005ab4] mb-2">PRO Plan</h3>
                        <p className="text-sm text-blue-900/60 mb-8 leading-relaxed">Advanced tools, deeper analytics, and premium integrations.</p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#00458d] uppercase tracking-widest">Monthly Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-sm">$</span>
                                    <input 
                                        type="text" 
                                        defaultValue={prices.proMonthly} 
                                        onChange={(e) => handlePriceChange('proMonthly', e.target.value)}
                                        className={cn(
                                            "w-full bg-white border rounded-xl py-2.5 pl-7 pr-3 text-lg font-black text-[#005ab4] focus:ring-2 outline-none shadow-sm transition-all",
                                            errors.proMonthly ? "border-rose-500 focus:ring-rose-500/20" : "border-[#d6e3ff] focus:ring-[#005ab4]/20"
                                        )}
                                    />
                                    {errors.proMonthly && <p className="text-[9px] font-black text-rose-500 uppercase mt-1 flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3"/> {errors.proMonthly}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#00458d] uppercase tracking-widest">Yearly Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-sm">$</span>
                                    <input 
                                        type="text" 
                                        defaultValue={prices.proYearly} 
                                        onChange={(e) => handlePriceChange('proYearly', e.target.value)}
                                        className={cn(
                                            "w-full bg-white border rounded-xl py-2.5 pl-7 pr-3 text-lg font-black text-[#005ab4] focus:ring-2 outline-none shadow-sm transition-all",
                                            errors.proYearly ? "border-rose-500 focus:ring-rose-500/20" : "border-[#d6e3ff] focus:ring-[#005ab4]/20"
                                        )}
                                    />
                                    {errors.proYearly && <p className="text-[9px] font-black text-rose-500 uppercase mt-1 flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3"/> {errors.proYearly}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
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
                                    <div className="flex justify-center"><Toggle checked={false} onChange={() => {}} /></div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={true} onChange={() => {}} /></div>
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
                                    <div className="flex justify-center"><Toggle checked={false} onChange={() => {}} /></div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={true} onChange={() => {}} /></div>
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
                                    <div className="flex justify-center"><Toggle checked={false} onChange={() => {}} /></div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center"><Toggle checked={true} onChange={() => {}} /></div>
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
                                            value={newPlan.priceMonthly}
                                            onChange={e => setNewPlan(p => ({...p, priceMonthly: e.target.value}))}
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-[#005ab4]/20 outline-none transition-all font-black text-slate-900" 
                                            placeholder="Yearly price" 
                                            type="number"
                                            value={newPlan.priceYearly}
                                            onChange={e => setNewPlan(p => ({...p, priceYearly: e.target.value}))}
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
                                            newPlan.selectedFeatures.includes(feature)
                                                ? "bg-blue-50 border-[#005ab4]/30 text-[#005ab4]"
                                                : "bg-slate-50 border-transparent hover:bg-slate-100 text-slate-700"
                                        )}>
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-slate-300 text-[#005ab4] focus:ring-[#005ab4]/20"
                                                checked={newPlan.selectedFeatures.includes(feature)}
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
                                                        newPlan.selectedBlocks.includes(block.id)
                                                            ? "bg-blue-50 border-[#005ab4]/30"
                                                            : "bg-slate-50 border-transparent hover:bg-slate-100"
                                                    )}>
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-4 h-4 rounded border-slate-300 text-[#005ab4] focus:ring-[#005ab4]/20 mt-0.5 shrink-0"
                                                            checked={newPlan.selectedBlocks.includes(block.id)}
                                                            onChange={() => toggleBlock(block.id)}
                                                        />
                                                        <div>
                                                            <span className={cn("text-xs font-bold block", newPlan.selectedBlocks.includes(block.id) ? "text-[#005ab4]" : "text-slate-700")}>{block.label}</span>
                                                            <span className="text-[9px] text-slate-400">{block.desc}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {newPlan.selectedBlocks.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest self-center">Selected:</span>
                                        {newPlan.selectedBlocks.map(id => {
                                            const block = ALL_BLOCKS.find(b => b.id === id);
                                            return block ? (
                                                <span key={id} className="text-[9px] font-black bg-[#005ab4]/10 text-[#005ab4] px-2 py-1 rounded-lg uppercase">
                                                    {block.label}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-[10px] text-slate-400 font-medium">
                                {newPlan.selectedBlocks.length} blocks · {newPlan.selectedFeatures.length} features selected
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
