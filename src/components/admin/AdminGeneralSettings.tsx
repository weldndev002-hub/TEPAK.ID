import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import AvatarUpload from '../ui/AvatarUpload';
import { Toggle } from '../ui/Toggle';
import { z } from 'zod';

const feeSchema = z.number().min(0, "Fee tidak boleh negatif").max(100, "Fee tidak boleh lebih dari 100%");

export const AdminGeneralSettings = () => {
    const [platformFee, setPlatformFee] = React.useState(5);
    const [feeError, setFeeError] = React.useState<string | null>(null);

    const handleSave = () => {
        try {
            feeSchema.parse(platformFee);
            setFeeError(null);
            alert(`Platform Fee diperbarui menjadi ${platformFee}%. Berlaku untuk semua transaksi baru.`);
        } catch (err: any) {
            setFeeError(err.errors[0].message);
        }
    };

    return (
        <div className="w-full">
            {/* Breadcrumb & Sub Nav */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00458d] tracking-widest uppercase mb-4">
                    <span>Platform Settings</span>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-[#465f89]">General Settings</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-3xl font-extrabold text-[#005ab4] tracking-tight">General Settings</h2>
                    <div className="flex gap-3">
                        <Button variant="ghost" className="bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all text-sm font-semibold border-transparent">
                            Discard Changes
                        </Button>
                        <Button onClick={handleSave} variant="primary" className="bg-[#465f89] text-white hover:shadow-lg hover:shadow-[#465f89]/20 transition-all text-sm font-semibold shadow-sm">
                            Save Changes
                        </Button>
                    </div>
                </div>

                {/* Internal Sub-Navigation */}
                <div className="flex overflow-x-auto no-scrollbar gap-8 mt-8 border-b border-slate-200">
                    <button className="pb-4 text-sm font-bold text-[#465f89] relative whitespace-nowrap">
                        General Settings
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-[#465f89] rounded-t-full"></span>
                    </button>
                    {/* Hide unused items for now as per request */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form Section */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Site Identity Card */}
                    <Card className="p-8 border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-[#d6e3ff] rounded-lg flex items-center justify-center text-[#465f89]">
                                <span className="material-symbols-outlined">branding_watermark</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#005ab4]">Branding & Identity</h3>
                                <p className="text-sm text-slate-500">How the platform appears to your creators and customers.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Platform Name</label>
                                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#465f89] outline-none transition-all font-semibold" type="text" defaultValue="Orbit Site" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Slogan / Tagline</label>
                                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#465f89] outline-none transition-all font-semibold" type="text" defaultValue="The Digital Hub for Creators" />
                                </div>
                            </div>
                            
                            <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider block">Official Logo</label>
                                    <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 relative group cursor-pointer overflow-hidden">
                                        <div className="text-2xl font-black text-blue-600">Orbit</div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white">upload</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">PNG or SVG, Min 256x256px</p>
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                     <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Favicon</label>
                                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                            <div className="w-8 h-8 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm">O</div>
                                            <div className="flex-1 text-xs text-slate-500 font-medium truncate">favicon-official_orbit.ico</div>
                                            <Button variant="ghost" className="text-xs h-8 px-3">Change</Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Primary System Theme</label>
                                        <div className="flex gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[#005ab4] cursor-pointer ring-2 ring-offset-2 ring-[#005ab4]"></div>
                                            <div className="w-8 h-8 rounded-full bg-[#465f89] cursor-pointer"></div>
                                            <div className="w-8 h-8 rounded-full bg-[#7e5300] cursor-pointer"></div>
                                            <div className="w-8 h-8 rounded-full bg-slate-900 cursor-pointer"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Support & Contact Card */}
                    <Card className="p-8 border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-[#ffddb2] rounded-lg flex items-center justify-center text-[#7e5300]">
                                <span className="material-symbols-outlined">headset_mic</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#005ab4]">Contact & Support</h3>
                                <p className="text-sm text-slate-500">Channels for creator support and system inquiries.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Support Email Address</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
                                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#465f89] outline-none transition-all font-semibold" type="email" defaultValue="support@orbitsite.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">WhatsApp Support Number</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">chat</span>
                                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#465f89] outline-none transition-all font-semibold" type="text" defaultValue="+62 812 3456 7890" />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-[#00458d] uppercase tracking-wider">Physical Office Address</label>
                                <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#465f89] outline-none transition-all font-semibold h-24 resize-none" defaultValue="Studio Nusantara Hub, 4th Floor, Jl. Sudirman No. 12, Jakarta" />
                            </div>
                        </div>
                    </Card>

                    {/* Fees & Commission Card */}
                    <Card className="p-8 border-slate-100 shadow-xl shadow-blue-500/5 bg-blue-50/20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[#005ab4] uppercase tracking-tight">Platform Fee Management</h3>
                                <p className="text-xs text-[#465f89] font-medium">Global commission rate for digital product sales.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Global Transaction Fee (%)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        className={`w-full bg-white border ${feeError ? 'border-rose-500 ring-4 ring-rose-500/5' : 'border-slate-200'} rounded-xl py-3 px-4 text-sm font-black text-[#005ab4] focus:ring-4 focus:ring-blue-600/5 outline-none transition-all`}
                                        value={platformFee}
                                        onChange={(e) => setPlatformFee(Number(e.target.value))}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                                </div>
                                {feeError && <p className="text-[10px] font-bold text-rose-500 px-1">{feeError}</p>}
                                <p className="text-[10px] text-[#465f89] font-medium italic mt-2">
                                    *Nilai ini akan langsung memotong "Net Amount" pada setiap transaksi baru berikutnya.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-blue-100 space-y-4">
                                <h4 className="text-[10px] font-black text-[#005ab4] uppercase tracking-widest">Fee Impact Projection</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Product Sale Price</span>
                                        <span className="font-bold text-slate-900">$100.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium font-bold">Platform Fee ({platformFee}%)</span>
                                        <span className="font-bold text-rose-500">-${(100 * platformFee / 100).toFixed(2)}</span>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-[#005ab4] uppercase">Creator Gets</span>
                                        <span className="text-lg font-black text-emerald-600">${(100 - (100 * platformFee / 100)).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Platform Status & Meta */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Platform Mode Card */}
                    <Card className="p-8 border-slate-200/60 shadow-sm overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-[#005ab4] mb-1">Platform Mode</h3>
                            <p className="text-xs text-slate-500 mb-6 font-medium">Control global accessibility</p>
                            
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Maintenance Mode</p>
                                        <p className="text-[10px] text-slate-500">Stop all traffic except Admin</p>
                                    </div>
                                    <Toggle checked={false} onChange={() => {}} />
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">New Registration</p>
                                        <p className="text-[10px] text-slate-500">Allow new creators to join</p>
                                    </div>
                                    <Toggle checked={true} onChange={() => {}} />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Payout Requests</p>
                                        <p className="text-[10px] text-slate-500">Pause wallet withdrawals</p>
                                    </div>
                                    <Toggle checked={true} onChange={() => {}} />
                                </div>
                            </div>

                            <div className="mt-8 border-t border-slate-100 pt-6">
                                <div className="flex items-center gap-3 text-emerald-600">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs font-bold tracking-widest uppercase">All Systems Ready</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">Last automated check: 5 mins ago</p>
                            </div>
                        </div>
                        
                        {/* Decorative BG element */}
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
                    </Card>

                    {/* Meta & SEO Spotlight */}
                    <Card className="p-8 bg-slate-900 border-none shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">SEO Spotlight</span>
                                <span className="material-symbols-outlined text-blue-400 text-lg">search_insights</span>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-4">Meta Optimization</h4>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">Ensure your platform is indexed correctly by search engines to attract organic creators.</p>
                            
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Default Meta Description</p>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-slate-300 italic group-hover:border-blue-500/30 transition-colors">
                                        "Transform your creative potential into a sustainable digital career with Orbit Site"
                                    </div>
                                </div>
                                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all active:scale-95">
                                    Edit Global Meta Data
                                </button>
                            </div>
                        </div>
                        
                        <div className="absolute right-0 bottom-0 opacity-[0.05] pointer-events-none transform translate-x-1/4 translate-y-1/4">
                             <span className="material-symbols-outlined text-[180px]">public</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
