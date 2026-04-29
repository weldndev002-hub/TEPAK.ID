import React from 'react';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import { 
    ShieldExclamationIcon, 
    EnvelopeIcon, 
    ArrowLeftOnRectangleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { getSupabaseBrowserClient } from '../../lib/supabase';

// Use shared browser client
const supabase = getSupabaseBrowserClient();

import { useBranding } from '../../hooks/useBranding';

export const BannedView = () => {
    const { branding } = useBranding();
    const siteName = 'Tepak.ID'; // Forced per user request
    const [isChecking, setIsChecking] = React.useState(true);
    const [isUnbanned, setIsUnbanned] = React.useState(false);


    React.useEffect(() => {
        let channel: any;
        let pollingInterval: any;

        const setupListener = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // If no user found, they might have been logged out or cookies cleared
                setIsChecking(false);
                return;
            }

            // 1. Initial Check (in case they were unbanned recently)
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_banned')
                .eq('id', user.id)
                .single();
            
            if (profile && !profile.is_banned) {
                setIsUnbanned(true);
                setIsChecking(false);
                return;
            }
            setIsChecking(false);

            // 2. Realtime Listener
            channel = supabase
                .channel('public:profiles:' + user.id)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log('[BannedView] Realtime update received:', payload);
                        if (payload.new && payload.new.is_banned === false) {
                            setIsUnbanned(true);
                        }
                    }
                )
                .subscribe();

            // 3. Polling Fallback (in case Realtime is disabled on the table)
            pollingInterval = setInterval(async () => {
                const { data: latestProfile } = await supabase
                    .from('profiles')
                    .select('is_banned')
                    .eq('id', user.id)
                    .single();
                
                if (latestProfile && !latestProfile.is_banned) {
                    console.log('[BannedView] Polling detected unban');
                    setIsUnbanned(true);
                }
            }, 5000);
        };

        setupListener();

        return () => {
            if (channel) supabase.removeChannel(channel);
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, []);

    // Automatic Redirect when unbanned
    React.useEffect(() => {
        console.log('[BannedView] isUnbanned state changed:', isUnbanned);
        if (isUnbanned) {
            console.log('[BannedView] Initiating automatic redirect in 3s...');
            const timer = setTimeout(() => {
                console.log('[BannedView] Redirecting to /dashboard now');
                window.location.replace('/dashboard');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isUnbanned]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const handleReLogin = () => {
        window.location.href = '/dashboard';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 ">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_#fff,_#f1f5f9)] -z-10"></div>
            
            <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <Card className={`p-0 border-rose-100 shadow-[0_50px_100px_-20px_rgba(225,29,72,0.1)] overflow-hidden bg-white rounded-[3rem] transition-all duration-700 ${isUnbanned ? 'border-emerald-100 shadow-emerald-100/20' : ''}`}>
                    {/* Urgency Stripe */}
                    <div className={`h-2.5 w-full transition-colors duration-700 ${isUnbanned ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    
                    <div className="p-12 md:p-16 text-center">
                        {/* ICON */}
                        <div className="flex justify-center mb-10">
                            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center border shadow-inner group relative transition-all duration-700 ${isUnbanned ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100/50'}`}>
                                {isUnbanned ? (
                                    <ShieldExclamationIcon className="w-12 h-12 rotate-180" />
                                ) : (
                                    <ShieldExclamationIcon className="w-12 h-12 group-hover:scale-110 transition-transform duration-500" />
                                )}
                                
                                {isChecking && (
                                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                                        <ArrowPathIcon className="w-4 h-4 text-rose-400 animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>
 
                        {/* TEXT CONTENT */}
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase leading-none">
                            {isUnbanned ? 'Akses Dipulihkan' : 'Akses Dibatasi'}
                        </h1>
                        
                        <p className={`font-black uppercase tracking-[0.3em] text-[10px] px-6 py-2 rounded-full border inline-block mb-12 transition-all duration-700 ${isUnbanned ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100/50'}`}>
                            {isUnbanned ? 'Status Akun: Aktif' : 'Tindakan Penegakan Akun'}
                        </p>
 
                        <div className="space-y-6 mb-12">
                            <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 text-left">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">
                                    {isUnbanned ? 'Informasi Terbaru' : 'Status Penangguhan'}
                                </h3>
                                <p className="text-slate-600 font-medium leading-relaxed tracking-tight">
                                    {isUnbanned ? (
                                        <>Kabar baik! Admin telah mencabut pembatasan pada akun Anda. <span className="text-emerald-600 font-black underline underline-offset-8 decoration-emerald-200">Sistem akan mengalihkan Anda</span> ke dashboard secara otomatis dalam 3 detik...</>
                                    ) : (
                                        <>Akun Anda telah <span className="text-rose-600 font-black underline underline-offset-8 decoration-rose-200">Dinonaktifkan Secara Sementara</span>. Halaman ini akan terbuka otomatis segera setelah admin mencabut pembatasan Anda.</>
                                    )}
                                </p>
                            </div>
 
                            <div className={`p-8 rounded-[2.5rem] border border-dashed flex flex-col items-center transition-all duration-700 ${isUnbanned ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-primary/5 border-primary/20'}`}>
                                <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-6 opacity-60">
                                    {isUnbanned ? 'Siap Beraksi Kembali?' : 'Ingin Mengajukan Keberatan?'}
                                </p>
                                
                                {isUnbanned ? (
                                    <Button 
                                        onClick={handleReLogin}
                                        variant="primary" 
                                        className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        Masuk ke Dashboard
                                    </Button>
                                ) : (
                                    <Button variant="primary" className="w-full h-16 bg-primary text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95">
                                        Hubungi Admin {siteName}
                                    </Button>
                                )}
                            </div>
                        </div>
 
                        {/* SECONDARY ACTIONS */}
                        <div className="flex flex-col gap-5">
                            {!isUnbanned ? (
                                <button className="text-[10px] font-black text-slate-400 hover:text-primary transition-all uppercase tracking-widest flex items-center justify-center gap-3 group">
                                    <ArrowPathIcon className="w-4 h-4 animate-spin-slow" />
                                    Menunggu Konfirmasi Admin...
                                </button>
                            ) : (
                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center justify-center gap-3 animate-bounce">
                                    <ArrowPathIcon className="w-4 h-4" />
                                    Pembatasan Telah Dicabut!
                                </div>
                            )}
                            
                            <button 
                                onClick={handleLogout}
                                className="text-[10px] font-black text-slate-300 hover:text-rose-600 transition-all uppercase tracking-widest flex items-center justify-center gap-3 group mt-4"
                            >
                                <ArrowLeftOnRectangleIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Keluar dari Akun
                            </button>
                        </div>
                    </div>
                </Card>
 
                {/* FOOTER */}
                <div className="mt-12 flex justify-between items-center px-8 opacity-30">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{siteName}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Global Enforcement Protection</span>
                </div>
            </div>
        </div>
    );
};

export default BannedView;
