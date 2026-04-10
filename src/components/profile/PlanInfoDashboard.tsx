import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
    TicketIcon, 
    CalendarIcon, 
    ShieldCheckIcon, 
    ExclamationTriangleIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
    PrinterIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { SubscriptionProvider, useSubscription } from '../../context/SubscriptionContext';

const PlanInfoContent = () => {
    const { plan, expiryDate, autoRenewal, cancelSubscription } = useSubscription();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [simulateTimeout, setSimulateTimeout] = useState(false);
    
    // Cancellation States
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    // Invoice States
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        fetchPlanData();
    }, []);

    const fetchPlanData = () => {
        setLoading(true);
        setError(false);
        
        // Simulating API Call to "Supabase"
        setTimeout(() => {
            if (simulateTimeout) {
                setError(true);
            }
            setLoading(false);
        }, 2000);
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-slate-100 rounded-[2.5rem]"></div>
                    <div className="h-64 bg-slate-100 rounded-[2.5rem]"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-xl mx-auto py-20 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                    <ExclamationTriangleIcon className="w-10 h-10" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase">Gagal memuat data</h2>
                    <p className="text-sm text-slate-500 font-medium mt-2">Silakan coba lagi atau hubungi dukungan jika masalah berlanjut.</p>
                </div>
                <Button onClick={fetchPlanData} variant="outline" className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest border-rose-100 text-rose-600 hover:bg-rose-50">
                    <ArrowPathIcon className="w-4 h-4" />
                    Coba Lagi
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 ">
            <header className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Account Status</span>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Informasi Paket</h1>
                <p className="text-slate-500 font-medium">Lihat rincian langganan Anda dan manfaat fitur aktif.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Plan Status Card */}
                <Card className={plan === 'PRO' ? "amber-gradient border-none p-10 text-white shadow-xl shadow-primary/20" : "bg-white border-slate-100 p-10"}>
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <TicketIcon className="w-6 h-6 text-white" />
                                </div>
                                <Badge className="bg-white text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1">
                                    {plan}
                                </Badge>
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Paket Langganan</h3>
                            <p className={plan === 'PRO' ? "text-white/70 font-medium text-sm" : "text-slate-400 font-medium text-sm"}>
                                {plan === 'PRO' ? "Anda sedang menikmati fitur premium tanpa batas." : "Tingkatkan ke PRO untuk fitur lebih lengkap."}
                            </p>
                        </div>
                        
                        <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="w-5 h-5 text-white/50" />
                                <div>
                                    <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">
                                        {autoRenewal ? "Perpanjangan Otomatis" : "Langganan akan berakhir pada"}
                                    </p>
                                    <p className="text-sm font-black uppercase text-white">{expiryDate}</p>
                                </div>
                            </div>
                            
                            {plan === 'PRO' && (
                                <button 
                                    onClick={async () => {
                                        setIsGeneratingInvoice(true);
                                        await new Promise(r => setTimeout(r, 1200));
                                        setShowInvoiceModal(true);
                                        setIsGeneratingInvoice(false);
                                    }}
                                    disabled={isGeneratingInvoice}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    <DocumentTextIcon className="w-4 h-4" />
                                    {isGeneratingInvoice ? 'Memuat...' : 'Invoice'}
                                </button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Features Card */}
                <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                    <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Fitur Aktif</h3>
                    <ul className="space-y-5">
                        {[
                            "Produk & Event Tanpa Batas",
                            "Domain Kustom (.com / .id)",
                            "Tanpa Branding Orbit Site",
                            "Analitik Real-time",
                            "Dukungan Prioritas 24/7"
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(255,185,76,0.8)]"></div>
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* Cancel Subscription Action */}
            {plan === 'PRO' && (
                <div className="bg-rose-50/30 border border-rose-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Batalkan Langganan?</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">Anda akan kehilangan akses ke fitur premium setelah masa langganan berakhir.</p>
                    </div>
                    <Button 
                        onClick={() => setShowCancelModal(true)}
                        disabled={!autoRenewal || isCancelling}
                        variant="ghost" 
                        className={`text-rose-500 border border-rose-200 hover:bg-rose-50 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${(!autoRenewal || isCancelling) ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                    >
                        {isCancelling ? 'Memproses...' : !autoRenewal ? 'Sudah Dibatalkan' : 'Batalkan Langganan'}
                    </Button>
                </div>
            )}

            {/* Confirmation Modal (Cancellation) */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-8">
                            <ExclamationTriangleIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">Konfirmasi Pembatalan</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">
                            Apakah Anda yakin ingin mematikan perpanjangan otomatis? Anda masih dapat menggunakan fitur PRO hingga tanggal <span className="font-black text-slate-900">{expiryDate}</span>.
                        </p>
                        <div className="flex gap-4">
                            <Button 
                                onClick={() => setShowCancelModal(false)}
                                variant="outline" 
                                className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-400"
                            >
                                Abaikan
                            </Button>
                            <Button 
                                onClick={async () => {
                                    setIsCancelling(true);
                                    setShowCancelModal(false);
                                    await cancelSubscription();
                                    setIsCancelling(false);
                                }}
                                variant="primary" 
                                className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border-none"
                            >
                                Ya, Batalkan
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Modal */}
            {showInvoiceModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Billing Details</p>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Invoice #INV-928371</h3>
                            </div>
                            <button onClick={() => setShowInvoiceModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <XMarkIcon className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            {/* Invoice Info Grid */}
                            <div className="grid grid-cols-2 gap-10">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ditagihkan Kepada</p>
                                    <p className="text-sm font-black text-slate-900 uppercase">Alexandra Quinn</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">alexandra@creator.studio</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Tanggal Transaksi</p>
                                    <p className="text-sm font-black text-slate-900 uppercase">24 Oktober 2024</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Metode: Duitku (Virtual Account)</p>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="border border-slate-100 rounded-3xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Deskripsi</th>
                                            <th className="px-6 py-4 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm font-black text-slate-900 divide-y divide-slate-100">
                                        <tr>
                                            <td className="px-6 py-6 uppercase tracking-tight">Orbit Site PRO Plan (1 Month)</td>
                                            <td className="px-6 py-6 text-right">Rp 99.000</td>
                                        </tr>
                                        <tr className="bg-slate-50/50">
                                            <td className="px-6 py-4 text-slate-400 font-black text-[9px] uppercase tracking-widest">Pajak (PPN 11%)</td>
                                            <td className="px-6 py-4 text-right font-medium">Rp 10.890</td>
                                        </tr>
                                    </tbody>
                                    <tfoot className="bg-blue-600 text-white">
                                        <tr>
                                            <th className="px-6 py-6 uppercase tracking-widest font-black text-[11px]">Total Pembayaran</th>
                                            <th className="px-6 py-6 text-right text-lg font-black">Rp 109.890</th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex gap-4 pt-4">
                                <Button 
                                    onClick={async () => {
                                        setIsDownloading(true);
                                        // Simulate PDF generation delay
                                        await new Promise(r => setTimeout(r, 2000));
                                        
                                        // Trigger Mock Download
                                        const content = `INVOICE #INV-928371\nAlexandra Quinn\nPlan: PRO\nTotal: Rp 109.890`;
                                        const blob = new Blob([content], { type: 'application/pdf' });
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.setAttribute('download', 'Invoice_INV-928371.pdf');
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                        
                                        setIsDownloading(false);
                                    }}
                                    disabled={isDownloading}
                                    className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest border-none shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isDownloading ? (
                                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                    )}
                                    {isDownloading ? 'Mengunduh...' : 'Cetak / Unduh PDF'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Simulated Error Toggle (For Demo) */}
            <div className="pt-10 border-t border-slate-100">
                <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-1">Demo Mode: Toggle Error Simulation</p>
                    <button 
                        onClick={() => setSimulateTimeout(!simulateTimeout)}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${simulateTimeout ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'}`}
                    >
                        {simulateTimeout ? 'Simulate Error: ON' : 'Simulate Error: OFF'}
                    </button>
                    <button onClick={fetchPlanData} className="text-primary font-black text-[9px] uppercase tracking-widest hover:underline">
                        Reload View
                    </button>
                </div>
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
