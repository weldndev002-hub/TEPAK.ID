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
  UserIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

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
  const [username, setUsername] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('username').eq('id', user.id).single();
        if (data) setUsername(data.username);
      }
    };
    fetchUser();
  }, []);

  return (
    <>
      {/* Fixed sidebar — never scrolls with page content */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 z-40 h-screen shrink-0 w-64 p-4 gap-2 bg-slate-50 border-r border-slate-200 antialiased overflow-y-auto no-scrollbar">
        {/* BRANDING */}
        <div className="flex flex-col gap-4 px-3 py-6 mb-4">
          <img src="/logo-light.png" alt="Orbit Site" className="w-32 h-auto" />
          
          {/* VIEW SITE LINK */}
          <a 
            href={username ? `/u/${username}` : '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <WindowIcon className="w-4 h-4" />
            View My site
          </a>
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
        <div className="mt-auto pt-4 border-t border-slate-200">
          <button 
            type="button"
            onClick={async () => {
              console.log('Logout button clicked - Creator');
              try {
                const { error } = await supabase.auth.signOut();
                if (error) console.error('SignOut error:', error);
              } catch (e) {
                console.error('SignOut Exception:', e);
              }
              // Force redirect to login even if signOut fails
              window.location.replace('/login');
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 font-bold transition-all w-full group text-left"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 text-rose-400 group-hover:text-rose-600 transition-colors" />
            <span className="text-[13px] uppercase tracking-tight">Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Spacer: reserves the sidebar width in the flex row so content isn't hidden behind the fixed sidebar */}
      <div className="hidden md:block shrink-0 w-64" aria-hidden="true" />
    </>
  );
};

export default LightSidebar;

