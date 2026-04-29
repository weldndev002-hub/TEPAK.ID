import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import { ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';

/**
 * IdleTimeoutGuard — monitors user activity and auto-logs out after 3 hours idle.
 * Shows a warning dialog 5 minutes before logout with countdown.
 * Only activates when user is authenticated.
 */
export const IdleTimeoutGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { showWarning, remainingSeconds, extendSession, logout } = useIdleTimeout();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is authenticated
        supabase.auth.getSession().then(({ data: { session } }: any) => {
            setIsAuthenticated(!!session);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setIsAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Don't render anything if user is not authenticated
    if (!isAuthenticated) return <>{children}</>;

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return (
        <>
            {children}

            {/* Inactivity Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="bg-amber-500 px-8 py-6 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Peringatan Sesi</p>
                                    <h2 className="text-xl font-black tracking-tight">Sesi Akan Berakhir</h2>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                                    <ClockIcon className="w-10 h-10 text-amber-500" />
                                </div>

                                <p className="text-slate-600 font-medium">
                                    Anda tidak melakukan aktivitas selama <span className="font-black text-slate-900">hampir 3 jam</span>.
                                </p>

                                <p className="text-slate-500 text-sm">
                                    Sesi Anda akan berakhir otomatis dalam:
                                </p>

                                {/* Countdown Display */}
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <p className="text-4xl font-black font-mono text-slate-900 tracking-wider">
                                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                    </p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">menit : detik</p>
                                </div>

                                <p className="text-slate-400 text-xs">
                                    Klik "Tetap Masuk" untuk memperpanjang sesi Anda, atau Anda akan logout otomatis.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={extendSession}
                                    className="w-full py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                                >
                                    Tetap Masuk
                                </button>
                                <button
                                    onClick={logout}
                                    className="w-full py-3 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                                >
                                    Logout Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
