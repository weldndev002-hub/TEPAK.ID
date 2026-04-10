import React from 'react';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 right-0 left-64 h-20 bg-white/80 backdrop-blur-xl flex justify-between items-center px-10 z-40 border-b border-slate-50 ">
      {/* SEARCH BAR */}
      <div className="flex items-center bg-slate-50/50 rounded-2xl px-5 py-2.5 w-[420px] group focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all border border-slate-100/50 focus-within:border-primary/20 shadow-sm">
        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 mr-3 group-focus-within:text-primary transition-colors" />
        <input 
            className="bg-transparent border-none focus:ring-0 text-[11px] w-full p-0 font-bold placeholder:text-slate-300 uppercase tracking-tight" 
            placeholder="Search for tools, insights, or orders..." 
            type="text"
        />
      </div>

      <div className="flex items-center gap-10">
        {/* NAV LINKS */}
        <div className="hidden xl:flex gap-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-r border-slate-50 pr-10">
          <a className="hover:text-primary transition-all duration-300 relative group" href="#">
            Support
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </a>
          <a className="hover:text-primary transition-all duration-300 relative group" href="#">
            Documentation
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </a>
        </div>

        {/* ACTION ICONS */}
        <div className="flex items-center gap-6">
          <button className="text-slate-400 hover:text-primary transition-all duration-300 bg-slate-50 p-2.5 rounded-xl border border-slate-100 hover:border-primary/20 hover:shadow-sm relative group overflow-hidden">
            <BellIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white ring-2 ring-rose-500/10"></span>
          </button>
          
          <div className="flex items-center gap-4 pl-4 group cursor-pointer">
            <div className="w-11 h-11 rounded-2xl bg-white p-0.5 border border-slate-100 shadow-sm group-hover:border-primary/30 group-hover:shadow-md transition-all duration-300 overflow-hidden">
                <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXF2MpFB4nN_m8dR-SL77ffo6TlEu09VF5HWh973JYlkiA69LT6exvZJ9xA3remAFPkFHR0lgyGDXxtLoxzagn5Zy4CJCW7fwO-PhAUJaXkV7tizX8scPU8h_u6QbclqJUcQVD_FFj44PmCqsblGnlaAUv1bnK1uAoOGJ25nLCBM8aHyFmwHh_tQ4jb_8HskKVkTv2iS2V0PVS89QJ56mvJzrtch-g2Xv6dTb2Q8JDM6RD8R7PLiHxat6lPLIoSA6dkd0088Mr0BE_" 
                    alt="User" 
                    className="w-full h-full object-cover rounded-[0.9rem]"
                />
            </div>
            <div className="hidden lg:flex flex-col items-start -space-y-0.5">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Sinta Nusantara</span>
                <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-widest mt-1">PRO PLAN</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
