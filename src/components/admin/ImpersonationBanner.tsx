import React, { useState, useEffect } from 'react';
import { UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

export const ImpersonationBanner: React.FC = () => {
    const [impersonatedUser, setImpersonatedUser] = useState<string | null>(null);

    useEffect(() => {
        // Shared state simulation via localStorage
        const checkStorage = () => {
            const user = localStorage.getItem('impersonating_user');
            if (user) {
                try {
                    const parsed = JSON.parse(user);
                    setImpersonatedUser(parsed.name || parsed.username);
                } catch {
                    setImpersonatedUser(user);
                }
            } else {
                setImpersonatedUser(null);
            }
        };

        checkStorage();
        window.addEventListener('storage', checkStorage);
        // Custom event for internal state changes in the same tab
        window.addEventListener('impersonation-change', checkStorage);
        
        return () => {
            window.removeEventListener('storage', checkStorage);
            window.removeEventListener('impersonation-change', checkStorage);
            document.documentElement.style.setProperty('--banner-height', '0px');
        };
    }, []);

    useEffect(() => {
        if (impersonatedUser) {
            document.documentElement.style.setProperty('--banner-height', '44px');
        } else {
            document.documentElement.style.setProperty('--banner-height', '0px');
        }
    }, [impersonatedUser]);

    const handleExit = () => {
        localStorage.removeItem('impersonating_user');
        document.cookie = "impersonate_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setImpersonatedUser(null);
        window.dispatchEvent(new Event('impersonation-change'));
        window.location.href = '/admin/users';
    };

    if (!impersonatedUser) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[200] h-[44px] bg-amber-500 text-slate-900 px-6 py-2.5 shadow-lg border-b border-amber-600 animate-in slide-in-from-top duration-500 ">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                        <UserCircleIcon className="w-5 h-5" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest">
                        Mode Pengamatan: <span className="bg-slate-900 text-white px-2 py-0.5 rounded ml-1">{impersonatedUser}</span>
                    </p>
                </div>
                
                <button 
                    onClick={handleExit}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                >
                    <ArrowLeftOnRectangleIcon className="w-3.5 h-3.5" />
                    Exit Impersonation
                </button>
            </div>
        </div>
    );
};
