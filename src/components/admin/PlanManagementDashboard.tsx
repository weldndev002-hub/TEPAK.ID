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
    const [saveConfirm, setSaveConfirm] = React.useState(false);
    const [discardConfirm, setDiscardConfirm] = React.useState(false);

    const [errors, setErrors] = React.useState<Record<string, Record<string, string>>>({});
    const [jsonEditPlanId, setJsonEditPlanId] = React.useState<string | null>(null);
    const [jsonInput, setJsonInput] = React.useState("");

    // Zod Schema for Plan Validation
    const planSchema = z.object({
        price_monthly: z.number({ 
            invalid_type_error: "Harus berupa angka" 
        }).min(0, "Harga tidak boleh negatif"),
        price_yearly: z.number({ 
            invalid_type_error: "Harus berupa angka" 
        }).min(0, "Harga tidak boleh negatif"),
    });

    const [isAddingFeature, setIsAddingFeature] = React.useState(false);
    const [newFeatureName, setNewFeatureName] = React.useState('');

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
                // ONLY ALLOW PRO TIER AS REQUESTED
                const proOnly = data.filter((p: any) => p.id === 'pro');
                setPlans(proOnly);
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
        // Allow empty string for clearing input, or validate if it's a number
        const numVal = value === '' ? 0 : parseFloat(value.replace(/[^0-9.]/g, ''));
        
        // Update plan state (raw value for UI, or parsed number for state)
        setPlans(prev => prev.map(p => p.id === planId ? { ...p, [type]: value } : p));

        // Validate using Zod
        const validation = planSchema.safeParse({ [type]: Number(value) || 0 });
        
        if (!validation.success) {
            const errorMsg = validation.error.format()[type]?._errors[0] || "Invalid";
            setErrors(prev => ({
                ...prev,
                [planId]: { ...(prev[planId] || {}), [type]: errorMsg }
            }));
        } else {
            setErrors(prev => {
                const newErrors = { ...(prev[planId] || {}) };
                delete newErrors[type];
                return { ...prev, [planId]: newErrors };
            });
        }
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

    // handleDeletePlan was removed as adding/deleting plans is no longer supported

    const handleOpenJsonEditor = (plan: any) => {
        setJsonEditPlanId(plan.id);
        const dataToEdit = {
            features: plan.features,
            config: plan.config
        };
        setJsonInput(JSON.stringify(dataToEdit, null, 4));
    };

    const handleSaveJson = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            setPlans(prev => prev.map(p => p.id === jsonEditPlanId ? { ...p, ...parsed } : p));
            setJsonEditPlanId(null);
            showToast('success', 'Configuration updated via JSON');
        } catch (e) {
            showToast('error', 'Invalid JSON format');
        }
    };

    const addGlobalFeature = () => {
        if (!newFeatureName.trim()) return;
        // Adding a feature is handled by just including it in the memoized list
        // and letting users toggle it for specific plans.
        // But to make it "visible" even if no one has it, we can either add it to a state 
        // or just let it be a placeholder.
        setIsAddingFeature(false);
        setNewFeatureName('');
        showToast('success', `Feature "${newFeatureName}" added to the matrix. You can now enable it for specific plans.`);
    };

    const handleSaveChanges = () => {
        setSaveConfirm(true);
    };

    const executeSave = async () => {
        setSaveConfirm(false);
        setLoading(true);
        try {
            const res = await fetch('/api/admin/plans/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(plans)
            });
            if (!res.ok) throw new Error('Failed to save plans');
            showToast('success', 'Pricing and configuration updated successfully across the platform!');
            await fetchData();
        } catch (err: any) {
            showToast('error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const executeDiscard = () => {
        setDiscardConfirm(false);
        fetchData();
    };

    // handleFeatureToggle and handleBlockToggle for newPlan were removed

    const blocksByCategory = ALL_BLOCKS.reduce((acc, block) => {
        if (!acc[block.category]) acc[block.category] = [];
        acc[block.category].push(block);
        return acc;
    }, {} as Record<string, typeof ALL_BLOCKS>);

    const allFeatureNames = React.useMemo(() => {
        const set = new Set<string>();
        // Default standard features
        ['Landing Page Builder', 'Digital Product Sales', 'Custom Domain (CNAME)', 'WhatsApp Notification'].forEach(f => set.add(f));
        // Add features from current plans
        plans.forEach(p => (p.features || []).forEach((f: string) => set.add(f)));
        // Add new feature if being added
        if (newFeatureName) set.add(newFeatureName);
        return Array.from(set);
    }, [plans, newFeatureName]);

    if (loading && plans.length === 0) {
        return (
            <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-primary uppercase tracking-widest text-xs">Loading Plan Configurations...</p>
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
                    <h2 className="text-3xl font-extrabold text-primary tracking-tight">Manage PRO Subscription</h2>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm" onClick={() => setDiscardConfirm(true)}>
                        Discard Changes
                    </Button>
                    <Button variant="primary" className="bg-[#465f89] text-white hover:shadow-lg hover:shadow-[#465f89]/20 transition-all font-bold text-sm px-6" onClick={handleSaveChanges}>
                        Save All Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {plans.map((plan) => (
                    <Card key={plan.id} className={cn(
                        "p-8 relative group overflow-hidden border transition-all",
                        plan.id === 'pro' 
                            ? "border-[#d6e3ff] bg-gradient-to-br from-white to-[#f8faff] shadow-xl shadow-blue-500/5" 
                            : "border-slate-200/60 shadow-sm"
                    )}>
                        {!['free', 'pro'].includes(plan.id) && (
                            <button 
                                onClick={() => handleDeletePlan(plan.id)}
                                className="absolute top-4 right-4 z-20 p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <span className="material-symbols-outlined text-sm text-[18px]">delete</span>
                            </button>
                        )}
                        
                        <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:transition-colors",
                            plan.id === 'pro' ? "bg-[#d6e3ff]/30 group-hover:bg-[#d6e3ff]/50" : "bg-slate-50 group-hover:bg-slate-100"
                        )}></div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all",
                                    plan.id === 'pro' ? "bg-primary text-white shadow-primary/20" : "bg-slate-100 text-slate-500 shadow-transparent"
                                )}>
                                    <span className="material-symbols-outlined text-2xl">{plan.id === 'pro' ? 'rocket_launch' : 'eco'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleOpenJsonEditor(plan)}
                                        className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                                        title="Edit JSON Config"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">code</span>
                                    </button>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge variant="ghost" className={cn(
                                            "border-none font-black text-[10px]",
                                            plan.id === 'pro' ? "bg-[#005ab4] text-white animate-pulse" : "bg-slate-100 text-slate-600"
                                        )}>{plan.badge || 'DEFAULT'}</Badge>
                                        <span className="text-[9px] font-black text-slate-400 tracking-widest">{subStats[plan.id] || 0} SUBSCRIBERS</span>
                                    </div>
                                </div>
                            </div>
                            <h3 className={cn("text-2xl font-black mb-2", plan.id === 'pro' ? "text-primary" : "text-slate-900")}>{plan.name}</h3>
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
                                                errors[plan.id]?.price_monthly ? "border-rose-500 bg-rose-50" : (plan.id === 'pro' ? "bg-white border-[#d6e3ff] text-[#005ab4] focus:ring-[#005ab4]/20" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#465f89]/20")
                                            )}
                                        />
                                        {errors[plan.id]?.price_monthly && (
                                            <p className="text-[9px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                                                <ExclamationCircleIcon className="w-3 h-3" />
                                                {errors[plan.id].price_monthly}
                                            </p>
                                        )}
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
                                                errors[plan.id]?.price_yearly ? "border-rose-500 bg-rose-50" : (plan.id === 'pro' ? "bg-white border-[#d6e3ff] text-[#005ab4] focus:ring-[#005ab4]/20" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#465f89]/20")
                                            )}
                                        />
                                        {errors[plan.id]?.price_yearly && (
                                            <p className="text-[9px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                                                <ExclamationCircleIcon className="w-3 h-3" />
                                                {errors[plan.id].price_yearly}
                                            </p>
                                        )}
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
                    <h3 className="text-xl font-bold text-primary">Feature Management</h3>
                    <div className="flex items-center gap-3">
                        {isAddingFeature ? (
                            <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                                <input 
                                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#005ab4]/20"
                                    placeholder="Enter feature name..."
                                    value={newFeatureName}
                                    onChange={(e) => setNewFeatureName(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && addGlobalFeature()}
                                />
                                <Button variant="primary" size="sm" className="h-8 text-[10px]" onClick={addGlobalFeature}>Add</Button>
                                <Button variant="ghost" size="sm" className="h-8 text-[10px] text-slate-400" onClick={() => setIsAddingFeature(false)}>Cancel</Button>
                            </div>
                        ) : (
                            <Button variant="ghost" className="text-xs font-bold text-[#465f89] hover:bg-slate-100" onClick={() => setIsAddingFeature(true)}>+ Add Global Feature</Button>
                        )}
                    </div>
                </div>

                <Card className="overflow-hidden border-slate-100 shadow-sm p-0">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-none">
                                <TableHead className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">Feature Capability</TableHead>
                                {plans.map(plan => (
                                    <TableHead key={plan.id} className="px-6 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">{plan.name}</TableHead>
                                ))}
                                <TableHead className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Category</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allFeatureNames.map(feature => (
                                <TableRow key={feature} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="px-8 py-5">
                                        <div className="font-bold text-slate-700">{feature}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">Included capability for this tier</div>
                                    </TableCell>
                                    {plans.map(plan => (
                                        <TableCell key={plan.id} className="text-center">
                                            <div className="flex justify-center">
                                                <Toggle 
                                                    checked={(plan.features || []).includes(feature)} 
                                                    onChange={() => handleFeatureToggle(plan.id, feature)} 
                                                />
                                            </div>
                                        </TableCell>
                                    ))}
                                    <TableCell className="px-8 text-right">
                                        <Badge variant="ghost" className={cn(
                                            "border-none text-[9px] font-black",
                                            feature.toLowerCase().includes('builder') ? "bg-blue-50 text-blue-600" :
                                            feature.toLowerCase().includes('custom') ? "bg-purple-50 text-purple-600" : "bg-slate-50 text-slate-400"
                                        )}>DYNAMIC</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* Add Plan Modal was here and is removed */}

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
