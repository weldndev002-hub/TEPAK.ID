import React from 'react';
import { cn } from '../../lib/utils';
import { 
    LinkIcon, 
    VideoCameraIcon, 
    ShoppingBagIcon, 
    CalendarIcon, 
    MegaphoneIcon, 
    DocumentTextIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export interface BlockType {
  id: string;
  label: string;
  icon: any;
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
    { id: 'link', label: 'Link', icon: LinkIcon },
    { id: 'video', label: 'Video', icon: VideoCameraIcon },
    { id: 'product', label: 'Produk', icon: ShoppingBagIcon },
    { id: 'event', label: 'Event', icon: CalendarIcon },
    { id: 'social', label: 'Sosmed', icon: MegaphoneIcon },
    { id: 'article', label: 'Tulisan', icon: DocumentTextIcon },
  ];

  return (
    <div 
        className={cn(
            "absolute top-0 right-0 w-96 h-full bg-white border-l border-slate-50 shadow-2xl z-20 flex flex-col transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) font-['Plus_Jakarta_Sans',sans-serif]",
            isOpen ? "translate-x-0" : "translate-x-full",
            className
        )}
    >
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white shadow-sm z-10">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Add Block</h3>
          <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest italic leading-none">New component to canvas</p>
        </div>
        <button 
          onClick={onClose} 
          className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all active:scale-95"
        >
            <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      
      <div className="p-6 grid grid-cols-2 gap-4 overflow-y-auto no-scrollbar">
        {defaultBlocks.map(block => (
          <div 
            key={block.id}
            onClick={() => onSelectBlock?.(block.id)}
            className="p-6 border border-slate-50 bg-slate-50/50 rounded-3xl flex flex-col items-center gap-4 hover:border-primary hover:bg-white cursor-pointer transition-all hover:shadow-2xl hover:shadow-primary/5 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <block.icon className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">{block.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddBlockDrawer;
