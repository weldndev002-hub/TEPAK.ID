import React, { useState } from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';

export const SEOSettingsDashboard = () => {
    const [title, setTitle] = useState('Aditya Pratama - Creative Digital Solutions');
    const [description, setDescription] = useState('Helping brands build stunning digital presence with premium landing pages and creative strategies.');
    const [keywords, setKeywords] = useState('digital creator, landing page, branding, portfolio');

    return (
        <div className="w-full p-8 max-w-5xl mx-auto space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-blue-600 tracking-tight">SEO Configuration</h2>
                    <p className="text-slate-500 mt-1">Optimize how your page appears in search results and social media.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="border-slate-200 bg-white font-bold text-sm">Discard</Button>
                    <Button variant="primary" className="bg-orange-400 text-white font-bold text-sm shadow-lg shadow-orange-400/20">Save Settings</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Inputs */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Basic SEO Card */}
                    <Card className="p-8 border-slate-200/60 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-blue-500">search</span>
                            <h3 className="font-bold text-slate-800">Search Engine Optimization</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Page Title Tag</label>
                                <Input 
                                    className="bg-slate-50 border-slate-200"
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter your page title..."
                                />
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[10px] text-slate-400">Main title shown in search tabs</p>
                                    <p className={cn("text-[10px] font-bold", title.length > 60 ? "text-orange-500" : "text-emerald-500")}>
                                        {title.length}/60 chars
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Meta Description</label>
                                <Textarea 
                                    className="bg-slate-50 border-slate-200 min-h-[100px]"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell search engines what your site is about..."
                                />
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[10px] text-slate-400">Brief summary of your site (150-160 recommended)</p>
                                    <p className={cn("text-[10px] font-bold", description.length > 160 ? "text-orange-500" : "text-emerald-500")}>
                                        {description.length}/160 chars
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Focus Keywords</label>
                                <Input 
                                    className="bg-slate-50 border-slate-200"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="e.g., portfolio, creator, photography"
                                />
                                <p className="text-[10px] text-slate-400 px-1">Separate keywords with commas</p>
                            </div>
                        </div>
                    </Card>

                    {/* Advanced Analytics Card */}
                    <Card className="p-8 border-slate-200/60 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-purple-500">analytics</span>
                            <h3 className="font-bold text-slate-800">Tracking & Analytics</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Google Analytics ID</label>
                                <Input className="bg-slate-50 border-slate-200" placeholder="G-XXXXXXXXXX" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Meta Pixel ID</label>
                                <Input className="bg-slate-50 border-slate-200" placeholder="123456789012345" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Side: Previews */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Google Search Preview */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Google Search Preview</h3>
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-2 hover:border-blue-400 transition-colors">
                            <div className="text-[#1a0dab] text-xl font-medium truncate hover:underline cursor-pointer">
                                {title || 'Untitled Site'}
                            </div>
                            <div className="text-[#006621] text-sm flex items-center gap-1">
                                <span>tepak.id/aditya</span>
                                <span className="material-symbols-outlined text-[12px]">arrow_drop_down</span>
                            </div>
                            <div className="text-[#545454] text-sm line-clamp-2 leading-relaxed">
                                {description || 'No description provided. Add one to improve your click-through rate in search results.'}
                            </div>
                        </div>
                    </div>

                    {/* Social Media Preview (OG) */}
                    <Card className="p-8 border-slate-200/60 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Social Share Banner (OG Image)</h3>
                        
                        <div className="relative group cursor-pointer">
                            <div className="aspect-[1200/630] bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-blue-400 group-hover:bg-blue-50/30">
                                <div className="text-center p-6 space-y-4">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-slate-400 group-hover:text-blue-500 transition-colors">
                                        <span className="material-symbols-outlined text-3xl">image</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">Upload OG Image</p>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Recommended size: 1200x630px</p>
                                    </div>
                                    <Button variant="ghost" className="bg-white border-slate-200 text-[10px] font-black uppercase tracking-widest scale-90">Select File</Button>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                            <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">help</span>
                            <p className="text-[11px] text-slate-500 leading-relaxed italic">
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
