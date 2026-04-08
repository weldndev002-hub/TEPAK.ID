import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { AvatarUpload } from '../ui/AvatarUpload';
import DraggableBlock from './DraggableBlock';
import { ThemeCard } from '../ui/ThemeCard';
import { LightSidebar as SidebarB } from '../layout/LightSidebar';
import { LightTopNavbar as HeaderB } from '../layout/LightTopNavbar';
import PhoneFrame from './PhoneFrame';

export const CreatorAtelierEditor: React.FC = () => {
    const [activeDevice, setActiveDevice] = useState<'mobile' | 'desktop'>('mobile');
    
    return (
        <div className="flex min-h-screen bg-white font-sans">
            {/* Sidebar B (Light) */}
            <SidebarB activePage="editor" />

            <div className="flex-1 flex flex-col">
                {/* Header B (Light) */}
                <HeaderB />

                {/* Main Content Area */}
                <div className="flex flex-1 pt-16 overflow-hidden">
                    {/* Left Panel: Editing Forms */}
                    <section className="w-1/2 overflow-y-auto p-8 no-scrollbar bg-white shadow-sm z-10">
                        <div className="max-w-xl mx-auto space-y-10">
                            {/* Section Header */}
                            <div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Page Configuration</span>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">Design Your Canvas</h2>
                                <p className="text-slate-500 mt-2 text-sm font-medium">Customize your tepak.id landing page with editorial blocks.</p>
                            </div>

                            {/* Profile Editor Block */}
                            <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-black text-slate-900 text-lg tracking-tight">Profile Identity</h3>
                                    <span className="bg-primary/10 text-primary text-[10px] px-3 py-1 rounded-full font-black">REQUIRED</span>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <AvatarUpload />
                                        <div className="w-full space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Display Name</label>
                                                <Input defaultValue="Andi Pratama" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Bio Description</label>
                                                <textarea 
                                                    className="w-full bg-slate-50 border-slate-100 rounded-2xl text-xs font-medium focus:border-primary focus:ring-0 p-4 min-h-[100px]" 
                                                    defaultValue="Visual Architect & Content Strategist based in Jakarta."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Block Editor List */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-slate-900 text-lg tracking-tight">Content Blocks</h3>
                                    <button className="text-primary text-xs font-black flex items-center gap-1 hover:underline uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-sm">add_circle</span>
                                        Add Block
                                    </button>
                                </div>
                                
                                <DraggableBlock 
                                    icon="link" 
                                    title="Main Portfolio" 
                                    subtitle="https://behance.net/andipratama" 
                                    onEdit={() => {}} 
                                    onDelete={() => {}}
                                />
                                <DraggableBlock 
                                    icon="share" 
                                    title="Social Icons" 
                                    subtitle="Instagram, Twitter, LinkedIn" 
                                    onEdit={() => {}} 
                                    onDelete={() => {}}
                                />
                                <DraggableBlock 
                                    icon="smart_display" 
                                    title="Latest Showreel" 
                                    subtitle="YouTube Embed • 03:45" 
                                    onEdit={() => {}} 
                                    onDelete={() => {}}
                                />
                            </div>

                            {/* Appearance Section */}
                            <div className="pt-10 border-t border-slate-100">
                                <h3 className="font-black text-slate-900 text-lg tracking-tight mb-6">Themes & Aesthetics</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <ThemeCard 
                                        id="minimal" 
                                        name="Minimalist" 
                                        previewGradient="bg-white border border-slate-200" 
                                        isActive={true} 
                                        onSelect={() => {}}
                                    />
                                    <ThemeCard 
                                        id="midnight" 
                                        name="Midnight" 
                                        previewGradient="bg-slate-900" 
                                        isActive={false} 
                                        onSelect={() => {}}
                                    />
                                </div>
                            </div>

                            <div className="pb-12">
                                <Button variant="amber" size="lg" className="w-full py-5 text-sm uppercase tracking-[0.2em]">
                                    Publish Changes
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Right Panel: Device Preview */}
                    <section className="flex-1 bg-slate-100 flex items-center justify-center p-8 relative overflow-hidden">
                        {/* Device Switcher (Kept from old EditorShell) */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2 bg-white p-2 rounded-full shadow-xl z-20 border border-slate-50">
                            <button 
                                onClick={() => setActiveDevice('desktop')}
                                className={cn(
                                    "px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeDevice === 'desktop' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-transparent text-slate-400 hover:text-slate-900"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">desktop_windows</span>
                                    Desktop
                                </div>
                            </button>
                            <button 
                                onClick={() => setActiveDevice('mobile')}
                                className={cn(
                                    "px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeDevice === 'mobile' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-transparent text-slate-400 hover:text-slate-900"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">smartphone</span>
                                    Mobile
                                </div>
                            </button>
                        </div>

                        {/* Preview Utility Info */}
                        <div className="absolute bottom-8 left-8 flex items-center gap-3 bg-white/50 backdrop-blur-md rounded-full px-5 py-2.5 shadow-sm border border-white/50">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Live Preview Active</span>
                        </div>

                        {/* Device Container */}
                        <div className={cn(
                            "transition-all duration-700 ease-in-out relative",
                            activeDevice === 'mobile' ? "scale-90" : "w-full h-full p-12 scale-100"
                        )}>
                            <PhoneFrame 
                                className={cn(
                                    "transition-all duration-700",
                                    activeDevice === 'desktop' ? "w-full h-full rounded-2xl border-4" : ""
                                )}
                            >
                                {/* Static preview content based on mockup */}
                                <div className="w-full bg-white rounded-xl py-4 px-5 shadow-sm border border-slate-50 flex items-center justify-between hover:scale-105 transition-transform cursor-pointer">
                                    <span className="text-sm font-black text-primary">Main Portfolio</span>
                                    <span className="material-symbols-outlined text-slate-400 text-sm">north_east</span>
                                </div>
                                <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-50">
                                    <div className="aspect-video bg-slate-100 relative group overflow-hidden">
                                        <img 
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqybq1j_FtwGdUyeqjI3jSTNZRmUiHTPO_LdgeWiu4wmoXSvrhTgevoLocGsDT-qAR04_6bOHRhD-7EY6ME1li3f8CFjzNT_Hy0rASJz-WC9QqcubCQtqc6r9UYvW5BdvjCknLBON7Tv-ZG6CScwAUnL-H3AM0-GdnllJ1oUyh1bUK5491Wxxorj6G7nuUkq0GFgeiDo27Py1SzSSrwovH2de17SV7mlOzAiw6SkKcvdJI4B1lTeN3vlrRTAhmJ51R-d4sG35Fl9PA" 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-xl">
                                                <span className="material-symbols-outlined fill" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <span className="text-xs font-black text-slate-900">Latest Showreel</span>
                                    </div>
                                </div>
                                <div className="flex justify-center gap-6 pt-6">
                                    <span className="material-symbols-outlined text-primary text-xl">public</span>
                                    <span className="material-symbols-outlined text-primary text-xl">alternate_email</span>
                                    <span className="material-symbols-outlined text-primary text-xl">campaign</span>
                                </div>
                            </PhoneFrame>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CreatorAtelierEditor;
