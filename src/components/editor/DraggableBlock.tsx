import React from 'react';
import { cn } from '../../lib/utils';
import * as OutlineIcons from '@heroicons/react/24/outline';
import * as SolidIcons from '@heroicons/react/24/solid';

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
  // Map icon string to component
  const getIcon = (iconName: string) => {
    return (OutlineIcons as any)[iconName] || (SolidIcons as any)[iconName] || OutlineIcons.CubeIcon;
  };

  const Icon = getIcon(icon);

  return (
    <div className={cn("bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center group transition-all hover:shadow-2xl hover:shadow-slate-100 ", className)}>
      <div className="mr-6 text-slate-300 cursor-grab active:cursor-grabbing group-hover:text-slate-400 transition-colors">
        <OutlineIcons.Bars2Icon className="w-6 h-6" />
      </div>
      
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary/5 transition-colors border border-slate-100/50">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-black text-slate-900 truncate uppercase tracking-tight group-hover:text-primary transition-colors">
            {title}
          </span>
        </div>
        {subtitle && (
          <span className="text-[10px] text-slate-400 block truncate font-black uppercase tracking-widest mt-1 italic opacity-70 ml-13">
            {subtitle}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
        {onEdit && (
          <button onClick={onEdit} className="p-3 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
            <OutlineIcons.PencilSquareIcon className="w-5 h-5" />
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
            <OutlineIcons.TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DraggableBlock;
