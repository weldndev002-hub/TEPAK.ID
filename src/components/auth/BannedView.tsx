import React from 'react';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import { 
    ShieldExclamationIcon, 
    EnvelopeIcon, 
    ArrowLeftOnRectangleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';

// Client-side supabase for realtime
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BannedView = () => {
    const [isChecking, setIsChecking] = React.useState(true);

    React.useEffect(() => {
        let channel: any;

        const setupListener = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Initial Check (in case they were unbanned recently)
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_banned')
                .eq('id', user.id)
                .single();
            
            if (profile && !profile.is_banned) {
                window.location.href = '/dashboard';
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
                        if (payload.new && payload.new.is_banned === false) {
                            window.location.href = '/dashboard';
                        }
                    }
                )
                .subscribe();
        };

        setupListener();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 ">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_#fff,_#f1f5f9)] -z-10"></div>
            
            <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <Card className="p-0 border-rose-100 shadow-[0_50px_100px_-20px_rgba(225,29,72,0.1)] overflow-hidden bg-white rounded-[3rem]">
                    {/* Urgency Stripe */}
                    <div className="h-2.5 bg-rose-500 w-full"></div>
                    
                    <div className="p-12 md:p-16 text-center">
                        {/* ICON */}
                        <div className="flex justify-center mb-10">
                            <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 border border-rose-100/50 shadow-inner group relative">
                                <ShieldExclamationIcon className="w-12 h-12 group-hover:scale-110 transition-transform duration-500" />
                                {isChecking && (
                                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                                        <ArrowPathIcon className="w-4 h-4 text-rose-400 animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>
 
                        {/* TEXT CONTENT */}
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase leading-none">Akses Dibatasi</h1>
                        <p className="text-rose-600 font-black uppercase tracking-[0.3em] text-[10px] bg-rose-50 px-6 py-2 rounded-full border border-rose-100/50 inline-block mb-12">
                            Tindakan Penegakan Akun
                        </p>
 
                        <div className="space-y-6 mb-12">
                            <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 text-left">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Status Penangguhan</h3>
                                <p className="text-slate-600 font-medium leading-relaxed tracking-tight">
                                    Akun Anda telah <span className="text-rose-600 font-black underline underline-offset-8 decoration-rose-200">Dinonaktifkan Secara Sementara</span>. Halaman ini akan terbuka otomatis segera setelah admin mencabut pembatasan Anda.
                                </p>
                            </div>
 
                            <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-dashed border-primary/20 flex flex-col items-center">
                                <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-6 opacity-60">Ingin Mengajukan Keberatan?</p>
                                <Button variant="primary" className="w-full h-16 bg-primary text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95">
                                    Hubungi Admin Tepak.ID
                                </Button>
                            </div>
                        </div>
 
                        {/* SECONDARY ACTIONS */}
                        <div className="flex flex-col gap-5">
                            <button className="text-[10px] font-black text-slate-400 hover:text-primary transition-all uppercase tracking-widest flex items-center justify-center gap-3 group">
                                <ArrowPathIcon className="w-4 h-4 animate-spin-slow" />
                                Menunggu Konfirmasi Admin...
                            </button>
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
                    <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">TEPAK.ID</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Global Enforcement Protection</span>
                </div>
            </div>
        </div>
    );
};

export default BannedView;
