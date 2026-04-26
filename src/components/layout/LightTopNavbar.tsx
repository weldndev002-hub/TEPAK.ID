import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useBranding } from '../../hooks/useBranding.tsx';
import { BellIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { useSubscription, SubscriptionProvider } from '../../context/SubscriptionContext';

export const LightTopNavbar: React.FC = () => {
    return (
        <SubscriptionProvider>
            <LightTopNavbarContent />
        </SubscriptionProvider>
    );
};

const LightTopNavbarContent: React.FC = () => {
    const { plan, isLoading: planLoading } = useSubscription();
    const { branding } = useBranding();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const siteName = branding?.site_name || 'TEPAK.ID';
    
    useEffect(() => {
        const fetchProfile = async () => {
            if (!supabase) return;
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // Fetch Profile Avatar
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('avatar_url')
                        .eq('id', user.id)
                        .single();
                    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
                }
            } catch (err) {
                console.error('[Navbar] Profile fetch error:', err);
            }
        };
        fetchProfile();
    }, []);

    const displayPlan = planLoading ? '...' : (plan?.toUpperCase() || 'FREE');

    return (
        <nav 
            style={{ top: 'var(--banner-height, 0px)' }}
            className="fixed left-0 right-0 h-16 md:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-[100] flex items-center justify-between px-4 md:px-8 transition-all duration-300"
        >
            <div className="flex items-center">
                {/* Logo Section */}
                <div className="flex items-center py-2">
                    {branding?.logo_url && (
                        <img src={branding.logo_url} alt={siteName} className="h-10 md:h-14 w-auto object-contain" />
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
                {/* Plan Badge */}
                <div className={cn(
                    "px-2 md:px-3 py-1 rounded-full text-[7px] md:text-[10px] font-black uppercase tracking-widest border transition-all duration-300 shrink-0",
                    displayPlan === 'PRO' 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                        : "bg-slate-100 text-slate-400 border-slate-200"
                )}>
                    {displayPlan} <span className="hidden sm:inline">Account</span>
                </div>

                <div className="flex items-center gap-1">
                    <a 
                        href="/academy"
                        className="text-slate-500 hover:text-primary hover:bg-slate-50 p-2 rounded-full transition-colors hidden sm:block"
                        title="Bantuan & Tutorial"
                    >
                        <QuestionMarkCircleIcon className="w-5 h-5" />
                    </a>
                </div>
                
                {/* User Profile Avatar */}
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                        <img 
                            alt="User profile" 
                            className="w-full h-full object-cover"
                            src={avatarUrl} 
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                            <span className="text-slate-400 text-xs font-black italic">?</span>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default LightTopNavbar;
