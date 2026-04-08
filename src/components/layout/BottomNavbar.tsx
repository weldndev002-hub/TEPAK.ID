import React from 'react';
import { cn } from '../../lib/utils';

interface BottomNavItemProps {
    icon: string;
    label: string;
    active?: boolean;
    href?: string;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({ icon, label, active, href = "#" }) => (
    <a 
        href={href}
        className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all relative py-2",
            active ? "text-primary scale-110" : "text-slate-400 hover:text-slate-600"
        )}
    >
        <span className="material-symbols-outlined text-2xl" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-widest leading-none">{label}</span>
        {active && (
            <span className="absolute -top-1 w-8 h-1 bg-primary rounded-full shadow-lg shadow-primary/40 animate-in zoom-in-50"></span>
        )}
    </a>
);

export const BottomNavbar: React.FC = () => {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-t-2xl font-sans text-[10px] font-semibold">
            <BottomNavItem icon="home" label="Home" />
            <BottomNavItem icon="edit_note" label="Editor" />
            <BottomNavItem icon="bar_chart" label="Stats" active />
            <BottomNavItem icon="payments" label="Wallet" />
            <BottomNavItem icon="person_search" label="CRM" />
        </nav>
    );
};

export default BottomNavbar;
