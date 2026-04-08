import React from 'react';
import { cn } from '../../lib/utils';

interface ThemeOption {
  id: string;
  name: string;
  bgColor: string;
  accentColor: string;
  thumbnailClass: string;
}

interface ThemePickerProps {
  options: ThemeOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({ options, selectedId, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {options.map((theme) => (
        <div 
          key={theme.id}
          onClick={() => onSelect(theme.id)}
          className={cn(
            "group relative bg-white rounded-2xl overflow-hidden border-2 p-3 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95 hover:shadow-xl",
            selectedId === theme.id 
              ? "border-primary shadow-lg ring-4 ring-primary/5" 
              : "border-slate-200 hover:border-primary/50"
          )}
        >
          {/* Mock UI Thumbnail for Theme */}
          <div className={cn("rounded-xl aspect-[4/5] p-6 flex flex-col items-center gap-3", theme.thumbnailClass)}>
            <div className={cn("w-14 h-14 rounded-full mb-2", theme.accentColor)}></div>
            <div className="w-3/4 h-3 bg-current opacity-20 rounded-full"></div>
            <div className="w-1/2 h-3 bg-current opacity-10 rounded-full"></div>
            <div className="w-full h-10 bg-white/10 backdrop-blur border border-white/20 rounded-xl mt-4"></div>
            <div className="w-full h-10 bg-white/10 backdrop-blur border border-white/20 rounded-xl"></div>
          </div>
          
          <div className="mt-4 flex items-center justify-between px-3 pb-2">
            <span className={cn(
              "font-bold text-slate-900 transition-colors",
              selectedId === theme.id ? "text-primary" : "group-hover:text-primary"
            )}>
              {theme.name}
            </span>
            {selectedId === theme.id && (
              <span className="material-symbols-outlined text-primary text-2xl animate-in zoom-in-50" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThemePicker;
