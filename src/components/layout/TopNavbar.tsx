import React from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import { ShareIcon } from '@heroicons/react/24/outline';

interface TopNavBarProps {
    className?: string;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ className }) => {
    return (
        <nav className={cn(
            "fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100/50 transition-all duration-500 font-['Plus_Jakarta_Sans',sans-serif]",
            className
        )}>
            <div className="flex justify-between items-center max-w-6xl mx-auto px-6 lg:px-12 h-20">
                
                {/* LOGO */}
                <div className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                    tepak.id
                </div>

                {/* NAVIGATION LINKS */}
                <div className="hidden md:flex items-center gap-10 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                    <a className="hover:text-primary transition-colors decoration-2 underline-offset-8" href="#portfolio">Portofolio</a>
                    <a className="hover:text-primary transition-colors decoration-2 underline-offset-8" href="#shop">Toko Produk</a>
                    <a className="hover:text-primary transition-colors decoration-2 underline-offset-8" href="#events">Agenda</a>
                    <a className="hover:text-primary transition-colors decoration-2 underline-offset-8" href="#about">Tentang</a>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-5">
                    <button className="text-slate-400 hover:text-primary transition-colors">
                        <ShareIcon className="w-6 h-6" />
                    </button>
                    <Button variant="amber" size="md" className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-primary/20 rounded-xl">
                        Langganan
                    </Button>
                </div>
            </div>
        </nav>
    );
};

export default TopNavBar;

