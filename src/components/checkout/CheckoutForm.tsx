import React, { useState, useEffect } from 'react';
import PaymentMethodCard from './PaymentMethodCard';
import OrderSummary from './OrderSummary';
import { 
    UserCircleIcon, 
    CreditCardIcon, 
    QrCodeIcon, 
    BuildingLibraryIcon, 
    WalletIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { z } from 'zod';
import { DuitkuPaymentModal } from './DuitkuPaymentModal';
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
    const [creatorUrl, setCreatorUrl] = useState('/public');

    // DuitKu Credentials (should be fetched from merchant settings or environment)
    const [duitkuMerchantCode, setDuitkuMerchantCode] = useState('');
    const [duitkuMerchantKey, setDuitkuMerchantKey] = useState('');
    const [orderId, setOrderId] = useState('');

    const feePercentage = 5;

    // Fetch Product Info if ID exists in URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('product_id');
        
        // Generate unique order ID
        const newOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setOrderId(newOrderId);

        // TODO: Load DuitKu credentials from merchant settings
        // For now, these should be stored in environment variables or fetched from API
        const merchantCode = import.meta.env.PUBLIC_DUITKU_MERCHANT_CODE || '';
        const merchantKey = import.meta.env.PUBLIC_DUITKU_MERCHANT_KEY || '';
        
        setDuitkuMerchantCode(merchantCode);
        setDuitkuMerchantKey(merchantKey);

        if (productId) {
            fetchProduct(productId);
        } else {
            setErrors({ global: 'Link produk tidak valid atau tidak ditemukan.' });
            setIsLoading(false);
        }
    }, []);

    const fetchProduct = async (id: string) => {
        try {
            const res = await fetch(`/api/public/products/${id}`);
            console.log(`[CheckoutForm] Fetch product ${id}:`, res.status);
            
            if (res.ok) {
                const data = await res.json();
                console.log(`[CheckoutForm] Product data:`, data);
                setProduct(data);
                
                // Fetch creator profile based on merchant_id
                if (data.merchant_id) {
                    try {
                        const profileRes = await fetch(`/api/public/profiles/${data.merchant_id}`);
                        console.log(`[CheckoutForm] Fetch profile ${data.merchant_id}:`, profileRes.status);
                        
                        if (profileRes.ok) {
                            const profile = await profileRes.json();
                            console.log(`[CheckoutForm] Profile data:`, profile);
                            
                            // Use username if available, fallback to profile ID or full_name
                            let creatorIdentifier = null;
                            
                            if (profile?.username) {
                                creatorIdentifier = profile.username;
                                console.log(`[CheckoutForm] Using username:`, creatorIdentifier);
                            } else if (profile?.full_name) {
                                // Fallback: use full_name converted to URL-friendly format
                                creatorIdentifier = profile.full_name
                                    .toLowerCase()
                                    .replace(/\s+/g, '-')
                                    .replace(/[^a-z0-9-]/g, '');
                                console.log(`[CheckoutForm] Fallback to full_name:`, creatorIdentifier);
                            } else if (profile?.id) {
                                // Last resort: use profile ID
                                creatorIdentifier = profile.id;
                                console.log(`[CheckoutForm] Fallback to profile ID:`, creatorIdentifier);
                            }
                            
                            if (creatorIdentifier) {
                                const newUrl = `/u/${creatorIdentifier}`;
                                console.log(`[CheckoutForm] Setting creatorUrl to:`, newUrl);
                                setCreatorUrl(newUrl);
                            }
                        } else {
                            console.error(`[CheckoutForm] Profile fetch failed:`, profileRes.status);
                        }
                    } catch (err) {
                        console.error('Error fetching creator profile:', err);
                    }
                }
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

    // Main payment initiation handler

    const handleInitiatePayment = async () => {
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

        try {
            setOrderStatus('processing');
            
            // 1. Map Method to Duitku Code
            const methodMapping: Record<string, string> = {
                'qris': 'SP', // ShopeePay (Paling stabil di Sandbox)
                'va': 'BT',   // Bank Transfer / VA
                'credit': 'VC', // VISA/Mastercard
                'ewallet': 'OV' // OVO
            };
            const duitkuMethod = methodMapping[selectedMethod] || 'SP';

            // 2. Create Order & Get Payment URL in one go
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
                    payment_method: duitkuMethod,
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Gagal membuat pesanan');
            }

            const data = await res.json();
            
            // 2. Redirect to Duitku Payment Page
            if (data.payment && data.payment.paymentUrl) {
                console.log('[Checkout] Redirecting to:', data.payment.paymentUrl);
                window.location.href = data.payment.paymentUrl;
            } else {
                // Fallback jika tidak ada link payment
                setOrderStatus('paid');
                setSuccessModal({ netIncome: productPrice * 0.95 });
            }
        } catch (error: any) {
            console.error('Error initiating order:', error);
            setErrors({ global: error.message });
            setOrderStatus('idle');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center px-8">
                <div className="max-w-screen-2xl mx-auto px-0 mb-8 w-full">
                    <a href={creatorUrl} className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm group">
                        <ArrowLeftIcon className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                        Kembali
                    </a>
                </div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Show error if product failed to load
    if (errors.global || !product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] px-8">
                <div className="max-w-screen-2xl mx-auto mb-8 w-full">
                    <a href={creatorUrl} className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm group">
                        <ArrowLeftIcon className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                        Kembali
                    </a>
                </div>
                <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-8 max-w-md text-center">
                    <ExclamationCircleIcon className="w-12 h-12 text-rose-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-rose-700 mb-2">Gagal Memuat Produk</h3>
                    <p className="text-sm text-rose-600 mb-6">
                        {errors.global || 'Produk tidak ditemukan atau terjadi kesalahan saat memuat data.'}
                    </p>
                    <a 
                        href={creatorUrl} 
                        className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition"
                    >
                        Kembali
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-screen-2xl mx-auto w-full px-8 py-12 ">
            
            {/* LEFT COLUMN: MAIN FORM CONTENT */}
            <div className="flex-grow lg:w-2/3 space-y-8">
                
                {/* BACK BUTTON */}
                <div className="-mx-8 px-8 py-4 border-b border-slate-100">
                    <a href={creatorUrl} className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm group">
                        <ArrowLeftIcon className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Kreator
                    </a>
                </div>

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
