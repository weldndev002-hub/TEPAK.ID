import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { AvatarUpload } from '../ui/AvatarUpload';

export const EditProfileForm = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-blue-900">Edit Profile</h2>
                    <p className="text-slate-500 mt-1">Manage your public presence and personal information.</p>
                </div>
                <Button variant="primary" className="shadow-lg hover:brightness-110 transition-all font-bold px-8">
                    Save Changes
                </Button>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-12 gap-8">
                
                {/* Section 1 & 3: Profile Photo & Social Media (Side Column) */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* Section 1: Profile Photo */}
                    <section className="bg-white p-8 rounded-xl shadow-[0px_20px_40px_rgba(16,27,50,0.06)] flex flex-col items-center text-center">
                        <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase mb-6 w-full text-left">Profile Photo</h3>
                        <AvatarUpload image="https://lh3.googleusercontent.com/aida-public/AB6AXuA82ba5c6WkZQbK9PtizNdoD8TH0DbMVadQyO1efsclyTh9uWQ0puy08qsLlndUArlFqWDjkFTWln75EXvGAq2UferLJVD47SezZDdQ_qyDCQbN3TjX-SYzhEjICFNVbbPbRo8sEYzYToOfDRWYnnR5MGOAwVpg5Z5b14XBFXfXPY-i56JtFbSQ_xlD2Dwx5NxBSVY0dySBUhRS8xqF_C7x4AM1pdMSXyVz-FeRow9HbkFNIcgY6Ufn5yAX2HO9GnktfSKloW0dJX5I" />
                    </section>

                    {/* Section 3: Social Media */}
                    <section className="bg-white p-8 rounded-xl shadow-[0px_20px_40px_rgba(16,27,50,0.06)]">
                        <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase mb-6">Social Media</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="material-symbols-outlined text-slate-400">link</span>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Instagram</p>
                                    <input className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 font-medium text-slate-800 outline-none" type="text" defaultValue="@creator_studio" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="material-symbols-outlined text-slate-400">public</span>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Twitter / X</p>
                                    <input className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 font-medium text-slate-800 outline-none" placeholder="Add handle" type="text" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="material-symbols-outlined text-slate-400">video_library</span>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">YouTube</p>
                                    <input className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 font-medium text-slate-800 outline-none" type="text" defaultValue="youtube.com/c/creator" />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Main Column */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    
                    {/* Section 2: Basic Information */}
                    <section className="bg-white p-8 rounded-xl shadow-[0px_20px_40px_rgba(16,27,50,0.06)]">
                        <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase mb-8">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Full Name</label>
                                <Input type="text" defaultValue="Alexandra Quinn" />
                            </div>
                            <div className="col-span-2">
                                <div className="flex justify-between items-end mb-2 ml-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Bio</label>
                                    <span className="text-[10px] font-medium text-slate-400">124 / 200</span>
                                </div>
                                <Textarea rows={3} defaultValue="Digital curator specializing in high-end editorial management and precision analytics for the modern SME market in SE Asia." />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Phone Number</label>
                                <Input type="text" defaultValue="+62 812-3456-7890" />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Address</label>
                                <Input type="email" defaultValue="alexandra@creator.studio" disabled className="bg-slate-100 text-slate-400 cursor-not-allowed border-none" />
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Alamat */}
                    <section className="bg-white p-8 rounded-xl shadow-[0px_20px_40px_rgba(16,27,50,0.06)]">
                        <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase mb-8">Address Information</h3>
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Full Address</label>
                                <Input type="text" defaultValue="Jl. Senopati No. 12, Kebayoran Baru" />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">City</label>
                                <Input type="text" defaultValue="Jakarta Selatan" />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Postcode</label>
                                <Input type="text" defaultValue="12190" />
                            </div>
                        </div>
                    </section>
                    
                    {/* Section: Security */}
                    <section className="bg-white p-8 rounded-xl shadow-[0px_20px_40px_rgba(16,27,50,0.06)]">
                        <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase mb-8">Security & Account Management</h3>
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 mb-1">Change Password</p>
                                    <p className="text-xs text-slate-500 max-w-sm">It is recommended to use a strong and unique password to secure your account.</p>
                                </div>
                                <a href="/reset-password">
                                    <Button variant="outline" type="button">Change Password</Button>
                                </a>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 mb-1">Account Management</p>
                                    <p className="text-xs text-slate-500 max-w-sm">Manage account status and data deletion from the platform.</p>
                                </div>
                                <a href="/account-management">
                                    <Button variant="outline" type="button" className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600">Delete Account</Button>
                                </a>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 mb-1">Custom Domain</p>
                                    <p className="text-xs text-slate-500 max-w-sm">Connect your own custom domain (e.g. my-store.com) for a more professional look.</p>
                                </div>
                                <a href="/domain-settings">
                                    <Button variant="outline" type="button" className="w-full sm:w-auto">Setup Domain</Button>
                                </a>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#f0f7ff] rounded-xl p-6 border border-blue-100">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-bold text-blue-900">SEO Optimization</p>
                                        <span className="px-1.5 py-0.5 rounded bg-blue-600 text-[8px] font-black text-white uppercase tracking-widest">PRO</span>
                                    </div>
                                    <p className="text-xs text-blue-700/60 max-w-sm">Optimize your site snippet for Google search and social media sharing.</p>
                                </div>
                                <a href="/seo-settings">
                                    <Button variant="primary" type="button" className="w-full sm:w-auto bg-blue-600 text-white border-none shadow-md shadow-blue-500/20">Configure SEO</Button>
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Bank Account Details */}
                    <section className="bg-white p-8 rounded-xl shadow-[0px_20px_40px_rgba(16,27,50,0.06)]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-bold text-slate-800 tracking-wider uppercase">Bank Account details</h3>
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                Verified
                            </span>
                        </div>
                        
                        <div className="bg-[#f8faff] border border-[#e9edff] p-6 rounded-xl flex items-start gap-6">
                            <div className="w-14 h-14 bg-white rounded-lg shadow-sm flex items-center justify-center p-2">
                                <span className="material-symbols-outlined text-blue-600 text-3xl">account_balance</span>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Bank Name</p>
                                    <p className="text-sm font-bold text-slate-900">Bank Central Asia (BCA)</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Account Number</p>
                                    <p className="text-sm font-bold text-slate-900 tracking-widest">•••• •••• 8829</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Owner Name</p>
                                    <p className="text-sm font-bold text-slate-900">Alexandra Quinn</p>
                                </div>
                            </div>
                            <a href="/bank-info" title="Edit Bank Info" className="material-symbols-outlined text-slate-400 hover:text-blue-600 transition-colors">edit_square</a>
                        </div>
                    </section>

                    {/* Bottom Action Bar */}
                    <div className="pt-4 flex items-center justify-end gap-4">
                        <Button variant="ghost" className="text-slate-500 hover:bg-slate-100 px-6 font-bold">
                            Cancel
                        </Button>
                        <Button variant="primary" className="shadow-[0px_10px_20px_rgba(59,130,246,0.2)] hover:brightness-110 active:scale-[0.98] transition-all px-10 font-bold">
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
