import React from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';

export const DomainSettingsDashboard = () => {
    return (
        <div className="flex-1 p-8 min-h-screen bg-[#F8FAFC]">
            <div className="max-w-5xl mx-auto">
                
                {/* Breadcrumbs (Moved from TopNav to internal page header for consistency) */}
                <div className="flex items-center gap-2 text-sm mb-6">
                    <a href="/settings" className="text-slate-500 hover:text-slate-800 transition-colors">Settings</a>
                    <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                    <span className="text-[#005ab4] font-bold">Custom Domain</span>
                </div>

                {/* Page Header */}
                <div className="mb-10">
                    <h2 className="text-3xl font-extrabold text-[#005ab4] tracking-tight mb-2">Custom Domain</h2>
                    <p className="text-slate-500 max-w-2xl leading-relaxed font-medium">Manage your brand identity by connecting a custom domain. These settings help your audience find your work easier.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        
                        {/* Subdomain Status Card */}
                        <Card className="p-8 shadow-[0px_20px_40px_rgba(16,27,50,0.06)] border-none">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-[#465f89]">language</span>
                                <h3 className="font-bold text-slate-800 tracking-tight">Default Subdomain</h3>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg mb-6 border border-slate-100">
                                <p className="text-sm font-bold text-[#005ab4] break-all">creatorname.tepak.id</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-bold text-emerald-600 tracking-wide uppercase">Active</span>
                            </div>
                        </Card>

                        {/* Decorative Branding Block */}
                        <div className="bg-[#0873df] p-8 rounded-2xl relative overflow-hidden text-white shadow-lg shadow-blue-500/20">
                            <div className="relative z-10">
                                <h4 className="text-lg font-bold mb-2">Elevate Your Branding</h4>
                                <p className="text-sm text-blue-100 leading-relaxed font-medium">Use a custom domain to look more professional to clients and collaborators.</p>
                            </div>
                            <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                                <span className="material-symbols-outlined text-[120px]">verified</span>
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        
                        {/* Custom Domain Config Card */}
                        <Card className="p-8 shadow-[0px_20px_40px_rgba(16,27,50,0.06)] border-none">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-[#005ab4] tracking-tight mb-1">Connect New Domain</h3>
                                    <p className="text-sm text-slate-500 font-medium">Follow the steps below to connect your domain.</p>
                                </div>
                                <Badge className="bg-[#465f89]/10 text-[#465f89]">Configuration</Badge>
                            </div>
                            
                            <div className="space-y-8">
                                {/* Input Step */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-slate-600">Domain Name</label>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <Input type="text" placeholder="my-store.com" />
                                        </div>
                                        <Button className="bg-[#465f89] hover:bg-[#344d77] text-white px-6 font-bold shadow-sm rounded-xl">Save</Button>
                                    </div>
                                </div>

                                {/* DNS Settings Instruction */}
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                                    <h4 className="text-sm font-bold text-[#005ab4] mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base">dns</span>
                                        DNS Settings
                                    </h4>
                                    
                                    <div className="overflow-x-auto bg-white border border-slate-100 rounded-lg">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead className="font-bold text-slate-500">Type</TableHead>
                                                    <TableHead className="font-bold text-slate-500">Name/Host</TableHead>
                                                    <TableHead className="font-bold text-slate-500">Value</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow className="hover:bg-white bg-white">
                                                    <TableCell className="font-bold text-slate-800">CNAME</TableCell>
                                                    <TableCell className="font-medium text-slate-700">@ or www</TableCell>
                                                    <TableCell className="font-mono text-[#465f89] font-bold">custom.tepak.id</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                                    <p className="text-xs text-slate-500 italic font-medium">DNS propagation may take up to 24-48 hours.</p>
                                    <Button variant="secondary" className="flex items-center gap-2 bg-[#465f89] hover:bg-[#344d77] text-white px-6 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-transform rounded-xl">
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                        Check Verification
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Active Custom Domain Card */}
                        <Card className="p-8 shadow-[0px_20px_40px_rgba(16,27,50,0.06)] border-none">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-emerald-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#005ab4] tracking-tight">my-store.com</h3>
                                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></span>
                                                Active
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="flex items-center gap-1 text-xs font-bold text-[#465f89]">
                                                <span className="material-symbols-outlined text-[14px]">lock</span>
                                                SSL Secured
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 hover:border-red-300 transition-all shrink-0 active:scale-95">
                                    <span className="material-symbols-outlined text-base">delete</span>
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
