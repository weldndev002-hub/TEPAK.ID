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
            className="flex flex-col group cursor-pointer "
        >
            <div className={cn(
                "w-full aspect-[3/4] rounded-[2.5rem] p-8 transition-all duration-500 overflow-hidden relative shadow-sm border",
                previewGradient,
                isActive 
                    ? "border-primary shadow-2xl shadow-primary/10 scale-[1.02]" 
                    : "border-slate-100 hover:border-slate-300 hover:scale-[1.01]"
            )}>
                {/* MOCK UI ELEMENTS WITHIN CARD */}
                <div className="space-y-4 opacity-40">
                    <div className={cn("w-1/2 h-2 rounded-full", id === 'clean-minimal' ? 'bg-slate-200' : 'bg-white/30')} />
                    <div className={cn("w-1/3 h-1.5 rounded-full", id === 'clean-minimal' ? 'bg-slate-100' : 'bg-white/20')} />
                    
                    <div className={cn(
                        "mt-10 w-full aspect-square rounded-[2rem] flex items-center justify-center border",
                        id === 'clean-minimal' ? 'bg-slate-50 border-slate-100' : 'bg-white/10 border-white/20'
                    )}>
                        <PhotoIcon className={cn(
                            "w-12 h-12",
                            id === 'clean-minimal' ? 'text-slate-200' : 'text-white/30'
                        )} />
                    </div>
                </div>

                {/* SELECTION OVERLAY */}
                {isActive && (
                    <div className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-xl animate-in zoom-in-50 duration-300 border-2 border-white">
                        <CheckIcon className="w-6 h-6 text-white stroke-[3]" />
                    </div>
                )}
            </div>

            <span className={cn(
                "mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-center transition-colors px-2",
                isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
            )}>
                {name}
            </span>
        </div>
    );
};

export default ThemeCard;

