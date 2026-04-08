import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 right-0 left-64 h-20 bg-white/80 backdrop-blur-xl flex justify-between items-center px-10 z-40 border-b border-slate-50">
      {/* SEARCH BAR */}
      <div className="flex items-center bg-slate-100/50 rounded-2xl px-5 py-2.5 w-[400px] group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 transition-all border border-transparent focus-within:border-blue-500/20">
        <span className="material-symbols-outlined text-slate-400 text-lg mr-3 group-focus-within:text-blue-500">search</span>
        <input 
            className="bg-transparent border-none focus:ring-0 text-xs w-full p-0 font-medium placeholder:text-slate-400" 
            placeholder="Search for tools, insights, or orders..." 
            type="text"
        />
      </div>

      <div className="flex items-center gap-8">
        {/* NAV LINKS */}
        <div className="flex gap-6 text-slate-400 text-[11px] font-black uppercase tracking-widest border-r border-slate-100 pr-8">
          <a className="hover:text-primary transition-colors" href="#">Support</a>
          <a className="hover:text-primary transition-colors" href="#">Documentation</a>
        </div>

        {/* ACTION ICONS */}
        <div className="flex items-center gap-5">
          <button className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors text-2xl relative">
            notifications
            <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-slate-100 p-0.5 border border-slate-200 group-hover:border-primary transition-colors overflow-hidden">
                <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXF2MpFB4nN_m8dR-SL77ffo6TlEu09VF5HWh973JYlkiA69LT6exvZJ9xA3remAFPkFHR0lgyGDXxtLoxzagn5Zy4CJCW7fwO-PhAUJaXkV7tizX8scPU8h_u6QbclqJUcQVD_FFj44PmCqsblGnlaAUv1bnK1uAoOGJ25nLCBM8aHyFmwHh_tQ4jb_8HskKVkTv2iS2V0PVS89QJ56mvJzrtch-g2Xv6dTb2Q8JDM6RD8R7PLiHxat6lPLIoSA6dkd0088Mr0BE_" 
                    alt="User" 
                    className="w-full h-full object-cover rounded-full"
                />
            </div>
            <div className="hidden lg:flex flex-col items-start -space-y-1">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Sinta Nusantara</span>
                <span className="text-[9px] font-bold text-slate-400">PRO PLAN</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
