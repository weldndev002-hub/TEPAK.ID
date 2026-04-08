import React, { useState } from 'react';
import PaymentMethodCard from './PaymentMethodCard';
import OrderSummary from './OrderSummary';
import { 
    UserCircleIcon, 
    CreditCardIcon, 
    QrCodeIcon, 
    BuildingLibraryIcon, 
    WalletIcon 
} from '@heroicons/react/24/outline';

export const CheckoutForm: React.FC = () => {
    const [buyerName, setBuyerName] = useState('');
    const [buyerEmail, setBuyerEmail] = useState('');
    const [buyerPhone, setBuyerPhone] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('qris');

    const paymentMethods = [
        { id: 'qris', title: 'QRIS', description: 'OVO, GoPay, Dana, LinkAja, ShopeePay', icon: QrCodeIcon },
        { id: 'va', title: 'Virtual Account', description: 'BCA, Mandiri, BNI, BRI', icon: BuildingLibraryIcon },
        { id: 'wallet', title: 'E-Wallet Direct', description: 'ShopeePay, OVO (One-Click)', icon: WalletIcon },
    ];

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Hanya angka
        setBuyerPhone(value);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-screen-2xl mx-auto w-full px-8 py-12 font-['Plus_Jakarta_Sans',sans-serif]">
            
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
                                className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-secondary transition-all placeholder:text-outline" 
                                placeholder="Masukkan nama sesuai KTP"
                                value={buyerName}
                                onChange={(e) => setBuyerName(e.target.value)}
                                type="text"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-on-surface-variant">Email</label>
                            <input 
                                className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-secondary transition-all placeholder:text-outline" 
                                placeholder="contoh@email.com"
                                value={buyerEmail}
                                onChange={(e) => setBuyerEmail(e.target.value)}
                                type="email"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-on-surface-variant">No HP (WhatsApp)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant tracking-tighter opacity-50">+62</span>
                                <input 
                                    className="w-full bg-surface-container-low border-none rounded-lg p-3 pl-14 focus:ring-2 focus:ring-secondary transition-all placeholder:text-outline font-medium tracking-widest" 
                                    placeholder="812 3456 7890" 
                                    value={buyerPhone}
                                    onChange={handlePhoneChange}
                                    type="tel"
                                />
                            </div>
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
                    productPrice={499000}
                    feePercentage={5}
                    image="https://lh3.googleusercontent.com/aida-public/AB6AXuA8uHu8gp3KKfCXG_MbnJzQ4Jj9ZUkrndYcEqZY1YbQDSzaE6nUX1x30Vhksf1XW-EbQw-dbxao5d80CzXzUHFLYzsM4_e4UVuMuA7hIcQIMBWEPNuRO1i7YMG01O1ZRcMh_lrQ_JT-PCl6KTz-ChYC3Eb_p3KR7fuRUAH1C0t_TlQEDpzY7mjTW5ha0G1AM3xKhwIzIYc8BdmyBhTn-1R_Lu3GIqN6n5FxPYGElZdG4nV5iU-0IDQXdO4WtzruigzCLRmAbRlE-lUX"
                />
            </div>
        </div>
    );
};

export default CheckoutForm;
