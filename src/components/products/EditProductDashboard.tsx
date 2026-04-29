import React, { useState } from 'react';
import { toast } from 'sonner';

import { supabase } from '../../lib/supabase';
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
    ExclamationCircleIcon,
    XMarkIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useSubscription, SubscriptionProvider } from '../../context/SubscriptionContext';

export const EditProductDashboard = () => {
    return (
        <SubscriptionProvider>
            <EditProductDashboardContent />
        </SubscriptionProvider>
    );
};

const EditProductDashboardContent = () => {
    const { hasFeature, isLoading: subLoading } = useSubscription();

    React.useEffect(() => {
        // Block access if feature is disabled in Admin
        if (!subLoading && !hasFeature('Digital Product Sales')) {
            window.location.replace('/dashboard');
        }
    }, [hasFeature, subLoading]);

    // States for data
    const [id, setId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState(true);
    const [visibility, setVisibility] = useState(true);
    const [coverUrl, setCoverUrl] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [fileName, setFileName] = useState('');
    const [previewImages, setPreviewImages] = useState<{ id: string; file?: File; url: string }[]>([]);
    const [downloadLimit, setDownloadLimit] = useState(false);
    const [downloadLimitVal, setDownloadLimitVal] = useState<string>('');
    const [linkExpiry, setLinkExpiry] = useState<string>('forever');

    // UI States
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [showFileDeleteModal, setShowFileDeleteModal] = useState(false);
    const [errors, setErrors] = useState<{ system?: string; price?: string }>({});

    const fetchProduct = async (productId: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/products/${productId}`);
            if (!res.ok) throw new Error('Gagal mengambil data produk');
            const data = await res.json();

            setTitle(data.title || '');
            setDescription(data.description || '');
            setPrice(data.price?.toString() || '');
            setCategory(data.type || '');
            setStatus(data.status === 'published');
            setVisibility(data.is_public !== false);
            setDownloadLimit(!!data.download_limit);
            setDownloadLimitVal(data.download_limit?.toString() || '');
            setLinkExpiry(data.link_expiry || 'forever');
            setCoverUrl(data.cover_url || '');
            setFileUrl(data.file_url || '');

            // Populate preview images
            if (data.preview_urls && Array.isArray(data.preview_urls)) {
                setPreviewImages(data.preview_urls.map((url: string) => ({
                    id: Math.random().toString(36).substring(7),
                    url
                })));
            }

            // Extract filename from URL (if it's a Supabase URL)
            if (data.file_url) {
                const parts = data.file_url.split('/');
                setFileName(parts[parts.length - 1] || 'Digital Asset');
            }
        } catch (error: any) {
            setErrors({ system: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    // Load Data
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        if (productId) {
            setId(productId);
            fetchProduct(productId);
        }
    }, []);



    if (subLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F8FAFC]">
                <div className="text-center group">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs font-black text-primary uppercase tracking-widest">Validating Access...</p>
                </div>
            </div>
        );
    }

    if (!hasFeature('Digital Product Sales')) {
        return null; // Will redirect via useEffect
    }

    const uploadFile = async (file: File, path: string, bucket: string = 'product') => {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, { upsert: true });

        if (error) throw error;

        // For product bucket, return public URL since it's configured as public
        if (bucket === 'product') {
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(data.path);
            return publicUrl;
        }

        // Legacy support for old buckets
        if (bucket === 'media-produk-private') {
            // Return internal path for private bucket items
            return data.path;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return publicUrl;
    };

    const handleSave = async () => {
        // Validation before saving
        const newErrors: { price?: string } = {};

        if (Number(price) < 10000) {
            newErrors.price = "Harga minimal adalah Rp 10.000";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setShowSaveModal(false);
        setIsSaving(true);
        setErrors({});

        try {
            const timestamp = Date.now();
            let final_cover_url = coverUrl;
            let final_file_url = fileUrl;

            // Get user ID for folder structure
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;
            if (!userId) {
                throw new Error('User not authenticated');
            }

            // 1. Check if new thumbnail uploaded
            const thumbInput = document.getElementById('thumbnail-file') as HTMLInputElement;
            if (thumbInput?.files?.[0]) {
                const thumbFile = thumbInput.files[0];
                const ext = thumbFile.name.split('.').pop();
                const thumbPath = `${userId}/${id}/thumbnail.${ext}`;
                final_cover_url = await uploadFile(thumbFile, thumbPath);
            }

            // 2. Check if new asset file uploaded
            const fileInput = document.getElementById('product-file') as HTMLInputElement;
            if (fileInput?.files?.[0]) {
                const productFile = fileInput.files[0];
                const ext = productFile.name.split('.').pop();
                const productPath = `${userId}/${id}/product.${ext}`;
                final_file_url = await uploadFile(productFile, productPath);
            }

            // 3. Process Preview Images
            const finalPreviewUrls = await Promise.all(
                previewImages.map(async (img, idx) => {
                    if (img.file) {
                        // It's a new file, upload it
                        const ext = img.file.name.split('.').pop();
                        const previewPath = `${userId}/${id}/preview_${idx}.${ext}`;
                        return await uploadFile(img.file, previewPath);
                    }
                    return img.url; // It's an existing URL
                })
            );

            // 4. Update Database via API
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    price: Number(price),
                    type: category || 'digital',
                    status: status ? 'published' : 'draft',
                    is_public: visibility,
                    download_limit: downloadLimit ? Number(downloadLimitVal) : null,
                    link_expiry: linkExpiry,
                    cover_url: final_cover_url,
                    file_url: final_file_url,
                    preview_urls: finalPreviewUrls
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.error || errData?.message || 'Gagal memperbarui produk');
            }

            setIsDirty(false);
            toast.success("Perubahan produk berhasil disimpan!");

            setTimeout(() => {
                window.location.href = '/products';
            }, 1000);
        } catch (error: any) {
            console.error('Update error:', error);
            setErrors({ system: error.message });
        } finally {
            setIsSaving(false);
        }
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

    const handlePreviewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages = Array.from(files).map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            url: URL.createObjectURL(file)
        }));

        setPreviewImages(prev => [...prev, ...newImages]);
        setIsDirty(true);
    };

    const removePreviewImage = (id: string) => {
        setPreviewImages(prev => prev.filter(img => img.id !== id));
        setIsDirty(true);
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F8FAFC]">
                <div className="text-center group">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs font-black text-primary uppercase tracking-widest">Loading Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] relative">

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
                    <h2 className="text-xl font-extrabold text-[#162138] tracking-tight">Edit Produk Digital</h2>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="secondary"
                        className="px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all bg-primary hover:bg-primary/90 text-white"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                    <button
                        onClick={async () => {
                            if (window.confirm('Hapus produk ini secara permanen?')) {
                                try {
                                    await fetch(`/api/products/${id}`, { method: 'DELETE' });
                                    window.location.href = '/products';
                                } catch (err) {
                                    toast.error('Gagal menghapus produk');
                                }

                            }
                        }}
                        className="p-2.5 text-red-500 hover:bg-red-50 border border-red-100 rounded-xl transition-colors"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
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
                                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                    <h3 className="text-lg font-extrabold tracking-tight text-primary">Informasi Produk</h3>
                                </div>

                                <div className="space-y-6">
                                    {errors.system && (
                                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                                            <ExclamationTriangleIcon className="w-5 h-5" />
                                            {errors.system}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Produk</label>
                                        <Input
                                            type="text"
                                            value={title}
                                            onChange={(e) => {
                                                setTitle(e.target.value);
                                                handleInputChange();
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi</label>
                                        <Textarea
                                            rows={5}
                                            value={description}
                                            onChange={(e) => {
                                                setDescription(e.target.value);
                                                handleInputChange();
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                                            <Select value={category} onChange={(e) => {
                                                setCategory(e.target.value);
                                                handleInputChange();
                                            }}>
                                                <option value="">— Pilih Kategori —</option>
                                                <option value="ebook">E-Book</option>
                                                <option value="course">Kursus Online</option>
                                                <option value="assets">Asset Desain</option>
                                                <option value="software">Software / Plugin</option>
                                                <option value="video">Bundle Video</option>
                                                <option value="templates">Template</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Harga (IDR)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">Rp</span>
                                                <Input
                                                    type="number"
                                                    value={price}
                                                    onChange={(e) => {
                                                        setPrice(e.target.value);
                                                        handleInputChange();
                                                        // Clear error when user types
                                                        if (errors.price) {
                                                            setErrors({ ...errors, price: undefined });
                                                        }
                                                    }}
                                                    className={`pl-10 ${errors.price ? 'border-red-300 focus:ring-red-200' : ''}`}
                                                />
                                                {errors.price && (
                                                    <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                                                        <ExclamationCircleIcon className="w-3.5 h-3.5" />
                                                        {errors.price}
                                                    </p>
                                                )}
                                                <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                                    <span className="font-medium">Catatan:</span> Fitur harga diskon sedang dalam pengembangan dan akan tersedia dalam update berikutnya.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* File Produk Digital Section */}
                            <Card className="p-8 shadow-[0px_20px_40px_rgba(16,27,50,0.04)] border-none">
                                <div className="flex items-center space-x-3 mb-8">
                                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                    <h3 className="text-lg font-extrabold tracking-tight text-primary">File Produk Digital</h3>
                                </div>

                                <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 p-10 text-center group hover:border-primary/50 transition-all cursor-pointer relative">
                                    <input
                                        type="file"
                                        id="product-file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setFileName(file.name);
                                                handleInputChange();
                                            }
                                        }}
                                    />
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <CloudArrowUpIcon className="w-8 h-8 text-primary" />
                                    </div>
                                    <p className="text-sm font-bold text-primary mb-1">Tarik dan lepas file di sini</p>
                                    <p className="text-xs text-slate-500 mb-6">Maksimal ukuran file 500MB (PDF, ZIP, MP4)</p>
                                    <Button variant="outline" className="px-6 py-2 rounded-full text-xs hover:bg-slate-100 border-slate-300 pointer-events-none">Pilih File</Button>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-blue-900/10">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-900/10 text-[#465f89] rounded flex items-center justify-center">
                                                <DocumentIcon className="w-5 h-5" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-xs font-bold text-primary truncate max-w-[200px]">{fileName || 'Belum ada file terpilih'}</p>
                                                <p className="text-[10px] text-slate-500">Asset siap digunakan</p>
                                            </div>
                                        </div>
                                        {fileName && (
                                            <button
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                onClick={() => setShowFileDeleteModal(true)}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Preview Images Gallery Section */}
                            <Card className="p-8 shadow-[0px_20px_40px_rgba(16,27,50,0.04)] border-none">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center space-x-3">
                                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                        <h3 className="text-lg font-extrabold tracking-tight text-primary">Galeri Gambar Preview</h3>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{previewImages.length} / 8 Foto</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {previewImages.map((img) => (
                                        <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden group/item shadow-sm border border-slate-100">
                                            <img src={img.url} className="w-full h-full object-cover transition-transform group-hover/item:scale-110" alt="Preview" />
                                            <div className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={() => removePreviewImage(img.id)}
                                                    className="p-2 bg-white rounded-lg text-rose-500 shadow-xl active:scale-90 transition-transform"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {previewImages.length < 8 && (
                                        <div
                                            className="aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer group"
                                            onClick={() => document.getElementById('gallery-files-edit')?.click()}
                                        >
                                            <CloudArrowUpIcon className="w-6 h-6 text-slate-300 group-hover:text-[#465f89]/60 transition-colors" />
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider group-hover:text-[#465f89]/60">Tambah Foto</p>
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        id="gallery-files-edit"
                                        className="hidden"
                                        multiple
                                        onChange={handlePreviewImagesChange}
                                        accept="image/*"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-4 font-medium italic italic">Galeri ini akan ditampilkan kepada calon pembeli sebagai preview produk.</p>
                            </Card>

                        </div>

                        {/* Right Column (Media & Settings) */}
                        <div className="space-y-8">

                            {/* Thumbnail Produk Section */}
                            <Card className="p-6 shadow-[0px_20px_40px_rgba(16,27,50,0.04)] border-none">
                                <div className="flex items-center space-x-3 mb-6">
                                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                    <h3 className="text-lg font-extrabold tracking-tight text-primary">Thumbnail</h3>
                                </div>
                                <div
                                    className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-4 cursor-pointer"
                                    onClick={() => document.getElementById('thumbnail-file')?.click()}
                                >
                                    <img
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        src={coverUrl || "https://images.unsplash.com/photo-1544006659-f0b21f04cb1b?w=400&h=400&fit=crop"}
                                        alt="Thumbnail"
                                    />
                                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="bg-white text-primary px-4 py-2 rounded-full text-xs font-bold flex items-center shadow-lg active:scale-95 transition-all">
                                            <PencilSquareIcon className="w-4 h-4 mr-2" />
                                            Ganti Gambar
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        id="thumbnail-file"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setCoverUrl(URL.createObjectURL(file));
                                                handleInputChange();
                                            }
                                        }}
                                        accept="image/*"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed text-center italic font-medium">Recommended size: 1080x1080px (1:1)</p>
                            </Card>

                            {/* Pengaturan Section */}
                            <Card className="p-6 shadow-[0px_20px_40px_rgba(16,27,50,0.04)] border-none">
                                <div className="flex items-center space-x-3 mb-8">
                                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                    <h3 className="text-lg font-extrabold tracking-tight text-primary">Pengaturan</h3>
                                </div>
                                <div className="space-y-6">

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-primary">Status Produk</p>
                                            <p className="text-[10px] text-slate-500">Tampilkan produk di toko</p>
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
                                            <p className="text-sm font-bold text-primary">Visibilitas Publik</p>
                                            <p className="text-[10px] text-slate-500">Dapat dicari di Google</p>
                                        </div>
                                        <Toggle
                                            checked={visibility}
                                            onChange={(e) => {
                                                setVisibility(e.target.checked);
                                                handleInputChange();
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-primary">Batasi Unduhan</p>
                                            <p className="text-[10px] text-slate-500">Atur jumlah maksimal unduhan</p>
                                        </div>
                                        <Toggle
                                            checked={downloadLimit}
                                            onChange={(e) => {
                                                setDownloadLimit(e.target.checked);
                                                handleInputChange();
                                            }}
                                        />
                                    </div>

                                    {downloadLimit && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jumlah Maksimal Unduhan</label>
                                            <Input 
                                                type="number" 
                                                placeholder="e.g. 5" 
                                                value={downloadLimitVal}
                                                onChange={(e) => {
                                                    setDownloadLimitVal(e.target.value);
                                                    handleInputChange();
                                                }}
                                            />
                                        </div>
                                    )}

                                    <hr className="border-slate-100" />

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kedaluwarsa Link Download</label>
                                        <Select 
                                            className="font-bold"
                                            value={linkExpiry}
                                            onChange={(e) => {
                                                setLinkExpiry(e.target.value);
                                                handleInputChange();
                                            }}
                                        >
                                            <option value="forever">Selamanya (Tanpa Batas)</option>
                                            <option value="24h">24 Jam</option>
                                            <option value="7d">7 Hari</option>
                                            <option value="30d">30 Hari</option>
                                        </Select>
                                    </div>
                                </div>
                            </Card>

                            {/* Quick Actions */}
                            <div className="p-6 bg-primary rounded-2xl text-white overflow-hidden relative shadow-lg shadow-primary/10">
                                <div className="relative z-10">
                                    <h4 className="font-bold text-sm mb-2">Butuh Bantuan?</h4>
                                    <p className="text-xs text-blue-200 mb-4 leading-relaxed">Pelajari cara mengoptimalkan penjualan produk digital Anda di Pusat Bantuan kami.</p>
                                    <a className="inline-flex items-center text-white text-xs font-bold hover:underline" href="#">
                                        Baca Panduan
                                        <ArrowUpRightIcon className="w-4 h-4 ml-1" />
                                    </a>
                                </div>
                                <QuestionMarkCircleIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
                            </div>

                        </div>
                    </div>
                </div>
            </main>


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
                                Apakah Anda yakin ingin menghapus file <strong className="text-slate-900">"{fileName}"</strong>? Anda harus mengunggah file baru agar produk tetap dapat diakses oleh pembeli.
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
                                    setFileUrl('');
                                    setFileName('');
                                    setShowFileDeleteModal(false);
                                    setIsDirty(true);
                                    toast.success("File produk berhasil dihapus.");
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

