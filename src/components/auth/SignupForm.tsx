import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SocialButton from '../ui/SocialButton';

export const SignupForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Error States
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Reset Errors
        setNameError('');
        setEmailError('');
        setPasswordError('');

        let isValid = true;

        // 1. Name Validation
        if (!name.trim()) {
            setNameError('Nama lengkap wajib diisi');
            isValid = false;
        }

        // 2. Email Validation (Simple)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !emailRegex.test(email)) {
            setEmailError('Alamat email tidak valid');
            isValid = false;
        }

        // 3. Password Length Validation
        if (password.length < 8) {
            setPasswordError('Kata sandi minimal 8 karakter');
            isValid = false;
        }

        if (!isValid) return;

        // Mock Sign-up Process
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            // Redirect to verify-email as success simulation
            window.location.href = '/verify-email';
        }, 1200);
    };

    return (
        <div className="w-full flex flex-col gap-8 font-sans">
            
            <form onSubmit={handleSignup} className="w-full flex flex-col gap-5">
                
                {/* Name Input */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Nama Lengkap
                    </label>
                    <Input 
                        iconLeft="person"
                        placeholder="Masukkan nama lengkap Anda" 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        hasError={!!nameError}
                        className="h-14"
                        required
                    />
                    {nameError && (
                        <p className="text-error text-[10px] font-black uppercase tracking-wider ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                            {nameError}
                        </p>
                    )}
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Alamat Email
                    </label>
                    <Input 
                        iconLeft="mail"
                        placeholder="nama@perusahaan.com" 
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
                    </div>
                    <Input 
                        iconLeft="lock"
                        placeholder="Minimal 8 karakter" 
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
                    Buat Akun Gratis
                </Button>
            </form>

            {/* Divider */}
            <div className="w-full flex items-center gap-6 opacity-60">
                <div className="h-px flex-1 bg-slate-100"></div>
                <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] whitespace-nowrap">
                    Atau Daftar Dengan
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

export default SignupForm;
