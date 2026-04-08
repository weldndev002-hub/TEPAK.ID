import React from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

interface FloatingToolbarProps {
  className?: string;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ className }) => {
  const actions = [
    { label: "Add Block", icon: "add_box" },
    { label: "Theme", icon: "palette" },
    { label: "Preview", icon: "visibility" }
  ];

  return (
    <div className={cn(
      "fixed bottom-8 left-1/2 -translate-x-1/2 glass-panel border border-white/20 rounded-full px-6 py-3 shadow-2xl flex items-center space-x-6 z-50",
      className
    )}>
      {actions.map((action, index) => (
        <React.Fragment key={action.label}>
          <button className="flex items-center space-x-2 text-on-surface hover:text-primary transition-colors">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>{action.icon}</span>
            <span className="text-sm font-bold uppercase tracking-wider">{action.label}</span>
          </button>
          
          {index < actions.length - 1 && (
            <div className="h-6 w-px bg-slate-300"></div>
          )}
        </React.Fragment>
      ))}

      <Button variant="primary" className="ml-4 px-6 py-2 rounded-full shadow-lg">
        Publish Changes
      </Button>
    </div>
  );
};

export default FloatingToolbar;
