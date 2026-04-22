import React from 'react';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

export const Header: React.FC = () => {
  const [profile, setProfile] = React.useState<any>(null);
  const [plan, setPlan] = React.useState('STANDARD');

  React.useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
        
        const { data: settings } = await supabase.from('user_settings').select('plan_status').eq('user_id', user.id).single();
        if (settings?.plan_status) setPlan(settings.plan_status.toUpperCase());
      }
    };
    fetchProfile();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 md:h-20 bg-white/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-10 z-40 border-b border-slate-50 ">
      {/* SEARCH BAR */}
      <div className="flex items-center bg-slate-50/50 rounded-2xl px-3 md:px-5 py-2 md:py-2.5 flex-1 max-w-[200px] sm:max-w-[420px] group focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all border border-slate-100/50 focus-within:border-primary/20 shadow-sm">
        <MagnifyingGlassIcon className="w-4 h-4 md:w-5 md:h-5 text-slate-400 mr-2 md:mr-3 group-focus-within:text-primary transition-colors" />
        <input 
            className="bg-transparent border-none focus:ring-0 text-[10px] md:text-[11px] w-full p-0 font-bold placeholder:text-slate-300 uppercase tracking-tight" 
            placeholder="Search..." 
            type="text"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-10">
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
        <div className="flex items-center gap-2 md:gap-6">
          <button className="text-slate-400 hover:text-primary transition-all duration-300 bg-slate-50 p-2 md:p-2.5 rounded-xl border border-slate-100 hover:border-primary/20 hover:shadow-sm relative group overflow-hidden">
            <BellIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-1.5 md:top-2 right-1.5 md:right-2 w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-500 rounded-full border-2 border-white ring-2 ring-rose-500/10"></span>
          </button>
          
          <div className="flex items-center gap-2 md:gap-4 pl-1 md:pl-4 group cursor-pointer">
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-white p-0.5 border border-slate-100 shadow-sm group-hover:border-primary/30 group-hover:shadow-md transition-all duration-300 overflow-hidden flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img 
                      src={profile.avatar_url} 
                      alt="User" 
                      className="w-full h-full object-cover rounded-[0.7rem] md:rounded-[0.9rem]"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-[0.7rem] md:rounded-[0.9rem] text-slate-400 font-black text-xs">
                    {getInitials(profile?.full_name || profile?.username || 'User')}
                  </div>
                )}
            </div>
            <div className="hidden lg:flex flex-col items-start -space-y-0.5">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                  {profile?.full_name || profile?.username || 'User Profile'}
                </span>
                <span className="text-[9px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-widest mt-1">
                  {plan} PLAN
                </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

