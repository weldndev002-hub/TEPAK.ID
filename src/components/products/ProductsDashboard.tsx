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
    TrashIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export const ProductsDashboard = () => {
    const [products, setProducts] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [deleteModal, setDeleteModal] = React.useState(false);
    const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
    const [toast, setToast] = React.useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const [stats, setStats] = React.useState({ totalSold: 0, totalCustomers: 0 });

    const fetchStats = async () => {
        try {
            const [ordersRes, custRes] = await Promise.all([
                fetch('/api/orders/stats'),
                fetch('/api/customers')
            ]);
            
            let totalSold = 0;
            let totalCust = 0;

            if (ordersRes.ok) {
                const orderData = await ordersRes.json();
                totalSold = orderData.total_revenue;
            }
            if (custRes.ok) {
                const custData = await custRes.json();
                totalCust = custData.length;
            }
            setStats({ totalSold, totalCustomers: totalCust });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    React.useEffect(() => {
        fetchProducts();
        fetchStats();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    const handleDeleteClick = (product: any) => {
        setSelectedProduct(product);
        setDeleteModal(true);
    };

    const executeDelete = async () => {
        if (!selectedProduct) return;
        
        try {
            const res = await fetch(`/api/products/${selectedProduct.id}`, {
                method: 'DELETE'
            });
            
            if (res.ok) {
                showToast(`Produk "${selectedProduct.title}" berhasil dihapus.`);
                fetchProducts();
            } else {
                showToast(`Gagal menghapus produk.`);
            }
        } catch (error) {
            showToast(`Kesalahan sistem saat menghapus.`);
        } finally {
            setDeleteModal(false);
        }
    };

    const filterTabsData = [
        { label: 'Semua', value: 'all' },
        { label: 'Aktif', value: 'active' },
        { label: 'Draf', value: 'draft' },
        { label: 'Habis', value: 'sold_out' },
    ];
    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#f8f9fb] relative">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-bold bg-emerald-500 text-white animate-in slide-in-from-right duration-300">
                    <CheckCircleIcon className="w-5 h-5 shrink-0" />
                    {toast}
                </div>
            )}

            {/* Main Content */}
            <div className="px-8 mt-8 pb-12 overflow-y-auto">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Produk Digital</h2>
                        <p className="text-slate-500 mt-1 font-medium">Kelola semua aset digital dan kursus Anda dari satu tempat.</p>
                    </div>
                    <a href="/add-product" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform bg-primary hover:bg-primary/90 text-white">
                        <PlusIcon className="w-5 h-5" />
                        Tambah Produk
                    </a>
                </div>

                {/* Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Card className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Produk</p>
                            <h3 className="text-4xl font-extrabold text-primary leading-tight">{products.length}</h3>
                            <p className="text-xs text-slate-500 font-bold mt-2">Aset Aktif</p>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <ArchiveBoxIcon className="w-6 h-6" />
                        </div>
                    </Card>

                    <Card className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Pendapatan</p>
                            <h3 className="text-2xl font-extrabold text-primary leading-tight">{formatCurrency(stats.totalSold)}</h3>
                            <p className="text-xs text-emerald-500 font-bold mt-2">Penjualan Terverifikasi</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                            <BanknotesIcon className="w-6 h-6" />
                        </div>
                    </Card>

                    <Card className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Pelanggan</p>
                            <h3 className="text-4xl font-extrabold text-primary leading-tight">{stats.totalCustomers}</h3>
                            <p className="text-xs text-slate-500 font-bold mt-2">Pembeli Unik</p>
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
                                <TableHead>Produk</TableHead>
                                <TableHead className="hidden md:table-cell">Metrik</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat Produk...</TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">Produk tidak ditemukan. Mulai dengan menambah satu!</TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id} className="group">
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                                    <img 
                                                        alt={product.title} 
                                                        className="w-full h-full object-cover" 
                                                        src={product.cover_url || "https://images.unsplash.com/photo-1544006659-f0b21f04cb1b?w=400&h=400&fit=crop"}
                                                    />
                                                </div>
                                                <div>
                                                    <a href={`/product-detail?id=${product.id}`} className="text-sm font-bold text-primary group-hover:text-primary/80 transition-colors hover:underline line-clamp-1">{product.title}</a>
                                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">{product.type}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-xs font-medium text-slate-600">
                                                    <EyeIcon className="w-4 h-4 mr-1.5 opacity-60" /> {product.views_count || 0} dilihat
                                                </div>
                                                <div className="flex items-center text-xs font-medium text-slate-600">
                                                    <ShoppingBagIcon className="w-4 h-4 mr-1.5 opacity-60" /> {product.sold_count || 0} terjual
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-bold text-primary">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={product.status === 'published' ? 'success' : 'pending'}>
                                                {product.status === 'published' ? 'Aktif' : 'Draf'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a href={`/edit-product?id=${product.id}`} className="p-2 inline-block text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </a>
                                                <button 
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    onClick={() => handleDeleteClick(product)}
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    
                    {/* Pagination */}
                    <Pagination 
                        currentPage={1} 
                        totalPages={1} 
                        totalItems={products.length} 
                        itemsPerPage={10}
                        className="rounded-b-none border-t border-slate-100" 
                    />
                </Card>
            </div>
            
            {/* BottomNavBar Spacer for Mobile */}
            <div className="md:hidden h-16 w-full shrink-0"></div>

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-100 mb-4">
                                <ExclamationTriangleIcon className="w-6 h-6 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Hapus Produk?</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Apakah Anda yakin ingin menghapus produk <strong className="text-slate-900">"{selectedProduct?.title}"</strong>? 
                                Member yang sudah membeli produk ini masih akan dapat mengaksesnya, namun produk ini tidak akan tersedia lagi di toko Anda.
                            </p>
                        </div>
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button 
                                className="px-5 py-2.5 rounded-xl font-black text-slate-500 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest" 
                                onClick={() => setDeleteModal(false)}
                            >
                                Batal
                            </button>
                            <button 
                                className="px-6 py-2.5 rounded-xl font-black bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all text-[10px] uppercase tracking-widest" 
                                onClick={executeDelete}
                            >
                                Ya, Hapus Produk
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

