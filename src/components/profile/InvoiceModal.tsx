import React from 'react';
import { 
    XMarkIcon, 
    PrinterIcon, 
    ArrowDownTrayIcon,
    CheckCircleIcon,
    CalendarIcon,
    TicketIcon,
    HashtagIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceData: any;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoiceData }) => {
    if (!isOpen || !invoiceData) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Detail Invoice</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Order ID: {invoiceData.id}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-900 shadow-sm"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content - Scrollable for print safety */}
                <div className="p-8 md:p-12 overflow-y-auto no-scrollbar flex-1 print-content">
                    {/* Status Badge */}
                    <div className="flex justify-center mb-10">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                                <CheckCircleIcon className="w-10 h-10" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Payment Successful</span>
                        </div>
                    </div>

                    {/* Invoice Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <CalendarIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tanggal Transaksi</p>
                                    <p className="text-sm font-bold text-slate-900">{new Date(invoiceData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <TicketIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paket Langganan</p>
                                    <p className="text-sm font-bold text-slate-900">{invoiceData.subscription_plans?.name || invoiceData.plan_id?.toUpperCase() || 'Paket Langganan'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <HashtagIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Metode Pembayaran</p>
                                    <p className="text-sm font-bold text-slate-900 uppercase">{invoiceData.payment_type || 'Duitku Payment'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <CheckCircleIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-sm font-bold text-emerald-600 uppercase tracking-tight">Terbayar Lunas</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amount Table */}
                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200/50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Nominal</span>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-slate-700">Aktivasi Paket {invoiceData.subscription_plans?.name}</span>
                            <span className="text-sm font-bold text-slate-900">Rp {(invoiceData.amount || 0).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-slate-200 border-dashed">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Total Bayar</span>
                            <span className="text-xl font-black text-primary">Rp {(invoiceData.amount || 0).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4 no-print">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-black text-slate-500 hover:text-slate-900 transition-all text-[10px] uppercase tracking-widest"
                    >
                        Tutup
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
                    >
                        <PrinterIcon className="w-4 h-4" />
                        Cetak PDF
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * { visibility: hidden; }
                    .print-content, .print-content * { visibility: visible; }
                    .print-content { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
            `}} />
        </div>
    );
};
