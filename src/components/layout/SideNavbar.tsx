import React from 'react';
import Button from '../ui/Button';
import { 
    Squares2X2Icon, 
    WalletIcon, 
    GlobeAltIcon, 
    ClipboardDocumentListIcon, 
    ChartBarIcon, 
    Cog6ToothIcon,
    RocketLaunchIcon,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

import { useBranding } from '../../hooks/useBranding';

export const SideNavbar: React.FC = () => {
    const { branding } = useBranding();

    return (
        <aside className="flex flex-col h-screen fixed left-0 top-0 z-50 w-72 bg-[#1e2939] text-white  tracking-tight antialiased">
            <div className="p-8 pb-4 flex flex-col items-start space-y-2">
                {branding?.logo_url ? (
                    <img 
                      src={branding.logo_url} 
                      alt={branding.site_name} 
                      className="w-32 h-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-lg md:text-xl font-black text-primary tracking-tighter uppercase italic">
                            {branding?.site_name?.split('.')[0] || 'Tepak'}<span className="text-white">{branding?.site_name?.includes('.') ? `.${branding.site_name.split('.')[1]}` : '.ID'}</span>
                        </span>
                    </div>
                )}
            </div>
            
            <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto no-scrollbar">
                <a className="flex items-center space-x-3 p-3 rounded-xl text-amber-500 font-bold bg-slate-800/50 shadow-inner group transition-all duration-200" href="#">
                    <Squares2X2Icon className="w-5 h-5" />
                    <span>Dashboard</span>
                </a>
                <a className="flex items-center space-x-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200 font-bold" href="#">
                    <WalletIcon className="w-5 h-5" />
                    <span>Wallet</span>
                </a>
                <a className="flex items-center space-x-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200 font-bold" href="#">
                    <GlobeAltIcon className="w-5 h-5" />
                    <span>Domain Status</span>
                </a>
                <a className="flex items-center space-x-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200 font-bold" href="#">
                    <ClipboardDocumentListIcon className="w-5 h-5" />
                    <span>Plan Manager</span>
                </a>
                <a className="flex items-center space-x-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200 font-bold" href="#">
                    <ChartBarIcon className="w-5 h-5" />
                    <span>Analytics</span>
                </a>
                <a className="flex items-center space-x-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200 font-bold" href="#">
                    <Cog6ToothIcon className="w-5 h-5" />
                    <span>Settings</span>
                </a>
            </nav>
            
            <div className="p-4 space-y-4 mb-4">
                <Button variant="amber" className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-sm font-bold">
                    <RocketLaunchIcon className="w-4 h-4" />
                    <span>Upgrade Plan</span>
                </Button>
                <a className="flex items-center justify-center space-x-3 p-3 rounded-xl text-slate-400 hover:text-white transition-colors" href="#">
                    <QuestionMarkCircleIcon className="w-5 h-5" />
                    <span className="text-sm font-bold tracking-tight">Help Center</span>
                </a>
            </div>
        </aside>
    );
};

export default SideNavbar;

