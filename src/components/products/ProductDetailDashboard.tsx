import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
    ArrowLeftIcon,
    EyeIcon,
    ShoppingBagIcon,
    StarIcon,
    PencilSquareIcon,
    TrashIcon,
    ArrowTrendingUpIcon,
    DocumentTextIcon,
    LinkIcon,
    TagIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';

import { useSubscription } from '../../context/SubscriptionContext';

export const ProductDetailDashboard = () => {
    const { hasFeature, isLoading: subLoading } = useSubscription();

    useEffect(() => {
        // Block access if feature is disabled in Admin
        if (!subLoading && !hasFeature('Digital Product Sales')) {
            window.location.replace('/dashboard');
        }
    }, [hasFeature, subLoading]);

    const [product, setProduct] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
            fetchData(id);
        }
    }, []);

    const fetchData = async (id: string) => {
        try {
            const [prodRes, statsRes] = await Promise.all([
                fetch(`/api/products/${id}`),
                fetch(`/api/products/${id}/stats`)
            ]);

            if (prodRes.ok) {
                const prodData = await prodRes.json();
                setProduct(prodData);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }
        } catch (error) {
            console.error('Error fetching product data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (subLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!hasFeature('Digital Product Sales')) {
        return null; // Will redirect via useEffect
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] p-8 text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Produk Tidak Ditemukan</h3>
                <p className="text-slate-500 mb-6">Produk yang Anda cari tidak tersedia atau telah dihapus.</p>
                <a href="/products" className="px-6 py-2 bg-primary text-white rounded-xl font-bold">Kembali ke Produk</a>
            </div>
        );
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] ">
            {/* Contextual Header */}
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md flex justify-between items-center w-full px-8 py-4 shadow-[0px_20px_40px_rgba(16,27,50,0.06)] border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <a href="/products" className="text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-lg hover:bg-slate-100">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </a>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-0.5">Products</p>
                        <h2 className="text-xl font-extrabold text-[#162138] tracking-tight">{product.title}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <a href={`/edit-product?id=${product.id}`} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-sm text-slate-600 transition-all">
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit Produk
                    </a>
                    <button 
                        onClick={() => {
                            if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                                fetch(`/api/products/${product.id}`, { method: 'DELETE' })
                                    .then(() => window.location.href = '/products');
                            }
                        }}
                        className="p-2.5 text-red-500 hover:bg-red-50 border border-red-100 rounded-xl transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Top Hero Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Product Card */}
                        <Card className="lg:col-span-1 p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] flex flex-col gap-5">
                            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                                <img
                                    src={product.cover_url || 'https://via.placeholder.com/400x400?text=No+Image'}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <Badge variant={product.status === 'active' || product.status === 'published' ? 'success' : 'neutral'} className="text-[9px] font-black uppercase tracking-widest px-3 py-1 border-none">
                                        {product.status}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-amber-400">
                                        <StarIcon className="w-4 h-4 fill-current" />
                                        <span className="text-xs font-black text-slate-600">5.0</span>
                                        <span className="text-[10px] text-slate-400">(0)</span>
                                    </div>
                                </div>
                                <h3 className="text-base font-extrabold text-primary leading-tight mb-1">{product.title}</h3>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{product.type}</p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Harga</p>
                                    <p className="text-xl font-black text-primary">{formatCurrency(product.price)}</p>
                                </div>
                                <a href={`/checkout?product_id=${product.id}`} target="_blank" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                                    <LinkIcon className="w-3 h-3" /> Lihat Checkout
                                </a>
                            </div>
                        </Card>

                        {/* Stats Grid */}
                        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                            <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] flex flex-col justify-between group hover:scale-[1.02] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                                        <EyeIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Total</span>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Total Dilihat</p>
                                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">
                                        {isLoading ? '...' : (stats?.total_views ?? 0).toLocaleString('id-ID')}
                                    </h4>
                                </div>
                            </Card>

                            <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] flex flex-col justify-between group hover:scale-[1.02] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                                        <ShoppingBagIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Live</span>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Total Terjual</p>
                                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">
                                        {isLoading ? '...' : (stats?.total_sold ?? 0)}
                                    </h4>
                                </div>
                            </Card>

                            <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] flex flex-col justify-between group hover:scale-[1.02] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                        <CurrencyDollarIcon className="w-5 h-5" />
                                    </div>
                                    <ArrowTrendingUpIcon className="w-5 h-5 text-blue-200" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Total Penghasilan</p>
                                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter">
                                        {isLoading ? '...' : formatCurrency(stats?.total_revenue ?? 0)}
                                    </h4>
                                </div>
                            </Card>

                            <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] flex flex-col justify-between group hover:scale-[1.02] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform">
                                        <ChartBarIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-full">CVR</span>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Tingkat Konversi</p>
                                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">
                                        {isLoading ? '...' : `${stats?.conversion_rate ?? '0.0'}%`}
                                    </h4>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Details & Metadata */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Description */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="p-8 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)]">
                                <div className="flex items-center space-x-3 mb-6">
                                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                    <h3 className="text-base font-extrabold tracking-tight text-primary">Deskripsi Produk</h3>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {product.description || 'Tidak ada deskripsi untuk produk ini.'}
                                </p>
                            </Card>

                            {/* Gallery Preview */}
                            {product.preview_urls && product.preview_urls.length > 0 && (
                                <Card className="p-8 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)]">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                        <h3 className="text-base font-extrabold tracking-tight text-primary">Galeri Preview</h3>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {product.preview_urls.map((url: string, idx: number) => (
                                            <div key={idx} className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                                <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-8">
                            {/* Digital Asset */}
                            <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] bg-primary/5 border border-primary/10">
                                <div className="flex items-center space-x-3 mb-6">
                                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                    <h3 className="text-base font-extrabold tracking-tight text-primary">Asset Digital</h3>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-primary/10 mb-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                            <DocumentTextIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">URL File</p>
                                            <p className="text-xs font-bold text-slate-700 truncate">{product.file_url || 'Belum ada file diunggah'}</p>
                                        </div>
                                    </div>
                                    {product.file_url && (
                                        <a 
                                            href={product.admin_download_url || product.file_url} 
                                            target="_blank" 
                                            className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                        >
                                            Lihat File Sumber
                                        </a>
                                    )}
                                </div>
                                <p className="text-[9px] text-slate-400 font-medium text-center italic">Hanya Anda (merchant) yang dapat melihat link ini.</p>
                            </Card>

                            {/* Metadata */}
                            <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)]">
                                <div className="flex items-center space-x-3 mb-6">
                                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                    <h3 className="text-base font-extrabold tracking-tight text-primary">Info Produk</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Dibuat', value: new Date(product.created_at).toLocaleDateString(), icon: CalendarDaysIcon },
                                        { label: 'Kategori', value: product.type, icon: TagIcon },
                                        { label: 'Status', value: product.status, icon: DocumentTextIcon },
                                    ].map(({ label, value, icon: Icon }) => (
                                        <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Icon className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Recent Buyers */}
                    <Card className="border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                <h3 className="text-base font-extrabold tracking-tight text-primary">Pembeli Terbaru</h3>
                            </div>
                            <a href="/orders" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                                Lihat Semua Pesanan →
                            </a>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {stats?.recent_buyers?.length > 0 ? (
                                stats.recent_buyers.map((order: any) => (
                                    <div key={order.id} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                                                {order.customers?.name?.charAt(0) || 'C'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{order.customers?.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{order.customers?.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-primary">{formatCurrency(order.amount)}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                    Belum ada pembeli untuk produk ini.
                                </div>
                            )}
                        </div>
                    </Card>

                </div>
            </main>
        </div>
    );
};
