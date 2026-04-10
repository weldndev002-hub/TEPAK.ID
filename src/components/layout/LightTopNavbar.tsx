import React from 'react';
import { cn } from '../../lib/utils';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/outline';

export const LightTopNavbar: React.FC = () => {
  const [plan, setPlan] = React.useState('STANDARD');

  React.useEffect(() => {
    // Initial check
    const savedPlan = localStorage.getItem('user_plan');
    if (savedPlan) setPlan(savedPlan);

    // Listen for real-time updates
    const handlePlanUpdate = (e: any) => {
      setPlan(e.detail);
    };

    window.addEventListener('plan-updated', handlePlanUpdate);
    return () => window.removeEventListener('plan-updated', handlePlanUpdate);
  }, []);

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-3 md:px-6 h-16 w-full bg-white border-b border-slate-200 shadow-sm antialiased">
      <div className="flex items-center gap-1.5 md:gap-4">
        <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 gap-2 group transition-all focus-within:ring-2 focus-within:ring-primary/10">
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-64 outline-none text-slate-600 placeholder:text-slate-400 font-medium" 
            placeholder="Search assets, orders..." 
            type="text"
          />
        </div>
        {/* Placeholder for mobile logo or title if needed */}
        <div className="md:hidden">
           <span className="text-[10px] font-black text-primary tracking-tighter uppercase">TEPAK<span className="text-slate-900">.ID</span></span>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 md:gap-4">
        {/* Plan Badge */}
        <div className={cn(
          "px-2 md:px-3 py-1 rounded-full text-[7px] md:text-[10px] font-black uppercase tracking-widest border transition-all duration-300 shrink-0",
          plan === 'PRO' 
            ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(255,185,76,0.3)] animate-pulse" 
            : "bg-slate-100 text-slate-400 border-slate-200"
        )}>
          {plan} <span className="hidden sm:inline">Account</span>
        </div>

        <div className="flex items-center gap-0">
          <button className="text-slate-500 hover:text-primary hover:bg-slate-50 p-2 rounded-full transition-colors relative">
            <BellIcon className="w-5 h-5 mx-auto" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
          </button>
          <button className="text-slate-500 hover:text-primary hover:bg-slate-50 p-2 rounded-full transition-colors hidden sm:block">
            <QuestionMarkCircleIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center shrink-0">
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

