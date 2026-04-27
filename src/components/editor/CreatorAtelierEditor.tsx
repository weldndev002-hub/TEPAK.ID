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
import { TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { AddBlockDrawer } from './AddBlockDrawer';
import { BlockSettingsForm } from './BlockSettingsForm';
import { PhoneFrame } from './PhoneFrame';
import { OnboardingForm } from '../onboarding/OnboardingForm';
import { BrandingProvider, type BrandingData } from '../../hooks/useBranding';
import { useSubscription, SubscriptionProvider } from '../../context/SubscriptionContext';

interface CreatorAtelierEditorProps {
    initialBranding?: BrandingData | null;
}

export const CreatorAtelierEditor: React.FC<CreatorAtelierEditorProps> = (props) => {
    return (
        <SubscriptionProvider>
            <CreatorAtelierEditorContent {...props} />
        </SubscriptionProvider>
    );
};

const CreatorAtelierEditorContent: React.FC<CreatorAtelierEditorProps> = ({ initialBranding }) => {
    const { hasFeature, isLoading: subLoading } = useSubscription();

    React.useEffect(() => {
        // Block access if feature is disabled in Admin
        if (!subLoading && !hasFeature('Landing Page Builder')) {
            window.location.replace('/dashboard');
        }
    }, [hasFeature, subLoading]);

    // URL Search Params
    const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const initialTheme = queryParams?.get('theme') || 'atelier-dark';
    const initialSubdomain = queryParams?.get('subdomain') || 'yourname';

    const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(initialTheme);
    const [subdomain, setSubdomain] = useState(initialSubdomain);
    const [bio, setBio] = useState('');
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [activeBlockType, setActiveBlockType] = useState<string | null>(null);
    const [blocks, setBlocks] = useState<any[]>([]);

    // Fetch Profile Data
    React.useEffect(() => {
        const fetchProfile = async () => {
            setIsLoadingProfile(true);
            try {
                const res = await fetch(`/api/profile/me?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.user_settings?.domain_name) {
                        setSubdomain(data.user_settings.domain_name);
                    } else if (data.username) {
                        setSubdomain(data.username);
                    }
                    if (data.bio) setBio(data.bio);
                    if (data.full_name) setFullName(data.full_name);
                    if (data.avatar_url) setAvatarUrl(data.avatar_url);
                    if (data.blocks && Array.isArray(data.blocks) && data.blocks.length > 0) setBlocks(data.blocks);
                } else if (initialBranding) {
                    // Fallback to initial branding if API fails
                    if (initialBranding.fullName) setFullName(initialBranding.fullName);
                    if (initialBranding.avatarUrl) setAvatarUrl(initialBranding.avatarUrl);
                    if (initialBranding.bio) setBio(initialBranding.bio);
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setIsLoadingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    if (subLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!hasFeature('Landing Page Builder')) {
        return null; // Will redirect via useEffect
    }

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/profile/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bio: bio,
                    username: subdomain,
                    domain_name: subdomain,
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    blocks: blocks
                })
            });
            if (res.ok) {
                alert('Changes published successfully!');
            } else {
                alert('Failed to publish changes.');
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('Error saving changes.');
        } finally {
            setIsLoading(false);
        }
    };

    // Delete confirm modal
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const blockToDelete = blocks.find(b => b.id === deleteTarget);

    const handleSelectBlock = (type: string) => {
        setActiveBlockType(type);
        setIsAddBlockOpen(false);
    };

    const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...blocks];
        if (direction === 'up' && index > 0) {
            const temp = newBlocks[index];
            newBlocks[index] = newBlocks[index - 1];
            newBlocks[index - 1] = temp;
            setBlocks(newBlocks);
        } else if (direction === 'down' && index < newBlocks.length - 1) {
            const temp = newBlocks[index];
            newBlocks[index] = newBlocks[index + 1];
            newBlocks[index + 1] = temp;
            setBlocks(newBlocks);
        }
    };

    // After saving a block: add it to list and go back to the block drawer
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
            data: data
        };
        setBlocks([...blocks, newBlock]);
        // Return to block drawer after saving
        setActiveBlockType(null);
        setIsAddBlockOpen(true);
    };

    // Close block settings → go back to block drawer
    const handleCloseBlockSettings = () => {
        setActiveBlockType(null);
        setIsAddBlockOpen(true);
    };

    // Confirm delete
    const handleDeleteConfirmed = () => {
        if (deleteTarget) setBlocks(prev => prev.filter(b => b.id !== deleteTarget));
        setDeleteTarget(null);
    };

    return (
        <BrandingProvider initialData={initialBranding}>
            <div className="flex min-h-screen bg-white ">
                {/* Sidebar B (Light) */}
                <SidebarB activePage="editor" />

                <div className="flex-1 flex flex-col">
                    {/* Header B (Light) */}
                    <HeaderB />

                    {/* Main Content Area */}
                    <div className="flex flex-col lg:flex-row flex-1 pt-4 md:pt-16 overflow-y-auto lg:overflow-hidden no-scrollbar">
                        {/* Left Panel: Editing Forms */}
                        <section className="flex-1 overflow-y-auto px-3 md:px-12 py-6 no-scrollbar bg-white z-10 pb-32 min-w-0">
                            <div className="max-w-xl mx-auto space-y-8 md:space-y-12">
                                {/* Section Header */}
                                <div className="text-center md:text-left px-1">
                                    <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em] md:tracking-[0.4em]">Konfigurasi Halaman</span>
                                    <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-900 tracking-tight md:tracking-tighter mt-2 md:mt-4 uppercase break-words px-2">Desain Kanvas Anda</h2>
                                    <p className="text-slate-400 mt-2 text-[9px] md:text-sm font-medium italic opacity-80 px-4">Sesuaikan tampilan halaman landing Orbit Site Anda dengan blok edukasi.</p>
                                </div>

                                {/* Profile Editor Block */}
                                <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-10">
                                    <div className="flex items-center justify-between mb-4 md:mb-10 gap-1 md:gap-2">
                                        <h3 className="font-black text-slate-900 text-xs md:text-xl tracking-tighter uppercase truncate">Identitas Profil</h3>
                                        <span className="bg-primary text-white text-[7px] md:text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-widest leading-none shrink-0 scale-90 md:scale-100">Wajib</span>
                                    </div>
                                    <div className="space-y-4 md:space-y-8">
                                        <div className="flex flex-col items-center gap-5 md:gap-8 p-3 md:p-10 bg-white rounded-[1.2rem] md:rounded-[2rem] border border-slate-100 shadow-sm">
                                             <AvatarUpload 
                                                image={avatarUrl}
                                                onUpload={async (file: File) => {
                                                    try {
                                                        const formData = new FormData();
                                                        formData.append('avatar', file);
                                                        const res = await fetch('/api/profile/avatar', {
                                                            method: 'POST',
                                                            body: formData,
                                                        });
                                                        if (res.ok) {
                                                            const data = await res.json();
                                                            setAvatarUrl(data.avatar_url || data.url);
                                                        } else {
                                                            const err = await res.json().catch(() => ({}));
                                                            alert('Gagal upload foto: ' + (err?.error || 'Unknown error'));
                                                        }
                                                    } catch (e: any) {
                                                        alert('Error: ' + e.message);
                                                    }
                                                }}
                                             />
                                            <div className="w-full space-y-4 md:space-y-6">
                                                <div>
                                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] block mb-2 md:mb-3">Host Subdomain</label>
                                                    <div className="flex items-center gap-1 md:gap-2">
                                                        <span className="text-slate-300 font-black text-[8px] md:text-xs">tepak.id/</span>
                                                        <Input 
                                                            value={subdomain} 
                                                            onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                                                            className="rounded-lg md:rounded-xl flex-1 px-3 text-[9px] md:text-xs h-8 md:h-auto" 
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] block mb-2 md:mb-3">Deskripsi Bio</label>
                                                    <textarea 
                                                        className="w-full bg-slate-50 border-slate-100 rounded-xl md:rounded-3xl text-[10px] md:text-xs font-black uppercase tracking-tight focus:border-primary focus:ring-0 p-3 md:p-5 px-4 md:px-6 min-h-[80px] md:min-h-[120px] shadow-inner" 
                                                        value={bio}
                                                        onChange={(e) => setBio(e.target.value)}
                                                        placeholder="Ceritakan tentang Anda..."
                                                    />
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Block Editor List */}
                                <div className="space-y-4 md:space-y-8">
                                    <div className="flex items-center justify-between gap-1 md:gap-2">
                                        <h3 className="font-black text-slate-900 text-xs md:text-xl tracking-tighter uppercase truncate">Blok Konten</h3>
                                        <button 
                                            onClick={() => setIsAddBlockOpen(true)}
                                            className="bg-primary/5 hover:bg-primary text-primary hover:text-white px-2 md:px-6 py-2 rounded-lg md:rounded-2xl text-[8px] md:text-[10px] font-black flex items-center gap-1 md:gap-2 transition-all uppercase tracking-widest shrink-0 scale-95 md:scale-100"
                                        >
                                            <PlusCircleIcon className="w-4 h-4 md:w-6 md:h-6" />
                                            Tambah Blok
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-2 md:space-y-4">
                                        {isLoadingProfile ? (
                                            // Skeleton loading
                                            <div className="space-y-3">
                                                {[1,2].map(i => (
                                                    <div key={i} className="h-16 md:h-20 bg-slate-100 rounded-2xl animate-pulse" />
                                                ))}
                                            </div>
                                        ) : blocks.length === 0 ? (
                                            // Empty state
                                            <div className="flex flex-col items-center justify-center py-10 md:py-14 px-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] md:rounded-[2rem] text-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-300">
                                                    <PlusCircleIcon className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] md:text-xs font-black text-slate-900 uppercase tracking-widest">Belum Ada Blok</p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed">Klik <span className="font-black text-primary">+ Tambah Blok</span> untuk mulai membangun halaman Anda</p>
                                                </div>
                                                <button
                                                    onClick={() => setIsAddBlockOpen(true)}
                                                    className="mt-1 bg-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
                                                >
                                                    + Tambah Blok Pertama
                                                </button>
                                            </div>
                                        ) : (
                                            // Daftar blok
                                            blocks.map((block, index) => (
                                                <DraggableBlock 
                                                    key={block.id}
                                                    icon={block.icon} 
                                                    title={block.title} 
                                                    subtitle={block.subtitle} 
                                                    onEdit={() => setActiveBlockType(block.type)} 
                                                    onDelete={() => setDeleteTarget(block.id)}
                                                    onMoveUp={index > 0 ? () => handleMoveBlock(index, 'up') : undefined}
                                                    onMoveDown={index < blocks.length - 1 ? () => handleMoveBlock(index, 'down') : undefined}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="pt-10 md:pt-12 border-t border-slate-100 px-1 md:px-0">
                                    <h3 className="font-black text-slate-900 text-sm md:text-xl tracking-tighter uppercase mb-6 md:mb-8">Tema & Estetika</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
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

                                <div className="pb-16 pt-6">
                                    <Button 
                                        variant="amber" 
                                        size="lg" 
                                        className="w-full py-5 md:py-6 text-[10px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] rounded-2xl md:rounded-[1.5rem] shadow-2xl shadow-amber-500/20"
                                        onClick={handleSaveProfile}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Menerbitkan...' : 'Terbitkan Perubahan'}
                                    </Button>
                                </div>
                            </div>
                        </section>

                        {/* Right Panel: Phone Preview */}
                        <section className="flex-1 bg-slate-50 flex items-center justify-center p-8 md:p-12 border-t lg:border-t-0 lg:border-l border-slate-100 overflow-hidden relative">
                            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
                            <div className="relative scale-90 xxl:scale-100 transition-transform duration-500">
                                <PhoneFrame 
                                    theme={selectedTheme === 'atelier-dark' ? 'bold' : 'minimal'}
                                    profileName={fullName}
                                    profileBio={bio}
                                    profileImage={avatarUrl}
                                >
                                    <div className="space-y-4">
                                        {blocks.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center opacity-60">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tambah blok<br/>untuk mulai</p>
                                            </div>
                                        ) : (
                                            blocks.map((block: any) => (
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
                                            ))
                                        )}
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
                    onClose={handleCloseBlockSettings}
                    onSave={handleSaveBlock}
                />
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-100 mb-4">
                                <TrashIcon className="w-6 h-6 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Hapus Blok?</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Block <strong className="text-slate-900">"{blockToDelete?.title}"</strong> akan dihapus dari halaman. Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                className="px-5 py-2.5 rounded-xl font-black text-slate-500 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest"
                                onClick={() => setDeleteTarget(null)}
                            >
                                Batal
                            </button>
                            <button
                                className="px-6 py-2.5 rounded-xl font-black bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all text-[10px] uppercase tracking-widest"
                                onClick={handleDeleteConfirmed}
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </BrandingProvider>
    );
};

export default CreatorAtelierEditor;
