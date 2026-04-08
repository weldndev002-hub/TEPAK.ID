import React from 'react';
import { cn } from '../../lib/utils';
import { 
    HomeIcon, 
    PencilSquareIcon, 
    ChartBarIcon, 
    WalletIcon, 
    MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

interface BottomNavItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    href?: string;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({ icon: Icon, label, active, href = "#" }) => (
    <a 
        href={href}
        className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all relative py-2 font-['Plus_Jakarta_Sans',sans-serif]",
            active ? "text-primary scale-110" : "text-slate-400 hover:text-slate-600"
        )}
    >
        <Icon className={cn("w-6 h-6", active && "stroke-[2.5px]")} />
        <span className="text-[9px] font-black uppercase tracking-widest leading-none">{label}</span>
        {active && (
            <span className="absolute -top-1 w-8 h-1 bg-primary rounded-full shadow-lg shadow-primary/40 animate-in zoom-in-50"></span>
        )}
    </a>
);

export const BottomNavbar: React.FC = () => {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-t-2xl font-['Plus_Jakarta_Sans',sans-serif] text-[10px] font-semibold">
            <BottomNavItem icon={HomeIcon} label="Home" />
            <BottomNavItem icon={PencilSquareIcon} label="Editor" />
            <BottomNavItem icon={ChartBarIcon} label="Stats" active />
            <BottomNavItem icon={WalletIcon} label="Wallet" />
            <BottomNavItem icon={MagnifyingGlassIcon} label="Search" />
        </nav>
    );
};

export default BottomNavbar;

