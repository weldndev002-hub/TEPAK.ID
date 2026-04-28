import React, { useState, useEffect } from 'react';
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
  ArrowLeftOnRectangleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { useBranding } from '../../hooks/useBranding.tsx';
import { useSubscription, SubscriptionProvider } from '../../context/SubscriptionContext';

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
        ? "bg-primary/5 text-primary font-black shadow-sm" 
        : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900 font-bold"
    )}
  >
    <Icon className={cn("w-5 h-5 transition-transform duration-300", active ? "text-primary scale-110" : "text-slate-400 group-hover:text-slate-600")} />
    <span className="text-[13px] uppercase tracking-tight">{label}</span>
  </a>
);

interface LightSidebarProps {
  activePage?: 'dashboard' | 'analytics' | 'editor' | 'products' | 'orders' | 'wallet' | 'customers' | 'academy' | 'settings' | 'plan-info' | 'profile';
}

export const LightSidebar: React.FC<LightSidebarProps> = (props) => {
  return (
    <SubscriptionProvider>
      <LightSidebarContent {...props} />
    </SubscriptionProvider>
  );
};

const LightSidebarContent: React.FC<LightSidebarProps> = ({ activePage = 'dashboard' }) => {
  const [username, setUsername] = useState<string | null>(null);
  const { branding } = useBranding();
  const { plan, isLoading: subLoading, hasFeature } = useSubscription();
  const isPaid = plan !== 'free' && !!plan;
  const showAnalytics = hasFeature('Analytics');
  const showCustomers = hasFeature('Customer Management');

  useEffect(() => {
    const fetchUser = async () => {
      if (!supabase) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('profiles').select('username').eq('id', user.id).single();
          if (data) setUsername(data.username);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, []);

  const supportWA = branding?.whatsapp_number?.replace(/[^0-9]/g, '') || '628';

  return (
    <>
      <aside 
        style={{ top: 'var(--banner-height, 0px)' }}
        className="hidden md:flex flex-col fixed left-0 z-40 h-screen shrink-0 w-64 p-4 gap-2 bg-slate-50 border-r border-slate-200 antialiased overflow-y-auto no-scrollbar transition-all duration-300"
      >
        <nav className="flex-1 space-y-1 pt-16 md:pt-20">
          <NavItem icon={Squares2X2Icon} label="Dashboard" href="/dashboard" active={activePage === 'dashboard'} />
          
          {showAnalytics && (
            <NavItem icon={ChartBarIcon} label="Analytics" href="/analytics" active={activePage === 'analytics'} />
          )}
          {showCustomers && (
            <NavItem icon={UsersIcon} label="Customers" href="/customers" active={activePage === 'customers'} />
          )}

          <NavItem icon={WindowIcon} label="Editor" href="/editor" active={activePage === 'editor'} />
          
          {isPaid && (
            <>
              <NavItem icon={ArchiveBoxIcon} label="Products" href="/products" active={activePage === 'products'} />
              <NavItem icon={DocumentTextIcon} label="Orders" href="/orders" active={activePage === 'orders'} />
              <NavItem icon={WalletIcon} label="Wallet" href="/wallet" active={activePage === 'wallet'} />
            </>
          )}

          <NavItem icon={AcademicCapIcon} label="Academy" href="/academy" active={activePage === 'academy'} />
          <NavItem icon={UserIcon} label="Profile" href="/settings" active={activePage === 'profile'} />
          <NavItem icon={Cog6ToothIcon} label="Settings" href="/account-management" active={activePage === 'settings'} />
          <NavItem icon={TicketIcon} label="Informasi Paket" href="/plan-info" active={activePage === 'plan-info'} />
          
          <div className="pt-4 mt-4 border-t border-slate-100 italic opacity-60">
            <NavItem icon={ChatBubbleLeftRightIcon} label="Bantuan" href={`https://wa.me/${supportWA}`} />
          </div>
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-200">
          <button 
            type="button"
            onClick={async () => {
              if (supabase) {
                try {
                  await supabase.auth.signOut();
                } catch (e) {
                  console.error('SignOut Exception:', e);
                }
              }
              window.location.replace('/login');
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 font-bold transition-all w-full group text-left"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 text-rose-400 group-hover:text-rose-600 transition-colors" />
            <span className="text-[13px] uppercase tracking-tight">Keluar Akun</span>
          </button>
        </div>
      </aside>

      <div className="hidden md:block shrink-0 w-64" aria-hidden="true" />
    </>
  );
};

export default LightSidebar;

