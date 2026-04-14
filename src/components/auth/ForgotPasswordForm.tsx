import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { EnvelopeIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

export const ForgotPasswordForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) {
                setError(resetError.message);
            } else {
                setIsSent(true);
            }
        } catch (err: any) {
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
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Email Terkirim!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Kami telah mengirimkan instruksi pemulihan ke <span className="text-slate-900 font-bold">{email}</span>. 
                        Silakan periksa kotak masuk atau folder spam Anda.
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
