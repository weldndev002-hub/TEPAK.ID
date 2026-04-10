import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SocialButton from '../ui/SocialButton';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError('');
        setPasswordError('');

        // 1. Password Length Validation
        if (password.length < 8) {
            setPasswordError('Kata sandi minimal 8 karakter');
            return;
        }

        // 2. Mock Authentication Logic
        setIsLoading(true);
        
        setTimeout(() => {
            if (email === 'test@gmail.com' && password === '12345678') {
                // Berhasil
                window.location.href = '/uikit'; // Redirect ke galeri sebagai sukses
            } else {
                // Salah
                if (email !== 'test@gmail.com') setEmailError('Email tidak terdaftar atau salah');
                if (password !== '12345678') setPasswordError('Kata sandi salah');
            }
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="w-full flex flex-col gap-10 ">
            
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
                <SocialButton provider="google" className="h-16 rounded-2xl border-slate-100 bg-white shadow-sm hover:shadow-md transition-all active:scale-[0.98]" />
                <SocialButton provider="apple" className="h-16 rounded-2xl border-slate-100 bg-white shadow-sm hover:shadow-md transition-all active:scale-[0.98]" />
            </div>
            
        </div>
    );
};

export default LoginForm;
