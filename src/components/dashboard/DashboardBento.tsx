import React from 'react';
import Button from '../ui/Button';

export const DashboardBento: React.FC = () => {
    return (
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            {/* WELCOME BANNER */}
            <div className="md:col-span-8 relative h-80 rounded-[3rem] overflow-hidden bg-slate-900 group shadow-2xl shadow-slate-900/10">
                {/* BACKGROUND IMAGE WITH OVERLAY */}
                <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
                    <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFCq2A7bQ2uHynsM-2n8adCyhLcl5z6SwptunCfPK5jLw4KtJhoKrgRpIyza6sXt9mbZlHC-stdHUehyk1jI1xW76TSapDpEZiXODo6MR-8BVaKcBVvdijfe6p4krp-LxmggZj0kofcrs4tMeLkqKAZxt3T6OsoPvvKoB9N56_mrNZlpTfC_xQffpiQL1YikNl8P5luEJe3RrSqDgXUcuzCZagkpcV_-JF8aTDKqzNHBZz6cLW0BsZl3Twjfxp2PWNt1RbPhF8WeyM" 
                        alt="Abstract Background" 
                        className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[2s]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/50 to-transparent" />
                </div>
                
                {/* CONTENT */}
                <div className="relative z-10 h-full flex flex-col justify-center px-12 space-y-4">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Creator Dashboard</span>
                        <h2 className="text-4xl font-black text-white tracking-tighter">Halo, Sinta 👋</h2>
                    </div>
                    <p className="text-slate-300 text-sm font-medium max-w-sm leading-relaxed">
                        Profil <span className="text-white font-black underline decoration-blue-500 underline-offset-4">tepak.id/sinta</span> Anda naik 15% dari minggu lalu. Lanjutkan kreativitas Anda!
                    </p>
                    <div className="pt-4">
                        <Button variant="primary" className="bg-blue-600 hover:bg-blue-500 text-white border-none px-8 py-4 rounded-2xl text-[11px] uppercase font-black tracking-widest shadow-xl shadow-blue-500/20">
                            Lihat Profil Live
                        </Button>
                    </div>
                </div>

                {/* DECORATIVE ICON */}
                <div className="absolute right-12 bottom-0 w-64 h-64 opacity-10 pointer-events-none translate-y-20">
                    <span className="material-symbols-outlined text-[15rem] text-white">auto_awesome</span>
                </div>
            </div>

            {/* WALLET / QUICK STATS CARD */}
            <div className="md:col-span-4 bg-white rounded-[3rem] p-10 border border-slate-50 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-500 relative overflow-hidden group">
                <div className="relative z-10">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 block">Saldo Tersedia</span>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Rp 4.250.000</h3>
                    
                    <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-wider bg-emerald-50 w-fit px-3 py-1 rounded-full">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        +12% Bulan ini
                    </div>
                </div>

                <div className="mt-12 relative z-10">
                    <Button variant="outline" className="w-full py-5 rounded-3xl group-hover:bg-primary transition-all duration-300 text-[11px] uppercase font-black tracking-widest border-2 border-slate-100 group-hover:border-primary group-hover:text-white">
                        <span className="material-symbols-outlined text-lg">payments</span>
                        Tarik Saldo
                    </Button>
                </div>

                {/* BACKGROUND ELEMENT */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />
            </div>
        </section>
    );
};

export default DashboardBento;
