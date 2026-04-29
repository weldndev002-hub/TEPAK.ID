import React, { useState } from 'react';
import { z } from 'zod';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { EnvelopeIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { supabase as globalSupabase } from '../../lib/supabase';
import { createBrowserClient } from '@supabase/ssr';

interface ForgotPasswordFormProps {
    supabaseUrl?: string;
    supabaseAnonKey?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ supabaseUrl, supabaseAnonKey }) => {
    // Initialize client WITH cookie handlers (required for PKCE flow — code_verifier must be stored)
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

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState('');

    // Zod validation schema for email
    const emailSchema = z.string().email({ message: 'Format email tidak valid.' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validate email format with Zod
        const validationResult = emailSchema.safeParse(email);
        if (!validationResult.success) {
            setError(validationResult.error.issues[0].message);
            setIsLoading(false);
            return;
        }

        try {
            // Directly send reset email - Supabase handles user existence check internally
            // Don't query profiles table as email may not be synced there
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) {
                if (resetError.message.toLowerCase().includes('rate limit')) {
                    setError('Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.');
                    setIsLoading(false);
                    return;
                }
                console.error('Reset password error:', resetError);
            }

            // Always show success to prevent email enumeration
            setIsSent(true);
        } catch (err: any) {
            console.error('Unexpected error:', err);
            // Don't show specific error to user to prevent information leakage
            setError('Terjadi kesalahan sistem. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center border border-emerald-100 shadow-xl shadow-emerald-500/10">
                        <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
                    </div>
                </div>
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Permintaan Diterima</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Jika email <span className="text-slate-900 font-bold">{email}</span> terdaftar di sistem kami,
                        tautan reset password telah dikirim. Silakan periksa kotak masuk atau folder spam Anda.
                    </p>
                    <p className="text-slate-400 text-sm font-medium mt-4">
                        (Pesan ini selalu ditampilkan untuk mencegah enumerasi email)
                    </p>
                </div>
                <Button
                    variant="ghost"
                    className="w-full h-14 rounded-2xl border-slate-100 font-black text-[11px] uppercase tracking-widest"
                    onClick={() => setIsSent(false)}
                >
                    Ganti Alamat Email
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
                <label className="block text-[10px] font-black text-primary tracking-[0.2em] uppercase ml-1">
                    Alamat Email Anda
                </label>
                <Input
                    iconLeft={EnvelopeIcon}
                    type="email"
                    placeholder="nama@perusahaan.com"
                    className="h-16 text-base rounded-2xl border-slate-100 bg-slate-50/50 shadow-inner"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {error && (
                    <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest ml-1 mt-2">
                        {error}
                    </p>
                )}
            </div>

            <Button
                type="submit"
                variant="amber"
                size="lg"
                isLoading={isLoading}
                className="w-full h-16 rounded-[1.5rem] shadow-xl shadow-amber-500/20 group text-[11px] font-black uppercase tracking-[0.3em]"
            >
                <span>Kirim Instruksi Pemulihan</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
        </form>
    );
};

export default ForgotPasswordForm;
