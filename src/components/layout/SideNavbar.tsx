import React from 'react';
import Button from '../ui/Button';

export const SideNavbar: React.FC = () => {
    return (
        <aside className="flex flex-col h-screen fixed left-0 top-0 z-50 w-72 bg-[#1e2939] text-white font-sans tracking-tight antialiased">
            <div className="p-8 flex flex-col items-start space-y-2">
                <div className="text-2xl font-bold text-white tracking-widest">Tepak.id</div>
                <p className="text-slate-400 text-xs font-medium tracking-wider uppercase">The Digital Architect</p>
            </div>
            
            <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto no-scrollbar">
                <a className="flex items-center space-x-3 p-3 rounded-lg text-amber-500 font-bold border-r-4 border-amber-500 bg-slate-800/50 transition-all duration-200" href="#">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>dashboard</span>
                    <span>Dashboard</span>
                </a>
                <a className="flex items-center space-x-3 p-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200" href="#">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>account_balance_wallet</span>
                    <span>Wallet</span>
                </a>
                <a className="flex items-center space-x-3 p-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200" href="#">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>language</span>
                    <span>Domain Status</span>
                </a>
                <a className="flex items-center space-x-3 p-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200" href="#">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>assignment</span>
                    <span>Plan Manager</span>
                </a>
                <a className="flex items-center space-x-3 p-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200" href="#">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>monitoring</span>
                    <span>Analytics</span>
                </a>
                <a className="flex items-center space-x-3 p-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200" href="#">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>settings</span>
                    <span>Settings</span>
                </a>
            </nav>
            
            <div className="p-4 space-y-4 mb-4">
                <Button variant="amber" className="w-full flex items-center justify-center space-x-2 py-3">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>rocket</span>
                    <span>Upgrade Plan</span>
                </Button>
                <a className="flex items-center justify-center space-x-3 p-3 rounded-lg text-slate-400 hover:text-white transition-colors" href="#">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>help</span>
                    <span className="text-sm font-medium">Help Center</span>
                </a>
            </div>
        </aside>
    );
};

export default SideNavbar;
