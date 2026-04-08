import React from 'react';
import Button from '../ui/Button';
import { Card } from '../ui/Card';

export const BannedView = () => {
    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6 font-sans">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_#fff,_#f8f9ff)] -z-10"></div>
            
            <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Card className="p-0 border-error/20 shadow-[0px_40px_80px_rgba(186,26,26,0.08)] overflow-hidden bg-white">
                    {/* Urgency Stripe */}
                    <div className="h-2 bg-error w-full"></div>
                    
                    <div className="p-10 md:p-14 text-center">
                        {/* ICON */}
                        <div className="flex justify-center mb-8">
                            <div className="w-20 h-20 bg-error/5 rounded-full flex items-center justify-center text-error border border-error/10">
                                <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                            </div>
                        </div>

                        {/* TEXT CONTENT */}
                        <h1 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight mb-4">Access Restricted</h1>
                        <p className="text-error font-bold uppercase tracking-[0.2em] text-[10px] bg-error/5 px-4 py-1.5 rounded-full border border-error/10 inline-block mb-10">
                            Enforcement Action Taken
                        </p>

                        <div className="space-y-6 mb-12">
                            <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/30 text-left">
                                <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Suspension Case</h3>
                                <p className="text-on-surface font-medium leading-relaxed">
                                    Your account has been <span className="text-error font-black underline underline-offset-4 decoration-error/30">Permanently Banned</span> due to repeated violations of our community guidelines.
                                </p>
                            </div>

                            <div className="bg-primary/5 p-6 rounded-2xl border border-dashed border-primary/20 flex flex-col items-center">
                                <p className="text-on-surface-variant text-sm mb-4">Think this decision was made in error?</p>
                                <Button variant="primary" className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95">
                                    Ajukan Banding Sekarang
                                </Button>
                            </div>
                        </div>

                        {/* SECONDARY ACTIONS */}
                        <div className="flex flex-col gap-3">
                            <button className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-lg">mail</span>
                                Contact Global Support
                            </button>
                            <button className="text-xs font-bold text-slate-400 hover:text-error transition-colors mt-2">
                                Logout and Exit
                            </button>
                        </div>
                    </div>
                </Card>

                {/* FOOTER */}
                <div className="mt-12 flex justify-between items-center px-4 opacity-40">
                    <span className="text-xl font-black text-on-surface tracking-tighter">tepak.id</span>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Case ID: #TK-BAN-9102</span>
                </div>
            </div>
        </div>
    );
};
