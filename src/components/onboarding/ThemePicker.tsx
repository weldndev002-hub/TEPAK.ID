import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto ">
      {options.map((theme) => (
        <div 
          key={theme.id}
          onClick={() => onSelect(theme.id)}
          className={cn(
            "group relative bg-white rounded-[2.5rem] overflow-hidden border p-4 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95",
            selectedId === theme.id 
              ? "border-primary shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.15)] bg-slate-50/10" 
              : "border-slate-100 hover:border-primary/30"
          )}
        >
          {/* Mock UI Thumbnail for Theme */}
          <div className={cn("rounded-[2rem] aspect-[4/5] p-8 flex flex-col items-center gap-4 transition-all", theme.thumbnailClass)}>
            <div className={cn("w-16 h-16 rounded-[1.25rem] mb-4 shadow-lg", theme.accentColor)}></div>
            <div className="w-3/4 h-2 bg-current opacity-20 rounded-full"></div>
            <div className="w-1/2 h-2 bg-current opacity-10 rounded-full"></div>
            <div className="w-full h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl mt-6"></div>
            <div className="w-full h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl"></div>
          </div>
          
          <div className="mt-6 flex items-center justify-between px-4 pb-4">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
              selectedId === theme.id ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
            )}>
              {theme.name}
            </span>
            {selectedId === theme.id && (
              <CheckCircleIcon className="w-6 h-6 text-primary animate-in zoom-in-50 duration-300" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThemePicker;

