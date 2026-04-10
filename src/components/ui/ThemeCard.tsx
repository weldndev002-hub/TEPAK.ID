import React from 'react';
import { cn } from '../../lib/utils';
import { PhotoIcon, CheckIcon } from '@heroicons/react/24/outline';

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
            className="flex flex-col group cursor-pointer w-full"
        >
            <div className={cn(
                "w-full aspect-[3/4] rounded-3xl md:rounded-[2.5rem] p-4 md:p-8 transition-all duration-500 overflow-hidden relative shadow-sm border",
                previewGradient,
                isActive 
                    ? "border-primary shadow-2xl shadow-primary/10 scale-[1.02]" 
                    : "border-slate-100 hover:border-slate-300 hover:scale-[1.01]"
            )}>
                {/* MOCK UI ELEMENTS WITHIN CARD */}
                <div className="space-y-3 md:space-y-4 opacity-40">
                    <div className={cn("w-1/2 h-1.5 md:h-2 rounded-full", id === 'clean-minimal' ? 'bg-slate-200' : 'bg-white/30')} />
                    <div className={cn("w-1/3 h-1 md:h-1.5 rounded-full", id === 'clean-minimal' ? 'bg-slate-100' : 'bg-white/20')} />
                    
                    <div className={cn(
                        "mt-6 md:mt-10 w-full aspect-square rounded-2xl md:rounded-[2rem] flex items-center justify-center border",
                        id === 'clean-minimal' ? 'bg-slate-50 border-slate-100' : 'bg-white/10 border-white/20'
                    )}>
                        <PhotoIcon className={cn(
                            "w-8 h-8 md:w-12 md:h-12",
                            id === 'clean-minimal' ? 'text-slate-200' : 'text-white/30'
                        )} />
                    </div>
                </div>

                {/* SELECTION OVERLAY */}
                {isActive && (
                    <div className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center shadow-xl animate-in zoom-in-50 duration-300 border-2 border-white">
                        <CheckIcon className="w-4 h-4 md:w-6 md:h-6 text-white stroke-[3]" />
                    </div>
                )}
            </div>

            <span className={cn(
                "mt-4 md:mt-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-center transition-colors px-2",
                isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
            )}>
                {name}
            </span>
        </div>
    );
};

export default ThemeCard;

