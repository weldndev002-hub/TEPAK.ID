import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const ResetPasswordForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSuccess(true);
    };

    if (isSuccess) {
        return (
            <>
                <main className="w-full max-w-[480px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden flex flex-col items-center px-10 py-12 relative z-10 font-sans">
                    {/* Illustration Section */}
                    <div className="mb-8 relative flex items-center justify-center">
                        <div className="w-[130px] h-[130px] bg-green-100 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-500 text-[80px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 600" }}>
                                check_circle
                            </span>
                        </div>
                        {/* Decorative elements to mimic "animation" feel */}
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 opacity-20 rounded-full"></div>
                        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-500 opacity-10 rounded-full"></div>
                    </div>

                    {/* Heading Section */}
                    <h1 className="font-funnel font-black text-[22px] leading-tight text-[#162138] text-center mb-4 tracking-tighter">
                        Password Berhasil Diubah!
                    </h1>

                    {/* Body Text Section */}
                    <p className="text-[13px] text-slate-500 font-medium text-center leading-relaxed max-w-[320px] mb-10">
                        Password akun kamu sudah diperbarui. Silakan login dengan password baru.
                    </p>

                    {/* Call to Action */}
                    <div className="w-full flex flex-col items-center gap-6">
                        <a href="/login" className="w-full">
                            <Button variant="primary" className="w-full py-4 text-sm bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20">
                                Masuk Sekarang
                            </Button>
                        </a>
                        
                        {/* Secondary Link */}
                        <a className="text-[12px] font-bold text-slate-500 underline hover:text-[#162138] transition-colors duration-200" href="/">
                            Kembali ke beranda
                        </a>
                    </div>

                    {/* Subtle Brand Footer */}
                    <div className="mt-12 flex items-center gap-2 opacity-40">
                        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[14px]">shield</span>
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-[#162138] uppercase">tepak.id</span>
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

    return (
        <main className="w-full max-w-[480px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden font-sans">
            <div className="p-8 relative">
                {/* Back Button */}
                <a href="/settings" className="absolute top-8 left-8 inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-400 hover:text-blue-600 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Kembali
                </a>

                {/* Brand Logo */}
                <div className="flex justify-center mb-6">
                    <h1 className="text-2xl font-black text-[#162138] font-funnel tracking-tighter">tepak.id</h1>
                </div>

                {/* Lock Illustration Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-[100px] h-[100px] bg-blue-50 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600 text-6xl" style={{ fontVariationSettings: "'FILL' 0" }}>lock_reset</span>
                    </div>
                </div>

                {/* Headings */}
                <div className="text-center mb-8">
                    <h2 className="text-[22px] font-black text-[#162138] leading-tight mb-2 tracking-tight">Buat Password Baru</h2>
                    <p className="text-[13px] text-slate-500 max-w-[320px] mx-auto font-medium">Masukkan password baru untuk akunmu. Gunakan kombinasi huruf dan angka.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6" method="POST">
                    
                    {/* Password Baru Input */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-[#162138] ml-1" htmlFor="new_password">Password Baru</label>
                        <Input 
                            id="new_password" 
                            name="new_password" 
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimal 8 karakter"
                            iconLeft="lock"
                            iconRight={
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-blue-600 transition-colors p-1">
                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            }
                        />
                    </div>

                    {/* Password Strength Indicator */}
                    <div className="space-y-2 mt-2">
                        <div className="flex gap-1.5">
                            <div className="h-1.5 flex-1 rounded-full bg-error"></div> {/* Segment 1: Red */}
                            <div className="h-1.5 flex-1 rounded-full bg-amber-500"></div> {/* Segment 2: Orange */}
                            <div className="h-1.5 flex-1 rounded-full bg-yellow-500"></div> {/* Segment 3: Yellow */}
                            <div className="h-1.5 flex-1 rounded-full bg-slate-200"></div> {/* Segment 4: Inactive */}
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-yellow-600 uppercase tracking-widest">Kuat</span>
                        </div>
                        
                        {/* Criteria List */}
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                            <li className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                Minimal 8 karakter
                            </li>
                            <li className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                Mengandung huruf besar
                            </li>
                            <li className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                                <span className="material-symbols-outlined text-[14px]">cancel</span>
                                Mengandung angka
                            </li>
                            <li className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                                <span className="material-symbols-outlined text-[14px]">cancel</span>
                                Mengandung karakter khusus
                            </li>
                        </ul>
                    </div>

                    {/* Konfirmasi Password Input */}
                    <div className="space-y-1.5 pt-2">
                        <label className="text-sm font-bold text-[#162138] ml-1" htmlFor="confirm_password">Konfirmasi Password</label>
                        <Input 
                            id="confirm_password" 
                            name="confirm_password" 
                            type={showConfirm ? "text" : "password"}
                            iconLeft="lock"
                            iconRight={
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-slate-400 hover:text-blue-600 transition-colors p-1">
                                    <span className="material-symbols-outlined text-[20px]">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            }
                        />
                    </div>

                    {/* Submit Button */}
                    <Button variant="primary" className="w-full py-4 text-sm mt-4 bg-[#162138] hover:bg-[#162138]/90" type="submit">
                        Simpan Password Baru
                    </Button>
                </form>

                {/* Footer Text */}
                <div className="mt-6 text-center">
                    <p className="text-[12px] font-bold text-slate-400">Link reset ini hanya berlaku 1 jam.</p>
                </div>
            </div>
        </main>
    );
};
