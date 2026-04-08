import React from 'react';
import { cn } from '../../lib/utils';

export const LightTopNavbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-6 h-16 w-full bg-white border-b border-slate-200 shadow-sm font-sans antialiased">
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold text-blue-600">KreatorIndo</span>
        <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 gap-2 group transition-all focus-within:ring-2 focus-within:ring-blue-100">
          <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-64 outline-none text-slate-600 placeholder:text-slate-400" 
            placeholder="Search..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-slate-500 cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-colors">notifications</span>
          <span className="material-symbols-outlined text-slate-500 cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-colors">help_outline</span>
        </div>
        
        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 overflow-hidden shadow-sm flex items-center justify-center">
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
