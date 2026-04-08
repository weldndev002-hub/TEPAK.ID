import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { AvatarUpload } from '../ui/AvatarUpload';
import { 
    LinkIcon, 
    GlobeAltIcon, 
    VideoCameraIcon, 
    CheckBadgeIcon, 
    BuildingLibraryIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';

export const EditProfileForm = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-10 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Identity Management</span>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Edit Profile</h2>
                    <p className="text-slate-500 mt-2 font-medium">Manage your public presence and personal information.</p>
                </div>
                <Button variant="primary" className="shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-black px-10 py-4 rounded-2xl text-[11px] uppercase tracking-widest">
                    Save Changes
                </Button>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-12 gap-10">
                
                {/* Section 1 & 3: Profile Photo & Social Media (Side Column) */}
                <div className="col-span-12 lg:col-span-4 space-y-10">
                    {/* Section 1: Profile Photo */}
                    <section className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-8 w-full text-left">Profile Photo</h3>
                        <AvatarUpload image="https://lh3.googleusercontent.com/aida-public/AB6AXuA82ba5c6WkZQbK9PtizNdoD8TH0DbMVadQyO1efsclyTh9uWQ0puy08qsLlndUArlFqWDjkFTWln75EXvGAq2UferLJVD47SezZDdQ_qyDCQbN3TjX-SYzhEjICFNVbbPbRo8sEYzYToOfDRWYnnR5MGOAwVpg5Z5b14XBFXfXPY-i56JtFbSQ_xlD2Dwx5NxBSVY0dySBUhRS8xqF_C7x4AM1pdMSXyVz-FeRow9HbkFNIcgY6Ufn5yAX2HO9GnktfSKloW0dJX5I" />
                    </section>

                    {/* Section 3: Social Media */}
                    <section className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-8">Social Media</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-5 p-4 bg-slate-50 border border-slate-100/50 rounded-2xl group focus-within:bg-white focus-within:border-primary/20 transition-all">
                                <LinkIcon className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Instagram</p>
                                    <input className="w-full bg-transparent border-none p-0 text-xs focus:ring-0 font-black text-slate-900 outline-none uppercase tracking-tight" type="text" defaultValue="@creator_studio" />
                                </div>
                            </div>
                            <div className="flex items-center gap-5 p-4 bg-slate-50 border border-slate-100/50 rounded-2xl group focus-within:bg-white focus-within:border-primary/20 transition-all">
                                <GlobeAltIcon className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Twitter / X</p>
                                    <input className="w-full bg-transparent border-none p-0 text-xs focus:ring-0 font-black text-slate-900 outline-none uppercase tracking-tight" placeholder="Add handle" type="text" />
                                </div>
                            </div>
                            <div className="flex items-center gap-5 p-4 bg-slate-50 border border-slate-100/50 rounded-2xl group focus-within:bg-white focus-within:border-primary/20 transition-all">
                                <VideoCameraIcon className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">YouTube</p>
                                    <input className="w-full bg-transparent border-none p-0 text-xs focus:ring-0 font-black text-slate-900 outline-none uppercase tracking-tight" type="text" defaultValue="youtube.com/c/creator" />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Main Column */}
                <div className="col-span-12 lg:col-span-8 space-y-10">
                    
                    {/* Section 2: Basic Information */}
                    <section className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-10">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Full Name</label>
                                <Input type="text" defaultValue="Alexandra Quinn" className="rounded-2xl border-slate-100 font-black text-xs uppercase tracking-tight bg-slate-50/50" />
                            </div>
                            <div className="col-span-2">
                                <div className="flex justify-between items-end mb-3 ml-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio</label>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">124 / 200</span>
                                </div>
                                <Textarea rows={3} defaultValue="Digital curator specializing in high-end editorial management and precision analytics for the modern SME market in SE Asia." className="rounded-2xl border-slate-100 font-medium text-xs tracking-tight bg-slate-50/50" />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Phone Number</label>
                                <Input type="text" defaultValue="+62 812-3456-7890" className="rounded-2xl border-slate-100 font-black text-xs uppercase tracking-tight bg-slate-50/50" />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Email Address</label>
                                <Input type="email" defaultValue="alexandra@creator.studio" disabled className="rounded-2xl bg-slate-50 text-slate-400 cursor-not-allowed border-none font-black text-xs uppercase tracking-tight opacity-50" />
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Alamat */}
                    <section className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-10">Address Information</h3>
                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-12">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Full Address</label>
                                <Input type="text" defaultValue="Jl. Senopati No. 12, Kebayoran Baru" className="rounded-2xl border-slate-100 font-black text-xs uppercase tracking-tight bg-slate-50/50" />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">City</label>
                                <Input type="text" defaultValue="Jakarta Selatan" className="rounded-2xl border-slate-100 font-black text-xs uppercase tracking-tight bg-slate-50/50" />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Postcode</label>
                                <Input type="text" defaultValue="12190" className="rounded-2xl border-slate-100 font-black text-xs uppercase tracking-tight bg-slate-50/50" />
                            </div>
                        </div>
                    </section>
                    
                    {/* Section: Security */}
                    <section className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-10">Security & Account</h3>
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 rounded-2xl p-8 border border-slate-100/50">
                                <div>
                                    <p className="text-xs font-black text-slate-900 mb-1 uppercase tracking-tight">Change Password</p>
                                    <p className="text-[10px] text-slate-400 max-w-sm font-medium uppercase tracking-tight">It is recommended to use a strong and unique password to secure your account.</p>
                                </div>
                                <a href="/reset-password">
                                    <Button variant="outline" type="button" className="font-black text-[9px] uppercase tracking-widest px-6 py-2.5 rounded-xl bg-white">Change Password</Button>
                                </a>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 rounded-2xl p-8 border border-slate-100/50">
                                <div>
                                    <p className="text-xs font-black text-slate-900 mb-1 uppercase tracking-tight">Account Management</p>
                                    <p className="text-[10px] text-slate-400 max-w-sm font-medium uppercase tracking-tight">Manage account status and data deletion from the platform.</p>
                                </div>
                                <a href="/account-management">
                                    <Button variant="ghost" type="button" className="text-rose-500 border border-rose-100 hover:bg-rose-50 font-black text-[9px] uppercase tracking-widest px-6 py-2.5 rounded-xl">Delete Account</Button>
                                </a>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 rounded-2xl p-8 border border-slate-100/50">
                                <div>
                                    <p className="text-xs font-black text-slate-900 mb-1 uppercase tracking-tight">Custom Domain</p>
                                    <p className="text-[10px] text-slate-400 max-w-sm font-medium uppercase tracking-tight">Connect your own custom domain (e.g. my-store.com) for a more professional look.</p>
                                </div>
                                <a href="/domain-settings">
                                    <Button variant="outline" type="button" className="font-black text-[9px] uppercase tracking-widest px-6 py-2.5 rounded-xl bg-white">Setup Domain</Button>
                                </a>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-primary/[0.03] rounded-2xl p-8 border border-primary/10">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-xs font-black text-primary uppercase tracking-tight">SEO Optimization</p>
                                        <span className="px-2 py-0.5 rounded bg-primary text-[7px] font-black text-white uppercase tracking-widest">PRO</span>
                                    </div>
                                    <p className="text-[10px] text-primary/60 max-w-sm font-medium uppercase tracking-tight">Optimize your site snippet for Google search and social media sharing.</p>
                                </div>
                                <a href="/seo-settings">
                                    <Button variant="primary" type="button" className="bg-primary text-white font-black text-[9px] uppercase tracking-widest px-8 py-2.5 rounded-xl shadow-lg shadow-primary/20">Configure SEO</Button>
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Bank Account Details */}
                    <section className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Bank Account details</h3>
                            <span className="flex items-center gap-2 text-[9px] font-black text-emerald-500 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-widest">
                                <CheckBadgeIcon className="w-3.5 h-3.5" />
                                Verified
                            </span>
                        </div>
                        
                        <div className="bg-slate-50 border border-slate-100/50 p-8 rounded-3xl flex items-start gap-8 relative group">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center p-3 text-primary border border-slate-100">
                                <BuildingLibraryIcon className="w-10 h-10" />
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-y-6">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank Name</p>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Bank Central Asia (BCA)</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                                    <p className="text-xs font-black text-slate-900 tracking-[0.3em]">•••• •••• 8829</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner Name</p>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Alexandra Quinn</p>
                                </div>
                            </div>
                            <a href="/bank-info" title="Edit Bank Info" className="absolute top-8 right-8 text-slate-300 hover:text-primary transition-all active:scale-95">
                                <PencilSquareIcon className="w-6 h-6" />
                            </a>
                        </div>
                    </section>

                    {/* Bottom Action Bar */}
                    <div className="pt-6 flex items-center justify-end gap-6">
                        <Button variant="ghost" className="text-slate-400 hover:bg-slate-100 px-8 py-3 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
                            Cancel
                        </Button>
                        <Button variant="primary" className="shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-primary text-white">
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

