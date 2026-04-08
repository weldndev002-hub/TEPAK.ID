import React from 'react';
import { cn } from '../../lib/utils';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/outline';

export const LightTopNavbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-6 h-16 w-full bg-white border-b border-slate-200 shadow-sm font-['Plus_Jakarta_Sans',sans-serif] antialiased">
      <div className="flex items-center gap-4">
        <img src="/logo-light.png" alt="Orbit Site" className="w-28 h-auto" />
        <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 gap-2 group transition-all focus-within:ring-2 focus-within:ring-primary/10">
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-64 outline-none text-slate-600 placeholder:text-slate-400 font-medium" 
            placeholder="Search assets, orders..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button className="text-slate-500 hover:text-primary hover:bg-slate-50 p-2 rounded-full transition-colors relative">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <button className="text-slate-500 hover:text-primary hover:bg-slate-50 p-2 rounded-full transition-colors">
            <QuestionMarkCircleIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center">
          <img 
            alt="User profile" 
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrJAzBTk_qx0_IVmpXnxETk5ALunsc_oCaW-5JmWre8Qhwn0DZ4MWjx2mLpKfVdMRJeGSuA21xnFwEVizeSuO0mkzlmd60ij7lFT_E-HroEYrBaAsfgQhsv8QgJHWzoK62RwmtNFXSVJiFG8B9ShLUhzNG2qbzVz5HIyu_JBxU1DLKpvwks0AJxIwPI8P6tDSKkiEEZnpPfkQfLluDpCFgCRWUu1L1XlfPs309xfb1m2-veyVAY5e8S1vOS4Ga5VnNJ7CPMsQpTEQc" 
          />
        </div>
      </div>
    </nav>
  );
};

export default LightTopNavbar;

