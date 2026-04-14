import React, { useState } from 'react';
import PaymentMethodCard from './PaymentMethodCard';
import OrderSummary from './OrderSummary';
import { 
    UserCircleIcon, 
    CreditCardIcon, 
    QrCodeIcon, 
    BuildingLibraryIcon, 
    WalletIcon,
    ExclamationCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { z } from 'zod';
import { DuitkuSimulation } from './DuitkuSimulation';
import { cn } from '../../lib/utils';

const paymentMethods = [
    { 
        id: 'qris', 
        title: 'QRIS (Gopay, OVO, Dana, LinkAja)', 
        description: 'Bayar instan dengan scan kode QR melalui e-wallet favoritmu.',
        icon: QrCodeIcon 
    },
    { 
        id: 'va', 
        title: 'Virtual Account (BNI, BRI, Mandiri)', 
        description: 'Pembayaran otomatis yang diverifikasi dalam hitungan menit.',
        icon: BuildingLibraryIcon 
    },
    { 
        id: 'credit', 
        title: 'Kartu Kredit / Debit', 
        description: 'Mendukung Visa, Mastercard, dan JCB dengan enkripsi 256-bit.',
        icon: CreditCardIcon 
    },
    { 
        id: 'ewallet', 
        title: 'Electronic Wallet Direct', 
        description: 'Bayar langsung melalui aplikasi ShopeePay atau OVO.',
        icon: WalletIcon 
    }
];

export const CheckoutForm: React.FC = () => {
    const [buyerName, setBuyerName] = useState('');
    const [buyerEmail, setBuyerEmail] = useState('');
    const [buyerPhone, setBuyerPhone] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('qris');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'pending' | 'paid' | 'expired'>('pending');
    const [successModal, setSuccessModal] = useState<{ netIncome: number } | null>(null);
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const feePercentage = 5;

    // Fetch Product Info if ID exists in URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('product_id');
        if (productId) {
            fetchProduct(productId);
        } else {
            // Default product if none specified (for demo)
            setProduct({
                id: 'demo-product-id',
                title: 'Mastering No-Code: Professional Edition',
                price: 499000,
                merchant_id: 'demo-merchant-id',
                cover_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8uHu8gp3KKfCXG_MbnJzQ4Jj9ZUkrndYcEqZY1YbQDSzaE6nUX1x30Vhksf1XW-EbQw-dbxao5d80CzXzUHFLYzsM4_e4UVuMuA7hIcQIMBWEPNuRO1i7YMG01O1ZRcMh_lrQ_JT-PCl6KTz-ChYC3Eb_p3KR7fuRUAH1C0t_TlQEDpzY7mjTW5ha0G1AM3xKhwIzIYc8BdmyBhTn-1R_Lu3GIqN6n5FxPYGElZdG4nV5iU-0IDQXdO4WtzruigzCLRmAbRlE-lUX'
            });
            setIsLoading(false);
        }
    }, []);

    const fetchProduct = async (id: string) => {
        try {
            const res = await fetch(`/api/public/products/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProduct(data);
            } else {
                setErrors({ global: 'Produk tidak ditemukan. Silakan kembali ke halaman profil.' });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            setErrors({ global: 'Terjadi kesalahan saat mengambil data produk.' });
        } finally {
            setIsLoading(false);
        }
    };

    const productPrice = product?.price || 0;

    // Validation Schema
    const checkoutSchema = z.object({
        name: z.string().min(3, "Nama minimal 3 karakter"),
        email: z.string().email("Format email tidak valid"),
        phone: z.string().regex(/^\d+$/, "Nomor HP hanya boleh berisi angka").min(9, "Nomor HP tidak valid"),
    });

    const handleInitiatePayment = () => {
        if (!product) {
            setErrors({ global: 'Data produk belum dimuat dengan sempurna.' });
            return;
        }

        const result = checkoutSchema.safeParse({
            name: buyerName,
            email: buyerEmail,
            phone: buyerPhone
        });

        if (!result.success) {
            const formattedErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                formattedErrors[issue.path[0]] = issue.message;
            });
            setErrors(formattedErrors);
            return;
        }

        setErrors({});
        setIsPaymentOpen(true);
    };

    const handleSuccess = async (netIncome: number) => {
        // Save Order to Database
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: product.id,
                    merchant_id: product.merchant_id,
                    amount: productPrice,
                    buyer_name: buyerName,
                    buyer_email: buyerEmail,
                    buyer_phone: buyerPhone,
                    payment_method: selectedMethod.toUpperCase(),
                    status: 'success'
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to save order');
            }

            setOrderStatus('paid');
            setIsPaymentOpen(false);
            setSuccessModal({ netIncome });
        } catch (error: any) {
            console.error('Error saving order:', error);
            alert(`Pembayaran berhasil, namun: ${error.message}. Silakan hubungi admin.`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-screen-2xl mx-auto w-full px-8 py-12 ">
            
            {/* LEFT COLUMN: MAIN FORM CONTENT */}
            <div className="flex-grow lg:w-2/3 space-y-8">
                
                {/* BUYER INFO SECTION */}
                <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2 tracking-tight">
                        <UserCircleIcon className="w-7 h-7 text-secondary" />
                        Informasi Pembeli
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-on-surface-variant">Nama Lengkap</label>
                            <input 
                                className={cn(
                                    "w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 transition-all placeholder:text-outline",
                                    errors.name ? "ring-2 ring-rose-500" : "focus:ring-secondary"
                                )} 
                                placeholder="Masukkan nama sesuai KTP"
                                value={buyerName}
                                onChange={(e) => setBuyerName(e.target.value)}
                                type="text"
                            />
                            {errors.name && <p className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3"/> {errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-on-surface-variant">Email</label>
                            <input 
                                className={cn(
                                    "w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 transition-all placeholder:text-outline",
                                    errors.email ? "ring-2 ring-rose-500" : "focus:ring-secondary"
                                )} 
                                placeholder="contoh@email.com"
                                value={buyerEmail}
                                onChange={(e) => {
                                    setBuyerEmail(e.target.value);
                                    if(errors.email) setErrors({...errors, email: ''});
                                }}
                                type="email"
                            />
                            {errors.email && <p className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3"/> {errors.email}</p>}
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-on-surface-variant">No HP (WhatsApp)</label>
                            <div className="relative">
                                <span className={cn("absolute left-4 top-1/2 -translate-y-1/2 font-bold tracking-tighter opacity-50", errors.phone ? "text-rose-500" : "text-on-surface-variant")}>+62</span>
                                <input 
                                    className={cn(
                                        "w-full bg-surface-container-low border-none rounded-lg p-3 pl-14 focus:ring-2 transition-all placeholder:text-outline font-medium tracking-widest",
                                        errors.phone ? "ring-2 ring-rose-500" : "focus:ring-secondary"
                                    )} 
                                    placeholder="812 3456 7890" 
                                    value={buyerPhone}
                                    onChange={(e) => {
                                        setBuyerPhone(e.target.value);
                                        if(errors.phone) setErrors({...errors, phone: ''});
                                    }}
                                    type="text"
                                />
                            </div>
                            {errors.phone && <p className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3"/> {errors.phone}</p>}
                        </div>
                    </div>
                </section>

                {/* PAYMENT METHOD SECTION */}
                <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2 tracking-tight">
                        <CreditCardIcon className="w-7 h-7 text-secondary" />
                        Metode Pembayaran
                    </h2>
                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                            <PaymentMethodCard 
                                key={method.id}
                                id={method.id}
                                title={method.title}
                                description={method.description}
                                icon={method.icon}
                                isSelected={selectedMethod === method.id}
                                onSelect={setSelectedMethod}
                            />
                        ))}
                    </div>
                </section>
            </div>

            {/* RIGHT COLUMN: SIDEBAR */}
            <div className="lg:w-1/3">
                <OrderSummary 
                    productTitle={product?.title || 'Loading...'}
                    productPrice={productPrice}
                    feePercentage={feePercentage}
                    image={product?.cover_url || ''}
                    onPay={handleInitiatePayment}
                    status={orderStatus}
                />
            </div>

            <DuitkuSimulation 
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                onSuccess={handleSuccess}
                grossAmount={productPrice + (productPrice * (feePercentage/100))}
            />

            {/* Payment Success Modal */}
            {successModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-100 mx-auto mb-4">
                                <CheckCircleIcon className="w-9 h-9 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Pembayaran Berhasil!</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Terima kasih! <strong className="text-emerald-600">Rp {successModal.netIncome.toLocaleString('id-ID')}</strong> telah dikirim ke kreator. Link download akan segera dikirim ke email Anda.
                            </p>
                        </div>
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-center">
                            <button className="px-8 py-2.5 rounded-xl font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all text-[10px] uppercase tracking-widest" onClick={() => setSuccessModal(null)}>OK, Mengerti</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutForm;
