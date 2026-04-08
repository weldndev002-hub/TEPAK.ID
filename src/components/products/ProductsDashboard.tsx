import React from 'react';
import { Card } from '../ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FilterTabs } from '../ui/FilterTabs';
import { Pagination } from '../ui/Pagination';
import { 
    PlusIcon, 
    ArrowTrendingUpIcon, 
    ArchiveBoxIcon, 
    BanknotesIcon, 
    UsersIcon, 
    EyeIcon, 
    ShoppingBagIcon, 
    PencilSquareIcon, 
    TrashIcon 
} from '@heroicons/react/24/outline';

export const ProductsDashboard = () => {
    const filterTabsData = [
        { label: 'All', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
        { label: 'Sold Out', value: 'sold_out' },
    ];
    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#f8f9fb] font-['Plus_Jakarta_Sans',sans-serif]">
            {/* Main Content */}
            <div className="px-8 mt-8 pb-12 overflow-y-auto">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-[#005ab4] tracking-tight">Digital Products</h2>
                        <p className="text-slate-500 mt-1 font-medium">Manage all your digital assets and courses from one place.</p>
                    </div>
                    <Button variant="secondary" className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-transform bg-[#465f89] hover:bg-[#344d77] text-white">
                        <PlusIcon className="w-5 h-5" />
                        Add Product
                    </Button>
                </div>

                {/* Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Card className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Products</p>
                            <h3 className="text-4xl font-extrabold text-[#005ab4] leading-tight">12</h3>
                            <p className="text-xs text-green-600 font-bold mt-2 flex items-center">
                                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> +2 this month
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <ArchiveBoxIcon className="w-6 h-6" />
                        </div>
                    </Card>

                    <Card className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Sold</p>
                            <h3 className="text-4xl font-extrabold text-[#005ab4] leading-tight">$4.2k</h3>
                            <p className="text-xs text-green-600 font-bold mt-2 flex items-center">
                                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> +15% from last week
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                            <BanknotesIcon className="w-6 h-6" />
                        </div>
                    </Card>

                    <Card className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Customers</p>
                            <h3 className="text-4xl font-extrabold text-[#005ab4] leading-tight">89</h3>
                            <p className="text-xs text-slate-500 font-bold mt-2">Verified customers</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                            <UsersIcon className="w-6 h-6" />
                        </div>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6">
                    <FilterTabs tabs={filterTabsData} activeTab="all" />
                </div>

                {/* Product Table */}
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Metrics</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="group">
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                            <img alt="E-Book Design" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7uu6UxFuaXnXuaIyO5j3EjVQgNUBmjEoMhrk44cqOTMWeqeqc1eayA_oq42UxyAniiY0djVt0F7lhy8LCQlRFE7sVxi-HqeFFFbMu0oSKZqcbx3wAafWzgXv1B5zdz5tJP2joWHnyefVsetMoKsGcuNF4N15v5SAP0JhHGwzaEcqalp1TCa1rU2LieciJktEcf99aBzC6ICjMSIYf_LCPMxGLO9ZlUS7TTqpdzWPN42ynZmhHRMAu1L9DlH5aF-_fh9ghiJD5hxPh"/>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#005ab4] group-hover:text-[#465f89] transition-colors">Mastering UI Design for Creators</h4>
                                            <p className="text-xs text-slate-500 font-medium">PDF, 124 Pages</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center text-xs font-medium text-slate-600">
                                            <EyeIcon className="w-4 h-4 mr-1.5 opacity-60" /> 1,240 views
                                        </div>
                                        <div className="flex items-center text-xs font-medium text-slate-600">
                                            <ShoppingBagIcon className="w-4 h-4 mr-1.5 opacity-60" /> 45 sold
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-bold text-[#005ab4]">$14.90</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="success">Active</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <a href="/edit-product" className="p-2 inline-block text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </a>
                                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>

                            <TableRow className="group">
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                            <img alt="Web Template" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUrJvg6hYUipxufaFuot0-TUo-ZqqjI1nre9KfTpgZQJdS45Bef59Z5YPilbfPn8n0SdIv2DCu84EN7pJ8MYhoUlJqcTV4pZ7WtzacfIls8xtl2FN4J8rdih9MOuZ8yegX4II82mMCHZYzDjTlRd2qClwBB05Xc9r0cHB8qKf3gRebvoOqvLAXuxLUmAZbjcoV1yRUrWSnQCrZcH01xYTAVqNpyuScj-vlEs8wzy7unfDivuI0B-OUtBe7e6B7EpaYiJw0VwFdcvv1"/>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#005ab4] group-hover:text-[#465f89] transition-colors">Portfolio Template: Zenith Pro</h4>
                                            <p className="text-xs text-slate-500 font-medium">HTML/React Source</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center text-xs font-medium text-slate-600">
                                            <EyeIcon className="w-4 h-4 mr-1.5 opacity-60" /> 892 views
                                        </div>
                                        <div className="flex items-center text-xs font-medium text-slate-600">
                                            <ShoppingBagIcon className="w-4 h-4 mr-1.5 opacity-60" /> 12 sold
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-bold text-[#005ab4]">$29.90</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="pending">Draft</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <a href="/edit-product" className="p-2 inline-block text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </a>
                                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>

                            <TableRow className="group">
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                            <img alt="Video Course" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx_jW_O6wmHNZtjt0psQRBdBxAsAEkzBRoIMZs1DKE57TqeY_0ZXZV7zEiv4ZN2FcF7UKQg9Ar8wC4vcpi8U9uz7beiyacFdCjsT4X1VlENz6KNrcqaXSk2QsI86SnpdF4b0NpjaHc1mwQyizh2LUuxn7mOjd97esTawARAe12pAtv6lyL8zSrE6shX-8srjaaywK8BkTjBZWjvdSr2pZQX62bTOhiWbVFU8j_P8CqzaPaNIARuNSFFaUWcmCYae05nftAmEyCoyrZ"/>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#005ab4] group-hover:text-[#465f89] transition-colors">Social Media Strategy Bundle</h4>
                                            <p className="text-xs text-slate-500 font-medium">Video &amp; Checklist</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center text-xs font-medium text-slate-600">
                                            <EyeIcon className="w-4 h-4 mr-1.5 opacity-60" /> 3,450 views
                                        </div>
                                        <div className="flex items-center text-xs font-medium text-slate-600">
                                            <ShoppingBagIcon className="w-4 h-4 mr-1.5 opacity-60" /> 132 sold
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-bold text-[#005ab4]">$45.00</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="success">Active</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <a href="/edit-product" className="p-2 inline-block text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </a>
                                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    
                    {/* Pagination */}
                    <Pagination 
                        currentPage={1} 
                        totalPages={3} 
                        totalItems={12} 
                        itemsPerPage={3}
                        className="rounded-b-none border-t border-slate-100" 
                    />
                </Card>
            </div>
            
            {/* BottomNavBar Spacer for Mobile */}
            <div className="md:hidden h-16 w-full shrink-0"></div>
        </div>
    );
};

