import React, { useEffect, useState } from 'react';
import { 
    BookOpenIcon, 
    PlayCircleIcon, 
    DocumentTextIcon, 
    VideoCameraSlashIcon, 
    LockClosedIcon,
    ShieldExclamationIcon
} from '@heroicons/react/24/outline';

interface ContentViewerProps {
    title: string;
    type: 'ebook' | 'video' | 'article';
    content: string; // Could be HTML string, video URL, etc.
    buyerEmail?: string; // For watermarking
}

export const ContentViewer: React.FC<ContentViewerProps> = ({ 
    title, type, content, buyerEmail = "user@example.com" 
}) => {
    const [protectToast, setProtectToast] = useState(false);
    
    useEffect(() => {
        // PREVENT RIGHT CLICK
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // PREVENT SPECIFIC SHORTCUTS (Ctrl+S, Ctrl+P, Ctrl+C)
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'c' || e.key === 'u')) {
                e.preventDefault();
                setProtectToast(true);
                setTimeout(() => setProtectToast(false), 3000);
            }
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="relative min-h-[70vh] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden select-none">

            {/* Content Protection Toast */}
            {protectToast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 bg-slate-900/90 backdrop-blur-sm text-white rounded-2xl shadow-2xl text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top duration-200">
                    <ShieldExclamationIcon className="w-4 h-4 text-amber-400 shrink-0" />
                    Proteksi Konten Aktif — Fitur ini dinonaktifkan untuk melindungi hak cipta kreator.
                </div>
            )}
            
            {/* PRINT PROTECTION CSS */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body { display: none !important; }
                    .no-print { display: none !important; }
                }
                .protected-content {
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                }
            `}} />

            {/* WATERMARK OVERLAY (Subtle) */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-[0.03] select-none flex flex-wrap gap-20 p-10 rotate-12">
                {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className="text-xl font-bold whitespace-nowrap uppercase tracking-widest">
                        {buyerEmail} • PROTECTED BY TEPAK.ID
                    </span>
                ))}
            </div>

            {/* VIEWER HEADER */}
            <header className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        {type === 'ebook' && <BookOpenIcon className="w-6 h-6" />}
                        {type === 'video' && <PlayCircleIcon className="w-6 h-6" />}
                        {type === 'article' && <DocumentTextIcon className="w-6 h-6" />}
                    </div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">{title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-widest">
                        Secure Mode Active
                    </span>
                </div>
            </header>

            {/* CONTENT AREA */}
            <div className="p-8 md:p-12 protected-content relative z-0">
                {type === 'ebook' || type === 'article' ? (
                    <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase prose-p:text-slate-500 prose-p:leading-relaxed text-lg" 
                        dangerouslySetInnerHTML={{ __html: content }} 
                    />
                ) : type === 'video' ? (
                    <div className="aspect-video bg-slate-900 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl border border-white/5">
                        {/* Static Placeholder for Video - In real app, use HLS player */}
                        <div className="text-center text-white/20 space-y-6">
                            <VideoCameraSlashIcon className="w-20 h-20 mx-auto opacity-50" />
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase tracking-widest text-white/40">Secure Streaming Active</p>
                                <p className="text-[10px] font-medium text-white/20 uppercase tracking-[0.2em]">Encrypted Data Stream • Do not record</p>
                            </div>
                            <button className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">Start Streaming</button>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* FOOTER PROTECTION NOTICE */}
            <footer className="px-8 py-4 bg-slate-50/50 border-t border-slate-50 flex justify-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                    <LockClosedIcon className="w-3.5 h-3.5" />
                    ENCRYPTED ACCESS ONLY • TEPAK.ID ECOSYSTEM
                </p>
            </footer>

        </div>
    );
};

export default ContentViewer;
