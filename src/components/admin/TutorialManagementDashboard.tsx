import React, { useState } from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { CheckCircleIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

export const TutorialManagementDashboard = () => {
    const [tutorials, setTutorials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const tutorialToDelete = tutorials.find(t => t.id === deleteTarget);

    // Toast
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchTutorials = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/tutorials');
            if (res.ok) {
                const data = await res.json();
                setTutorials(data);
            }
        } catch (err) {
            console.error('Fetch tutorials error:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchTutorials();
    }, []);

    // Form State
    const [newTutorial, setNewTutorial] = useState({
        title: '',
        category: '',
        video_url: '',
        description: '',
    });
    const [isDirty, setIsDirty] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

    const categories = ['All', 'Onboarding', 'Marketing', 'Monetization', 'Advanced Tools'];

    // YouTube Helper
    const getYouTubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const previewThumbnail = getYouTubeId(newTutorial.video_url) 
        ? `https://img.youtube.com/vi/${getYouTubeId(newTutorial.video_url)}/maxresdefault.jpg`
        : null;

    const handleAddTutorial = async () => {
        if (!newTutorial.title || !newTutorial.category || !newTutorial.video_url) {
            showToast('error', 'Harap lengkapi formulir sebelum mempublikasikan.');
            setShowSaveConfirm(false);
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                id: modalMode === 'edit' ? editingId : undefined,
                title: newTutorial.title,
                category: newTutorial.category,
                video_url: newTutorial.video_url,
                description: newTutorial.description,
                status: 'published'
            };

            const res = await fetch('/api/admin/tutorials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchTutorials();
                setIsModalOpen(false);
                setNewTutorial({ title: '', category: '', video_url: '', description: '' });
                setIsDirty(false);
                setShowSaveConfirm(false);
                showToast('success', modalMode === 'add' ? 'Tutorial berhasil dipublikasikan!' : 'Tutorial berhasil diperbarui!');
            } else {
                const errData = await res.json();
                showToast('error', `Gagal: ${errData.error || 'Server Error'}`);
            }
        } catch (err) {
            showToast('error', 'Koneksi ke server terputus.');
        } finally {
            setIsSubmitting(false);
            setShowSaveConfirm(false);
        }
    };

    const handleCancel = () => {
        if (isDirty) {
            setShowDiscardConfirm(true);
        } else {
            setIsModalOpen(false);
        }
    };

    const handleDeleteConfirmed = async () => {
        if (!deleteTarget) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/tutorials/${deleteTarget}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                await fetchTutorials();
                showToast('success', 'Tutorial berhasil dihapus dari library.');
            } else {
                showToast('error', 'Gagal menghapus tutorial.');
            }
        } catch (err) {
            showToast('error', 'Koneksi gagal.');
        } finally {
            setIsSubmitting(false);
            setDeleteTarget(null);
        }
    };

    const filteredTutorials = activeFilter === 'All' 
        ? tutorials 
        : tutorials.filter(t => t.category === activeFilter);

    const openAddModal = () => {
        setModalMode('add');
        setEditingId(null);
        setNewTutorial({ title: '', category: '', video_url: '', description: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (tutorial: any) => {
        setModalMode('edit');
        setEditingId(tutorial.id);
        setNewTutorial({
            title: tutorial.title,
            category: tutorial.category,
            video_url: tutorial.video_url || '',
            description: tutorial.description || '',
        });
        setIsModalOpen(true);
    };

    return (
        <div className="w-full pb-20">
            {/* Toast */}
            {toast && (
                <div className={cn(
                    "fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold animate-in slide-in-from-right duration-300",
                    toast.type === 'success' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                )}>
                    {toast.type === 'success'
                        ? <CheckCircleIcon className="w-5 h-5 shrink-0" />
                        : <XCircleIcon className="w-5 h-5 shrink-0" />
                    }
                    {toast.message}
                </div>
            )}
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#005ab4] bg-blue-50 px-3 py-1 rounded-full mb-3 inline-block border border-blue-100/50">Management Console</span>
                    <h2 className="text-4xl font-black text-[#001b3e] tracking-tight">Tutorial Library</h2>
                    <p className="text-slate-500 mt-2 max-w-lg">Manage educational content and video guides for the creator ecosystem.</p>
                </div>
                <Button 
                    variant="primary" 
                    className="bg-[#005ab4] hover:bg-[#00458d] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                    onClick={openAddModal}
                >
                    <span className="material-symbols-outlined font-bold">add</span>
                    <span>Add New Tutorial</span>
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl mb-8 flex flex-wrap items-center gap-2 shadow-sm border border-slate-100 sticky top-20 z-10">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${activeFilter === cat ? 'bg-[#005ab4] text-white shadow-lg shadow-blue-500/20' : 'bg-transparent hover:bg-slate-50 text-slate-500'}`}
                    >
                        {cat} {cat === 'All' ? `(${tutorials.length})` : `(${tutorials.filter(t => t.category === cat).length})`}
                    </button>
                ))}
                
                <div className="ml-auto pr-2">
                    <button className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-[#005ab4] transition-colors">
                        <span className="material-symbols-outlined text-lg">sort</span>
                        <span>Sort by Date</span>
                    </button>
                </div>
            </div>

            {/* Tutorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-24 text-center flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-[#005ab4] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Library...</p>
                    </div>
                ) : filteredTutorials.map((tutorial) => (
                    <div key={tutorial.id} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 flex flex-col">
                        <div className="relative aspect-video overflow-hidden">
                            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={tutorial.title} src={tutorial.thumbnail_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1074&auto=format&fit=crop'} />
                            <div className="absolute inset-0 bg-[#001b3e]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => window.open(tutorial.video_url, '_blank')}>
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-500">
                                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                </div>
                            </div>
                            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-[#005ab4] uppercase tracking-widest shadow-sm border border-white/20">
                                {tutorial.category}
                            </span>
                        </div>
                        <div className="p-8 flex flex-col flex-grow">
                            <h3 className="text-lg font-black text-[#001b3e] mb-3 leading-tight tracking-tight line-clamp-2">{tutorial.title}</h3>
                            <p className="text-xs text-slate-500 mb-8 line-clamp-2 font-medium leading-relaxed">{tutorial.description || "Video panduan resmi untuk membantu Anda memaksimalkan potensi Tepak.ID."}</p>
                            
                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-base">timer</span>
                                    <span>{tutorial.duration || "0:00"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => openEditModal(tutorial)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-[#005ab4] hover:bg-blue-50 rounded-xl transition-all">
                                        <span className="material-symbols-outlined text-xl">edit</span>
                                    </button>
                                    <button onClick={() => setDeleteTarget(tutorial.id)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {(!loading && filteredTutorials.length === 0) && (
                    <div className="col-span-full py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <span className="material-symbols-outlined text-4xl text-slate-300">video_library</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Tutorial Empty</h3>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium">Belum ada video di kategori ini. Mulai dengan menambahkan panduan baru.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Tutorial Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#001b3e]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={handleCancel} />
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom duration-500">
                        {/* Modal Header */}
                        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
                            <div>
                                <h2 className="text-2xl font-black text-[#001b3e] tracking-tight">
                                    {modalMode === 'add' ? 'Publish Tutorial' : 'Modify Content'}
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    {modalMode === 'add' ? 'Populate creator education library' : 'Update metadata and configuration'}
                                </p>
                            </div>
                            <button 
                                className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-full transition-colors text-slate-400"
                                onClick={handleCancel}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-10 overflow-y-auto space-y-8">
                             {/* Title & Category Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Tutorial Title</label>
                                    <input 
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-[#001b3e] placeholder:text-slate-300" 
                                        placeholder="e.g. Getting Started Guide" 
                                        type="text" 
                                        value={newTutorial.title}
                                        onChange={(e) => {
                                            setNewTutorial({...newTutorial, title: e.target.value});
                                            setIsDirty(true);
                                        }}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Category</label>
                                    <select 
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-[#001b3e]"
                                        value={newTutorial.category}
                                        onChange={(e) => {
                                            setNewTutorial({...newTutorial, category: e.target.value});
                                            setIsDirty(true);
                                        }}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.filter(c => c !== 'All').map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* YouTube Link */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">YouTube Video URL</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">link</span>
                                    <input 
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-16 pr-6 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-[#001b3e] placeholder:text-slate-300" 
                                        placeholder="https://youtube.com/watch?v=..." 
                                        type="text" 
                                        value={newTutorial.video_url}
                                        onChange={(e) => {
                                            setNewTutorial({...newTutorial, video_url: e.target.value});
                                            setIsDirty(true);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Short Description</label>
                                <textarea 
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-[#001b3e] h-28 resize-none placeholder:text-slate-300"
                                    placeholder="Briefly explain what creators will learn in this video..."
                                    value={newTutorial.description}
                                    onChange={(e) => {
                                        setNewTutorial({...newTutorial, description: e.target.value});
                                        setIsDirty(true);
                                    }}
                                />
                            </div>

                            {/* Live Preview / Thumbnail */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Thumbnail Preview</label>
                                <div className="aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center overflow-hidden">
                                    {previewThumbnail ? (
                                        <img src={previewThumbnail} className="w-full h-full object-cover animate-in fade-in duration-700" alt="Preview" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-300 group">
                                            <span className="material-symbols-outlined text-5xl mb-3 transition-transform group-hover:scale-110 duration-500">smart_display</span>
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting valid link...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-end gap-4">
                            <button 
                                className="px-8 py-3 rounded-xl font-black text-[10px] text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all"
                                onClick={handleCancel}
                            >
                                Discard
                            </button>
                            <button
                                className="px-10 py-3 rounded-xl bg-[#001b3e] text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-[1.05] active:scale-95 transition-all"
                                onClick={() => setShowSaveConfirm(true)}
                            >
                                {modalMode === 'add' ? 'Add to Library' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Confirmation Modal */}
            {showSaveConfirm && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#001b3e]/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowSaveConfirm(false)} />
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-emerald-50 mx-auto mb-6">
                                <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-black text-[#001b3e] tracking-tight mb-3">Publish Changes?</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                Content will be immediately visible to all creators in their Dashboard Academy.
                            </p>
                        </div>
                        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-end gap-3">
                            <button className="flex-1 px-5 py-3 rounded-xl font-black text-slate-400 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest" onClick={() => setShowSaveConfirm(false)}>Review</button>
                             <button 
                                className="flex-1 px-5 py-3 rounded-xl font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                                onClick={handleAddTutorial}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                {isSubmitting ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Discard Changes Modal */}
            {showDiscardConfirm && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#001b3e]/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowDiscardConfirm(false)} />
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-amber-50 mx-auto mb-6">
                                <span className="material-symbols-outlined text-amber-500 text-4xl">warning</span>
                            </div>
                            <h3 className="text-xl font-black text-[#001b3e] tracking-tight mb-3">Unsaved Data</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                You have unsaved changes. Closing this will discard everything you've entered.
                            </p>
                        </div>
                        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-end gap-3">
                            <button className="flex-1 px-5 py-3 rounded-xl font-black text-slate-400 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest" onClick={() => setShowDiscardConfirm(false)}>Keep Editing</button>
                            <button className="flex-1 px-5 py-3 rounded-xl font-black bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all text-[10px] uppercase tracking-widest" onClick={() => { setIsModalOpen(false); setShowDiscardConfirm(false); setIsDirty(false); }}>Discard All</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#001b3e]/40 backdrop-blur-sm animate-in fade-in" onClick={() => setDeleteTarget(null)} />
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10">
                            <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-rose-50 mb-6">
                                <TrashIcon className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="text-xl font-black text-[#001b3e] tracking-tight mb-3">Archive Tutorial?</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                This action will permanently remove <strong className="text-[#001b3e]">"{tutorialToDelete?.title}"</strong> from the creator library.
                            </p>
                        </div>
                        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-end gap-3">
                            <button
                                className="flex-1 px-5 py-3 rounded-xl font-black text-slate-400 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest"
                                onClick={() => setDeleteTarget(null)}
                            >
                                Cancel
                            </button>
                             <button
                                className="flex-1 px-5 py-3 rounded-xl font-black bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                onClick={handleDeleteConfirmed}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
