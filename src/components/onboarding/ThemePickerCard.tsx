import React from 'react';
import { cn } from '../../lib/utils';

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
          <div className="bg-slate-900 rounded-lg aspect-[4/5] p-4 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary mb-2"></div>
            <div className="w-3/4 h-3 bg-white/20 rounded-full"></div>
            <div className="w-full h-8 bg-primary rounded-lg mt-2"></div>
            <div className="w-full h-8 bg-primary rounded-lg"></div>
          </div>
        );
      case 'warm':
        return (
          <div className="bg-orange-50 rounded-lg aspect-[4/5] p-4 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-200 mb-2"></div>
            <div className="w-3/4 h-3 bg-orange-100 rounded-full"></div>
            <div className="w-full h-8 bg-orange-500/10 border border-orange-500 rounded-lg mt-2"></div>
            <div className="w-full h-8 bg-orange-500/10 border border-orange-500 rounded-lg"></div>
          </div>
        );
      case 'minimal':
      default:
        return (
          <div className="bg-slate-50 rounded-lg aspect-[4/5] p-4 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-200 mb-2"></div>
            <div className="w-3/4 h-3 bg-slate-200 rounded-full"></div>
            <div className="w-1/2 h-3 bg-slate-200 rounded-full"></div>
            <div className="w-full h-8 bg-white border border-slate-200 rounded-lg mt-2"></div>
            <div className="w-full h-8 bg-white border border-slate-200 rounded-lg"></div>
          </div>
        );
    }
  };

  return (
    <div 
        onClick={() => onSelect?.(theme.id)}
        className={cn(
            "group relative bg-white rounded-xl overflow-hidden p-3 cursor-pointer transition-all",
            isSelected 
                ? "border-2 border-primary shadow-lg" 
                : "border border-slate-200 hover:border-primary/50 shadow-sm",
            className
        )}
    >
      {renderThemePreview()}
      
      <div className={cn("mt-4 px-2", isSelected && "flex items-center justify-between")}>
        <span className="font-bold text-slate-900">{theme.name}</span>
        {isSelected && (
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
            </span>
        )}
      </div>
    </div>
  );
};

export default ThemePickerCard;
