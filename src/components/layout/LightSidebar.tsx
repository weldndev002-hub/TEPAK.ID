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
  Cog6ToothIcon,
  TicketIcon,
  ChartBarIcon,
  UserIcon
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
      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300  group",
      active 
        ? "bg-blue-50 text-[#005ab4] font-black shadow-sm" 
        : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900 font-bold"
    )}
  >
    <Icon className={cn("w-5 h-5 transition-transform duration-300", active ? "text-[#005ab4] scale-110" : "text-slate-400 group-hover:text-slate-600")} />
    <span className="text-[13px] uppercase tracking-tight">{label}</span>
  </a>
);

interface LightSidebarProps {
  activePage?: 'dashboard' | 'analytics' | 'editor' | 'products' | 'orders' | 'wallet' | 'customers' | 'academy' | 'settings' | 'plan-info' | 'profile';
}

export const LightSidebar: React.FC<LightSidebarProps> = ({ activePage = 'dashboard' }) => {
  return (
    <>
      {/* Fixed sidebar — never scrolls with page content */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 z-40 h-screen shrink-0 w-64 p-4 gap-2 bg-slate-50 border-r border-slate-200 antialiased overflow-y-auto no-scrollbar">
        {/* BRANDING */}
        <div className="flex items-center gap-3 px-3 py-6 mb-4">
          <img src="/logo-light.png" alt="Orbit Site" className="w-32 h-auto" />
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-1">
          <NavItem icon={Squares2X2Icon} label="Dashboard" href="/dashboard" active={activePage === 'dashboard'} />
          <NavItem icon={ChartBarIcon} label="Analytics" href="/analytics" active={activePage === 'analytics'} />
          <NavItem icon={WindowIcon} label="Editor" href="/editor" active={activePage === 'editor'} />
          <NavItem icon={ArchiveBoxIcon} label="Products" href="/products" active={activePage === 'products'} />
          <NavItem icon={DocumentTextIcon} label="Orders" href="/orders" active={activePage === 'orders'} />
          <NavItem icon={UsersIcon} label="Customers" href="/customers" active={activePage === 'customers'} />
          <NavItem icon={WalletIcon} label="Wallet" href="/wallet" active={activePage === 'wallet'} />
          <NavItem icon={AcademicCapIcon} label="Academy" href="/academy" active={activePage === 'academy'} />
          <NavItem icon={UserIcon} label="Profile" href="/settings" active={activePage === 'profile'} />
          <NavItem icon={Cog6ToothIcon} label="Settings" href="/account-management" active={activePage === 'settings'} />
          <NavItem icon={TicketIcon} label="Informasi Paket" href="/plan-info" active={activePage === 'plan-info'} />
        </nav>

        {/* BOTTOM ACTION */}
        <div className="mt-auto pt-4 border-t border-slate-200 opacity-0 pointer-events-none">
          {/* Placeholder if needed later */}
        </div>
      </aside>

      {/* Spacer: reserves the sidebar width in the flex row so content isn't hidden behind the fixed sidebar */}
      <div className="hidden md:block shrink-0 w-64" aria-hidden="true" />
    </>
  );
};

export default LightSidebar;

