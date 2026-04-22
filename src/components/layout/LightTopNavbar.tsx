import React from 'react';
import { cn } from '../../lib/utils';
import { useBranding } from '../../hooks/useBranding.tsx';
import { BellIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export const LightTopNavbar: React.FC = () => {
    const [plan] = React.useState('STANDARD');
    const { branding } = useBranding();
    const siteName = branding?.site_name || 'TEPAK.ID';
    
    // Split site name for styling if it contains a dot
    const [namePrefix, nameSuffix] = siteName.includes('.') 
        ? [siteName.split('.')[0], `.${siteName.split('.')[1]}`]
        : [siteName, ''];

    return (
        <nav 
            style={{ top: 'var(--banner-height, 0px)' }}
            className="fixed left-0 right-0 h-16 md:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-[100] flex items-center justify-between px-4 md:px-8 transition-all duration-300"
        >
            <div className="flex items-center">
                {/* Logo Section */}
                <div className="flex items-center py-2">
                    {branding?.logo_url ? (
                        <img src={branding.logo_url} alt={siteName} className="h-10 md:h-14 w-auto object-contain" />
                    ) : (
                        <span className="text-xl md:text-2xl font-black text-primary tracking-tighter uppercase italic text-shadow-sm">
                            {namePrefix}<span className="text-slate-900">{nameSuffix}</span>
                        </span>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
                {/* Plan Badge */}
                <div className={cn(
                    "px-2 md:px-3 py-1 rounded-full text-[7px] md:text-[10px] font-black uppercase tracking-widest border transition-all duration-300 shrink-0",
                    plan === 'PRO' 
                        ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(255,185,76,0.3)]" 
                        : "bg-slate-100 text-slate-400 border-slate-200"
                )}>
                    {plan} <span className="hidden sm:inline">Account</span>
                </div>

                <div className="flex items-center gap-1">
                    <button className="text-slate-500 hover:text-primary hover:bg-slate-50 p-2 rounded-full transition-colors relative">
                        <BellIcon className="w-5 h-5 mx-auto" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                    </button>
                    <button className="text-slate-500 hover:text-primary hover:bg-slate-50 p-2 rounded-full transition-colors hidden sm:block">
                        <QuestionMarkCircleIcon className="w-5 h-5" />
                    </button>
                </div>
                
                {/* User Profile Avatar */}
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                    <img 
                        alt="User profile" 
                        className="w-full h-full object-cover"
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" 
                    />
                </div>
            </div>
        </nav>
    );
};

export default LightTopNavbar;
