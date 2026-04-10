import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';
import { Badge } from '../ui/Badge';

export const PayoutsDashboard = () => {
    const [payouts, setPayouts] = React.useState([
        { id: 101, name: 'Ahmad Fauzi', email: 'ahmad.fauzi@email.com', amount: '$250.00', fee: '$5.00', net: '$245.00', bank: 'BCA', account: '••••5678', holder: 'AHMAD FAUZI', date: 'Oct 12, 2023, 14:30', status: 'Pending', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-SIkJhYUowdY-ll6gbXfshU1rALh3em60TJM3tQuCkY9MY10OmrXrHSDzwi8-wOGvNFHoQJBdIZfeV6qqeQzlU_0C4xU6mKPsG4Xwi9acBFRsKC0o5Fdtc0aypnJdo0pBLuFCA7VzU1OFCQPvIT0Dl4Ls_iPaQR8-YBbg9Juz_NOiQ4LjVNiG9Z6_rCpacLrLHmHvY1hHE0rcFIrj4XKFvmwV7MOkNKwT5iraLbi1y1_yBpQjhlR8uc0i97piqeKAnOM4UN85pY89' },
        { id: 102, name: 'Riska Amelia', email: 'riska.ml@example.com', amount: '$1,200.00', fee: '$5.00', net: '$1,195.00', bank: 'Mandiri', account: '••••1122', holder: 'RISKA AMELIA', date: 'Oct 12, 2023, 15:45', status: 'Pending', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPlPjPxAMkvRRVzHmiBhvbAWaH-K3tMYyz0elNIw1aCo3PZfmDT1fSAHOYXAtz86zcEF_AC1lgDEXpYZ-Y1PLldZO2iwTU6BMye9wv75xPQXJEfF6BrVs8QRDw4eYau5d_iAasdUX7215-6ScY476dlvODPKAb83A5TQgl4145YvyKdcVAwrq-60MAngS4ItfdN9vsC9YMg8-3ZV8WiJFqHiyhMWcYaDnDvSPId2CWe8rgT_lcIuCHHjr1PpV2Q-jb7nXVGP-5FNNL' },
        { id: 103, name: 'Budi Santoso', email: 'budi.san@web.id', amount: '$5,000.00', fee: '$5.00', net: '$4,995.00', bank: 'BNI', account: '••••9900', holder: 'BUDI SANTOSO', date: 'Oct 13, 2023, 08:20', status: 'Pending', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8Ha_c9uw2xRRy41qNLcBZee4unv_9eG7SauD40C776cJAUOUL0lJ2uzuZunhwEL8cWRiw8oIkn945Vb-fsFk5gPYBnjrinSDkkhZoqJufZ-8E5Fl-7UhSOtVVftmf3VA8aorucnzPbvRAtytrKeRlNeSZtvnhpTwkJZVT-N-wu1B5hEv1UkpaVF-41nHrbEk0AxoVxNME4DMNLmRUzYOl_8fN1z9D-6rdsUHcTmG-Vkyjkd-6dw93PKP4FCZkc1XTNtALAJvGItGm' }
    ]);
    const [selectedPayout, setSelectedPayout] = React.useState<any>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'Pending' | 'Success' | 'Rejected'>('Pending');
    
    // Action States
    const [proofUrl, setProofUrl] = React.useState('');
    const [rejectReason, setRejectReason] = React.useState('');

    const handleMarkSuccess = (id: number) => {
        if (!proofUrl) {
            alert("Harap masukkan URL Bukti Transfer (Image/PDF) terlebih dahulu.");
            return;
        }
        setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'Success', proofUrl } : p));
        setIsModalOpen(false);
        setProofUrl('');
        alert("Status Payout berhasil diperbarui: Berhasil (Transfer Terverifikasi). Notifikasi telah dikirim ke kreator.");
    };

    const handleReject = (id: number) => {
        if (!rejectReason) {
            alert("Harap masukkan alasan penolakan untuk transparansi kreator.");
            return;
        }
        setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'Rejected', rejectReason } : p));
        setIsModalOpen(false);
        setRejectReason('');
        alert(`Payout ditolak: ${rejectReason}. Saldo sebesar ${payouts.find(p => p.id === id)?.amount} telah di-refund otomatis ke Virtual Balance kreator.`);
    };

    const filteredPayouts = payouts.filter(p => p.status === activeTab);

    const openDetails = (payout: any) => {
        setSelectedPayout(payout);
        setIsModalOpen(true);
    };

    return (
        <div className="w-full">
            {/* Page Title & Stats Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-[#005ab4] mb-2">Payout Processing</h2>
                    <p className="text-slate-500 max-w-md">Manage creator withdrawal requests carefully and quickly to maintain ecosystem trust.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Total Pending</p>
                        <p className="text-2xl font-black text-[#465f89]">$12,450.00</p>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Queue Size</p>
                        <p className="text-2xl font-black text-[#005ab4]">{payouts.filter(p => p.status === 'Pending').length} Requests</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-8 mb-8 border-b border-slate-100">
                <button 
                    onClick={() => setActiveTab('Pending')}
                    className={`pb-4 text-sm font-bold transition-all px-2 ${activeTab === 'Pending' ? 'text-[#465f89] border-b-2 border-[#465f89]' : 'text-slate-400 hover:text-[#005ab4]'}`}
                >
                    Pending ({payouts.filter(p => p.status === 'Pending').length})
                </button>
                <button 
                    onClick={() => setActiveTab('Success')}
                    className={`pb-4 text-sm font-bold transition-all px-2 ${activeTab === 'Success' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}
                >
                    Successful ({payouts.filter(p => p.status === 'Success').length})
                </button>
                <button 
                    onClick={() => setActiveTab('Rejected')}
                    className={`pb-4 text-sm font-bold transition-all px-2 ${activeTab === 'Rejected' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                >
                    Failed/Rejected ({payouts.filter(p => p.status === 'Rejected').length})
                </button>
            </div>

            {/* Payout Table Container */}
            <Card className="rounded-2xl overflow-hidden shadow-sm border-slate-100">
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Creator</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Amount Details</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Destination Bank</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Request Date</TableHead>
                                <TableHead className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayouts.map((payout) => (
                                <TableRow key={payout.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 cursor-pointer" onClick={() => openDetails(payout)}>
                                                <img alt={payout.name} src={payout.avatar} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="cursor-pointer" onClick={() => openDetails(payout)}>
                                                <p className="font-bold text-[#005ab4] hover:underline uppercase tracking-tight text-xs">{payout.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{payout.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-6">
                                        <div className="space-y-1">
                                            <p className="font-black text-slate-900">{payout.amount}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-400">Fees: {payout.fee}</span>
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded tracking-tighter">Net: {payout.net}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-6">
                                        <div>
                                            <p className="font-bold text-slate-900 text-xs">{payout.bank} ••••{payout.account.slice(-4)}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">AN. {payout.holder}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        {payout.date}
                                    </TableCell>
                                    <TableCell className="px-6 py-6">
                                        <div className="flex justify-end gap-2">
                                            {payout.status === 'Pending' ? (
                                                <>
                                                    <Button onClick={() => openDetails(payout)} variant="ghost" className="px-4 py-2 text-rose-500 hover:bg-rose-50 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-100">Reject</Button>
                                                    <Button onClick={() => openDetails(payout)} variant="primary" className="px-4 py-2 bg-[#465f89] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#465f89]/20">Mark Success</Button>
                                                </>
                                            ) : (
                                                <Badge className={payout.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-none' : 'bg-rose-50 text-rose-600 border-none'}>
                                                    {payout.status.toUpperCase()}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Footer Pagination Info */}
            <div className="mt-8 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">Showing 3 of 42 payout requests</p>
                <div className="flex gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#005ab4] transition-all">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#465f89] text-white font-bold shadow-md">1</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">2</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">3</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#005ab4] transition-all">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Payout Detail Modal */}
            {isModalOpen && selectedPayout && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#005ab4]/40 backdrop-blur-sm ">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-[#005ab4]">Payout Request Details</h2>
                                <p className="text-sm text-slate-500 font-medium">Verification for Withdrawal Request ID #PRQ-9021</p>
                            </div>
                            <button 
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                {/* Amount Breakdown */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Withdrawal Breakdown</p>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Request amount</span>
                                            <span className="font-bold text-slate-900">{selectedPayout.amount}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Processing fee</span>
                                            <span className="font-bold text-rose-500">-{selectedPayout.fee}</span>
                                        </div>
                                        <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                            <span className="text-xs font-black text-[#005ab4] uppercase tracking-wider">Net to Transfer</span>
                                            <span className="text-xl font-black text-[#005ab4]">{selectedPayout.net}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Details */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient Bank Information</p>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Bank Provider</p>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedPayout.bank}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Account Number</p>
                                            <p className="text-sm font-black text-slate-900">{selectedPayout.account}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Account Holder Name</p>
                                            <p className="text-sm font-black text-slate-900 uppercase">{selectedPayout.holder}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-[#005ab4] rounded-xl flex items-center justify-center text-white shrink-0">
                                        <span className="material-symbols-outlined">security</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-[#005ab4] uppercase tracking-tight">Security Check Passed</h4>
                                        <p className="text-[11px] text-[#465f89] font-medium leading-relaxed">System has verified that this bank account belongs to {selectedPayout.name} and matches the records on file. IP Address: 114.125.xx.xx (Verified).</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bukti Transfer (URL)</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-medium focus:ring-2 focus:ring-[#005ab4]/20 outline-none transition-all" 
                                        placeholder="https://imgur.com/screenshot.png"
                                        value={proofUrl}
                                        onChange={(e) => setProofUrl(e.target.value)}
                                    />
                                    <p className="text-[9px] text-slate-400 italic mt-1 px-1">*Wajib diisi sebelum Approve & Process.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">Alasan Penolakan</label>
                                    <textarea 
                                        className="w-full bg-rose-50/30 border border-rose-100 rounded-xl py-3 px-4 text-xs font-medium focus:ring-2 focus:ring-rose-500/10 outline-none transition-all h-[46px] resize-none" 
                                        placeholder="No. Rekening tidak terdaftar / Salah bank..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 mb-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20">
                                        <span className="material-symbols-outlined font-black">warning</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-amber-600 uppercase tracking-tight">Financial Warning</h4>
                                        <p className="text-[11px] text-amber-700/70 font-medium leading-relaxed">Pastikan nominal transfer ke <strong>{selectedPayout.holder}</strong> adalah <strong>{selectedPayout.net}</strong>. Biaya transfer dilerbankan ke Admin (Rp 5.000).</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <button 
                                className="px-6 py-2.5 rounded-xl font-black text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100 text-[10px] uppercase tracking-widest"
                                onClick={() => handleReject(selectedPayout.id)}
                            >
                                Reject Request
                            </button>
                            <div className="flex gap-3">
                                <button className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest" onClick={() => setIsModalOpen(false)}>Close</button>
                                <button 
                                    className="px-8 py-2.5 rounded-xl bg-[#465f89] text-white font-black shadow-lg shadow-[#465f89]/20 hover:scale-[1.02] active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                                    onClick={() => handleMarkSuccess(selectedPayout.id)}
                                >
                                    Approve & Process
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
