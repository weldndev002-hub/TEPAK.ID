import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import AddBlockDrawer from './AddBlockDrawer';
import DraggableBlock from './DraggableBlock';
import { PlusIcon } from '@heroicons/react/24/outline';

export interface EditorShellProps {
  className?: string;
}

export const EditorShell: React.FC<EditorShellProps> = ({ className }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'mobile'>('mobile');

  return (
    <div className={cn("flex h-[720px] w-full border border-slate-50 rounded-[2.5rem] overflow-hidden bg-white relative font-['Plus_Jakarta_Sans',sans-serif]", className)}>
      
      {/* Side Panel */}
      <aside className="w-96 bg-slate-50 border-r border-slate-100 flex flex-col z-0">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Blocks</h3>
            <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest italic leading-none">Your canvas elements</p>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <PlusIcon className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto flex-1 no-scrollbar">
          <DraggableBlock icon="UserIcon" title="Profile Identity" />
          <DraggableBlock icon="LinkIcon" title="Primary Links" />
          <DraggableBlock icon="ShareIcon" title="Social Cluster" />
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 bg-slate-100 flex items-center justify-center relative overflow-hidden p-12">
        
        {/* Device Switcher */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-3 bg-white/80 backdrop-blur-md p-2 rounded-[2rem] shadow-2xl z-10 border border-white/50">
          <button 
            onClick={() => setActiveDevice('desktop')}
            className={cn(
                "px-10 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                activeDevice === 'desktop' ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "text-slate-400 hover:text-slate-900"
            )}
          >
            Desktop
          </button>
          <button 
            onClick={() => setActiveDevice('mobile')}
             className={cn(
                "px-10 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all",
                activeDevice === 'mobile' ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "text-slate-400 hover:text-slate-900"
            )}
          >
            Mobile
          </button>
        </div>

        {/* Canvas Display Frame */}
        <div className={cn(
            "bg-white relative overflow-hidden transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)",
            activeDevice === 'mobile' 
                ? "w-[340px] h-[600px] rounded-[56px] border-[12px] border-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] shadow-slate-900/40" 
                : "w-full h-full rounded-[2.5rem] border-[8px] border-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)]"
        )}>
          {/* Mobile Notch (Only visible on mobile) */}
          {activeDevice === 'mobile' && (
              <div className="absolute top-0 w-36 h-7 bg-slate-900 left-1/2 -translate-x-1/2 rounded-b-[1.75rem] z-20 flex items-center justify-center">
                 <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
              </div>
          )}
          
          {/* Mock Content inside */}
          <div className="w-full h-full p-10 pt-16 flex flex-col items-center bg-white overflow-y-auto no-scrollbar">
            <div className="w-24 h-24 rounded-full bg-slate-100 mb-6 animate-pulse border-4 border-slate-50"></div>
            <div className="w-40 h-4 bg-slate-100 rounded-full mb-10 animate-pulse"></div>
            
            <div className="w-full max-w-sm h-16 bg-white border border-slate-50 rounded-2xl mb-4 shadow-sm flex items-center px-6 transition-all hover:scale-[1.02]">
                 <div className="w-8 h-8 rounded-lg bg-slate-50 mr-4"></div>
                 <div className="w-1/2 h-2.5 bg-slate-50 rounded-full"></div>
            </div>
            <div className="w-full max-w-sm h-16 bg-white border border-slate-50 rounded-2xl mb-4 shadow-sm flex items-center px-6 transition-all hover:scale-[1.02]">
                 <div className="w-8 h-8 rounded-lg bg-slate-50 mr-4"></div>
                 <div className="w-1/3 h-2.5 bg-slate-50 rounded-full"></div>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-900/10 rounded-full z-20"></div>
        </div>

      </main>

      {/* Floating Panel overlay */}
      <AddBlockDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

    </div>
  );
};

export default EditorShell;
