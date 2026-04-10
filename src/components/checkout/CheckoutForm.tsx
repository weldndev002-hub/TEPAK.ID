import React, { useState } from 'react';
import PaymentMethodCard from './PaymentMethodCard';
import OrderSummary from './OrderSummary';
import { 
    UserCircleIcon, 
    CreditCardIcon, 
    QrCodeIcon, 
    BuildingLibraryIcon, 
    WalletIcon,
    ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { z } from 'zod';
import { DuitkuSimulation } from './DuitkuSimulation';
import { cn } from '../../lib/utils';

export const CheckoutForm: React.FC = () => {
    const [buyerName, setBuyerName] = useState('');
    const [buyerEmail, setBuyerEmail] = useState('');
    const [buyerPhone, setBuyerPhone] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('qris');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'pending' | 'paid' | 'expired'>('pending');

    const productPrice = 499000;
    const feePercentage = 5;

    // Validation Schema
    const checkoutSchema = z.object({
        name: z.string().min(3, "Nama minimal 3 karakter"),
        email: z.string().email("Format email tidak valid"),
        phone: z.string().regex(/^\d+$/, "Nomor HP hanya boleh berisi angka").min(9, "Nomor HP tidak valid"),
    });

    const handleInitiatePayment = () => {
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

    const handleSuccess = (netIncome: number) => {
        setOrderStatus('paid');
        setIsPaymentOpen(false);
        alert(`Terima kasih! Pembayaran berhasil. Rp ${netIncome.toLocaleString('id-ID')} telah dikirim ke kreator.`);
    };

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
                    productTitle="Mastering No-Code: Professional Edition"
                    productPrice={productPrice}
                    feePercentage={feePercentage}
                    image="https://lh3.googleusercontent.com/aida-public/AB6AXuA8uHu8gp3KKfCXG_MbnJzQ4Jj9ZUkrndYcEqZY1YbQDSzaE6nUX1x30Vhksf1XW-EbQw-dbxao5d80CzXzUHFLYzsM4_e4UVuMuA7hIcQIMBWEPNuRO1i7YMG01O1ZRcMh_lrQ_JT-PCl6KTz-ChYC3Eb_p3KR7fuRUAH1C0t_TlQEDpzY7mjTW5ha0G1AM3xKhwIzIYc8BdmyBhTn-1R_Lu3GIqN6n5FxPYGElZdG4nV5iU-0IDQXdO4WtzruigzCLRmAbRlE-lUX"
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
        </div>
    );
};

export default CheckoutForm;
