import React from 'react';
import { cn } from '../../lib/utils';

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
      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
      active 
        ? "bg-blue-50 text-blue-700 font-semibold" 
        : "text-slate-600 hover:bg-slate-100"
    )}
  >
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </a>
);

interface LightSidebarProps {
  activePage?: 'dashboard' | 'editor' | 'products' | 'orders' | 'wallet' | 'customers' | 'academy' | 'settings';
}

export const LightSidebar: React.FC<LightSidebarProps> = ({ activePage = 'dashboard' }) => {
  return (
    <aside className="hidden md:flex flex-col sticky top-0 h-screen shrink-0 w-64 p-4 gap-2 bg-slate-50 border-r border-slate-200 font-sans antialiased">
      {/* BRANDING */}
      <div className="flex items-center gap-3 px-2 py-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-400 flex items-center justify-center text-white font-black text-lg">K</div>
        <div>
          <p className="text-lg font-black text-blue-600 tracking-tighter leading-none">KreatorIndo</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Pro Plan</p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
        <NavItem icon="dashboard" label="Dashboard" href="/dashboard" active={activePage === 'dashboard'} />
        <NavItem icon="web" label="Editor" href="/editor" active={activePage === 'editor'} />
        <NavItem icon="inventory_2" label="Products" href="/products" active={activePage === 'products'} />
        <NavItem icon="receipt_long" label="Orders" href="/orders" active={activePage === 'orders'} />
        <NavItem icon="group" label="Customers" href="/customers" active={activePage === 'customers'} />
        <NavItem icon="account_balance_wallet" label="Wallet" href="/wallet" active={activePage === 'wallet'} />
        <NavItem icon="video_library" label="Academy" href="/academy" active={activePage === 'academy'} />
        <NavItem icon="settings" label="Settings" href="/settings" active={activePage === 'settings'} />
      </nav>

      {/* BOTTOM ACTION */}
      <div className="mt-auto pt-4 border-t border-slate-200">
        <button className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl active:scale-95 transition-all shadow-lg shadow-orange-400/20">
          Build New Site
        </button>
      </div>
    </aside>
  );
};

export default LightSidebar;
