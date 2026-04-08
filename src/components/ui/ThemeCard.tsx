import React from 'react';
import { cn } from '../../lib/utils';

interface ThemeCardProps {
    id: string;
    name: string;
    previewGradient: string;
    isActive: boolean;
    onSelect: (id: string) => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({ 
    id, name, previewGradient, isActive, onSelect 
}) => {
    return (
        <div 
            onClick={() => onSelect(id)}
            className="flex flex-col group cursor-pointer"
        >
            <div className={cn(
                "w-full aspect-[3/4] rounded-3xl p-6 transition-all duration-500 overflow-hidden relative shadow-sm",
                previewGradient,
                isActive 
                    ? "ring-4 ring-primary ring-offset-4 ring-offset-white shadow-xl shadow-primary/10" 
                    : "ring-1 ring-slate-100 hover:ring-slate-300"
            )}>
                {/* MOCK UI ELEMENTS WITHIN CARD */}
                <div className="space-y-3 opacity-40">
                    <div className={cn("w-1/2 h-1.5 rounded-full", id === 'clean-minimal' ? 'bg-slate-200' : 'bg-white/30')} />
                    <div className={cn("w-1/3 h-1 rounded-full", id === 'clean-minimal' ? 'bg-slate-100' : 'bg-white/20')} />
                    
                    <div className={cn(
                        "mt-6 w-full aspect-square rounded-2xl flex items-center justify-center border",
                        id === 'clean-minimal' ? 'bg-slate-50 border-slate-100' : 'bg-white/10 border-white/20'
                    )}>
                        <span className={cn(
                            "material-symbols-outlined text-3xl",
                            id === 'clean-minimal' ? 'text-slate-200' : 'text-white/30'
                        )}>image</span>
                    </div>
                </div>

                {/* SELECTION OVERLAY */}
                {isActive && (
                    <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-300">
                        <span className="material-symbols-outlined text-white text-sm font-black">check</span>
                    </div>
                )}
            </div>

            <span className={cn(
                "mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-center transition-colors",
                isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
            )}>
                {name}
            </span>
        </div>
    );
};

export default ThemeCard;
