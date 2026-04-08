import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { 
    Squares2X2Icon, 
    WindowIcon, 
    WalletIcon, 
    Bars3Icon,
    XMarkIcon,
    ArchiveBoxIcon,
    DocumentTextIcon,
    UsersIcon,
    AcademicCapIcon,
    Cog6ToothIcon,
    CurrencyDollarIcon,
    TicketIcon
} from '@heroicons/react/24/outline';

interface BottomNavItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    href?: string;
    onClick?: (e: React.MouseEvent) => void;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({ icon: Icon, label, active, href = "#", onClick }) => (
    <a 
        href={onClick ? undefined : href}
        onClick={onClick}
        className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all relative py-2 font-['Plus_Jakarta_Sans',sans-serif] cursor-pointer",
            active ? "text-primary scale-105" : "text-slate-400 hover:text-slate-600"
        )}
    >
        <Icon className={cn("w-6 h-6 transition-transform", active && "stroke-[2.5px]")} />
        <span className="text-[9px] font-black uppercase tracking-widest leading-none">{label}</span>
        {active && (
            <span className="absolute -top-1 w-8 h-1 bg-primary rounded-full shadow-lg shadow-primary/40 animate-in zoom-in-50"></span>
        )}
    </a>
);

interface BottomNavbarProps {
    activePage?: string;
    variant?: 'creator' | 'admin';
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ 
    activePage = 'dashboard',
    variant = 'creator'
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsMenuOpen(!isMenuOpen);
    };

    // Configuration for Creator Variant
    const creatorConfig = {
        main: [
            { icon: Squares2X2Icon, label: "Home", href: "/dashboard", id: "dashboard" },
            { icon: WindowIcon, label: "Editor", href: "/editor", id: "editor" },
            { icon: WalletIcon, label: "Wallet", href: "/wallet", id: "wallet" },
        ],
        more: [
            { icon: ArchiveBoxIcon, label: "Products", href: "/products", id: "products" },
            { icon: DocumentTextIcon, label: "Orders", href: "/orders", id: "orders" },
            { icon: UsersIcon, label: "Customers", href: "/customers", id: "customers" },
            { icon: AcademicCapIcon, label: "Academy", href: "/academy", id: "academy" },
            { icon: Cog6ToothIcon, label: "Settings", href: "/settings", id: "settings" },
        ]
    };

    // Configuration for Admin Variant
    const adminConfig = {
        main: [
            { icon: Squares2X2Icon, label: "Home", href: "/admin", id: "dashboard" },
            { icon: UsersIcon, label: "Users", href: "/admin/users", id: "users" },
            { icon: CurrencyDollarIcon, label: "Payouts", href: "/admin/payouts", id: "payouts" },
        ],
        more: [
            { icon: TicketIcon, label: "Plans", href: "/admin/plans", id: "plans" },
            { icon: AcademicCapIcon, label: "Tutorials", href: "/admin/tutorials", id: "tutorials" },
            { icon: Cog6ToothIcon, label: "Settings", href: "/admin/general-settings", id: "settings" },
        ]
    };

    const config = variant === 'admin' ? adminConfig : creatorConfig;

    return (
        <>
            {/* "More" Menu Overlay */}
            <div 
                className={cn(
                    "fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-all duration-300",
                    isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsMenuOpen(false)}
            >
                <div 
                    className={cn(
                        "absolute bottom-20 left-4 right-4 bg-white rounded-[2.5rem] p-8 shadow-2xl border border-white transition-all duration-500 transform",
                        isMenuOpen ? "translate-y-0 scale-100" : "translate-y-10 scale-95"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">More Navigation</h3>
                        <button 
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className={cn(
                        "grid gap-6",
                        config.more.length > 3 ? "grid-cols-3" : "grid-cols-2"
                    )}>
                        {config.more.map((link) => (
                            <a 
                                key={link.id}
                                href={link.href}
                                className={cn(
                                    "flex flex-col items-center gap-3 p-4 rounded-2xl transition-all group",
                                    activePage === link.id ? "bg-primary/5 text-primary" : "hover:bg-slate-50 text-slate-400 hover:text-slate-900"
                                )}
                            >
                                <div className={cn(
                                    "p-3 rounded-xl transition-all duration-300",
                                    activePage === link.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-50 group-hover:bg-white group-hover:shadow-md"
                                )}>
                                    <link.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight text-center">{link.label}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Bottom Navbar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-white/90 backdrop-blur-xl border-t border-white shadow-[0_-8px_30px_rgb(0,0,0,0.12)] rounded-t-[2.5rem] font-['Plus_Jakarta_Sans',sans-serif] flex-shrink-0">
                {config.main.map((item) => (
                    <BottomNavItem 
                        key={item.id}
                        icon={item.icon} 
                        label={item.label} 
                        href={item.href} 
                        active={activePage === item.id} 
                    />
                ))}
                <BottomNavItem 
                    icon={isMenuOpen ? XMarkIcon : Bars3Icon} 
                    label="More" 
                    onClick={toggleMenu}
                    active={isMenuOpen}
                />
            </nav>
        </>
    );
};

export default BottomNavbar;
