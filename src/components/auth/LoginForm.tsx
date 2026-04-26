import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SocialButton from '../ui/SocialButton';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { getSupabaseBrowserClient } from '../../lib/supabase';

interface LoginFormProps {
    envUrl: string;
    envKey: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ envUrl, envKey }) => {
    // State-based client for better reactivity
    const [supabase, setSupabase] = useState<any>(null);

    // Pendekatan useEffect untuk Inisialisasi sesuai permintaan
    useEffect(() => {
        if (envUrl && envKey) {
            try {
                const client = getSupabaseBrowserClient(envUrl, envKey);
                setSupabase(client);
                if (!client) {
                    console.error('[LoginForm] getSupabaseBrowserClient returned null even with props');
                }
            } catch (err) {
                console.error('[LoginForm] Initialization Error:', err);
            }
        } else {
            console.warn('[LoginForm] Waiting for props or missing credentials', { 
                hasUrl: !!envUrl, 
                hasKey: !!envKey 
            });
        }
    }, [envUrl, envKey]);

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

        if (!supabase) {
            console.error('[LoginForm] FATAL: Supabase client not initialized');
            setEmailError('Kesalahan sistem: Koneksi ke database belum siap. Mohon muat ulang halaman.');
            return;
        }

        if (password.length < 6) {
            setPasswordError('Kata sandi minimal 6 karakter');
            return;
        }

        setIsLoading(true);

        try {
            console.log('[LoginForm] Auth attempt:', { email, hasPassword: !!password });
            
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error('[LoginForm] Auth Error:', {
                    message: error.message,
                    status: error.status,
                    code: (error as any).code
                });
                
                if (error.message.toLowerCase().includes('email')) {
                    setEmailError('Email tidak terdaftar atau salah');
                } else if (error.message.toLowerCase().includes('password') || error.message.toLowerCase().includes('invalid login credentials')) {
                    setPasswordError('Kata sandi salah atau kredensial tidak valid');
                } else {
                    setEmailError(error.message);
                }
            } else {
                console.log('[LoginForm] Auth success, fetching user...');
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                    console.log('[LoginForm] User:', user.email, user.id);
                    
                    try {
                        const { data: profile, error: profileError } = await supabase
                            .from('profiles')
                            .select('role, is_banned')
                            .eq('id', user.id)
                            .single();
                        
                        if (profileError) {
                            console.error('[LoginForm] Profile fetch error:', profileError);
                            throw profileError;
                        }

                        console.log('[LoginForm] Profile:', profile);
                        
                        if (profile?.is_banned) {
                            await supabase.auth.signOut();
                            setEmailError('Akun Anda telah dinonaktifkan. Silakan hubungi admin.');
                            setIsLoading(false);
                            return;
                        }

                        setIsSuccess(true);
                        let targetPath = profile?.role === 'admin' ? '/admin' : '/dashboard';
                        console.log('[LoginForm] Redirecting to:', targetPath);
                        setTimeout(() => {
                            window.location.href = targetPath;
                        }, 1500);
                    } catch (profileErr: any) {
                        console.error('[LoginForm] Profile check failed:', profileErr);
                        setEmailError(`Gagal mengambil data profil: ${profileErr.message}`);
                    }
                } else {
                    console.warn('[LoginForm] No user returned after successful auth');
                    setEmailError('Login berhasil tapi tidak bisa ambil data user');
                }
            }
        } catch (err: any) {
            console.error('[LoginForm] CATCH BLOCK ERROR:', {
                message: err.message,
                stack: err.stack,
                name: err.name,
                fullError: err,
                supabaseExists: !!supabase,
                envUrl: !!supabaseUrl,
                envKey: !!supabaseAnonKey
            });
            setEmailError(`Kesalahan sistem: ${err.message || 'Unknown error'}. Cek console untuk detail diagnostik.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-10">
            {isSuccess && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-sm">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Mengarahkan...</h3>
                    </div>
                </div>
            )}
            
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Alamat Email</label>
                    <Input 
                        iconLeft={EnvelopeIcon}
                        placeholder="email@contoh.com" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        hasError={!!emailError}
                        className="h-16 rounded-2xl border-slate-100 bg-slate-50/50"
                        required
                    />
                    {emailError && <p className="text-rose-500 text-[10px] font-black uppercase ml-1">{emailError}</p>}
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Kata Sandi</label>
                        <a className="text-[10px] font-black text-primary uppercase tracking-widest" href="/forgot-password">Lupa?</a>
                    </div>
                    <Input 
                        iconLeft={LockClosedIcon}
                        placeholder="••••••••" 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        hasError={!!passwordError}
                        className="h-16 rounded-2xl border-slate-100 bg-slate-50/50"
                        required
                        iconRight={
                            showPassword ? (
                                <EyeIcon onClick={() => setShowPassword(false)} className="w-6 h-6 cursor-pointer text-primary p-0.5" />
                            ) : (
                                <EyeSlashIcon onClick={() => setShowPassword(true)} className="w-6 h-6 cursor-pointer text-slate-300 p-0.5" />
                            )
                        }
                    />
                    {passwordError && <p className="text-rose-500 text-[10px] font-black uppercase ml-1">{passwordError}</p>}
                </div>

                <Button type="submit" variant="amber" isLoading={isLoading} className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-widest mt-4">
                    Masuk Sekarang
                </Button>
            </form>

            <div className="w-full flex items-center gap-8 opacity-40">
                <div className="h-px flex-1 bg-slate-200"></div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Opsi Lain</span>
                <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <SocialButton supabase={supabase} provider="google" />
                <SocialButton supabase={supabase} provider="apple" />
            </div>
        </div>
    );
};

export default LoginForm;
