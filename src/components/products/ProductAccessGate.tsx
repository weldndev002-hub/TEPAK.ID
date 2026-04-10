import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ShieldExclamationIcon, ArrowPathIcon, DocumentMagnifyingGlassIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

export const ProductAccessGate = () => {
    const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
    const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

    // Mock Authorized Data
    const VALID_EMAIL = "pembeli@mail.com";
    const VALID_TOKEN = "tepak_secure_token_123";

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setSearchParams(params);
        
        const email = params.get('email');
        const token = params.get('token');

        const timer = setTimeout(() => {
            if (email === VALID_EMAIL && token === VALID_TOKEN) {
                setStatus('authorized');
            } else {
                setStatus('unauthorized');
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 ">
                <div className="text-center space-y-4">
                    <ArrowPathIcon className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Verifying Access...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthorized') {
        return (
            <div className="min-h-screen bg-[#FFF5F5] flex flex-col items-center justify-center p-8 ">
                <Card className="max-w-md w-full p-10 text-center space-y-6 shadow-2xl shadow-rose-200/50 border-rose-100 rounded-[2.5rem]">
                    <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
                        <ShieldExclamationIcon className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Access Denied</h2>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                            Anda tidak bisa mengakses tautan. Silahkan hubungi kreator.
                        </p>
                    </div>
                    <div className="pt-4 flex flex-col gap-3">
                        <Button variant="outline" className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border-slate-200">
                            Back to Home
                        </Button>
                        <Button className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-600">
                            Contact Support
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col ">
            {/* Secures Header */}
            <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <DocumentMagnifyingGlassIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-black text-sm uppercase tracking-tight">Mastering UI Design Guide.pdf</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.15em] flex items-center gap-1">
                                <LockClosedIcon className="w-3 h-3" /> Encrypted Access
                            </span>
                            <span className="text-white/20 text-[9px]">•</span>
                            <span className="text-[9px] font-medium text-white/40 uppercase tracking-widest italic">{VALID_EMAIL}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-white/40 hover:text-white transition-colors">
                        <ArrowPathIcon className="w-5 h-5" />
                    </button>
                    <Button variant="primary" className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        Download Original
                    </Button>
                </div>
            </header>

            {/* PDF Viewer Area */}
            <main className="flex-1 relative overflow-hidden bg-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Simulated PDF Viewer */}
                    <div className="w-full h-full max-w-5xl mx-auto shadow-2xl bg-white m-8 rounded-lg overflow-hidden flex flex-col">
                        <iframe 
                            src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" 
                            className="w-full h-full border-none"
                            title="Product Viewer"
                        />
                    </div>
                </div>
            </main>
            
            {/* Floating Security Banner */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 text-white hover:bg-white/20 transition-all cursor-default select-none shadow-2xl">
                <ShieldExclamationIcon className="w-4 h-4 text-emerald-400" />
                <p className="text-[9px] font-black uppercase tracking-widest opacity-80">This document is protected with Dynamic Watermark & Forensic Tracking</p>
            </div>
        </div>
    );
};
