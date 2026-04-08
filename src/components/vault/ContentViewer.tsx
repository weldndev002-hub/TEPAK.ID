import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';

interface ContentViewerProps {
    title: string;
    type: 'ebook' | 'video' | 'article';
    content: string; // Could be HTML string, video URL, etc.
    buyerEmail?: string; // For watermarking
}

export const ContentViewer: React.FC<ContentViewerProps> = ({ 
    title, type, content, buyerEmail = "user@example.com" 
}) => {
    
    useEffect(() => {
        // PREVENT RIGHT CLICK
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // PREVENT SPECIFIC SHORTCUTS (Ctrl+S, Ctrl+P, Ctrl+C)
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'c' || e.key === 'u')) {
                e.preventDefault();
                alert("Proteksi Konten: Fitur ini dinonaktifkan untuk melindungi hak cipta kreator.");
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
                    <span key={i} className="text-xl font-bold whitespace-nowrap">
                        {buyerEmail} • PROTECTED BY TEPAK.ID
                    </span>
                ))}
            </div>

            {/* VIEWER HEADER */}
            <header className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">
                            {type === 'ebook' ? 'book' : type === 'video' ? 'play_circle' : 'article'}
                        </span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-widest">
                        Mode Aman Aktif
                    </span>
                </div>
            </header>

            {/* CONTENT AREA */}
            <div className="p-8 md:p-12 protected-content relative z-0">
                {type === 'ebook' || type === 'article' ? (
                    <div className="prose prose-slate max-w-none prose-headings:text-primary prose-p:text-slate-600 prose-p:leading-relaxed text-lg" 
                        dangerouslySetInnerHTML={{ __html: content }} 
                    />
                ) : type === 'video' ? (
                    <div className="aspect-video bg-black rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl">
                        {/* Static Placeholder for Video - In real app, use HLS player */}
                        <div className="text-center text-white/40 space-y-4">
                            <span className="material-symbols-outlined text-6xl">videocam_off</span>
                            <p className="text-sm font-medium">Video Player Terproteksi Aktif</p>
                            <button className="px-6 py-2 bg-primary text-white rounded-full font-bold text-xs">Mulai Streaming</button>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* FOOTER PROTECTION NOTICE */}
            <footer className="px-8 py-4 bg-slate-50/50 border-t border-slate-50 flex justify-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    ENCRYPTED ACCESS ONLY • TEPAK.ID ECOSYSTEM
                </p>
            </footer>

        </div>
    );
};

export default ContentViewer;
