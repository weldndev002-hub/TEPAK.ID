import React from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { 
    ChevronRightIcon, 
    LanguageIcon, 
    CheckBadgeIcon, 
    ServerStackIcon, 
    CheckCircleIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

export const DomainSettingsDashboard = () => {
    return (
        <div className="flex-1 p-8 min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="max-w-5xl mx-auto">
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[10px] mb-8 font-black uppercase tracking-widest">
                    <a href="/settings" className="text-slate-400 hover:text-primary transition-colors">Settings</a>
                    <ChevronRightIcon className="w-3 h-3 text-slate-300" />
                    <span className="text-primary">Custom Domain</span>
                </div>

                {/* Page Header */}
                <div className="mb-12">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Brand Identity</span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Custom Domain</h2>
                    <p className="text-slate-500 max-w-2xl leading-relaxed font-medium mt-2">Manage your brand identity by connecting a custom domain. These settings help your audience find your work easier.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        
                        {/* Subdomain Status Card */}
                        <Card className="p-8 shadow-sm border-slate-100 rounded-3xl">
                            <div className="flex items-center gap-3 mb-6">
                                <LanguageIcon className="w-5 h-5 text-primary" />
                                <h3 className="font-black text-slate-900 tracking-tight uppercase text-sm">Default Subdomain</h3>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
                                <p className="text-[11px] font-black text-primary break-all uppercase tracking-tight">creatorname.tepak.id</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Active</span>
                            </div>
                        </Card>

                        {/* Decorative Branding Block */}
                        <div className="bg-slate-900 p-8 rounded-3xl relative overflow-hidden text-white shadow-sm">
                            <div className="relative z-10">
                                <h4 className="text-lg font-black mb-2 uppercase tracking-tight leading-tight">Elevate Your Branding</h4>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">Use a custom domain to look more professional to clients and collaborators.</p>
                            </div>
                            <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                                <CheckBadgeIcon className="w-32 h-32" />
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        
                        {/* Custom Domain Config Card */}
                        <Card className="p-8 shadow-sm border-slate-100 rounded-3xl">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1 uppercase">Connect New Domain</h3>
                                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Follow the steps below to connect your domain.</p>
                                </div>
                                <Badge variant="pro">Configuration</Badge>
                            </div>
                            
                            <div className="space-y-8">
                                {/* Input Step */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Domain Name</label>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <Input type="text" placeholder="my-store.com" className="rounded-xl border-slate-100 uppercase text-xs font-black tracking-tight" />
                                        </div>
                                        <Button variant="primary" className="px-8 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 rounded-xl">Save</Button>
                                    </div>
                                </div>

                                {/* DNS Settings Instruction */}
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                                    <h4 className="text-[11px] font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
                                        <ServerStackIcon className="w-4 h-4 text-primary" />
                                        DNS Settings
                                    </h4>
                                    
                                    <div className="overflow-x-auto bg-white border border-slate-50 rounded-xl overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-widest px-6">Type</TableHead>
                                                    <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-widest px-6">Name/Host</TableHead>
                                                    <TableHead className="font-black text-[10px] text-slate-400 uppercase tracking-widest px-6">Value</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow className="hover:bg-white bg-white">
                                                    <TableCell className="font-black text-[11px] text-slate-900 px-6 uppercase tracking-tight">CNAME</TableCell>
                                                    <TableCell className="font-black text-[11px] text-slate-900 px-6 uppercase tracking-tight">@ or www</TableCell>
                                                    <TableCell className="font-black text-[11px] text-primary px-6 uppercase tracking-tight">custom.tepak.id</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-slate-50">
                                    <p className="text-[10px] text-slate-400 italic font-medium uppercase tracking-tight">DNS propagation may take up to 24-48 hours.</p>
                                    <Button variant="outline" className="flex items-center gap-2 px-8 py-3 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border-slate-100">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        Check Verification
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Active Custom Domain Card */}
                        <Card className="p-8 shadow-sm border-slate-100 rounded-3xl">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 text-emerald-500">
                                        <ShieldCheckIcon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">my-store.com</h3>
                                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                                            <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                Active
                                            </span>
                                            <span className="text-slate-100">•</span>
                                            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <LockClosedIcon className="w-3.5 h-3.5" />
                                                SSL Secured
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shrink-0 active:scale-95">
                                    <TrashIcon className="w-4 h-4" />
                                    Delete Domain
                                </Button>
                            </div>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    );
};

