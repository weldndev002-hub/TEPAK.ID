import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const AccountManagementDashboard = () => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="max-w-7xl w-full mx-auto space-y-8 font-sans">
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <a href="/settings" className="text-blue-600/60 hover:text-blue-600 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </a>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900">Manajemen Akun</h2>
                <p className="text-slate-500 font-medium">Kelola keberadaan data kamu di platform kami.</p>
            </div>

            {/* Two States Side-by-Side Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* State 5A: Akun Standard */}
                <Card className="flex flex-col border-slate-200">
                    <div className="bg-red-50 p-6 border-b border-red-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>delete_forever</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 leading-tight">Hapus Akun Permanen</h3>
                                <p className="text-sm text-slate-500 font-medium">Status: Akun Standard</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 space-y-8 flex-1">
                        <div className="space-y-3">
                            <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Peringatan Penting</p>
                            <div className="bg-red-50/50 border-l-4 border-red-600 p-5 rounded-r-xl">
                                <p className="text-red-600 font-bold text-sm mb-3">Data berikut akan dihapus selamanya:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-3 text-red-600/80 text-sm font-medium">
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        Semua halaman dan konten yang dibuat
                                    </li>
                                    <li className="flex items-center gap-3 text-red-600/80 text-sm font-medium">
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        Riwayat analitik dan statistik
                                    </li>
                                    <li className="flex items-center gap-3 text-red-600/80 text-sm font-medium">
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        Data profil dan pengaturan akun
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">Konfirmasi Password</label>
                                <Input 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="Masukkan password kamu" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    iconLeft="lock"
                                    iconRight={
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                                            <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    }
                                />
                                {/* Error message placeholder if needed */}
                                {/* <p className="text-red-500 text-xs font-bold flex items-center gap-1 mt-1">
                                    <span className="material-symbols-outlined text-[14px]">error</span>
                                    Password tidak sesuai
                                </p> */}
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <button className="w-full h-12 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-600/90 active:scale-[0.98] transition-all">
                                    Hapus Akun Saya Selamanya
                                </button>
                                <a href="/settings" className="w-full py-2 text-center text-slate-400 font-bold text-sm hover:text-slate-700 transition-colors">
                                    Batal, Kembali ke Pengaturan
                                </a>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* State 5B: Akun PRO */}
                <Card className="flex flex-col border-slate-200">
                    <div className="bg-slate-50 p-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 leading-tight">Penghapusan Terkunci</h3>
                                <p className="text-sm text-blue-600 font-bold">Status: Member PRO Active</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-8 flex flex-col items-center justify-center flex-1 text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center relative">
                            <span className="material-symbols-outlined text-[64px] text-slate-300">shield_lock</span>
                            <div className="absolute -top-1 -right-1 bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                                <span className="material-symbols-outlined text-[18px] font-bold">warning</span>
                            </div>
                        </div>
                        
                        <div className="max-w-xs space-y-3">
                            <h4 className="text-xl font-extrabold text-slate-900">Tidak Dapat Menghapus Akun</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Kamu masih memiliki langganan PRO aktif. Batalkan langganan PRO terlebih dahulu melalui panel billing sebelum menghapus akun ini.
                            </p>
                        </div>
                        
                        <div className="w-full space-y-6 pt-4">
                            <button className="w-full h-12 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">credit_card_off</span>
                                Batalkan Langganan PRO
                            </button>
                            
                            <div className="relative group">
                                {/* Tooltip (Visible on hover) */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[12px] px-4 py-2 rounded-lg whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-slate-900">
                                    Batalkan PRO untuk mengaktifkan tombol ini
                                </div>
                                <button className="w-full h-12 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed" disabled>
                                    Hapus Akun
                                </button>
                            </div>
                            
                            <a href="/settings" className="block w-full py-2 text-slate-400 font-bold text-sm hover:text-slate-700 transition-colors">
                                Batal, Kembali
                            </a>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Additional Help Section */}
            <div className="mt-12 bg-blue-50/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between border border-blue-100 gap-6">
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-amber-600 text-3xl">info</span>
                    <div>
                        <p className="font-bold text-blue-900">Butuh bantuan lain?</p>
                        <p className="text-sm text-blue-700/70">Hubungi tim support kami jika kamu mengalami kendala dalam mengelola akun.</p>
                    </div>
                </div>
                <Button variant="primary" className="whitespace-nowrap px-6 py-2 h-auto text-sm bg-blue-700 shadow-sm">
                    Hubungi Support
                </Button>
            </div>
        </div>
    );
};
