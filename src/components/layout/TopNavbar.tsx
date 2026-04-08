import React from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

interface TopNavBarProps {
    className?: string;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ className }) => {
    return (
        <nav className={cn(
            "fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100/50 transition-all duration-500",
            className
        )}>
            <div className="flex justify-between items-center max-w-6xl mx-auto px-6 lg:px-12 h-20">
                
                {/* LOGO */}
                <div className="text-2xl font-black text-slate-900 tracking-tighter">
                    tepak.id
                </div>

                {/* NAVIGATION LINKS */}
                <div className="hidden md:flex items-center gap-10 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    <a className="hover:text-primary transition-colors decoration-2 underline-offset-8" href="#portfolio">Portofolio</a>
                    <a className="hover:text-primary transition-colors decoration-2 underline-offset-8" href="#shop">Toko Produk</a>
                    <a className="hover:text-primary transition-colors decoration-2 underline-offset-8" href="#events">Agenda</a>
                    <a className="hover:text-primary transition-colors decoration-2 underline-offset-8" href="#about">Tentang</a>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-5">
                    <button className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors text-2xl">
                        share
                    </button>
                    <Button variant="amber" size="md" className="px-8 py-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                        Langganan
                    </Button>
                </div>
            </div>
        </nav>
    );
};

export default TopNavBar;
