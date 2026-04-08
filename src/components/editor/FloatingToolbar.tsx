import React from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import { 
    PlusCircleIcon, 
    SwatchIcon, 
    EyeIcon 
} from '@heroicons/react/24/outline';

interface FloatingToolbarProps {
  className?: string;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ className }) => {
  const actions = [
    { label: "Add Block", icon: PlusCircleIcon },
    { label: "Theme", icon: SwatchIcon },
    { label: "Preview", icon: EyeIcon }
  ];

  return (
    <div className={cn(
      "fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-8 py-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex items-center gap-8 z-50 font-['Plus_Jakarta_Sans',sans-serif]",
      className
    )}>
      {actions.map((action, index) => (
        <React.Fragment key={action.label}>
          <button className="flex items-center gap-3 text-white/70 hover:text-primary transition-all group active:scale-95">
            <action.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{action.label}</span>
          </button>
          
          {index < actions.length - 1 && (
            <div className="h-4 w-px bg-white/10"></div>
          )}
        </React.Fragment>
      ))}

      <div className="w-px h-8 bg-white/10 mx-2"></div>

      <Button variant="primary" className="px-8 py-3 rounded-2xl shadow-2xl shadow-primary/20 text-[10px] font-black uppercase tracking-[0.2em]">
        Publish Changes
      </Button>
    </div>
  );
};

export default FloatingToolbar;
