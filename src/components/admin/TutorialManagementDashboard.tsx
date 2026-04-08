import React, { useState } from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';

export const TutorialManagementDashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    const openAddModal = () => {
        setModalMode('add');
        setIsModalOpen(true);
    };

    const openEditModal = () => {
        setModalMode('edit');
        setIsModalOpen(true);
    };

    return (
        <div className="w-full">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-900 bg-blue-100 px-3 py-1 rounded-full mb-3 inline-block">Management Console</span>
                    <h2 className="text-4xl font-black text-[#005ab4] tracking-tight">Tutorial Library</h2>
                    <p className="text-slate-500 mt-2 max-w-lg">Manage educational content and video guides for the creator ecosystem.</p>
                </div>
                <Button 
                    variant="primary" 
                    className="bg-[#465f89] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-[#465f89]/20 hover:scale-[1.02] active:scale-95 transition-all"
                    onClick={openAddModal}
                >
                    <span className="material-symbols-outlined">add</span>
                    <span>Add Tutorial</span>
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-2 rounded-2xl mb-8 flex flex-wrap items-center gap-2 shadow-sm border border-slate-100">
                <button className="px-5 py-2 rounded-xl bg-[#005ab4] text-white font-semibold text-sm transition-all">All Videos</button>
                <button className="px-5 py-2 rounded-xl bg-transparent hover:bg-slate-50 text-slate-500 font-semibold text-sm transition-all">Onboarding</button>
                <button className="px-5 py-2 rounded-xl bg-transparent hover:bg-slate-50 text-slate-500 font-semibold text-sm transition-all">Marketing</button>
                <button className="px-5 py-2 rounded-xl bg-transparent hover:bg-slate-50 text-slate-500 font-semibold text-sm transition-all">Monetization</button>
                <button className="px-5 py-2 rounded-xl bg-transparent hover:bg-slate-50 text-slate-500 font-semibold text-sm transition-all">Advanced Tools</button>
                
                <div className="ml-auto pr-2">
                    <button className="flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-[#005ab4]">
                        <span className="material-symbols-outlined text-lg">filter_list</span>
                        <span>Sort by Newest</span>
                    </button>
                </div>
            </div>

            {/* Tutorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-blue-50">
                    <div className="relative aspect-video overflow-hidden">
                        <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Tutorial Thumbnail" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBX3r7Ma9baEeQhmOwKu7GCvhYMIpFeHuicGhtYcLOkT_0aGWOKNrbrCNLa8qyGxtASuOW2CJvl9dnmE9P6IlcdeL3WKHzbkFt5obM-to1XzsUVTfdp91YCmea_RLzewLubULhs3K0KlWYFZCpPKuV-Tblo0la4I4y-OizLr0zq2aPrJnHJwcPW9L4wUCeLx3iXqLok6Wq0n9w4eySlEeS0pa0DJ5yO_CzNQtQk-BLC_YOMrEI_ocrsr7fHXR_vsogz_IPyQP-6NZuE" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                            </div>
                        </div>
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-[#005ab4] uppercase tracking-wider">Onboarding</span>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-[#005ab4] mb-2 leading-tight">Mastering the Dashboard Essentials</h3>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2">Learn how to navigate your main workspace and optimize your daily workflow efficiency.</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                <span>12:45</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={openEditModal} className="p-2 text-slate-500 hover:text-[#465f89] hover:bg-slate-100 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-blue-50">
                    <div className="relative aspect-video overflow-hidden">
                        <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Tutorial Thumbnail" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqH3YIkdtU63Uih63nUdkQ1uvlT8Co6qg5jTIif-TqADv439Hr0k3Irb8zuDJHiLGtIuwfkb5u8KNNjQBSKwL8wP_x75iScAxA4FxRwr7PPCox1mHb8-mSYwkexq4VdhRL-In5XZCc0aVbHjmDsTgb93tUjbwOTJqtiOzBlWKT-6uSxmVKakjKHes2SjOQieQyZsv3uW5SOXkQ2vWh0Jq-uDu4tLEaPYrkVfi9Y13FZuL4FLTbdInK21moWGs6uLtrNh3lStruFPb4" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                            </div>
                        </div>
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-[#005ab4] uppercase tracking-wider">Marketing</span>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-[#005ab4] mb-2 leading-tight">Advanced Analytics for Content Growth</h3>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2">Deep dive into data interpretation to understand your audience behavior and scale reach.</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                <span>08:20</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={openEditModal} className="p-2 text-slate-500 hover:text-[#465f89] hover:bg-slate-100 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-blue-50">
                    <div className="relative aspect-video overflow-hidden">
                        <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Tutorial Thumbnail" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGHB-09Nx_-g5m3Sze_KEM5Ca8qw6B3cpWLa4ad9-NbWZQscdAgmWL3WWi5B3cRZhlSswsqgpb31ix3F90tolXFTV1_D1g53icCmuSRGKlL00UWjHPWWfa3wzEYj5qRYalhHGiKUHvBWsiSmZDuPVFC2_5KQimuQp67nKKRaO2HlAqAh7lUTi16ILrfY5yCKXZ5-kvD9ocuEV4cWT2RGWWH3DkZRO628abTaNRz5XNahJHGvYvvj_TZwUpmD342ocKIThjJOFqgSpz" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                            </div>
                        </div>
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-[#005ab4] uppercase tracking-wider">Monetization</span>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-[#005ab4] mb-2 leading-tight">Optimizing Your Payout Settings</h3>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2">Step-by-step guide to configuring your bank accounts and tracking transaction history.</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                <span>05:15</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={openEditModal} className="p-2 text-slate-500 hover:text-[#465f89] hover:bg-slate-100 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Add Tutorial Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#005ab4]/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-[#005ab4]">
                                    {modalMode === 'add' ? 'Add Tutorial' : 'Edit Tutorial'}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    {modalMode === 'add' ? 'Create and publish a new video guide' : 'Update the details for this video guide'}
                                </p>
                            </div>
                            <button 
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-8 overflow-y-auto space-y-6">
                            {/* Title & Category Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#001b3e] uppercase tracking-wider">Tutorial Title</label>
                                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#005ab4]/20 outline-none transition-all" placeholder="e.g. Setting Up Your Profile" type="text" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#001b3e] uppercase tracking-wider">Category</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#005ab4]/20 outline-none transition-all">
                                        <option>Select Category</option>
                                        <option>Onboarding</option>
                                        <option>Marketing</option>
                                        <option>Monetization</option>
                                    </select>
                                </div>
                            </div>

                            {/* YouTube Link */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#001b3e] uppercase tracking-wider">YouTube Video Link</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">link</span>
                                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[#005ab4]/20 outline-none transition-all" placeholder="https://youtube.com/watch?v=..." type="text" />
                                </div>
                            </div>

                            {/* Live Preview */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-[#001b3e] uppercase tracking-wider">Live Preview</label>
                                <div className="aspect-video rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">smart_display</span>
                                    <p className="text-sm font-medium">Video preview will appear here</p>
                                    <p className="text-[10px] opacity-60">Paste a valid URL above to generate thumbnail</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button 
                                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button className="px-8 py-2.5 rounded-xl bg-[#465f89] text-white font-bold shadow-lg shadow-[#465f89]/20 hover:scale-[1.02] active:scale-95 transition-all">
                                {modalMode === 'add' ? 'Publish Tutorial' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
