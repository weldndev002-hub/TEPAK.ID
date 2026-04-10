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
    PhotoIcon,
    TrashIcon,
    QuestionMarkCircleIcon,
    ArrowUpRightIcon,
    PlusCircleIcon,
    TagIcon,
    CurrencyDollarIcon,
    BanknotesIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

export const AddProductDashboard = () => {
    const [status, setStatus] = useState(true);
    const [visibility, setVisibility] = useState(true);
    const [isDirty, setIsDirty] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    
    const handleInputChange = () => {
        if (!isDirty) setIsDirty(true);
    };
    const [limitDownload, setLimitDownload] = useState(false);
    const [price, setPrice] = useState<string>('');
    const [productFile, setProductFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ price?: string; file?: string }>({});
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishConfirm, setPublishConfirm] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation: 25MB for PRO
        const maxSize = 25 * 1024 * 1024;
        if (file.size > maxSize) {
            setErrors(prev => ({ ...prev, file: "Batas ukuran file maksimal adalah 25MB" }));
            setProductFile(null);
            return;
        }

        setErrors(prev => ({ ...prev, file: undefined }));
        setProductFile(file);
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnail(URL.createObjectURL(file));
        }
    };

    const handlePublish = async () => {
        const newErrors: any = {};
        
        if (Number(price) < 10000) {
            newErrors.price = "Harga minimal adalah Rp 10.000";
        }

        if (!productFile) {
            newErrors.file = "File produk digital wajib diunggah";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Show confirm modal instead of publishing immediately
        setPublishConfirm(true);
    };

    const executePublish = async () => {
        setPublishConfirm(false);
        setIsPublishing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsPublishing(false);
        window.location.href = '/products';
    };

    return (
        <>
        <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] ">
            {/* Contextual Header */}
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md flex justify-between items-center w-full px-8 py-4 shadow-[0px_20px_40px_rgba(16,27,50,0.06)] border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <a 
                        href="/products" 
                        className="text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-lg hover:bg-slate-100"
                        onClick={(e) => {
                            if (isDirty) {
                                e.preventDefault();
                                setShowDiscardModal(true);
                            }
                        }}
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </a>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-0.5">Products</p>
                        <h2 className="text-xl font-extrabold text-[#162138] tracking-tight">Add New Product</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 border-slate-200 hover:bg-slate-50">
                        Save as Draft
                    </Button>
                    <Button 
                        variant="secondary" 
                        className="px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/30 hover:scale-105 active:scale-95 transition-all bg-[#465f89] hover:bg-[#344d77] text-white flex items-center gap-2 disabled:opacity-50"
                        onClick={handlePublish}
                        disabled={isPublishing}
                    >
                        <PlusCircleIcon className="w-4 h-4" />
                        {isPublishing ? 'Publishing...' : 'Publish Product'}
                    </Button>
                </div>
            </header>

            {/* Content Body */}
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column (Main Form) */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Basic Info */}
                            <Card className="p-8 shadow-[0px_20px_40px_rgba(16,27,50,0.04)] border-none">
                                <div className="flex items-center space-x-3 mb-8">
                                    <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                    <h3 className="text-lg font-extrabold tracking-tight text-[#005ab4]">Product Information</h3>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Name <span className="text-red-400">*</span></label>
                                        <Input 
                                            type="text" 
                                            placeholder="e.g. Mastering UI Design for Creators" 
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Short Description <span className="text-red-400">*</span></label>
                                        <Textarea 
                                            rows={4} 
                                            placeholder="Write a compelling product description that highlights the key benefits for buyers..." 
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category <span className="text-red-400">*</span></label>
                                            <Select>
                                                <option value="">— Select Category —</option>
                                                <option>E-Book</option>
                                                <option>Online Course</option>
                                                <option>Design Assets</option>
                                                <option>Software / Plugin</option>
                                                <option>Video Bundle</option>
                                                <option>Templates</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tags</label>
                                            <div className="relative">
                                                <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input type="text" placeholder="design, ui, figma..." className="pl-9" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (IDR) <span className="text-red-400">*</span></label>
                                            <div className="relative">
                                                <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input 
                                                    type="number" 
                                                    placeholder="50000" 
                                                    className="pl-9" 
                                                    value={price}
                                                    onChange={(e) => {
                                                        setPrice(e.target.value);
                                                        setErrors(prev => ({ ...prev, price: undefined }));
                                                    }}
                                                />
                                            </div>
                                            {errors.price && <p className="text-[10px] font-black text-rose-500 uppercase mt-2">{errors.price}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Discount Price</label>
                                            <div className="relative">
                                                <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input type="number" placeholder="Optional" className="pl-9" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Digital Product File Upload */}
                            <Card className="p-8 shadow-[0px_20px_40px_rgba(16,27,50,0.04)] border-none">
                                <div className="flex items-center space-x-3 mb-8">
                                    <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                    <h3 className="text-lg font-extrabold tracking-tight text-[#005ab4]">Digital Product File</h3>
                                </div>
                                <div 
                                    className={cn(
                                        "border-2 border-dashed rounded-2xl p-12 text-center group transition-all cursor-pointer relative",
                                        errors.file ? "border-rose-300 bg-rose-50/30" : "border-slate-200 bg-slate-50/50 hover:border-[#465f89]/60 hover:bg-blue-50/20"
                                    )}
                                    onClick={() => document.getElementById('product-file')?.click()}
                                >
                                    <input 
                                        type="file" 
                                        id="product-file" 
                                        className="hidden" 
                                        onChange={handleFileChange}
                                        accept=".pdf,.zip,.mp4,.mp3,.png"
                                    />
                                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <CloudArrowUpIcon className={cn("w-8 h-8", errors.file ? "text-rose-500" : "text-[#465f89]")} />
                                    </div>
                                    <p className={cn("text-sm font-bold mb-1", errors.file ? "text-rose-600" : "text-[#005ab4]")}>
                                        {productFile ? productFile.name : "Drag and drop your product file here"}
                                    </p>
                                    <p className="text-xs text-slate-400 mb-6">{productFile ? `${(productFile.size / (1024 * 1024)).toFixed(2)} MB` : "PDF, ZIP, MP4, MP3, PNG — Max 25MB"}</p>
                                    <Button variant="outline" className="px-6 py-2 rounded-xl text-xs hover:bg-white border-slate-200 font-bold">
                                        {productFile ? "Change File" : "Browse Files"}
                                    </Button>
                                    {errors.file && <p className="text-[10px] font-black text-rose-500 uppercase mt-4">{errors.file}</p>}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-4 text-center font-medium leading-relaxed">
                                    Your file is stored securely in our private bucket and only shared with verified buyers after payment.
                                </p>
                            </Card>

                            {/* Preview Images */}
                            <Card className="p-8 shadow-[0px_20px_40px_rgba(16,27,50,0.04)] border-none">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center space-x-3">
                                        <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                        <h3 className="text-lg font-extrabold tracking-tight text-[#005ab4]">Preview Images</h3>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">0 / 5 Images</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:border-[#465f89]/60 hover:bg-blue-50/20 transition-all cursor-pointer group">
                                            <PhotoIcon className="w-8 h-8 text-slate-300 group-hover:text-[#465f89]/60 transition-colors" />
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider group-hover:text-[#465f89]/60">Add Image</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-4 font-medium">Recommended: 1280x720px (16:9), JPG or PNG.</p>
                            </Card>

                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">

                            {/* Thumbnail Section */}
                            <Card className="p-6 shadow-[0px_20px_40px_rgba(16,27,50,0.04)] border-none">
                                <div className="flex items-center space-x-3 mb-6">
                                    <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                    <h3 className="text-lg font-extrabold tracking-tight text-[#005ab4]">Thumbnail</h3>
                                </div>
                                <div 
                                    className="aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-4 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 hover:border-[#465f89]/50 hover:bg-blue-50/20 transition-all cursor-pointer group relative"
                                    onClick={() => document.getElementById('thumbnail-file')?.click()}
                                >
                                    <input 
                                        type="file" 
                                        id="thumbnail-file" 
                                        className="hidden" 
                                        onChange={handleThumbnailChange}
                                        accept="image/*"
                                    />
                                    {thumbnail ? (
                                        <img src={thumbnail} className="w-full h-full object-cover" alt="Thumbnail Preview" />
                                    ) : (
                                        <>
                                            <PhotoIcon className="w-10 h-10 text-slate-300 group-hover:text-[#465f89]/50 transition-colors" />
                                            <p className="text-xs font-bold text-slate-400">Click to upload thumbnail</p>
                                        </>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed text-center font-medium italic">
                                    Recommended: 1080x1080px (1:1)
                                </p>
                            </Card>

                            {/* Settings */}
                            <Card className="p-6 shadow-[0px_20px_40px_rgba(16,27,50,0.04)] border-none">
                                <div className="flex items-center space-x-3 mb-8">
                                    <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                    <h3 className="text-lg font-extrabold tracking-tight text-[#005ab4]">Settings</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-[#005ab4]">Publish Immediately</p>
                                            <p className="text-[10px] text-slate-500">Visible in store right away</p>
                                        </div>
                                        <Toggle checked={status} onChange={(e) => setStatus(e.target.checked)} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-[#005ab4]">Public Visibility</p>
                                            <p className="text-[10px] text-slate-500">Searchable on public store</p>
                                        </div>
                                        <Toggle checked={visibility} onChange={(e) => setVisibility(e.target.checked)} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-[#005ab4]">Limit Downloads</p>
                                            <p className="text-[10px] text-slate-500">Set max download count</p>
                                        </div>
                                        <Toggle checked={limitDownload} onChange={(e) => setLimitDownload(e.target.checked)} />
                                    </div>
                                    <hr className="border-slate-100" />
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

                            {/* Help Card */}
                            <div className="p-6 bg-gradient-to-br from-[#0873df] to-[#005ab4] rounded-2xl text-white overflow-hidden relative shadow-lg shadow-blue-500/20">
                                <div className="relative z-10">
                                    <h4 className="font-bold text-sm mb-2">Need Help?</h4>
                                    <p className="text-xs text-blue-200 mb-4 leading-relaxed">
                                        Learn how to create high-converting product listings in our Help Center.
                                    </p>
                                    <a className="inline-flex items-center text-white text-xs font-bold hover:underline" href="#">
                                        Read Creator Guide
                                        <ArrowUpRightIcon className="w-4 h-4 ml-1" />
                                    </a>
                                </div>
                                <QuestionMarkCircleIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {/* Publish Confirm Modal */}
            {publishConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-100 mb-4">
                                <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Publish Product?</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Produk <strong className="text-slate-900">{productFile?.name}</strong> akan diterbitkan dan langsung terlihat di toko. File akan disimpan secara aman di private bucket.
                            </p>
                        </div>
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                className="px-5 py-2.5 rounded-xl font-black text-slate-500 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest"
                                onClick={() => setPublishConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-6 py-2.5 rounded-xl font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2"
                                onClick={executePublish}
                            >
                                <CheckCircleIcon className="w-4 h-4" />
                                Yes, Publish
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
                                <ExclamationTriangleIcon className="absolute w-6 h-6" /> {/* Note: need to import ExclamationTriangleIcon if not there */}
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Buang Produk Baru?</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Anda sedang dalam proses membuat produk baru. Jika Anda keluar sekarang, semua data yang sudah diisi akan hilang.
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
        </div>
        </>
    );
};
