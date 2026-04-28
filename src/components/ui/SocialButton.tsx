import React, { useState } from 'react';
import Button from './Button';
import { supabase as globalSupabase } from '../../lib/supabase';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface SocialButtonProps {
    provider: 'google' | 'apple';
    className?: string;
    supabase?: any;
    onError?: (message: string) => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
    provider,
    className,
    supabase: propSupabase,
    onError
}) => {
    const supabase = propSupabase || globalSupabase;
    const isGoogle = provider === 'google';
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                    },
                },
            });

            if (error) {
                // Check for popup blocked error
                if (error.message.includes('popup') || error.message.includes('blocked')) {
                    const errorMsg = 'Pop-up diblokir, mohon izinkan pop-up untuk login';
                    if (onError) {
                        onError(errorMsg);
                    } else {
                        showToastAlert(errorMsg);
                    }
                } else if (error.message.includes('cancelled') || error.message.includes('user closed')) {
                    // User cancelled the OAuth flow - no error message needed
                    console.log('User cancelled OAuth login');
                } else {
                    throw error;
                }
            }
        } catch (error: any) {
            console.error(`Error logging in with ${provider}:`, error.message);

            // Show error toast/alert
            const errorMsg = `Gagal login dengan ${provider}: ${error.message}`;
            if (onError) {
                onError(errorMsg);
            } else {
                showToastAlert(errorMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fallback toast for components that don't provide onError prop
    const showToastAlert = (message: string) => {
        // Create a temporary toast element
        const toast = document.createElement('div');
        toast.className = 'fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold bg-rose-500 text-white animate-in slide-in-from-right duration-300';
        toast.innerHTML = `
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 4000);
    };

    return (
        <Button
            variant="outline"
            size="lg"
            className={`w-full py-6 rounded-2xl shadow-sm hover:shadow-md transition-all group flex-col gap-3 h-auto ${className}`}
            onClick={handleLogin}
            disabled={isLoading}
        >
            <div className="flex items-center justify-center gap-3">
                {isLoading ? (
                    <div className="w-6 h-6 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : isGoogle ? (
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.23.81-.6z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.06.75 1.21-.02 2.1-.81 3.46-.74 1.77.1 3.02.82 3.73 2.05-3.66 1.83-3.1 6.5.15 7.9-.53 1.25-1.25 2.18-2.35 2.94a.521.521 0 0 1-.05.07zM12.03 7.25c-.03-2.63 2.13-4.87 4.54-4.9.22 2.76-2.22 5.05-4.54 4.9z" />
                    </svg>
                )}
                <span className="text-sm font-black text-slate-900 tracking-tight">
                    {isLoading ? 'Memproses...' : (isGoogle ? 'Google' : 'Apple')}
                </span>
            </div>
        </Button>
    );
};

export default SocialButton;
