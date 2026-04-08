import React from 'react';
import { cn } from '../../lib/utils';

export interface DraggableBlockProps {
  icon: string;
  title: string;
  subtitle?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({ 
  icon, title, subtitle, onEdit, onDelete, className 
}) => {
  return (
    <div className={cn("bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center group transition-all hover:shadow-md", className)}>
      <span className="material-symbols-outlined text-slate-300 cursor-grab active:cursor-grabbing mr-3" style={{ fontVariationSettings: "'FILL' 0" }}>
        drag_indicator
      </span>
      
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>
            {icon}
          </span>
          <span className="text-sm font-bold text-slate-900 truncate">
            {title}
          </span>
        </div>
        {subtitle && (
          <span className="text-xs text-slate-500 block truncate">
            {subtitle}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button onClick={onEdit} className="p-2 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>edit</span>
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="p-2 text-slate-400 hover:text-error transition-colors">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>delete</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DraggableBlock;
