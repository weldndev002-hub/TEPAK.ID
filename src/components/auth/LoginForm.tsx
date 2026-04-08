import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SocialButton from '../ui/SocialButton';

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
        <div className="w-full flex flex-col gap-8 font-sans">
            
            {/* Inputs Container */}
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
                
                {/* Email Input */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Alamat Email
                    </label>
                    <Input 
                        iconLeft="mail"
                        placeholder="test@gmail.com" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        hasError={!!emailError}
                        className="h-14"
                        required
                    />
                    {emailError && (
                        <p className="text-error text-[10px] font-black uppercase tracking-wider ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                            {emailError}
                        </p>
                    )}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Kata Sandi
                        </label>
                        <a className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider" href="/forgot-password">
                            Lupa sandi?
                        </a>
                    </div>
                    <Input 
                        iconLeft="lock"
                        placeholder="••••••••" 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        hasError={!!passwordError}
                        className="h-14 font-sans tracking-widest"
                        required
                        iconRight={
                            <span 
                                onClick={() => setShowPassword(!showPassword)}
                                className={`material-symbols-outlined cursor-pointer transition-colors text-xl ${showPassword ? "text-primary" : "text-slate-300 hover:text-slate-500"}`}
                            >
                                {showPassword ? "visibility" : "visibility_off"}
                            </span>
                        }
                    />
                    {passwordError && (
                        <p className="text-error text-[10px] font-black uppercase tracking-wider ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                            {passwordError}
                        </p>
                    )}
                </div>

                {/* Main Button */}
                <Button 
                    type="submit" 
                    variant="amber" 
                    isLoading={isLoading}
                    className="w-full h-14 mt-4 shadow-xl shadow-primary/20 text-sm font-black uppercase tracking-widest"
                >
                    Masuk ke Akun
                </Button>
            </form>

            {/* Divider */}
            <div className="w-full flex items-center gap-6 opacity-60">
                <div className="h-px flex-1 bg-slate-100"></div>
                <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] whitespace-nowrap">
                    Masuk Dengan
                </span>
                <div className="h-px flex-1 bg-slate-100"></div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <SocialButton provider="google" />
                <SocialButton provider="apple" />
            </div>
            
        </div>
    );
};

export default LoginForm;
