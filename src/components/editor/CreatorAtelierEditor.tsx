import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { AvatarUpload } from '../ui/AvatarUpload';
import DraggableBlock from './DraggableBlock';
import { ThemeCard } from '../ui/ThemeCard';
import { LightSidebar as SidebarB } from '../layout/LightSidebar';
import { LightTopNavbar as HeaderB } from '../layout/LightTopNavbar';
import { BottomNavbar } from '../layout/BottomNavbar';
import { 
    PlusCircleIcon
} from '@heroicons/react/24/solid';

export const CreatorAtelierEditor: React.FC = () => {
    return (
        <>
            <div className="flex min-h-screen bg-white font-['Plus_Jakarta_Sans',sans-serif]">
                {/* Sidebar B (Light) */}
                <SidebarB activePage="editor" />

                <div className="flex-1 flex flex-col">
                    {/* Header B (Light) */}
                    <HeaderB />

                    {/* Main Content Area */}
                    <div className="flex flex-1 pt-16 overflow-hidden">
                        {/* Left Panel: Editing Forms */}
                        <section className="flex-1 overflow-y-auto p-12 no-scrollbar bg-white z-10">
                            <div className="max-w-xl mx-auto space-y-12">
                                {/* Section Header */}
                                <div>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Page Configuration</span>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter mt-4 uppercase">Design Your Canvas</h2>
                                    <p className="text-slate-400 mt-2 text-sm font-medium italic opacity-80">Customize your Orbit Site landing page with editorial blocks.</p>
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


                    </div>
                </div>
            </div>
            {/* Bottom Navigation for Mobile - Moved Outside Main Flex */}
            <BottomNavbar activePage="editor" />
        </>
    );
};

export default CreatorAtelierEditor;
