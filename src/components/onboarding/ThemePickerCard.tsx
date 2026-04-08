import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export interface ThemeOption {
  id: string;
  name: string;
  type: 'minimal' | 'bold' | 'warm';
}

export interface ThemePickerCardProps {
  theme: ThemeOption;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

export const ThemePickerCard: React.FC<ThemePickerCardProps> = ({ 
  theme, 
  isSelected = false, 
  onSelect,
  className 
}) => {
  
  const renderThemePreview = () => {
    switch (theme.type) {
      case 'bold':
        return (
          <div className="bg-slate-900 rounded-[1.5rem] aspect-[4/5] p-6 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary mb-2 shadow-lg shadow-primary/20"></div>
            <div className="w-3/4 h-2.5 bg-white/20 rounded-full"></div>
            <div className="w-full h-10 bg-primary/20 border border-primary/30 rounded-xl mt-4"></div>
            <div className="w-full h-10 bg-primary/20 border border-primary/30 rounded-xl"></div>
          </div>
        );
      case 'warm':
        return (
          <div className="bg-rose-50 rounded-[1.5rem] aspect-[4/5] p-6 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-200 mb-2 shadow-sm"></div>
            <div className="w-3/4 h-2.5 bg-rose-100 rounded-full"></div>
            <div className="w-full h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl mt-4"></div>
            <div className="w-full h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl"></div>
          </div>
        );
      case 'minimal':
      default:
        return (
          <div className="bg-slate-50 rounded-[1.5rem] aspect-[4/5] p-6 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-200 mb-2 shadow-sm"></div>
            <div className="w-3/4 h-2.5 bg-slate-200 rounded-full"></div>
            <div className="w-1/2 h-2.5 bg-slate-200 rounded-full"></div>
            <div className="w-full h-10 bg-white border border-slate-200 rounded-xl mt-4"></div>
            <div className="w-full h-10 bg-white border border-slate-200 rounded-xl"></div>
          </div>
        );
    }
  };

  return (
    <div 
        onClick={() => onSelect?.(theme.id)}
        className={cn(
            "group relative bg-white rounded-[2rem] overflow-hidden p-4 cursor-pointer transition-all font-['Plus_Jakarta_Sans',sans-serif]",
            isSelected 
                ? "border-2 border-primary shadow-xl" 
                : "border border-slate-100 hover:border-primary/30 shadow-sm",
            className
        )}
    >
      {renderThemePreview()}
      
      <div className={cn("mt-6 px-3 pb-2 flex items-center justify-between")}>
        <span className={cn(
            "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
            isSelected ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
        )}>
            {theme.name}
        </span>
        {isSelected && (
            <CheckCircleIcon className="w-5 h-5 text-primary animate-in zoom-in-50 duration-300" />
        )}
      </div>
    </div>
  );
};

export default ThemePickerCard;

