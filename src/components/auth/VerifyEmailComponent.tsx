import React, { useState } from 'react';
import { EnvelopeOpenIcon, ArrowTopRightOnSquareIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';

import { useBranding } from '../../hooks/useBranding';

export const VerifyEmailComponent: React.FC = () => {
    const { branding } = useBranding();
    const siteName = branding?.site_name || 'Orbit Site';
    const logoUrl = branding?.logo_url || '/logo-light.png';

    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');

    // Get email from URL params or localStorage
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        
        if (errorParam === 'link_expired') {
            setError('Link verifikasi Anda sudah kadaluarsa. Silakan minta pengiriman ulang.');
        }

        // Try to get email from user session
        const getEmail = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                if (data.session?.user?.email) {
                    setEmail(data.session.user.email);
                }
            } catch (err) {
                console.error('Error getting email:', err);
            }
        };
        getEmail();
    }, []);

    const handleResendEmail = async () => {
        if (!email) {
            setError('Email tidak ditemukan. Silakan login ulang.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Resend verification email
            const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            if (resendError) {
                setError(resendError.message || 'Gagal mengirim ulang email.');
            } else {
                setIsSent(true);
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-slate-50/50 font-['Plus_Jakarta_Sans',sans-serif]">
            
            {/* LOGO AREA */}
            <div className="mb-10">
                <a href="/">
                    <img src={logoUrl} alt={siteName} className="w-28 h-auto" />
                </a>
            </div>

            {/* VERIFICATION CARD */}
            <div className="w-full max-w-[480px] bg-white p-10 md:p-14 rounded-[2.5rem] shadow-[0px_32px_64px_-12px_rgba(0,0,0,0.06)] border border-slate-50 relative overflow-hidden">
                
                <div className="flex flex-col items-center text-center">
                    
                    {isSent ? (
                        <>
                            {/* SUCCESS ICON */}
                            <div className="mb-10 relative">
                                <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full scale-150"></div>
                                <div className="relative w-28 h-28 bg-emerald-500/5 rounded-full flex items-center justify-center">
                                    <CheckCircleIcon className="w-14 h-14 text-emerald-500" />
                                </div>
                            </div>

                            {/* SUCCESS TEXT */}
                            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">
                                Email Terkirim
                            </h2>
                            <p className="text-slate-500 font-medium leading-relaxed mb-12 text-[15px] max-w-xs">
                                Link verifikasi telah dikirim ke <span className="text-slate-900 font-bold">{email}</span>. Periksa kotak masuk atau folder spam.
                            </p>
                        </>
                    ) : (
                        <>
                            {/* ILLUSTRATION/ICON */}
                            <div className="mb-10 relative">
                                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150"></div>
                                <div className="relative w-28 h-28 bg-primary/5 rounded-full flex items-center justify-center">
                                    <EnvelopeOpenIcon className="w-14 h-14 text-primary" />
                                </div>
                            </div>

                            {/* TEXT CONTENT */}
                            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">
                                Cek Email Anda
                            </h2>
                            <p className="text-slate-500 font-medium leading-relaxed mb-12 text-[15px] max-w-xs">
                                Kami telah mengirimkan tautan verifikasi ke email Anda. Silakan periksa kotak masuk atau folder spam untuk melanjutkan.
                            </p>

                            {/* ERROR MESSAGE */}
                            {error && (
                                <div className="w-full mb-8 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                                    <p className="text-rose-700 text-sm font-bold">{error}</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="w-full space-y-8">
                        {!isSent ? (
                            <>
                                <Button variant="amber" size="lg" className="w-full shadow-none group" disabled={isLoading}>
                                    <span>Buka Email</span>
                                    <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                </Button>

                                <div className="flex flex-col items-center gap-4">
                                    <p className="text-sm font-medium text-slate-400">
                                        Tidak menerima email? 
                                        <button 
                                            onClick={handleResendEmail}
                                            disabled={isLoading}
                                            className="text-primary font-black hover:underline underline-offset-4 decoration-2 ml-1 transition-all disabled:opacity-50"
                                        >
                                            {isLoading ? 'Mengirim...' : 'Kirim ulang email'}
                                        </button>
                                    </p>
                                </div>
                            </>
                        ) : (
                            <button 
                                onClick={() => setIsSent(false)}
                                className="w-full px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black uppercase rounded-2xl text-sm transition-all"
                            >
                                Kirim Ulang Email
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* FOOTER / BACK LINK */}
            <div className="mt-12">
                <a className="flex items-center gap-3 text-slate-400 font-black hover:text-primary transition-all group text-sm uppercase tracking-widest" href="/login">
                    <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Kembali ke Login</span>
                </a>
            </div>

            {/* SHARED FOOTER COMPONENT */}
            <footer className="flex flex-col md:flex-row justify-center items-center gap-8 py-16 w-full text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <span>© {new Date().getFullYear()} {siteName}. All rights reserved.</span>
                <div className="flex gap-8">
                    <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                    <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                    <a className="hover:text-primary transition-colors" href="#">Support</a>
                </div>
            </footer>

        </main>
    );
};

export default VerifyEmailComponent;
