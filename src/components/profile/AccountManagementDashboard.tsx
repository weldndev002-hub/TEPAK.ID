import React, { useState } from 'react';
import { Card } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { 
    ArrowLeftIcon, 
    TrashIcon, 
    CheckCircleIcon, 
    LockClosedIcon, 
    EyeSlashIcon, 
    EyeIcon, 
    ShieldCheckIcon, 
    ExclamationTriangleIcon, 
    CreditCardIcon, 
    InformationCircleIcon 
} from '@heroicons/react/24/solid';
import { 
    ArrowLeftIcon as ArrowLeftIconOutline,
    LockClosedIcon as LockClosedIconOutline,
    CreditCardIcon as CreditCardIconOutline
} from '@heroicons/react/24/outline';

export const AccountManagementDashboard = () => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="max-w-7xl w-full mx-auto space-y-12 ">
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                    <a href="/settings" className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:shadow-sm">
                        <ArrowLeftIconOutline className="w-5 h-5" />
                    </a>
                </div>
                <h2 className="text-4xl font-black tracking-tighter mb-2 text-slate-900 uppercase">Account Management</h2>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none">Control your digital presence and data footprint on our platform.</p>
            </div>

            {/* Two States Side-by-Side Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* State 5A: Akun Standard */}
                <Card className="flex flex-col border-none rounded-[3rem] shadow-sm overflow-hidden bg-white">
                    <div className="bg-rose-50 p-10 border-b border-rose-100/50">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-rose-100 rounded-[1.5rem] flex items-center justify-center text-rose-600 shadow-sm">
                                <TrashIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">Permanent Termination</h3>
                                <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest mt-1">Status: Standard Access</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-10 space-y-10 flex-1">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Critical Warnings</p>
                            <div className="bg-rose-50/30 border-l-[6px] border-rose-500 p-8 rounded-2xl">
                                <p className="text-rose-600 font-black text-xs uppercase tracking-widest mb-4">The following assets will be purged:</p>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-4 text-rose-600 text-[11px] font-black uppercase tracking-tight">
                                        <CheckCircleIcon className="w-5 h-5 opacity-40" />
                                        All generated pages & content
                                    </li>
                                    <li className="flex items-center gap-4 text-rose-600 text-[11px] font-black uppercase tracking-tight">
                                        <CheckCircleIcon className="w-5 h-5 opacity-40" />
                                        Analytics & Statistical History
                                    </li>
                                    <li className="flex items-center gap-4 text-rose-600 text-[11px] font-black uppercase tracking-tight">
                                        <CheckCircleIcon className="w-5 h-5 opacity-40" />
                                        Profile Data & System Preferences
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Security Confirmation</label>
                                <Input 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="Verify with your password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-16 rounded-2xl bg-slate-50 border-slate-100 font-black"
                                    iconRight={
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-300 hover:text-primary transition-colors p-2">
                                            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                        </button>
                                    }
                                />
                            </div>

                            <div className="pt-4 flex flex-col gap-4">
                                <button className="w-full h-16 bg-rose-600 text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl shadow-xl shadow-rose-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    Terminate Account Permanently
                                </button>
                                <a href="/settings" className="w-full py-4 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">
                                    Cancel & Return To Control Panel
                                </a>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* State 5B: Akun PRO */}
                <Card className="flex flex-col border-none rounded-[3rem] shadow-sm overflow-hidden bg-white">
                    <div className="bg-slate-50 p-10 border-b border-slate-100">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm">
                                <LockClosedIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">Deletion Restricted</h3>
                                <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Status: Active Pro Member</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-10 flex flex-col items-center justify-center flex-1 text-center space-y-8">
                        <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center relative shadow-inner">
                            <ShieldCheckIcon className="w-16 h-16 text-slate-200" />
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                                <ExclamationTriangleIcon className="w-5 h-5" />
                            </div>
                        </div>
                        
                        <div className="max-w-xs space-y-4">
                            <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Security Lock Active</h4>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
                                You currently have an active Pro subscription. Subscription must be terminated via the Billing Hub before account deletion can proceed.
                            </p>
                        </div>
                        
                        <div className="w-full space-y-6 pt-6 px-10">
                            <button className="w-full h-16 border-2 border-primary text-primary font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                <CreditCardIconOutline className="w-5 h-5" />
                                Disconnect Pro Billing
                            </button>
                            
                            <div className="relative group">
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest px-6 py-3 rounded-xl whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 pointer-events-none z-10 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-slate-900">
                                    Restriction: Pro Membership Active
                                </div>
                                <button className="w-full h-16 bg-slate-50 text-slate-300 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl cursor-not-allowed opacity-50" disabled>
                                    Purge Account
                                </button>
                            </div>
                            
                            <a href="/settings" className="block w-full py-4 text-slate-300 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">
                                Return To Safety
                            </a>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Additional Help Section */}
            <div className="mt-16 bg-white rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between border border-slate-100 shadow-sm gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                        <InformationCircleIcon className="w-7 h-7" />
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">System Assistance Required?</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Our resolution protocols are available 24/7 if you encounter infrastructure issues.</p>
                    </div>
                </div>
                <Button variant="primary" className="whitespace-nowrap h-14 rounded-2xl px-10 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20">
                    Consult Support
                </Button>
            </div>
        </div>
    );
};

