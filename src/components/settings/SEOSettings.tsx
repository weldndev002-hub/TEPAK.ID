import React, { useState } from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { 
    MagnifyingGlassIcon, 
    ChartBarIcon, 
    ChevronDownIcon, 
    PhotoIcon, 
    QuestionMarkCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export const SEOSettingsDashboard = () => {
    const [title, setTitle] = useState('Aditya Pratama - Creative Digital Solutions');
    const [description, setDescription] = useState('Helping brands build stunning digital presence with premium landing pages and creative strategies.');
    const [keywords, setKeywords] = useState('digital creator, landing page, branding, portfolio');
    const [toast, setToast] = useState<string | null>(null);
    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

    const sanitizeInput = (val: string) => {
        return val.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "");
    };

    const handleSave = () => {
        const cleanTitle = sanitizeInput(title);
        const cleanDesc = sanitizeInput(description);
        
        setTitle(cleanTitle);
        setDescription(cleanDesc);
        showToast('SEO Settings Saved Successfully!');
    };

    return (
        <div className="w-full p-8 max-w-5xl mx-auto space-y-12">
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold bg-emerald-500 text-white animate-in slide-in-from-right duration-300">
                    <CheckCircleIcon className="w-5 h-5 shrink-0" />{toast}
                </div>
            )}
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Seo Excellence</span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">SEO Configuration</h2>
                    <p className="text-slate-500 mt-2 font-medium">Optimize how your page appears in search results and social media.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="border-slate-100 bg-white font-black text-[11px] uppercase tracking-widest px-6 py-2.5 rounded-xl">Discard</Button>
                    <Button 
                        variant="primary" 
                        className="bg-primary text-white font-black text-[11px] uppercase tracking-widest px-8 py-2.5 rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                        onClick={handleSave}
                    >
                        Save Settings
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Side: Inputs */}
                <div className="lg:col-span-7 space-y-10">
                    {/* Basic SEO Card */}
                    <Card className="p-8 border-slate-100 shadow-sm space-y-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-2">
                            <MagnifyingGlassIcon className="w-5 h-5 text-primary" />
                            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Search Engine Optimization</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Title Tag</label>
                                <Input 
                                    className="bg-slate-50 border-slate-100 rounded-xl font-black text-xs uppercase tracking-tight"
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter your page title..."
                                />
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Main title shown in search tabs</p>
                                    <p className={cn(
                                        "text-[10px] font-black uppercase tracking-widest", 
                                        title.length > 70 ? "text-rose-500" : title.length > 60 ? "text-amber-500" : "text-emerald-500"
                                    )}>
                                        {title.length}/60 chars
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Description</label>
                                <Textarea 
                                    className="bg-slate-50 border-slate-100 rounded-xl min-h-[120px] font-medium text-xs tracking-tight"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell search engines what your site is about..."
                                />
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Brief summary of your site (150-160 recommended)</p>
                                    <p className={cn(
                                        "text-[10px] font-black uppercase tracking-widest", 
                                        description.length > 170 ? "text-rose-500" : description.length > 160 ? "text-amber-500" : "text-emerald-500"
                                    )}>
                                        {description.length}/160 chars
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Focus Keywords</label>
                                <Input 
                                    className="bg-slate-50 border-slate-100 rounded-xl font-black text-xs uppercase tracking-tight"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="e.g., portfolio, creator, photography"
                                />
                                <p className="text-[10px] font-medium text-slate-400 px-1 uppercase tracking-tight">Separate keywords with commas</p>
                            </div>
                        </div>
                    </Card>

                    {/* Advanced Analytics Card */}
                    <Card className="p-8 border-slate-100 shadow-sm space-y-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-2">
                            <ChartBarIcon className="w-5 h-5 text-primary" />
                            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Tracking & Analytics</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Google Analytics ID</label>
                                <Input className="bg-slate-50 border-slate-100 rounded-xl font-black text-xs uppercase tracking-tight" placeholder="G-XXXXXXXXXX" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Pixel ID</label>
                                <Input className="bg-slate-50 border-slate-100 rounded-xl font-black text-xs uppercase tracking-tight" placeholder="123456789012345" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Side: Previews */}
                <div className="lg:col-span-5 space-y-10">
                    {/* Google Search Preview */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Google Search Preview</h3>
                        <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-3 hover:border-primary/30 transition-all group">
                            <div className="text-primary text-xl font-black truncate group-hover:underline cursor-pointer tracking-tight">
                                {title || 'Untitled Site'}
                            </div>
                            <div className="text-emerald-500 text-xs font-black flex items-center gap-1 uppercase tracking-widest">
                                <span>tepak.id/aditya</span>
                                <ChevronDownIcon className="w-3 h-3" />
                            </div>
                            <div className="text-slate-500 text-[13px] line-clamp-2 leading-relaxed font-medium">
                                {description || 'No description provided. Add one to improve your click-through rate in search results.'}
                            </div>
                        </div>
                    </div>

                    {/* Social Media Preview (OG) */}
                    <Card className="p-10 border-slate-100 shadow-sm rounded-3xl">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Social Share Banner (OG Image)</h3>
                        
                        <div className="relative group cursor-pointer">
                            <div className="aspect-[1200/630] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-primary/20 group-hover:bg-primary/5">
                                <div className="text-center p-8 space-y-6">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-slate-300 group-hover:text-primary transition-all">
                                        <PhotoIcon className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-xs uppercase tracking-widest">Upload OG Image</p>
                                        <p className="text-[9px] font-medium text-slate-400 mt-2 uppercase tracking-[0.2em]">Recommended: 1200x630px</p>
                                    </div>
                                    <Button variant="ghost" className="bg-white border-slate-100 text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl scale-95 shadow-sm">Select File</Button>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100/50">
                            <QuestionMarkCircleIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-tight">
                                OG Images are shown when you share your link on WhatsApp, Facebook, or Twitter. Make it visually appealing!
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Helper function for conditional classes
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

