import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';
import { 
    ArrowLeftIcon, 
    CloudArrowUpIcon, 
    DocumentIcon, 
    TrashIcon, 
    PencilSquareIcon, 
    ArrowUpRightIcon, 
    QuestionMarkCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export const EditProductDashboard = () => {
    const [status, setStatus] = useState(true);
    const [visibility, setVisibility] = useState(true);
    const [isDirty, setIsDirty] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [showFileDeleteModal, setShowFileDeleteModal] = useState(false);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };

    const handleSave = () => {
        setShowSaveModal(false);
        setIsDirty(false);
        showToast("Perubahan produk berhasil disimpan!");
    };

    const handleBackClick = (e: React.MouseEvent) => {
        if (isDirty) {
            e.preventDefault();
            setShowDiscardModal(true);
        }
    };

    const handleInputChange = () => {
        if (!isDirty) setIsDirty(true);
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] relative">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold bg-emerald-500 text-white animate-in slide-in-from-right duration-300">
                    <CheckCircleIcon className="w-5 h-5 shrink-0" />
                    {toast}
                </div>
            )}
            {/* TopNavBar Replacement Local Context */}
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md flex justify-between items-center w-full px-8 py-4 shadow-[0px_20px_40px_rgba(16,27,50,0.06)] border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <a 
                        href="/products" 
                        className="text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-lg hover:bg-slate-100"
                        onClick={handleBackClick}
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </a>
                    <h2 className="text-xl font-extrabold text-[#162138] tracking-tight">Edit Digital Product</h2>
                </div>
                <div className="flex items-center space-x-6">
                    <Button 
                        variant="secondary" 
                        className="px-8 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-blue-900/30 hover:scale-105 active:scale-95 transition-all bg-[#465f89] hover:bg-[#344d77] text-white"
                        onClick={() => setShowSaveModal(true)}
                    >
                        Save
                    </Button>
                </div>
            </header>

            {/* Content Body */}
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Left Column (Main Form) */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Informasi Produk Section */}
                            <Card className="p-8 shadow-[0px_20px_40px_rgba(16,27,50,0.04)] border-none">
                                <div className="flex items-center space-x-3 mb-8">
                                    <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                    <h3 className="text-lg font-extrabold tracking-tight text-[#005ab4]">Product Information</h3>
                                </div>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Name</label>
                                        <Input type="text" defaultValue="Ebook: Master UI Design with Tailwind" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                        <Textarea rows={5} defaultValue="Complete step-by-step guide to mastering modern interface design using the Tailwind CSS framework. Suitable for beginners to intermediates." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                                            <Select>
                                                <option>E-Book</option>
                                                <option>Online Course</option>
                                                <option>Design Assets</option>
                                                <option>Software</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (USD)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">$</span>
                                                <Input type="text" defaultValue="24.90" className="pl-8" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* File Produk Digital Section */}
                            <Card className="p-8 shadow-[0px_20px_40px_rgba(16,27,50,0.04)] border-none">
                                <div className="flex items-center space-x-3 mb-8">
                                    <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                    <h3 className="text-lg font-extrabold tracking-tight text-[#005ab4]">Digital Product File</h3>
                                </div>
                                
                                <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 p-10 text-center group hover:border-[#465f89]/50 transition-all cursor-pointer">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <CloudArrowUpIcon className="w-8 h-8 text-[#465f89]" />
                                    </div>
                                    <p className="text-sm font-bold text-[#005ab4] mb-1">Drag and drop file here</p>
                                    <p className="text-xs text-slate-500 mb-6">Maximum file size 500MB (PDF, ZIP, MP4)</p>
                                    <Button variant="outline" className="px-6 py-2 rounded-full text-xs hover:bg-slate-100 border-slate-300">Select File</Button>
                                </div>
                                
                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-blue-900/10">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-900/10 text-[#465f89] rounded flex items-center justify-center">
                                                <DocumentIcon className="w-5 h-5" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-xs font-bold text-[#005ab4]">Master_UI_Design_Tailwind_v2.pdf</p>
                                                <p className="text-[10px] text-slate-500">12.4 MB • Successfully uploaded</p>
                                            </div>
                                        </div>
                                        <button 
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            onClick={() => setShowFileDeleteModal(true)}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </Card>

                        </div>

                        {/* Right Column (Media & Settings) */}
                        <div className="space-y-8">
                            
                            {/* Thumbnail Produk Section */}
                            <Card className="p-6 shadow-[0px_20px_40px_rgba(16,27,50,0.04)] border-none">
                                <div className="flex items-center space-x-3 mb-6">
                                    <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                    <h3 className="text-lg font-extrabold tracking-tight text-[#005ab4]">Thumbnail</h3>
                                </div>
                                <div className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-4">
                                    <img 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFFfO0u3ABzaB5B6QVhNOFAv9wmpw2FE2IXeDpmfjmvxHPhy39x-T7Pzl9pxTZBSfuehl-5mcwrRoczZ9UohNhPnjIKHJswbQIU235Vv_OQDsYKjPkCaqhMD8u5BCxI6c_qTEf4HCdeL9HXok2xC_WaAlnM8Oz2BENBYgIPvorFlJEY6J-m2PET-FsOXaApOH1RTasb6E5KDXjLel-5WYiHgGxbax7lGpMQEUfLaVtnPnHdPMx_ZxXcPV6PeKHaebSt1QAWXI_Ii7K" alt="Thumbnail" />
                                <div className="absolute inset-0 bg-[#005ab4]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <button className="bg-white text-[#005ab4] px-4 py-2 rounded-full text-xs font-bold flex items-center shadow-lg active:scale-95 transition-all">
                                            <PencilSquareIcon className="w-4 h-4 mr-2" />
                                            Change Image
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed text-center italic font-medium">Recommended size: 1080x1080px (1:1)</p>
                            </Card>

                            {/* Pengaturan Section */}
                            <Card className="p-6 shadow-[0px_20px_40px_rgba(16,27,50,0.04)] border-none">
                                <div className="flex items-center space-x-3 mb-8">
                                    <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                    <h3 className="text-lg font-extrabold tracking-tight text-[#005ab4]">Settings</h3>
                                </div>
                                <div className="space-y-6">
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-[#005ab4]">Product Status</p>
                                            <p className="text-[10px] text-slate-500">Show product in store</p>
                                        </div>
                                        <Toggle 
                                            checked={status} 
                                            onChange={(e) => {
                                                setStatus(e.target.checked);
                                                handleInputChange();
                                            }} 
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-[#005ab4]">Public Visibility</p>
                                            <p className="text-[10px] text-slate-500">Searchable on Google</p>
                                        </div>
                                        <Toggle 
                                            checked={visibility} 
                                            onChange={(e) => {
                                                setVisibility(e.target.checked);
                                                handleInputChange();
                                            }} 
                                        />
                                    </div>
                                    
                                    <hr className="border-slate-100"/>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Download Link Expiry</label>
                                        <Select className="font-bold">
                                            <option>Forever (No Expiry)</option>
                                            <option>24 Hours</option>
                                            <option>7 Days</option>
                                            <option>30 Days</option>
                                        </Select>
                                    </div>
                                </div>
                            </Card>

                            {/* Quick Actions */}
                            <div className="p-6 bg-[#0873df] rounded-2xl text-white overflow-hidden relative shadow-lg shadow-blue-500/10">
                                <div className="relative z-10">
                                    <h4 className="font-bold text-sm mb-2">Need Help?</h4>
                                    <p className="text-xs text-blue-200 mb-4 leading-relaxed">Learn how to optimize your digital product sales in our Help Center.</p>
                                    <a className="inline-flex items-center text-white text-xs font-bold hover:underline" href="#">
                                        Read Guide 
                                        <ArrowUpRightIcon className="w-4 h-4 ml-1" />
                                    </a>
                                </div>
                                <QuestionMarkCircleIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
                            </div>

                        </div>
                    </div>
                </div>
            </main>
            {/* Save Confirmation Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-blue-50 text-[#005ab4] rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircleIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Simpan Perubahan?</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">
                                Pastikan semua data sudah benar sebelum menyimpan. Perubahan akan segera aktif di toko Anda.
                            </p>
                        </div>
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-3">
                            <button 
                                className="flex-1 py-3 rounded-xl font-black text-slate-500 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest" 
                                onClick={() => setShowSaveModal(false)}
                            >
                                Periksa Lagi
                            </button>
                            <button 
                                className="flex-1 py-3 rounded-xl font-black bg-[#465f89] hover:bg-[#344d77] text-white shadow-lg shadow-blue-900/20 transition-all text-[10px] uppercase tracking-widest" 
                                onClick={handleSave}
                            >
                                Ya, Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Discard Changes Modal */}
            {showDiscardModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100 mb-4 text-amber-600">
                                <ExclamationTriangleIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Buang Perubahan?</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Anda memiliki perubahan yang belum disimpan. Jika Anda keluar sekarang, perubahan tersebut akan hilang secara permanen.
                            </p>
                        </div>
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button 
                                className="px-5 py-2.5 rounded-xl font-black text-slate-500 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest" 
                                onClick={() => setShowDiscardModal(false)}
                            >
                                Lanjut Edit
                            </button>
                            <a 
                                href="/products"
                                className="px-6 py-2.5 rounded-xl font-black bg-slate-900 text-white shadow-lg transition-all text-[10px] uppercase tracking-widest text-center" 
                            >
                                Ya, Buang & Keluar
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* File Delete Confirmation Modal */}
            {showFileDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-100 mb-4 text-rose-500">
                                <TrashIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Hapus File Produk?</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Apakah Anda yakin ingin menghapus file <strong className="text-slate-900">"Master_UI_Design_Tailwind_v2.pdf"</strong>? Anda harus mengunggah file baru agar produk tetap dapat diakses oleh pembeli.
                            </p>
                        </div>
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button 
                                className="px-5 py-2.5 rounded-xl font-black text-slate-500 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest" 
                                onClick={() => setShowFileDeleteModal(false)}
                            >
                                Batal
                            </button>
                            <button 
                                className="px-6 py-2.5 rounded-xl font-black bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all text-[10px] uppercase tracking-widest" 
                                onClick={() => {
                                    setShowFileDeleteModal(false);
                                    showToast("File produk berhasil dihapus.");
                                }}
                            >
                                Ya, Hapus File
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

