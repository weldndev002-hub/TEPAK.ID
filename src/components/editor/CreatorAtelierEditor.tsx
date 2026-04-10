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
import { AddBlockDrawer } from './AddBlockDrawer';
import { BlockSettingsForm } from './BlockSettingsForm';
import { PhoneFrame } from './PhoneFrame';

export const CreatorAtelierEditor: React.FC = () => {
    // URL Search Params
    const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const initialTheme = queryParams?.get('theme') || 'atelier-dark';
    const initialSubdomain = queryParams?.get('subdomain') || 'yourname';

    const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(initialTheme);
    const [subdomain, setSubdomain] = useState(initialSubdomain);
    const [activeBlockType, setActiveBlockType] = useState<string | null>(null);
    const [blocks, setBlocks] = useState([
        { id: '1', type: 'link', icon: 'LinkIcon', title: 'Main Portfolio', subtitle: 'https://behance.net/andipratama' },
        { id: '2', type: 'social', icon: 'ShareIcon', title: 'Social Icons', subtitle: 'Instagram, Twitter, LinkedIn' },
        { id: '3', type: 'video', icon: 'PlayCircleIcon', title: 'Latest Showreel', subtitle: 'YouTube Embed • 03:45' },
    ]);

    const handleSelectBlock = (type: string) => {
        setActiveBlockType(type);
        setIsAddBlockOpen(false);
    };

    const handleSaveBlock = (data: any) => {
        let subtitle = data.url || 'Configure details in settings';
        
        if (activeBlockType === 'social') {
            const activePlatforms = Object.keys(data).filter(key => data[key] && key !== 'title');
            subtitle = activePlatforms.length > 0 
                ? activePlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
                : 'No platforms connected';
        } else if (activeBlockType === 'image') {
            subtitle = data.fileName || 'Image uploaded';
        } else if (activeBlockType === 'video') {
            subtitle = data.isYouTube ? 'YouTube Player' : data.isVimeo ? 'Vimeo Player' : 'Video Embed';
        }

        const newBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type: activeBlockType || 'link',
            icon: activeBlockType === 'link' ? 'LinkIcon' : activeBlockType === 'video' ? 'PlayCircleIcon' : activeBlockType === 'social' ? 'MegaphoneIcon' : activeBlockType === 'image' ? 'PhotoIcon' : 'CubeIcon',
            title: data.title || (activeBlockType === 'social' ? 'Social Profiles' : activeBlockType === 'image' ? (data.title || 'Image Content') : `New ${activeBlockType} Item`),
            subtitle: subtitle,
            data: data // Store raw data for preview
        };
        setBlocks([...blocks, newBlock]);
        setActiveBlockType(null);
    };

    const handleDeleteBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    return (
        <>
            <div className="flex min-h-screen bg-white ">
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
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Subdomain Host</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-300 font-black text-xs">tepak.id/</span>
                                                        <Input 
                                                            value={subdomain} 
                                                            onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                                                            className="rounded-2xl flex-1" 
                                                        />
                                                    </div>
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
                                        <button 
                                            onClick={() => setIsAddBlockOpen(true)}
                                            className="bg-primary/5 hover:bg-primary text-primary hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black flex items-center gap-3 transition-all uppercase tracking-widest"
                                        >
                                            <PlusCircleIcon className="w-5 h-5" />
                                            Add Block
                                        </button>
                                    </div>
                                    
                                    {blocks.map(block => (
                                        <DraggableBlock 
                                            key={block.id}
                                            icon={block.icon} 
                                            title={block.title} 
                                            subtitle={block.subtitle} 
                                            onEdit={() => setActiveBlockType(block.type)} 
                                            onDelete={() => handleDeleteBlock(block.id)}
                                        />
                                    ))}
                                </div>

                                <div className="pt-12 border-t border-slate-100">
                                    <h3 className="font-black text-slate-900 text-xl tracking-tighter uppercase mb-8">Themes & Aesthetics</h3>
                                    <div className="grid grid-cols-3 gap-8">
                                        {[
                                            { id: 'atelier-dark', name: 'Atelier Dark', gradient: 'bg-slate-900 shadow-2xl' },
                                            { id: 'clean-minimal', name: 'Clean Minimal', gradient: 'bg-white border-2 border-slate-100 shadow-sm' },
                                            { id: 'sunrise-glow', name: 'Sunrise Glow', gradient: 'bg-gradient-to-br from-amber-100 to-rose-200' },
                                        ].map((theme) => (
                                            <ThemeCard 
                                                key={theme.id}
                                                id={theme.id} 
                                                name={theme.name} 
                                                previewGradient={theme.gradient} 
                                                isActive={selectedTheme === theme.id} 
                                                onSelect={setSelectedTheme}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="pb-16 pt-8">
                                    <Button variant="amber" size="lg" className="w-full py-6 text-[11px] uppercase tracking-[0.4em] rounded-[1.5rem] shadow-2xl shadow-amber-500/20">
                                        Publish Changes
                                    </Button>
                                </div>
                            </div>
                        </section>

                        {/* Right Panel: Phone Preview */}
                        <section className="flex-1 bg-slate-50 flex items-center justify-center p-12 border-l border-slate-100 overflow-hidden relative">
                            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
                            <div className="relative scale-90 xxl:scale-100 transition-transform duration-500">
                                <PhoneFrame theme={selectedTheme === 'atelier-dark' ? 'bold' : 'minimal'}>
                                    <div className="space-y-4">
                                        {blocks.map((block: any) => (
                                            <div key={block.id}>
                                                {block.type === 'social' ? (
                                                    <div className="flex justify-center gap-4 py-4">
                                                        {block.data?.instagram && (
                                                            <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm hover:scale-110 transition-transform">
                                                                <span className="text-[10px] font-black uppercase text-slate-800">IG</span>
                                                            </div>
                                                        )}
                                                        {block.data?.tiktok && (
                                                            <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm hover:scale-110 transition-transform">
                                                                <span className="text-[10px] font-black uppercase text-slate-800">TT</span>
                                                            </div>
                                                        )}
                                                        {block.data?.twitter && (
                                                            <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm hover:scale-110 transition-transform">
                                                                <span className="text-[10px] font-black uppercase text-slate-800">TW</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : block.type === 'text' ? (
                                                    <div className="py-6 px-2 text-center space-y-3">
                                                        {block.data?.title && (
                                                            <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-tight">{block.data.title}</h4>
                                                        )}
                                                        {block.data?.content && (
                                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic opacity-80">{block.data.content}</p>
                                                        )}
                                                    </div>
                                                ) : block.type === 'image' ? (
                                                    <div className="w-full space-y-4 py-4 animate-in fade-in zoom-in-95 duration-500">
                                                        <div className="w-full aspect-video rounded-3xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                                                            {block.data?.imageUrl && (
                                                                <img src={block.data.imageUrl} className="w-full h-full object-cover" alt={block.title} />
                                                            )}
                                                        </div>
                                                        {block.data?.title && (
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center italic">{block.data.title}</p>
                                                        )}
                                                    </div>
                                                ) : block.type === 'video' ? (
                                                    <div className="w-full space-y-4 py-4 animate-in fade-in zoom-in-95 duration-500">
                                                        <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-slate-900">
                                                            {block.data?.isYouTube && block.data?.videoId && (
                                                                <iframe 
                                                                    width="100%" 
                                                                    height="100%" 
                                                                    src={`https://www.youtube.com/embed/${block.data.videoId}`}
                                                                    title="YouTube video player" 
                                                                    frameBorder="0" 
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                                                    allowFullScreen
                                                                />
                                                            )}
                                                            {block.data?.isVimeo && (
                                                                <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">
                                                                     Vimeo Player Ready
                                                                </div>
                                                            )}
                                                        </div>
                                                        {block.title && (
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center italic">{block.title}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="w-full py-4 px-6 border border-slate-100 bg-white rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-all hover:scale-[1.02]">
                                                        <span className="text-slate-700">{block.title}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </PhoneFrame>
                            </div>
                        </section>


                    </div>
                </div>
            </div>
            {/* Bottom Navigation for Mobile - Moved Outside Main Flex */}
            <BottomNavbar activePage="editor" />

            {/* Backdrop Overlay */}
            {(isAddBlockOpen || activeBlockType) && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-300"
                    onClick={() => {
                        setIsAddBlockOpen(false);
                        setActiveBlockType(null);
                    }}
                />
            )}

            {/* Overlays / Drawers */}
            <AddBlockDrawer 
                isOpen={isAddBlockOpen} 
                onClose={() => setIsAddBlockOpen(false)} 
                onSelectBlock={handleSelectBlock}
            />

            {activeBlockType && (
                <BlockSettingsForm 
                    blockType={activeBlockType} 
                    onClose={() => setActiveBlockType(null)} 
                    onSave={handleSaveBlock}
                />
            )}

        </>
    );
};

export default CreatorAtelierEditor;
