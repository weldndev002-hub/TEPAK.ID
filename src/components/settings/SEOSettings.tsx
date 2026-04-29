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
    CheckCircleIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

export const SEOSettingsDashboard = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [keywords, setKeywords] = useState('');
    const [seoImage, setSeoImage] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

    React.useEffect(() => {
        fetchSEOData();
    }, []);

    const fetchSEOData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                const settings = data.settings || {};
                setTitle(settings.seo_title || '');
                setDescription(settings.seo_description || '');
                setSeoImage(settings.seo_image || '');
                setUsername(data.username || 'username');
                setKeywords(settings.seo_keywords || ''); 
            }
        } catch (error) {
            console.error('Failed to fetch SEO data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sanitizeInput = (val: string) => {
        // Remove script tags and their content
        let clean = val.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "");
        // Remove inline event handlers (on...)
        clean = clean.replace(/on\w+\s*=/gmi, "x-on=");
        return clean;
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('/api/seo/og-image', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setSeoImage(data.seo_image);
                showToast('OG Image Uploaded Successfully!');
            } else {
                const err = await res.json();
                showToast('Upload failed: ' + (err.error || 'Server error'));
            }
        } catch (err) {
            showToast('Network error during upload.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const cleanTitle = sanitizeInput(title);
        const cleanDesc = sanitizeInput(description);
        
        try {
            const res = await fetch('/api/profile/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seo_title: cleanTitle,
                    seo_description: cleanDesc,
                    seo_image: seoImage,
                    seo_keywords: keywords
                })
            });

            if (res.ok) {
                setTitle(cleanTitle);
                setDescription(cleanDesc);
                showToast('SEO Configuration Updated Successfully!');
            } else {
                const err = await res.json();
                showToast('Error: ' + (err.error || 'Failed to save'));
            }
        } catch (error) {
            showToast('Network error while saving SEO settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimizing metadata...</p>
            </div>
        );
    }

    return (
        <div className="w-full p-8 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold bg-emerald-500 text-white animate-in slide-in-from-right duration-300">
                    <CheckCircleIcon className="w-5 h-5 shrink-0" />{toast}
                </div>
            )}
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-start gap-4">
                    <a 
                        href="/settings" 
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                        title="Back to Profile"
                    >
                        <ArrowLeftIcon className="w-5 h-5 group-active:scale-90 transition-transform" />
                    </a>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block">Seo Excellence</span>
                            <Badge variant="pro" className="text-[7px] px-2 py-0.5">PREMIUM FEATURE</Badge>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">SEO Configuration</h2>
                        <p className="text-slate-500 mt-2 font-medium">Optimize how your page appears in search results and social media.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        className="border-slate-100 bg-white font-black text-[11px] uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-slate-50 transition-all"
                        onClick={fetchSEOData}
                        disabled={isSaving}
                    >
                        Discard
                    </Button>
                    <Button 
                        variant="primary" 
                        className="bg-primary text-white font-black text-[11px] uppercase tracking-widest px-8 py-2.5 rounded-xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Side: Inputs */}
                <div className="lg:col-span-7 space-y-10">
                    {/* Basic SEO Card */}
                    <Card className="p-8 border-slate-100 shadow-sm space-y-8 rounded-3xl bg-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                <MagnifyingGlassIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none mb-1">Search Engine Optimization</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Metadata architecture</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Page Title Tag</label>
                                <Input 
                                    className="h-14 bg-slate-50/50 border-slate-100 rounded-xl font-black text-xs uppercase tracking-tight focus:bg-white transition-all px-6"
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter your page title..."
                                />
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tight">Main title shown in search tabs</p>
                                    <p className={cn(
                                        "text-[9px] font-black uppercase tracking-widest", 
                                        title.length > 70 ? "text-rose-500" : title.length > 60 ? "text-amber-500" : "text-emerald-500"
                                    )}>
                                        {title.length}/60 chars
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Description</label>
                                    {description.length > 160 && (
                                        <Badge variant="warning" className="text-[7px] px-2 py-0.5">EXCEEDS RECOMMENDED LENGTH</Badge>
                                    )}
                                </div>
                                <Textarea 
                                    className="bg-slate-50/50 border-slate-100 rounded-xl min-h-[140px] font-medium text-xs tracking-tight focus:bg-white transition-all p-6"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell search engines what your site is about..."
                                />
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tight italic">Brief summary of your site (150-160 recommended)</p>
                                    <p className={cn(
                                        "text-[9px] font-black uppercase tracking-widest", 
                                        description.length > 170 ? "text-rose-500" : description.length > 160 ? "text-amber-500" : "text-emerald-500"
                                    )}>
                                        {description.length}/160 chars
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Focus Keywords (Meta Keywords)</label>
                                <Input 
                                    className="h-14 bg-slate-50/50 border-slate-100 rounded-xl font-black text-xs uppercase tracking-tight focus:bg-white transition-all px-6"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="e.g., digital creator, landing page, branding"
                                />
                                <p className="text-[9px] font-medium text-slate-400 px-1 uppercase tracking-tight">Separate keywords with commas</p>
                            </div>
                        </div>
                    </Card>

                    {/* Advanced Analytics Card */}
                    <Card className="p-8 border-slate-100 shadow-sm space-y-8 rounded-3xl bg-white opacity-60">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                <ChartBarIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none mb-1">Tracking & Pixel</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Coming soon in next release</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pointer-events-none">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Google Analytics ID</label>
                                <Input className="h-12 bg-slate-50 border-slate-100 rounded-xl font-black text-xs uppercase tracking-tight" placeholder="G-XXXXXXXXXX" disabled />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Pixel ID</label>
                                <Input className="h-12 bg-slate-50 border-slate-100 rounded-xl font-black text-xs uppercase tracking-tight" placeholder="123456789012345" disabled />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Side: Previews */}
                <div className="lg:col-span-5 space-y-10">
                    {/* Google Search Preview */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Google Search Preview</h3>
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Live rendering</span>
                        </div>
                        <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-xl shadow-slate-200/50 space-y-3 hover:border-primary/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-all"></div>
                            <div className="text-[#1a0dab] text-xl font-medium truncate group-hover:underline cursor-pointer tracking-tight font-['Roboto',sans-serif]">
                                {title || 'Untitled Site'}
                            </div>
                            <div className="text-[#006621] text-sm flex items-center gap-1 font-['Roboto',sans-serif]">
                                <span>https://tepak.id/u/{username}</span>
                                <ChevronDownIcon className="w-3 h-3" />
                            </div>
                            <div className="text-[#4d5156] text-[14px] line-clamp-2 leading-relaxed font-['Roboto',sans-serif]">
                                {description || 'No description provided. Add one to improve your click-through rate in search results.'}
                            </div>
                        </div>
                    </div>

                    {/* Social Media Preview (OG) */}
                    <Card className="p-8 border-slate-100 shadow-sm rounded-[2.5rem] bg-white">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Social Share Spotlight (OG)</h3>
                        
                        <div className="relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 transition-all hover:border-primary/20">
                            <div className="aspect-[1200/630] bg-slate-50 flex flex-col items-center justify-center overflow-hidden relative">
                                {seoImage ? (
                                    <img src={seoImage} alt="OG Preview" className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" />
                                ) : (
                                    <div className="text-center p-8 space-y-6">
                                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-slate-200 group-hover:text-primary transition-all group-hover:scale-110 duration-500">
                                            <PhotoIcon className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Share Image Strategy</p>
                                            <p className="text-[8px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em]">1200 x 630 px • PNG/JPG</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="text-center">
                                        <Button variant="ghost" className="bg-white border-slate-100 text-[9px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-xl hover:bg-slate-50 transition-all mb-2">
                                            {isUploading ? 'Uploading...' : seoImage ? 'Change Image' : 'Select File'}
                                        </Button>
                                        <p className="text-[8px] font-black text-white uppercase tracking-widest drop-shadow-md">Click to choose asset</p>
                                    </div>
                                </div>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    disabled={isUploading}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex items-start gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                            <QuestionMarkCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                            <p className="text-[9px] text-blue-500 leading-relaxed font-black uppercase tracking-tight opacity-70">
                                OG Images appear on WhatsApp, Telegram & Discord. Optimized assets increase click rates by up to 40%.
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

