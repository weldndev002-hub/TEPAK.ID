import React, { useState } from 'react';
import { toast } from 'sonner';

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
    const { hasFeature, planDetails, isLoading: subLoading, refreshStatus } = useSubscription();

    // If config.allowed_blocks is explicitly set (even []), respect it.
    // Only fall back to all blocks if config is completely undefined (not yet configured in admin).
    const allowedBlocks: string[] | null = planDetails?.config?.allowed_blocks !== undefined
        ? (planDetails.config.allowed_blocks as string[])
        : null; // null = allow all (no restriction configured)

    React.useEffect(() => {
        // Force refresh subscription status to get latest plan config
        refreshStatus();
    }, []);


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
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);


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
                    if (data.user_settings?.theme) setSelectedTheme(data.user_settings.theme);
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
                    blocks: blocks,
                    theme: selectedTheme
                })
            });
            if (res.ok) {
                toast.success('Changes published successfully!');
            } else {
                toast.error('Failed to publish changes.');
            }
        } catch (err) {
            console.error('Save error:', err);
            toast.error('Error saving changes.');
        } finally {

            setIsLoading(false);
        }
    };

    // Social Data Extraction for Preview
    const BrandIcons = {
        instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.247 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.247-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.247-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.247 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
        tiktok: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-4.17.07-8.33.07-12.5z"/></svg>`,
        twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>`,
        facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>`,
        linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
        threads: `<svg viewBox="0 0 192 192" fill="currentColor"><path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"/></svg>`,
    };

    const socialBlock = blocks.find((b: any) => b.type === 'social');
    const socialData = socialBlock?.data || {};

    const socials = [
        { icon: BrandIcons.instagram, url: socialData.instagram ? `https://instagram.com/${socialData.instagram.replace('@', '')}` : null },
        { icon: BrandIcons.tiktok, url: socialData.tiktok ? `https://tiktok.com/@${socialData.tiktok.replace('@', '')}` : null },
        { icon: BrandIcons.twitter, url: socialData.twitter ? `https://twitter.com/${socialData.twitter.replace('@', '')}` : null },
        { icon: BrandIcons.threads, url: socialData.threads ? `https://threads.net/@${socialData.threads.replace('@', '')}` : null },
        { icon: BrandIcons.facebook, url: socialData.facebook ? `https://facebook.com/${socialData.facebook}` : null },
        { icon: BrandIcons.linkedin, url: socialData.linkedin ? `https://linkedin.com/in/${socialData.linkedin.replace('@', '')}` : null }
    ].filter(s => s.url);

    // Delete confirm modal derived data
    const blockToDelete = blocks.find(b => b.id === deleteTarget);

    const handleSelectBlock = (type: string) => {
        setActiveBlockType(type);
        setEditingBlockId(null); // Adding new block
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
        } else if (activeBlockType === 'link' || activeBlockType === 'article') {
            subtitle = data.description || data.url || 'Link Item';
        }


        if (editingBlockId) {
            // Update existing block
            setBlocks(prev => prev.map(b => b.id === editingBlockId ? {
                ...b,
                title: data.title || b.title,
                subtitle: subtitle,
                data: data
            } : b));
        } else {
            // Add new block
            const newBlock = {
                id: Math.random().toString(36).substr(2, 9),
                type: activeBlockType || 'link',
                icon: activeBlockType === 'link' ? 'LinkIcon' : activeBlockType === 'video' ? 'PlayCircleIcon' : activeBlockType === 'social' ? 'MegaphoneIcon' : activeBlockType === 'image' ? 'PhotoIcon' : 'CubeIcon',
                title: data.title || (activeBlockType === 'social' ? 'Social Profiles' : activeBlockType === 'image' ? (data.title || 'Image Content') : `New ${activeBlockType} Item`),
                subtitle: subtitle,
                data: data
            };
            setBlocks([...blocks, newBlock]);
        }
        
        // Return to block drawer after saving
        setActiveBlockType(null);
        setEditingBlockId(null);
        setIsAddBlockOpen(true);
    };


    // Close block settings → go back to block drawer
    const handleCloseBlockSettings = () => {
        setActiveBlockType(null);
        setEditingBlockId(null);
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
                                                            toast.error('Gagal upload foto: ' + (err?.error || 'Unknown error'));
                                                        }
                                                    } catch (e: any) {
                                                        toast.error('Error: ' + e.message);
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
                                                        className="w-full bg-slate-50 border-slate-100 rounded-xl md:rounded-3xl text-[10px] md:text-xs font-black tracking-tight focus:border-primary focus:ring-0 p-3 md:p-5 px-4 md:px-6 min-h-[80px] md:min-h-[120px] shadow-inner" 
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
                                                    onEdit={() => {
                                                        setActiveBlockType(block.type);
                                                        setEditingBlockId(block.id);
                                                    }} 
                                                    onDelete={() => setDeleteTarget(block.id)}

                                                    onMoveUp={block.type !== 'social' && index > 0 ? () => handleMoveBlock(index, 'up') : undefined}
                                                    onMoveDown={block.type !== 'social' && index < blocks.length - 1 ? () => handleMoveBlock(index, 'down') : undefined}
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
                                    theme={selectedTheme as any}
                                    profileName={fullName}
                                    profileBio={bio}
                                    profileImage={avatarUrl}
                                    socials={socials}
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
                                            (() => {
                                                // Define theme styles for the editor preview to match PublicCreatorProfile.astro
                                                const getPreviewTheme = (themeId: string) => {
                                                    const configs: Record<string, any> = {
                                                        'atelier-dark': {
                                                            cardClass: 'bg-slate-800/50 border-slate-700',
                                                            cardTitleClass: 'text-white',
                                                            cardSubtitleClass: 'text-slate-500',
                                                        },
                                                        'clean-minimal': {
                                                            cardClass: 'bg-slate-50 border-slate-100',
                                                            cardTitleClass: 'text-slate-900',
                                                            cardSubtitleClass: 'text-slate-400',
                                                        },
                                                        'sunrise-glow': {
                                                            cardClass: 'bg-white/60 border-white',
                                                            cardTitleClass: 'text-slate-900',
                                                            cardSubtitleClass: 'text-rose-400',
                                                        }
                                                    };
                                                    return configs[themeId] || configs['atelier-dark'];
                                                };

                                                const previewTheme = getPreviewTheme(selectedTheme);
                                                return blocks.map((block: any) => (
                                                <div key={block.id}>
                                                    {block.type === 'social' ? (
                                                        null // Socials are rendered in the PhoneFrame hero section
                                                    ) : block.type === 'text' ? (
                                                        <div className="py-6 px-2 text-center space-y-3">
                                                            {block.data?.title && (
                                                                <h4 className={cn("text-lg font-black tracking-tighter leading-tight", previewTheme.cardTitleClass)}>{block.data.title}</h4>


                                                            )}
                                                            {block.data?.content && (
                                                                <p className={cn("text-[10px] font-medium leading-relaxed italic opacity-80", previewTheme.cardSubtitleClass)}>{block.data.content}</p>
                                                            )}
                                                        </div>
                                                    ) : block.type === 'image' ? (
                                                        <div className={cn("w-full p-3 rounded-[2rem] space-y-3 animate-in fade-in zoom-in-95 duration-500", previewTheme.cardClass)}>
                                                            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm bg-slate-50">
                                                                 {block.data?.imageUrl && (
                                                                     <img src={block.data.imageUrl} className="w-full h-full object-cover" alt={block.title} />
                                                                 )}
                                                             </div>
                                                             {block.data?.title && (
                                                                 <p className={cn("text-[10px] font-black tracking-widest text-center italic", previewTheme.cardSubtitleClass)}>{block.data.title}</p>
                                                             )}
                                                         </div>
                                                    ) : block.type === 'video' ? (
                                                        <div className={cn("w-full p-3 rounded-[2rem] space-y-3 animate-in fade-in zoom-in-95 duration-500", previewTheme.cardClass)}>
                                                             <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-900">
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
                                                                 <p className={cn("text-[10px] font-black tracking-widest text-center italic", previewTheme.cardSubtitleClass)}>{block.title}</p>
                                                             )}
                                                         </div>
                                                    ) : (
                                                        <div className={cn("w-full py-4 px-6 border rounded-2xl shadow-sm flex items-center gap-4 transition-all hover:scale-[1.02]", previewTheme.cardClass)}>
                                                            {block.data?.thumbnailUrl ? (
                                                                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-50">
                                                                    <img src={block.data.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                                                                    <span className="material-symbols-outlined text-sm">{block.type === 'link' ? 'link' : 'article'}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className={cn("text-[10px] font-black tracking-widest truncate", previewTheme.cardTitleClass)}>{block.title}</p>


                                                                {block.subtitle && <p className={cn("text-[9px] font-medium truncate mt-0.5", previewTheme.cardSubtitleClass)}>{block.subtitle}</p>}

                                                            </div>
                                                            <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                                        </div>
                                                    )}

                                                </div>
                                                ))
                                            })()
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
                allowedBlocks={allowedBlocks}
            />

            {activeBlockType && (
                <BlockSettingsForm 
                    blockType={activeBlockType} 
                    initialData={editingBlockId ? blocks.find(b => b.id === editingBlockId)?.data : null}
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
