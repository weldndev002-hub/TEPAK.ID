import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
    TicketIcon, 
    CalendarIcon, 
    ShieldCheckIcon, 
    ExclamationTriangleIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    BoltIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { SubscriptionProvider, useSubscription } from '../../context/SubscriptionContext';

const formatCountdown = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return "Selesai";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}h ${hours}j ${minutes}m ${seconds}s`;
};

const PlanInfoContent = () => {
    const { plan, expiryDate, autoRenewal, upgradeToPro, cancelSubscription, isLoading } = useSubscription();
    const [countdown, setCountdown] = useState<string | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<string>('SP'); // Default ShopeePay
    const [allPlans, setAllPlans] = useState<any[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);

    useEffect(() => {
        if (expiryDate && plan !== 'free') {
            const timer = setInterval(() => {
                setCountdown(formatCountdown(expiryDate));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [expiryDate, plan]);

    // Fetch all available plans
    useEffect(() => {
        const fetchAllPlans = async () => {
            try {
                setPlansLoading(true);
                const res = await fetch('/api/plans');
                if (res.ok) {
                    const data = await res.json();
                    setAllPlans(data || []);
                }
            } catch (err) {
                console.error('Failed to fetch plans:', err);
            } finally {
                setPlansLoading(false);
            }
        };
        fetchAllPlans();
    }, []);

    const formattedExpiry = expiryDate 
        ? new Date(expiryDate).toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) 
        : '-';

    if (isLoading && !plan) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <header className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Account Status</span>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Informasi Paket</h1>
                <p className="text-slate-500 font-medium">Kelola langganan Anda dan pantau masa aktif paket.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Plan Status Card */}
                <Card className={plan !== 'free' ? "amber-gradient border-none p-10 text-white shadow-xl shadow-primary/20" : "bg-white border-slate-100 p-10 shadow-sm border-none shadow-[0px_20px_40px_rgba(16,27,50,0.0454)]"}>
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <div className={`w-12 h-12 ${plan !== 'free' ? 'bg-white/20' : 'bg-primary/10'} rounded-2xl flex items-center justify-center backdrop-blur-md`}>
                                    <TicketIcon className={`w-6 h-6 ${plan !== 'free' ? 'text-white' : 'text-primary'}`} />
                                </div>
                                <Badge className={`${plan !== 'free' ? 'bg-white text-primary' : 'bg-slate-100 text-slate-500'} border-none font-black text-[10px] uppercase tracking-widest px-4 py-1`}>
                                    {plan.toUpperCase()}
                                </Badge>
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
                                {plan === 'free' ? 'Paket Standar' : 'Orbit Site Pro'}
                            </h3>
                            <p className={plan !== 'free' ? "text-white/70 font-medium text-sm" : "text-slate-400 font-medium text-sm"}>
                                {plan !== 'free' ? "Anda sedang menikmati fitur premium tanpa batas." : "Tingkatkan ke PRO untuk fitur kustom domain dan analitik lengkap."}
                            </p>
                        </div>
                        
                        <div className={`mt-12 pt-8 border-t ${plan !== 'free' ? 'border-white/10' : 'border-slate-50'} flex items-center justify-between`}>
                            {plan !== 'free' ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <CalendarIcon className="w-5 h-5 text-white/50" />
                                        <div>
                                            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">Berakhir pada</p>
                                            <p className="text-sm font-black uppercase text-white">{formattedExpiry}</p>
                                        </div>
                                    </div>
                                    {countdown && (
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Sisa Waktu</p>
                                            <p className="text-sm font-black font-mono text-white">{countdown}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Pilih Metode Pembayaran</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'BT', name: 'Transfer Bank (Permata/ATM)' },
                                                { id: 'B1', name: 'Transfer Bank (CIMB Niaga)' },
                                                { id: 'SP', name: 'ShopeePay / QRIS' },
                                                { id: 'OV', name: 'OVO (E-Wallet)' },
                                                { id: 'LA', name: 'Alfamart / Retail' }
                                            ].map((m) => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setSelectedMethod(m.id)}
                                                    className={`p-3 rounded-xl border text-[10px] font-bold uppercase transition-all text-left flex flex-col justify-center ${
                                                        selectedMethod === m.id 
                                                        ? 'border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary' 
                                                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                                    }`}
                                                >
                                                    {m.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => upgradeToPro(selectedMethod)} 
                                        disabled={isLoading}
                                        className="w-full bg-primary hover:opacity-90 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <BoltIcon className="w-5 h-5" />
                                        {isLoading ? 'Memproses...' : `Bayar via ${selectedMethod === 'SP' ? 'ShopeePay' : selectedMethod === 'OV' ? 'OVO' : selectedMethod === 'BT' ? 'Permata' : 'Alfamart'}`}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Features Card */}
                <Card className="bg-white p-10 rounded-[2.5rem] shadow-sm border-none shadow-[0px_20px_40px_rgba(16,27,50,0.0454)] space-y-8">
                    <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Manfaat Paket Aktif</h3>
                    <ul className="grid grid-cols-1 gap-5">
                        {[
                            { name: "Produk Tanpa Batas", active: true },
                            { name: "Custom Domain (.com / .id)", active: plan !== 'free' },
                            { name: "Hapus Branding Orbit Site", active: plan !== 'free' },
                            { name: "Analitik Real-time", active: plan !== 'free' },
                            { name: "Prioritas Support", active: plan !== 'free' }
                        ].map((f, i) => (
                            <li key={i} className={`flex items-center gap-4 ${f.active ? 'opacity-100' : 'opacity-30'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${f.active ? 'bg-primary shadow-[0_0_8px_rgba(255,185,76,0.8)]' : 'bg-slate-300'}`}></div>
                                <span className={`text-xs font-bold uppercase tracking-tight ${f.active ? 'text-slate-600' : 'text-slate-400'}`}>
                                    {f.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            {/* Actions Section */}
            {plan !== 'free' && (
                <div className="bg-white/50 border border-slate-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm shadow-[0px_10px_20px_rgba(16,27,50,0.02)]">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                            <ShieldCheckIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Manajemen Langganan</h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">
                                {autoRenewal ? 'Perpanjangan otomatis sedang aktif.' : 'Perpanjangan otomatis dinonaktifkan.'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <Button 
                            onClick={cancelSubscription}
                            disabled={!autoRenewal || isLoading}
                            variant="ghost" 
                            className={`text-slate-400 hover:text-rose-500 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${!autoRenewal ? 'opacity-50 grayscale' : ''}`}
                        >
                            Matikan Auto-Renew
                        </Button>
                    </div>
                </div>
            )}

            {/* Available Plans Section */}
            <div className="mt-16 pt-16 border-t border-slate-100">
                <header className="flex flex-col gap-1 mb-12">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Paket Tersedia</span>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Pilih Paket Terbaik Anda</h2>
                    <p className="text-slate-500 font-medium mt-2">Bandingkan semua paket dan temukan yang paling sesuai untuk kebutuhan Anda.</p>
                </header>

                {plansLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : allPlans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allPlans.map((availablePlan) => (
                            <div key={availablePlan.id} className={`relative group animate-in fade-in slide-in-from-bottom-12 duration-1000`}>
                                <div className={`h-full bg-white rounded-[2.5rem] p-10 border transition-all duration-500 flex flex-col ${
                                    plan === availablePlan.id
                                        ? 'border-emerald-500 shadow-[0_32px_64px_-16px_rgba(16,185,129,0.2)] ring-2 ring-emerald-500/20'
                                        : availablePlan.id === 'pro'
                                        ? 'border-primary shadow-[0_32px_64px_-16px_rgba(255,185,76,0.2)] scale-105 z-10'
                                        : 'border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200'
                                }`}>
                                    
                                    {availablePlan.badge && availablePlan.badge !== 'DEFAULT' && (
                                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl ${
                                            plan === availablePlan.id
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-primary text-white'
                                        }`}>
                                            {plan === availablePlan.id ? 'Paket Aktif' : availablePlan.badge}
                                        </div>
                                    )}

                                    <div className="mb-10">
                                        <div className="flex items-start gap-3 mb-4">
                                            <h3 className="text-3xl font-black text-slate-900 uppercase italic">{availablePlan.name}</h3>
                                            {availablePlan.tier_category && (
                                                <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest mt-2 whitespace-nowrap">
                                                    {availablePlan.tier_category}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-2">{availablePlan.description}</p>
                                        {availablePlan.tier_description && (
                                            <p className="text-slate-500 text-xs leading-relaxed italic border-l-2 border-primary/30 pl-3">
                                                {availablePlan.tier_description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mb-10">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-black text-slate-900 italic tracking-tighter">
                                                {availablePlan.price_monthly === 0 ? 'Gratis' : `Rp ${Number(availablePlan.price_monthly).toLocaleString('id-ID')}`}
                                            </span>
                                            {availablePlan.price_monthly > 0 && <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">/Bulan</span>}
                                        </div>
                                        {availablePlan.price_yearly > 0 && (
                                            <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-2">
                                                Hemat 20% jika bayar tahunan
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-5 mb-12">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apa yang Anda dapatkan:</p>
                                        <ul className="space-y-4">
                                            {(availablePlan.features || []).map((feature: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <div className="mt-1">
                                                        <CheckCircleIcon className={`w-5 h-5 ${availablePlan.id === 'pro' ? 'text-primary' : 'text-slate-300'}`} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-600 leading-tight">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {plan === availablePlan.id ? (
                                        <Button
                                            disabled
                                            variant="primary"
                                            className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-emerald-500 text-white shadow-xl shadow-emerald-500/20"
                                        >
                                            ✓ Paket Anda Saat Ini
                                        </Button>
                                    ) : (
                                        <a href={availablePlan.price_monthly === 0 ? '/signup' : '#'} className="block mt-auto">
                                            <Button
                                                variant={availablePlan.id === 'pro' ? 'primary' : 'ghost'}
                                                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                                    availablePlan.id === 'pro'
                                                        ? 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95'
                                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                {availablePlan.price_monthly === 0 ? 'Downgrade ke Gratis' : 'Lihat Rincian'}
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-slate-50 border-dashed border-slate-200 p-12 text-center">
                        <p className="text-slate-400 text-sm font-medium">Belum ada paket tersedia. Mohon hubungi admin.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export const PlanInfoDashboard = () => {
    return (
        <SubscriptionProvider>
            <PlanInfoContent />
        </SubscriptionProvider>
    );
};
