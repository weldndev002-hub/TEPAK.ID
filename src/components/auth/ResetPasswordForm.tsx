import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import {
    CheckCircleIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
    ArrowLeftIcon,
    EyeIcon,
    EyeSlashIcon,
    XCircleIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid, XCircleIcon as XCircleIconSolid } from '@heroicons/react/24/solid';
import { supabase as globalSupabase } from '../../lib/supabase';
import { createBrowserClient } from '@supabase/ssr';
import { cn } from '../../lib/utils';
import { useBranding } from '../../hooks/useBranding';

interface ResetPasswordFormProps {
    supabaseUrl?: string;
    supabaseAnonKey?: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ supabaseUrl, supabaseAnonKey }) => {
    // Initialize client WITH cookie handlers (required for PKCE flow)
    const [supabase] = useState(() => {
        if (supabaseUrl && supabaseAnonKey) {
            return createBrowserClient(supabaseUrl, supabaseAnonKey, {
                cookies: {
                    getAll() {
                        return document.cookie.split('; ').filter(Boolean).map(cookie => {
                            const [name, ...valueParts] = cookie.split('=');
                            return { name, value: valueParts.join('=') };
                        });
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            let cookieString = `${name}=${value}`;
                            if (options?.path) cookieString += `; path=${options.path}`;
                            if (options?.maxAge !== undefined) cookieString += `; max-age=${options.maxAge}`;
                            if (options?.domain) cookieString += `; domain=${options.domain}`;
                            if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`;
                            if (options?.secure && window.location.protocol === 'https:') cookieString += '; secure';
                            document.cookie = cookieString;
                        });
                    },
                },
            });
        }
        return globalSupabase;
    });

    const { branding } = useBranding();
    const siteName = branding?.site_name || 'Orbit Site';

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // ===== PKCE Session Exchange =====
    // When Supabase sends a password reset email with PKCE flow,
    // the link contains ?code=XXXX in the URL. We must exchange
    // this code for a session BEFORE calling updateUser().
    const [sessionReady, setSessionReady] = useState(false);
    const [sessionLoading, setSessionLoading] = useState(true);
    const [sessionError, setSessionError] = useState('');

    useEffect(() => {
        const establishSession = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const code = urlParams.get('code');
                const type = urlParams.get('type') || hashParams.get('type');

                console.log('[ResetPassword] URL analysis:', {
                    hasCode: !!code,
                    type,
                    search: window.location.search,
                    hash: window.location.hash,
                });

                // PKCE flow: exchange code for session
                if (code) {
                    console.log('[ResetPassword] Exchanging PKCE code for session...');
                    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

                    if (exchangeError) {
                        console.error('[ResetPassword] Code exchange failed:', exchangeError.message);
                        setSessionError('Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link baru.');
                        setSessionLoading(false);
                        return;
                    }

                    if (data?.session) {
                        console.log('[ResetPassword] Session established successfully for:', data.session.user?.email);
                        setSessionReady(true);
                        setSessionLoading(false);
                        // Clean URL to remove the code parameter for security
                        window.history.replaceState({}, document.title, window.location.pathname);
                        return;
                    }

                    console.error('[ResetPassword] No session after code exchange');
                    setSessionError('Gagal membuat sesi. Silakan coba lagi.');
                    setSessionLoading(false);
                    return;
                }

                // Implicit flow: tokens in URL hash (fallback for non-PKCE setups)
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                if (accessToken && type === 'recovery') {
                    console.log('[ResetPassword] Found recovery tokens in URL hash');
                    // The createBrowserClient with @supabase/ssr should auto-process
                    // the hash on initialization. Let's check if we have a session.
                    const { data: sessionData } = await supabase.auth.getSession();
                    if (sessionData?.session) {
                        console.log('[ResetPassword] Session found after hash processing');
                        setSessionReady(true);
                        setSessionLoading(false);
                        // Clean URL hash for security
                        window.history.replaceState({}, document.title, window.location.pathname);
                        return;
                    }
                }

                // No code or hash tokens — check if there's already an active session
                // (e.g., user navigated here while already logged in, or session was
                // established by middleware)
                const { data: existingSession } = await supabase.auth.getSession();
                if (existingSession?.session) {
                    console.log('[ResetPassword] Existing session found');
                    setSessionReady(true);
                    setSessionLoading(false);
                    return;
                }

                // No session at all — invalid access
                console.error('[ResetPassword] No code, no hash tokens, no existing session');
                setSessionError('Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link baru dari halaman lupa password.');
                setSessionLoading(false);
            } catch (err) {
                console.error('[ResetPassword] Session establishment error:', err);
                setSessionError('Terjadi kesalahan saat verifikasi link reset. Silakan coba lagi.');
                setSessionLoading(false);
            }
        };

        establishSession();
    }, [supabase]);

    // Password Strength Logic
    const criteria = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };

    const strengthScore = Object.values(criteria).filter(Boolean).length;

    const getStrengthLabel = () => {
        if (password.length === 0) return { label: 'Kosong', color: 'text-slate-400', bg: 'bg-slate-50' };
        if (strengthScore <= 1) return { label: 'Sangat Lemah', color: 'text-rose-600', bg: 'bg-rose-50' };
        if (strengthScore === 2) return { label: 'Lemah', color: 'text-orange-600', bg: 'bg-orange-50' };
        if (strengthScore === 3) return { label: 'Sedang', color: 'text-amber-600', bg: 'bg-amber-50' };
        if (strengthScore === 4) return { label: 'Kuat', color: 'text-emerald-600', bg: 'bg-emerald-50' };
        return { label: 'Kosong', color: 'text-slate-400', bg: 'bg-slate-50' };
    };

    const { label, color, bg } = getStrengthLabel();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!sessionReady) {
            setError('Sesi belum terverifikasi. Tunggu hingga verifikasi selesai.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Konfirmasi password tidak cocok');
            return;
        }

        if (password.length < 8) {
            setError('Password minimal 8 karakter');
            return;
        }

        setIsLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                setError(updateError.message);
            } else {
                // Logout agar user harus login manual sesuai permintaan
                await supabase.auth.signOut();
                setIsSuccess(true);
            }
        } catch (err: any) {
            setError('Terjadi kesalahan sistem. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    // ===== Loading State: Session being established =====
    if (sessionLoading) {
        return (
            <main className="w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden flex flex-col items-center px-12 py-16 relative z-10">
                <div className="mb-10 relative flex items-center justify-center">
                    <div className="w-[140px] h-[140px] bg-blue-50 rounded-full flex items-center justify-center border border-blue-100/50">
                        <ArrowPathIcon className="text-blue-500 w-16 h-16 animate-spin" style={{ animationDuration: '2000ms' }} />
                    </div>
                </div>
                <h1 className="text-2xl font-black text-slate-900 text-center mb-4 tracking-tighter uppercase leading-none">
                    Memverifikasi Link...
                </h1>
                <p className="text-[13px] text-slate-500 font-medium text-center leading-relaxed max-w-[320px] italic">
                    Sedang memverifikasi link reset password Anda. Mohon tunggu sebentar.
                </p>
            </main>
        );
    }

    // ===== Error State: Session failed =====
    if (sessionError) {
        return (
            <>
                <main className="w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden flex flex-col items-center px-12 py-16 relative z-10">
                    <div className="mb-10 relative flex items-center justify-center">
                        <div className="w-[140px] h-[140px] bg-rose-50 rounded-full flex items-center justify-center border border-rose-100/50">
                            <XCircleIcon className="text-rose-500 w-20 h-20" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 text-center mb-4 tracking-tighter uppercase leading-none">
                        Link Tidak Valid
                    </h1>
                    <p className="text-[13px] text-slate-500 font-medium text-center leading-relaxed max-w-[320px] mb-10 italic">
                        {sessionError}
                    </p>
                    <div className="w-full flex flex-col items-center gap-6">
                        <a href="/forgot-password" className="w-full">
                            <Button variant="primary" className="w-full h-16 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all">
                                Minta Link Baru
                            </Button>
                        </a>
                        <a className="text-[10px] font-black text-slate-400 hover:text-primary transition-all uppercase tracking-widest border-b border-transparent hover:border-primary pb-1" href="/login">
                            Kembali ke halaman login
                        </a>
                    </div>
                    <div className="mt-16 flex items-center gap-3 opacity-30 group">
                        <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                            <ShieldCheckIcon className="text-slate-900 w-5 h-5 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-[10px] font-black tracking-[0.4em] text-slate-900 uppercase">{siteName}</span>
                    </div>
                </main>
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-50 rounded-full blur-[120px] opacity-60"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
                </div>
            </>
        );
    }

    // ===== Success State =====
    if (isSuccess) {
        return (
            <>
                <main className="w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden flex flex-col items-center px-12 py-16 relative z-10 ">
                    {/* Illustration Section */}
                    <div className="mb-10 relative flex items-center justify-center">
                        <div className="w-[140px] h-[140px] bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100/50">
                            <CheckCircleIconSolid className="text-emerald-500 w-24 h-24" />
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 w-6 h-6 bg-emerald-500 opacity-20 rounded-full animate-pulse"></div>
                        <div className="absolute -bottom-6 -left-6 w-10 h-10 bg-emerald-500 opacity-10 rounded-full animate-bounce duration-[2000ms]"></div>
                    </div>

                    {/* Heading Section */}
                    <h1 className="text-2xl font-black text-slate-900 text-center mb-4 tracking-tighter uppercase leading-none">
                        Password Berhasil Diubah!
                    </h1>

                    {/* Body Text Section */}
                    <p className="text-[13px] text-slate-500 font-medium text-center leading-relaxed max-w-[320px] mb-12 italic">
                        Password akun kamu sudah diperbarui. <span className="text-slate-900 font-bold">Silakan login dengan password baru.</span>
                    </p>

                    {/* Call to Action */}
                    <div className="w-full flex flex-col items-center gap-6">
                        <a href="/login" className="w-full">
                            <Button variant="primary" className="w-full h-16 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all">
                                Masuk Sekarang
                            </Button>
                        </a>

                        {/* Secondary Link */}
                        <a className="text-[10px] font-black text-slate-400 hover:text-primary transition-all uppercase tracking-widest border-b border-transparent hover:border-primary pb-1" href="/">
                            Kembali ke beranda
                        </a>
                    </div>

                    {/* Subtle Brand Footer */}
                    <div className="mt-16 flex items-center gap-3 opacity-30 group">
                        <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                            <ShieldCheckIcon className="text-slate-900 w-5 h-5 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-[10px] font-black tracking-[0.4em] text-slate-900 uppercase">{siteName}</span>
                    </div>
                </main>

                {/* Contextual background element */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-60"></div>
                </div>
            </>
        );
    }

    // ===== Main Form (only shown after session is confirmed) =====
    return (
        <main className="w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden ">
            <div className="p-10 relative">
                {/* Back Button */}
                <a href="/settings" className="absolute top-10 left-10 inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-primary transition-all uppercase tracking-widest group">
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Kembali
                </a>

                {/* Brand Logo */}
                <div className="flex justify-center mb-8 pt-6">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{siteName}</h1>
                </div>

                {/* Lock Illustration Icon */}
                <div className="flex justify-center mb-10">
                    <div className="w-[120px] h-[120px] bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100/50 shadow-inner group">
                        <ArrowPathIcon className="text-primary w-14 h-14 group-hover:rotate-180 transition-transform duration-700" />
                    </div>
                </div>

                {/* Headings */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-black text-slate-900 leading-tight mb-3 tracking-tighter uppercase">Password Baru</h2>
                    <p className="text-[11px] text-slate-400 max-w-[320px] mx-auto font-black uppercase tracking-widest italic opacity-70">Gunakan kombinasi yang kuat dan unik.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8" method="POST">

                    {/* Password Baru Input */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1" htmlFor="new_password">Password Baru</label>
                        <Input
                            id="new_password"
                            name="new_password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimal 8 karakter"
                            iconLeft={LockClosedIcon}
                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 shadow-inner"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            iconRight={
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-300 hover:text-primary transition-all p-1">
                                    {showPassword ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
                                </button>
                            }
                        />
                        {error && (
                            <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-2">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Password Strength Indicator */}
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", strengthScore >= 1 ? "bg-rose-500" : "bg-slate-100")}></div>
                            <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", strengthScore >= 2 ? "bg-orange-500" : "bg-slate-100")}></div>
                            <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", strengthScore >= 3 ? "bg-amber-500" : "bg-slate-100")}></div>
                            <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", strengthScore >= 4 ? "bg-emerald-500" : "bg-slate-100")}></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={cn("text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-lg transition-all", color, bg)}>
                                {label}
                            </span>
                        </div>

                        {/* Criteria List */}
                        <ul className="grid grid-cols-1 gap-y-3 pt-2">
                            <li className={cn("flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all", criteria.length ? "text-emerald-600" : "text-slate-400 opacity-40")}>
                                {criteria.length ? <CheckCircleIconSolid className="w-4 h-4" /> : <XCircleIconSolid className="w-4 h-4" />}
                                Minimal 8 karakter
                            </li>
                            <li className={cn("flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all", criteria.uppercase ? "text-emerald-600" : "text-slate-400 opacity-40")}>
                                {criteria.uppercase ? <CheckCircleIconSolid className="w-4 h-4" /> : <XCircleIconSolid className="w-4 h-4" />}
                                Mengandung huruf besar
                            </li>
                            <li className={cn("flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all", criteria.number ? "text-emerald-600" : "text-slate-400 opacity-40")}>
                                {criteria.number ? <CheckCircleIconSolid className="w-4 h-4" /> : <XCircleIconSolid className="w-4 h-4" />}
                                Mengandung angka
                            </li>
                            <li className={cn("flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all", criteria.special ? "text-emerald-600" : "text-slate-400 opacity-40")}>
                                {criteria.special ? <CheckCircleIconSolid className="w-4 h-4" /> : <XCircleIconSolid className="w-4 h-4" />}
                                Mengandung karakter khusus
                            </li>
                        </ul>
                    </div>

                    {/* Konfirmasi Password Input */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1" htmlFor="confirm_password">Konfirmasi Password</label>
                        <Input
                            id="confirm_password"
                            name="confirm_password"
                            type={showConfirm ? "text" : "password"}
                            iconLeft={LockClosedIcon}
                            className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 shadow-inner"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            iconRight={
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-slate-300 hover:text-primary transition-all p-1">
                                    {showConfirm ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
                                </button>
                            }
                        />
                    </div>

                    {/* Submit Button */}
                    <Button variant="primary" className="w-full h-16 text-[11px] font-black uppercase tracking-[0.3em] rounded-[1.5rem] shadow-2xl shadow-primary/20 bg-slate-900" type="submit" isLoading={isLoading}>
                        Simpan Password Baru
                    </Button>
                </form>

                {/* Footer Text */}
                <div className="mt-8 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Link reset ini hanya berlaku 1 jam.</p>
                </div>
            </div>
        </main>
    );
};

export default ResetPasswordForm;
