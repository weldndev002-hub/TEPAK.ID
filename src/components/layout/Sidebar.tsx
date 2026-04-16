import React from 'react';
import { cn } from '../../lib/utils';
import { 
    Squares2X2Icon, 
    UsersIcon, 
    CurrencyDollarIcon, 
    TicketIcon, 
    AcademicCapIcon, 
    Cog6ToothIcon,
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
      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 mx-2 my-0.5 ",
      active 
        ? "text-white font-bold bg-[#3B82F6] shadow-lg shadow-blue-500/20" 
        : "text-slate-400 hover:text-white hover:bg-white/5 font-medium"
    )}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm tracking-tight">{label}</span>
  </a>
);

interface SidebarProps {
  activePage?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage = 'dashboard' }) => {
  const [isAdminAuth, setIsAdminAuth] = React.useState(false);

  React.useEffect(() => {
    // Check for admin cookie client-side
    const cookies = document.cookie.split(';');
    const adminCookie = cookies.find(c => c.trim().startsWith('admin_access_token='));
    if (adminCookie) setIsAdminAuth(true);
  }, []);

  const handleLogout = async () => {
    if (isAdminAuth) {
      // Clear admin cookie
      document.cookie = "admin_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; sameSite=strict";
      window.location.replace('/admin/auth');
    } else {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('SignOut error:', e);
      }
      window.location.replace('/login');
    }
  };

  return (
    <aside className="hidden md:flex flex-col h-screen fixed left-0 top-0 z-50 w-64 bg-[#162138] text-white  antialiased overflow-hidden border-r border-white/5">
      <div className="p-7 mb-4 flex flex-col justify-center">
        <img src="/logo-dark.png" alt="Orbit Site" className="w-32 h-auto" />
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mt-3 ml-1">Admin Command Center</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto no-scrollbar">
        <NavItem href="/admin" icon={Squares2X2Icon} label="Dashboard" active={activePage === 'dashboard'} />
        <NavItem href="/admin/users" icon={UsersIcon} label="Users" active={activePage === 'users'} />
        <NavItem href="/admin/payouts" icon={CurrencyDollarIcon} label="Payouts" active={activePage === 'payouts'} />
        <NavItem href="/admin/plans" icon={TicketIcon} label="Plans" active={activePage === 'plans'} />
        <NavItem href="/admin/tutorials" icon={AcademicCapIcon} label="Tutorials" active={activePage === 'tutorials'} />
        <NavItem href="/admin/general-settings" icon={Cog6ToothIcon} label="Settings" active={activePage === 'settings'} />
      </nav>

      <div className="p-6 mt-auto flex flex-col gap-4">
        <div className={cn(
            "p-3 rounded-xl flex items-center gap-3 transition-all",
            isAdminAuth ? "bg-amber-500/10 border border-amber-500/20" : "bg-blue-600/20"
        )}>
            <div className={cn(
                "w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-black text-[10px]",
                isAdminAuth ? "bg-amber-500 text-white" : "bg-slate-600"
            )}>
                {isAdminAuth ? (
                    <span>MA</span>
                ) : (
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6yXzlkK9l1vGhNg8jieQYU1URZO7iB0E8eBY6apZr9DMuSPdDsLk8Wn8ZaLWFsNUhwscYUNR5v4QRbNkNqkxdD02jsVlcL1oa05ck_tuVlkw8sJ0lck1Zyy1SdpyEYTTQoq8pmJn5XIyVZXVokDkuc2ob8I7DE18EnXNZ-NMaso7yJM4Uy6zFRYe_KSj-8JufuNcMLVT4X45Ac_ONGP7G48AQxroItKCoSzxrDF3fXmnKzMU8Z5YH56xVFGRJh1nt7oeroYj2GYav" alt="Admin" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-white truncate">
                    {isAdminAuth ? 'Master Admin' : 'Administrator'}
                </p>
                <p className="text-[9px] text-blue-200 truncate pr-1">
                    {isAdminAuth ? 'Passcode Session' : 'admin@tepak.id'}
                </p>
            </div>
        </div>

        <button 
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/20 font-bold transition-all w-full text-left"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span className="text-sm">Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

