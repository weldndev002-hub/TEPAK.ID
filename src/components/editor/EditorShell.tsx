import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import AddBlockDrawer from './AddBlockDrawer';
import DraggableBlock from './DraggableBlock';

export interface EditorShellProps {
  className?: string;
}

export const EditorShell: React.FC<EditorShellProps> = ({ className }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'mobile'>('mobile');

  return (
    <div className={cn("flex h-[600px] w-full border border-slate-200 rounded-2xl overflow-hidden bg-white relative", className)}>
      
      {/* Side Panel */}
      <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col z-0">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10">
          <h3 className="font-bold text-slate-900">Blocks</h3>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-amber-600 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
          </button>
        </div>
        
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <DraggableBlock icon="account_circle" title="Profile" />
          <DraggableBlock icon="link" title="Links" />
          <DraggableBlock icon="share" title="Sosmed" />
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 bg-slate-100 flex items-center justify-center relative overflow-hidden">
        
        {/* Device Switcher */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white p-2 rounded-full shadow-md z-10">
          <button 
            onClick={() => setActiveDevice('desktop')}
            className={cn(
                "px-6 py-1.5 rounded-full text-xs font-bold transition-all",
                activeDevice === 'desktop' ? "bg-primary text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:text-slate-900"
            )}
          >
            Desktop
          </button>
          <button 
            onClick={() => setActiveDevice('mobile')}
             className={cn(
                "px-6 py-1.5 rounded-full text-xs font-bold transition-all",
                activeDevice === 'mobile' ? "bg-primary text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:text-slate-900"
            )}
          >
            Mobile
          </button>
        </div>

        {/* Canvas Display Frame */}
        <div className={cn(
            "bg-white rounded-[40px] border-[8px] border-slate-900 shadow-2xl relative overflow-hidden transition-all duration-500",
            activeDevice === 'mobile' ? "w-72 h-[500px]" : "w-[90%] h-[90%] rounded-xl border-[4px]"
        )}>
          {/* Mobile Notch (Only visible on mobile) */}
          {activeDevice === 'mobile' && (
              <div className="absolute top-0 w-24 h-5 bg-slate-900 left-1/2 -translate-x-1/2 rounded-b-xl z-20"></div>
          )}
          
          {/* Mock Content inside iframe/div */}
          <div className="w-full h-full p-6 pt-10 flex flex-col items-center bg-slate-50 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-slate-200 mb-4 animate-pulse"></div>
            <div className="w-32 h-3 bg-slate-200 rounded-full mb-8 animate-pulse"></div>
            
            <div className="w-full max-w-sm h-12 bg-white border border-slate-100 rounded-xl mb-3 shadow-sm flex items-center px-4">
                 <div className="w-6 h-6 rounded bg-slate-100 mr-3"></div>
                 <div className="w-1/2 h-2 bg-slate-100 rounded-full"></div>
            </div>
            <div className="w-full max-w-sm h-12 bg-white border border-slate-100 rounded-xl mb-3 shadow-sm flex items-center px-4">
                 <div className="w-6 h-6 rounded bg-slate-100 mr-3"></div>
                 <div className="w-1/3 h-2 bg-slate-100 rounded-full"></div>
            </div>
          </div>
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
