import React from 'react';
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

export const ProductDetailDashboard = () => {
    const recentBuyers = [
        { name: 'Michael Smith', email: 'michael.smith@gmail.com', date: 'Oct 14, 2023', amount: '$24.90', initials: 'MS', color: 'bg-blue-50 text-blue-600' },
        { name: 'Sarah Johnson', email: 'sarah.j@outlook.com', date: 'Oct 12, 2023', amount: '$24.90', initials: 'SJ', color: 'bg-purple-50 text-purple-600' },
        { name: 'Andrew Davis', email: 'andrew.d@tepak.id', date: 'Oct 10, 2023', amount: '$24.90', initials: 'AD', color: 'bg-emerald-50 text-emerald-600' },
        { name: 'Linda Chen', email: 'linda.chen@gmail.com', date: 'Oct 08, 2023', amount: '$24.90', initials: 'LC', color: 'bg-amber-50 text-amber-600' },
    ];

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
                        <h2 className="text-xl font-extrabold text-[#162138] tracking-tight">Product Detail</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <a href="/edit-product" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-sm text-slate-600 transition-all">
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit Product
                    </a>
                    <button className="p-2.5 text-red-500 hover:bg-red-50 border border-red-100 rounded-xl transition-colors">
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
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFFfO0u3ABzaB5B6QVhNOFAv9wmpw2FE2IXeDpmfjmvxHPhy39x-T7Pzl9pxTZBSfuehl-5mcwrRoczZ9UohNhPnjIKHJswbQIU235Vv_OQDsYKjPkCaqhMD8u5BCxI6c_qTEf4HCdeL9HXok2xC_WaAlnM8Oz2BENBYgIPvorFlJEY6J-m2PET-FsOXaApOH1RTasb6E5KDXjLel-5WYiHgGxbax7lGpMQEUfLaVtnPnHdPMx_ZxXcPV6PeKHaebSt1QAWXI_Ii7K"
                                    alt="Product Thumbnail"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <Badge variant="success" className="text-[9px] font-black uppercase tracking-widest px-3 py-1 border-none bg-emerald-50 text-emerald-600">Active</Badge>
                                    <div className="flex items-center gap-1 text-amber-400">
                                        <StarIcon className="w-4 h-4 fill-current" />
                                        <span className="text-xs font-black text-slate-600">4.9</span>
                                        <span className="text-[10px] text-slate-400">(22)</span>
                                    </div>
                                </div>
                                <h3 className="text-base font-extrabold text-[#005ab4] leading-tight mb-1">Mastering UI Design for Creators</h3>
                                <p className="text-xs text-slate-500 font-medium">PDF, 124 Pages • E-Book</p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Price</p>
                                    <p className="text-2xl font-black text-[#005ab4]">$24.90</p>
                                </div>
                                <a href="#" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                                    <LinkIcon className="w-3 h-3" /> View Store Page
                                </a>
                            </div>
                        </Card>

                        {/* Stats Grid */}
                        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                            <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] flex flex-col justify-between group hover:scale-[1.02] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                                        <EyeIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+14%</span>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Total Views</p>
                                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">1,240</h4>
                                </div>
                            </Card>

                            <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] flex flex-col justify-between group hover:scale-[1.02] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                                        <ShoppingBagIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+8%</span>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Total Sold</p>
                                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">45</h4>
                                </div>
                            </Card>

                            <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] flex flex-col justify-between group hover:scale-[1.02] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-[#005ab4] rounded-2xl text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                        <CurrencyDollarIcon className="w-5 h-5" />
                                    </div>
                                    <ArrowTrendingUpIcon className="w-5 h-5 text-blue-200" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Total Revenue</p>
                                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">$1.12k</h4>
                                </div>
                            </Card>

                            <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] flex flex-col justify-between group hover:scale-[1.02] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform">
                                        <ChartBarIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">3.6%</span>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Conversion Rate</p>
                                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">3.6%</h4>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Details & Metadata */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Description */}
                        <Card className="lg:col-span-2 p-8 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)]">
                            <div className="flex items-center space-x-3 mb-6">
                                <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                <h3 className="text-base font-extrabold tracking-tight text-[#005ab4]">Product Description</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Complete step-by-step guide to mastering modern interface design using the Tailwind CSS framework. Suitable for beginners to intermediates. This ebook covers everything from design fundamentals to advanced component patterns used by top-tier SaaS companies.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-2">
                                {['design', 'ui', 'tailwind', 'figma', 'ebook'].map((tag) => (
                                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#005ab4] text-[10px] font-black uppercase tracking-widest rounded-full">
                                        <TagIcon className="w-3 h-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </Card>

                        {/* Metadata */}
                        <Card className="p-6 border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)]">
                            <div className="flex items-center space-x-3 mb-6">
                                <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                <h3 className="text-base font-extrabold tracking-tight text-[#005ab4]">Product Info</h3>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Created', value: 'Sep 01, 2023', icon: CalendarDaysIcon },
                                    { label: 'Last Updated', value: 'Oct 12, 2023', icon: CalendarDaysIcon },
                                    { label: 'Category', value: 'E-Book', icon: TagIcon },
                                    { label: 'File Type', value: 'PDF (12.4 MB)', icon: DocumentTextIcon },
                                    { label: 'Expiry', value: 'Forever', icon: LinkIcon },
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

                    {/* Recent Buyers */}
                    <Card className="border-none shadow-[0px_20px_40px_rgba(16,27,50,0.04)] overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="w-1.5 h-6 bg-[#465f89] rounded-full"></span>
                                <h3 className="text-base font-extrabold tracking-tight text-[#005ab4]">Recent Buyers</h3>
                            </div>
                            <a href="/orders" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                                View All Orders →
                            </a>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {recentBuyers.map((buyer) => (
                                <div key={buyer.email} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full ${buyer.color} flex items-center justify-center text-xs font-black`}>
                                            {buyer.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{buyer.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{buyer.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-[#005ab4]">{buyer.amount}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{buyer.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                </div>
            </main>
        </div>
    );
};
