import React from 'react';
import { cn } from '../../lib/utils';

export interface BlockType {
  id: string;
  label: string;
  icon: string;
}

export interface AddBlockDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock?: (blockId: string) => void;
  className?: string;
}

export const AddBlockDrawer: React.FC<AddBlockDrawerProps> = ({ 
  isOpen, onClose, onSelectBlock, className 
}) => {
  const defaultBlocks: BlockType[] = [
    { id: 'link', label: 'Link', icon: 'link' },
    { id: 'video', label: 'Video', icon: 'videocam' },
    { id: 'product', label: 'Produk', icon: 'shopping_bag' },
    { id: 'event', label: 'Event', icon: 'event' },
    { id: 'social', label: 'Sosmed', icon: 'campaign' },
    { id: 'article', label: 'Tulisan', icon: 'article' },
  ];

  return (
    <div 
        className={cn(
            "absolute top-0 right-0 w-80 h-full bg-white border-l border-slate-200 shadow-2xl z-20 flex flex-col transition-transform duration-300",
            isOpen ? "translate-x-0" : "translate-x-full",
            className
        )}
    >
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-900">Add Block</h3>
        <span 
          onClick={onClose} 
          className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-slate-700 transition"
        >
            close
        </span>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
        {defaultBlocks.map(block => (
          <div 
            key={block.id}
            onClick={() => onSelectBlock?.(block.id)}
            className="p-4 border border-slate-100 bg-slate-50 rounded-xl flex flex-col items-center gap-2 hover:border-primary hover:bg-white cursor-pointer transition-all hover:shadow-sm"
          >
            <span className="material-symbols-outlined text-primary text-2xl">{block.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide">{block.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddBlockDrawer;
