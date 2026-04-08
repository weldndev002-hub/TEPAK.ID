import React from 'react';
import { cn } from '../../lib/utils';
import { 
  Squares2X2Icon, 
  WindowIcon, 
  ArchiveBoxIcon, 
  DocumentTextIcon, 
  UsersIcon, 
  WalletIcon, 
  AcademicCapIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  href?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, href = "#" }) => (
  <a 
    href={href}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-['Plus_Jakarta_Sans',sans-serif]",
      active 
        ? "bg-blue-50 text-blue-700 font-bold" 
        : "text-slate-600 hover:bg-slate-100 font-medium"
    )}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm">{label}</span>
  </a>
);

interface LightSidebarProps {
  activePage?: 'dashboard' | 'editor' | 'products' | 'orders' | 'wallet' | 'customers' | 'academy' | 'settings';
}

export const LightSidebar: React.FC<LightSidebarProps> = ({ activePage = 'dashboard' }) => {
  return (
    <aside className="hidden md:flex flex-col sticky top-0 h-screen shrink-0 w-64 p-4 gap-2 bg-slate-50 border-r border-slate-200 font-['Plus_Jakarta_Sans',sans-serif] antialiased">
      {/* BRANDING */}
      <div className="flex items-center gap-3 px-2 py-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-lg">T</div>
        <div>
          <p className="text-lg font-black text-primary tracking-tighter leading-none">tepak.id</p>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Creator Hub</p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
        <NavItem icon={Squares2X2Icon} label="Dashboard" href="/dashboard" active={activePage === 'dashboard'} />
        <NavItem icon={WindowIcon} label="Editor" href="/editor" active={activePage === 'editor'} />
        <NavItem icon={ArchiveBoxIcon} label="Products" href="/products" active={activePage === 'products'} />
        <NavItem icon={DocumentTextIcon} label="Orders" href="/orders" active={activePage === 'orders'} />
        <NavItem icon={UsersIcon} label="Customers" href="/customers" active={activePage === 'customers'} />
        <NavItem icon={WalletIcon} label="Wallet" href="/wallet" active={activePage === 'wallet'} />
        <NavItem icon={AcademicCapIcon} label="Academy" href="/academy" active={activePage === 'academy'} />
        <NavItem icon={Cog6ToothIcon} label="Settings" href="/settings" active={activePage === 'settings'} />
      </nav>

      {/* BOTTOM ACTION */}
      <div className="mt-auto pt-4 border-t border-slate-200">
        <button className="w-full bg-[#0873df] hover:bg-[#005ab4] text-white font-bold py-2.5 rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-500/10 text-sm">
          Build New Site
        </button>
      </div>
    </aside>
  );
};

export default LightSidebar;

