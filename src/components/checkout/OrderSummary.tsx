import React from 'react';
import { ArrowRightIcon, ShieldCheckIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface OrderSummaryProps {
    productTitle: string;
    productPrice: number;
    feePercentage: number;
    image: string;
    onPay: () => void;
    status: 'pending' | 'paid' | 'expired';
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ 
    productTitle, productPrice, feePercentage, image, onPay, status 
}) => {
    const serviceFee = Math.round(productPrice * (feePercentage / 100));
    const totalPrice = productPrice + serviceFee;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount).replace('Rp', 'Rp ');
    };

    return (
        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 sticky top-28 ">
            <h2 className="text-xl font-bold mb-6 text-primary tracking-tight">Ringkasan Pesanan</h2>
            
            {/* PRODUCT PREVIEW */}
            <div className="flex gap-4 mb-8">
                <div className="w-20 h-20 bg-surface-container rounded-lg overflow-hidden shrink-0">
                    <img className="w-full h-full object-cover" src={image} alt={productTitle} />
                </div>
                <div>
                    <h3 className="font-bold text-primary leading-tight line-clamp-2">
                        {productTitle}
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-1 font-medium">Digital Course Bundle</p>
                </div>
            </div>

            {/* COST BREAKDOWN */}
            <div className="space-y-4 pt-4 border-t border-outline-variant/30">
                <div className="flex justify-between text-on-surface-variant font-medium">
                    <span className="text-sm">Harga Produk</span>
                    <span className="text-sm font-bold">{formatCurrency(productPrice)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant font-medium">
                    <span className="text-sm">Biaya Layanan ({feePercentage}%)</span>
                    <span className="text-sm font-bold">{formatCurrency(serviceFee)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-secondary/20">
                    <span className="font-bold text-lg text-primary">Total Bayar</span>
                    <span className="font-extrabold text-2xl text-secondary">
                        {formatCurrency(totalPrice)}
                    </span>
                </div>
            </div>

            {/* ACTION BUTTON */}
            {status === 'paid' ? (
                <div className="w-full mt-8 bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                    <p className="text-sm font-black text-emerald-700 uppercase tracking-widest">Pembayaran Berhasil</p>
                </div>
            ) : status === 'expired' ? (
                <div className="w-full mt-8 bg-rose-50 border border-rose-100 p-4 rounded-xl flex flex-col items-center gap-2">
                    <XMarkIcon className="w-8 h-8 text-rose-500" />
                    <p className="text-sm font-black text-rose-700 uppercase tracking-widest">Pesanan Kadaluarsa</p>
                </div>
            ) : (
                <button 
                    onClick={onPay}
                    className="w-full mt-8 bg-secondary-container text-white font-bold py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                    Bayar Sekarang
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            )}

            {/* TRUST BADGES */}
            <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 bg-surface p-3 rounded-lg border border-outline-variant/10">
                    <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-semibold text-on-surface-variant">Transaksi Aman & Terenkripsi</span>
                </div>
                <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Powered by</span>
                    <span className="text-xs font-extrabold text-primary tracking-tighter">DUITKU</span>
                </div>
            </div>
            
            <div className="mt-6 bg-secondary/5 p-4 rounded-lg border border-secondary/10">
                <p className="text-xs text-on-secondary-fixed-variant leading-relaxed text-center">
                    Dengan menekan tombol bayar, Anda menyetujui <b>Syarat & Ketentuan</b> serta <b>Kebijakan Privasi</b> tepak.id.
                </p>
            </div>
        </section>
    );
};

export default OrderSummary;
