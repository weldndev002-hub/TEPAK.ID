import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SocialButton from '../ui/SocialButton';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { supabase as globalSupabase } from '../../lib/supabase';
import { createBrowserClient } from '@supabase/ssr';

interface LoginFormProps {
    supabaseUrl?: string;
    supabaseAnonKey?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ supabaseUrl, supabaseAnonKey }) => {
    // Initialized client: use passed props if available, otherwise fallback to global client
    const [supabase] = useState(() => {
        if (supabaseUrl && supabaseAnonKey) {
            return createBrowserClient(supabaseUrl, supabaseAnonKey);
        }
        return globalSupabase;
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError('');
        setPasswordError('');

        // 1. Basic Validation
        if (password.length < 6) {
            setPasswordError('Kata sandi minimal 6 karakter');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.toLowerCase().includes('email')) {
                    setEmailError('Email tidak terdaftar atau salah');
                } else if (error.message.toLowerCase().includes('password') || error.message.toLowerCase().includes('invalid login credentials')) {
                    setPasswordError('Kata sandi salah atau kredensial tidak valid');
                } else {
                    setEmailError(error.message);
                }
            } else {
                // Berhasil login secara teknis di Supabase
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                    // Check if banned
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role, is_banned')
                        .eq('id', user.id)
                        .single();
                    
                    if (profile?.is_banned) {
                        await supabase.auth.signOut();
                        setEmailError('Akun Anda telah dinonaktifkan (Banned). Silakan hubungi admin untuk bantuan.');
                        setIsLoading(false);
                        return;
                    }

                    // Proceed if not banned
                    setIsSuccess(true);
                    let targetPath = '/dashboard';
                    if (profile?.role === 'admin') {
                        targetPath = '/admin';
                    }

                    // Delay sejenak untuk menampilkan animasi sukses
                    setTimeout(() => {
                        window.location.href = targetPath;
                    }, 2000);
                }
            }
        } catch (err: any) {
            setEmailError('Terjadi kesalahan pada sistem. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-10 ">
            {/* Success Transition Overlay - Simplified */}
            {isSuccess && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] border border-slate-50 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                        <div className="text-center space-y-2">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">Loading...</h3>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Inputs Container */}
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-8">
                
                {/* Email Input */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                        Alamat Email
                    </label>
                    <Input 
                        iconLeft={EnvelopeIcon}
                        placeholder="test@gmail.com" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        hasError={!!emailError}
                        className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 shadow-inner"
                        required
                    />
                    {emailError && (
                        <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-2 animate-in fade-in slide-in-from-top-1">
                            {emailError}
                        </p>
                    )}
                </div>

                {/* Password Input */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            Kata Sandi
                        </label>
                        <a className="text-[10px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest" href="/forgot-password">
                            Lupa sandi?
                        </a>
                    </div>
                    <Input 
                        iconLeft={LockClosedIcon}
                        placeholder="••••••••" 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        hasError={!!passwordError}
                        className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 shadow-inner tracking-widest font-sans"
                        required
                        iconRight={
                            showPassword ? (
                                <EyeIcon 
                                    onClick={() => setShowPassword(false)}
                                    className="w-6 h-6 cursor-pointer text-primary p-0.5"
                                />
                            ) : (
                                <EyeSlashIcon 
                                    onClick={() => setShowPassword(true)}
                                    className="w-6 h-6 cursor-pointer text-slate-300 hover:text-slate-500 p-0.5"
                                />
                            )
                        }
                    />
                    {passwordError && (
                        <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-2 animate-in fade-in slide-in-from-top-1">
                            {passwordError}
                        </p>
                    )}
                </div>

                {/* Main Button */}
                <Button 
                    type="submit" 
                    variant="amber" 
                    isLoading={isLoading}
                    className="w-full h-16 mt-6 rounded-[1.5rem] shadow-2xl shadow-amber-500/20 text-[11px] font-black uppercase tracking-[0.3em] active:scale-[0.98] transition-all"
                >
                    Masuk ke Akun
                </Button>
            </form>

            {/* Divider */}
            <div className="w-full flex items-center gap-8 opacity-40">
                <div className="h-px flex-1 bg-slate-200"></div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] whitespace-nowrap">
                    Masuk Dengan
                </span>
                <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-6">
                <SocialButton 
                    supabase={supabase}
                    provider="google" 
                    className="h-16 rounded-2xl border-slate-100 bg-white shadow-sm hover:shadow-md transition-all active:scale-[0.98]" 
                />
                <SocialButton 
                    supabase={supabase}
                    provider="apple" 
                    className="h-16 rounded-2xl border-slate-100 bg-white shadow-sm hover:shadow-md transition-all active:scale-[0.98]" 
                />
            </div>
            
        </div>
    );
};

export default LoginForm;
