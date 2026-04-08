import React from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  href?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, href = "#" }) => (
  <a 
    href={href}
    className={cn(
      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 mx-2 my-0.5",
      active 
        ? "text-white font-bold bg-[#3B82F6] shadow-lg shadow-blue-500/20" 
        : "text-slate-400 hover:text-white hover:bg-white/5"
    )}
  >
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
    <span className="text-sm font-medium tracking-tight">{label}</span>
  </a>
);

interface SidebarProps {
  activePage?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage = 'dashboard' }) => {
  return (
    <aside className="flex flex-col h-screen fixed left-0 top-0 z-50 w-64 bg-[#162138] text-white font-sans antialiased overflow-hidden border-r border-white/5">
      <div className="p-7 mb-6 flex flex-col justify-center">
        <h1 className="text-2xl font-black text-white tracking-tighter">tepak.id</h1>
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Admin Command Center</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto no-scrollbar">
        <NavItem href="/admin" icon="dashboard" label="Dashboard" active={activePage === 'dashboard'} />
        <NavItem href="/admin/users" icon="group" label="Users" active={activePage === 'users'} />
        <NavItem href="/admin/payouts" icon="payments" label="Payouts" active={activePage === 'payouts'} />
        <NavItem href="/admin/plans" icon="subscriptions" label="Plans" active={activePage === 'plans'} />
        <NavItem href="/admin/tutorials" icon="school" label="Tutorials" active={activePage === 'tutorials'} />
        <NavItem href="/admin/general-settings" icon="settings" label="Settings" active={activePage === 'settings'} />
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-blue-600/20 p-3 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-600 flex-shrink-0">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6yXzlkK9l1vGhNg8jieQYU1URZO7iB0E8eBY6apZr9DMuSPdDsLk8Wn8ZaLWFsNUhwscYUNR5v4QRbNkNqkxdD02jsVlcL1oa05ck_tuVlkw8sJ0lck1Zyy1SdpyEYTTQoq8pmJn5XIyVZXVokDkuc2ob8I7DE18EnXNZ-NMaso7yJM4Uy6zFRYe_KSj-8JufuNcMLVT4X45Ac_ONGP7G48AQxroItKCoSzxrDF3fXmnKzMU8Z5YH56xVFGRJh1nt7oeroYj2GYav" alt="Admin" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white truncate">Administrator</p>
                <p className="text-[9px] text-blue-200 truncate pr-1">admin@tepak.id</p>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
