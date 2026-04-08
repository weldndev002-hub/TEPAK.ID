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
import { 
    PlusCircleIcon, 
    ComputerDesktopIcon, 
    DevicePhoneMobileIcon,
    ArrowUpRightIcon,
    PlayIcon,
    GlobeAltIcon,
    AtSymbolIcon,
    MegaphoneIcon
} from '@heroicons/react/24/solid';

export const CreatorAtelierEditor: React.FC = () => {
    const [activeDevice, setActiveDevice] = useState<'mobile' | 'desktop'>('mobile');
    
    return (
        <div className="flex min-h-screen bg-white font-['Plus_Jakarta_Sans',sans-serif]">
            {/* Sidebar B (Light) */}
            <SidebarB activePage="editor" />

            <div className="flex-1 flex flex-col">
                {/* Header B (Light) */}
                <HeaderB />

                {/* Main Content Area */}
                <div className="flex flex-1 pt-16 overflow-hidden">
                    {/* Left Panel: Editing Forms */}
                    <section className="w-1/2 overflow-y-auto p-12 no-scrollbar bg-white shadow-sm z-10">
                        <div className="max-w-xl mx-auto space-y-12">
                            {/* Section Header */}
                            <div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Page Configuration</span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mt-4 uppercase">Design Your Canvas</h2>
                                <p className="text-slate-400 mt-2 text-sm font-medium italic opacity-80">Customize your tepak.id landing page with editorial blocks.</p>
                            </div>

                            {/* Profile Editor Block */}
                            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="font-black text-slate-900 text-xl tracking-tighter uppercase">Profile Identity</h3>
                                    <span className="bg-primary text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest">Required</span>
                                </div>
                                <div className="space-y-8">
                                    <div className="flex flex-col items-center gap-8 p-10 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                                        <AvatarUpload />
                                        <div className="w-full space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Display Name</label>
                                                <Input defaultValue="Andi Pratama" className="rounded-2xl" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Bio Description</label>
                                                <textarea 
                                                    className="w-full bg-slate-50 border-slate-100 rounded-3xl text-xs font-black uppercase tracking-tight focus:border-primary focus:ring-0 p-6 min-h-[120px] shadow-inner" 
                                                    defaultValue="Visual Architect & Content Strategist based in Jakarta."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Block Editor List */}
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black text-slate-900 text-xl tracking-tighter uppercase">Content Blocks</h3>
                                    <button className="bg-primary/5 hover:bg-primary text-primary hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black flex items-center gap-3 transition-all uppercase tracking-widest">
                                        <PlusCircleIcon className="w-5 h-5" />
                                        Add Block
                                    </button>
                                </div>
                                
                                <DraggableBlock 
                                    icon="LinkIcon" 
                                    title="Main Portfolio" 
                                    subtitle="https://behance.net/andipratama" 
                                    onEdit={() => {}} 
                                    onDelete={() => {}}
                                />
                                <DraggableBlock 
                                    icon="ShareIcon" 
                                    title="Social Icons" 
                                    subtitle="Instagram, Twitter, LinkedIn" 
                                    onEdit={() => {}} 
                                    onDelete={() => {}}
                                />
                                <DraggableBlock 
                                    icon="PlayCircleIcon" 
                                    title="Latest Showreel" 
                                    subtitle="YouTube Embed • 03:45" 
                                    onEdit={() => {}} 
                                    onDelete={() => {}}
                                />
                            </div>

                            {/* Appearance Section */}
                            <div className="pt-12 border-t border-slate-100">
                                <h3 className="font-black text-slate-900 text-xl tracking-tighter uppercase mb-8">Themes & Aesthetics</h3>
                                <div className="grid grid-cols-2 gap-8">
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

                            <div className="pb-16 pt-8">
                                <Button variant="amber" size="lg" className="w-full py-6 text-[11px] uppercase tracking-[0.4em] rounded-[1.5rem] shadow-2xl shadow-amber-500/20">
                                    Publish Changes
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Right Panel: Device Preview */}
                    <section className="flex-1 bg-slate-50 flex items-center justify-center p-12 relative overflow-hidden">
                        {/* Device Switcher */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-3 bg-white/80 backdrop-blur-md p-2 rounded-[2rem] shadow-2xl z-20 border border-white/50">
                            <button 
                                onClick={() => setActiveDevice('desktop')}
                                className={cn(
                                    "px-10 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeDevice === 'desktop' ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "bg-transparent text-slate-400 hover:text-slate-900"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <ComputerDesktopIcon className="w-4 h-4" />
                                    Desktop
                                </div>
                            </button>
                            <button 
                                onClick={() => setActiveDevice('mobile')}
                                className={cn(
                                    "px-10 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeDevice === 'mobile' ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "bg-transparent text-slate-400 hover:text-slate-900"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <DevicePhoneMobileIcon className="w-4 h-4" />
                                    Mobile
                                </div>
                            </button>
                        </div>

                        {/* Preview Utility Info */}
                        <div className="absolute bottom-10 left-10 flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-lg border border-slate-100/50">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Live Preview Active</span>
                        </div>

                        {/* Device Container */}
                        <div className={cn(
                            "transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) relative",
                            activeDevice === 'mobile' ? "scale-90" : "w-full h-full p-16 scale-100"
                        )}>
                            <PhoneFrame 
                                className={cn(
                                    "transition-all duration-1000",
                                    activeDevice === 'desktop' ? "w-full h-full rounded-[3rem] border-8" : ""
                                )}
                            >
                                {/* Static preview content based on mockup */}
                                <div className="w-full bg-white rounded-[1.25rem] py-5 px-6 shadow-sm border border-slate-50 flex items-center justify-between hover:scale-[1.02] transition-transform cursor-pointer group/link">
                                    <span className="text-xs font-black text-primary uppercase tracking-tight">Main Portfolio</span>
                                    <ArrowUpRightIcon className="w-4 h-4 text-slate-400 group-hover/link:text-primary transition-colors" />
                                </div>
                                <div className="w-full bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-50 group/video">
                                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                        <img 
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqybq1j_FtwGdUyeqjI3jSTNZRmUiHTPO_LdgeWiu4wmoXSvrhTgevoLocGsDT-qAR04_6bOHRhD-7EY6ME1li3f8CFjzNT_Hy0rASJz-WC9QqcubCQtqc6r9UYvW5BdvjCknLBON7Tv-ZG6CScwAUnL-H3AM0-GdnllJ1oUyh1bUK5491Wxxorj6G7nuUkq0GFgeiDo27Py1SzSSrwovH2de17SV7mlOzAiw6SkKcvdJI4B1lTeN3vlrRTAhmJ51R-d4sG35Fl9PA" 
                                            className="w-full h-full object-cover group-hover/video:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                                            <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-primary shadow-2xl transition-all group-hover/video:scale-110 group-hover/video:bg-white">
                                                <PlayIcon className="w-6 h-6 ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Latest Showreel</span>
                                    </div>
                                </div>
                                <div className="flex justify-center gap-10 pt-8">
                                    <GlobeAltIcon className="w-6 h-6 text-primary hover:scale-110 transition-transform cursor-pointer opacity-70 hover:opacity-100" />
                                    <AtSymbolIcon className="w-6 h-6 text-primary hover:scale-110 transition-transform cursor-pointer opacity-70 hover:opacity-100" />
                                    <MegaphoneIcon className="w-6 h-6 text-primary hover:scale-110 transition-transform cursor-pointer opacity-70 hover:opacity-100" />
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
