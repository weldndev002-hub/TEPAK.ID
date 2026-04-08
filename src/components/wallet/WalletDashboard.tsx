import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Card, CardContent } from '../ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';

export const WalletDashboard = () => {
    return (
        <div className="max-w-7xl w-full mx-auto space-y-8">
            {/* Page Header */}
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-blue-900">Dompet & Pendapatan</h1>
                <p className="text-slate-600 font-medium">Kelola saldo, penarikan, dan pantau riwayat transaksi Anda secara real-time.</p>
            </header>

            {/* Top Section: Balance Card */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative overflow-hidden bg-blue-700 rounded-2xl p-8 flex flex-col justify-between min-h-[220px] shadow-lg shadow-blue-700/20">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                    </div>
                    
                    <div className="relative z-10">
                        <p className="text-blue-200 font-bold uppercase tracking-widest text-xs mb-2">Saldo Tersedia</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Rp 12.450.000</h2>
                    </div>
                    
                    <div className="relative z-10 flex flex-wrap items-center gap-4 mt-6">
                        <Button className="bg-blue-50 text-blue-800 hover:bg-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                                onClick={() => window.location.href='/withdraw'}>
                            <span className="material-symbols-outlined text-sm">account_balance</span>
                            Tarik Saldo
                        </Button>
                        <button className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all font-sans text-sm">
                            Mutasi Saldo
                        </button>
                    </div>
                </div>
                
                <Card className="p-8 flex flex-col justify-between border-0 shadow-sm relative z-0">
                    <div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Pendapatan Bulan Ini</p>
                        <h3 className="text-2xl font-bold text-blue-800">Rp 4.820.000</h3>
                        <p className="text-emerald-600 text-sm font-bold flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-xs">trending_up</span>
                            +12.5% dari bulan lalu
                        </p>
                    </div>
                    <div className="pt-6 mt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-slate-500">Penarikan Mendatang</span>
                            <span className="text-blue-600 font-bold">Rp 0</span>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Middle Section: Two-column layout */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Withdrawal History) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-extrabold text-blue-900">Riwayat Penarikan</h3>
                        <button className="text-blue-600 text-sm font-bold hover:underline">Lihat Semua</button>
                    </div>
                    
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request ID</TableHead>
                                    <TableHead>Bank</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="text-blue-700 font-bold">
                                        <a href="/withdrawal-details" className="hover:underline">#WD-82910</a>
                                    </TableCell>
                                    <TableCell className="text-slate-700">Bank BCA</TableCell>
                                    <TableCell className="text-slate-900 font-bold">Rp 2.500.000</TableCell>
                                    <TableCell className="text-slate-500 text-xs">24 Oct 2023</TableCell>
                                    <TableCell>
                                        <Badge variant="success">Berhasil</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-blue-700 font-bold">
                                        <a href="/withdrawal-details" className="hover:underline">#WD-82905</a>
                                    </TableCell>
                                    <TableCell className="text-slate-700">Mandiri</TableCell>
                                    <TableCell className="text-slate-900 font-bold">Rp 1.200.000</TableCell>
                                    <TableCell className="text-slate-500 text-xs">18 Oct 2023</TableCell>
                                    <TableCell>
                                        <Badge variant="success">Berhasil</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-blue-700 font-bold">
                                        <a href="/withdrawal-details" className="hover:underline">#WD-82901</a>
                                    </TableCell>
                                    <TableCell className="text-slate-700">Bank BCA</TableCell>
                                    <TableCell className="text-slate-900 font-bold">Rp 5.000.000</TableCell>
                                    <TableCell className="text-slate-500 text-xs">12 Oct 2023</TableCell>
                                    <TableCell>
                                        <Badge variant="pending">Tertunda</Badge>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Card>
                </div>

                {/* Right Column (Wallet Actions) */}
                <div className="space-y-6">
                    <h3 className="text-lg font-extrabold text-blue-900">Aksi Dompet</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <button className="flex flex-col gap-3 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-left group hover:bg-blue-50 hover:border-blue-100 border-transparent transition-all">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                <span className="material-symbols-outlined text-slate-500 group-hover:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>add_card</span>
                            </div>
                            <div>
                                <span className="block text-slate-900 font-bold group-hover:text-blue-700 transition-colors">Tambah Rekening Bank</span>
                                <span className="block text-xs text-slate-500 mt-1 transition-colors">Daftarkan rekening baru untuk pencairan</span>
                            </div>
                        </button>
                        <button className="flex flex-col gap-3 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-left group hover:bg-blue-50 hover:border-blue-100 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                <span className="material-symbols-outlined text-slate-500 group-hover:text-white" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
                            </div>
                            <div>
                                <span className="block text-slate-900 font-bold group-hover:text-blue-700 transition-colors">Lihat Laporan Penjualan</span>
                                <span className="block text-xs text-slate-500 mt-1 transition-colors">Unduh rekapitulasi performa toko Anda</span>
                            </div>
                        </button>
                    </div>

                    {/* Promo/Information Banner */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-blue-700/20">
                        <div className="relative z-10">
                            <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest mb-3 inline-block">Info</span>
                            <p className="font-bold mb-1 text-sm">Transfer Instan</p>
                            <p className="text-xs text-blue-100 mb-4 leading-relaxed">Nikmati biaya admin Rp 0 untuk penarikan ke sesama Bank BCA.</p>
                            <button className="text-white text-xs font-bold flex items-center gap-1 hover:underline">
                                Pelajari Ketentuan <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                        </div>
                        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl text-white/10" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    </div>
                </div>
            </section>

            {/* Bottom Section: Detailed Transactions */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-blue-900">Transaksi Terkini</h3>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="bg-white border border-slate-100">Filter</Button>
                        <Button variant="ghost" size="sm" className="bg-white border border-slate-100">Export .CSV</Button>
                    </div>
                </div>
                
                <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Buyer Info</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Net Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar size="sm" fallback="AR" />
                                            <div>
                                                <p className="text-slate-900 font-bold text-sm">Ahmad Rifqi</p>
                                                <p className="text-[10px] text-slate-500">rifqi.ahmad@mail.com</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="pro">Premium Mockup Bundle</Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-xs">Hari ini, 14:20</TableCell>
                                    <TableCell className="text-right text-emerald-600 font-bold">+Rp 450.000</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar size="sm" fallback="SL" />
                                            <div>
                                                <p className="text-slate-900 font-bold text-sm">Siska Lestari</p>
                                                <p className="text-[10px] text-slate-500">siska.les@mail.com</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="paid">Design System Pack</Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-xs">Hari ini, 11:05</TableCell>
                                    <TableCell className="text-right text-emerald-600 font-bold">+Rp 1.200.000</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar size="sm" fallback="BP" />
                                            <div>
                                                <p className="text-slate-900 font-bold text-sm">Bambang Pamungkas</p>
                                                <p className="text-[10px] text-slate-500">bambang@outlook.com</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="ghost">UI Icon Set v2.0</Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-xs">Kemarin, 19:45</TableCell>
                                    <TableCell className="text-right text-emerald-600 font-bold">+Rp 125.000</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <div className="px-6 py-4 bg-slate-50 text-center border-t border-slate-100">
                            <button className="text-slate-500 text-xs font-bold hover:text-blue-600 transition-colors flex items-center gap-2 mx-auto disabled:opacity-50">
                                Load 20 More Transactions
                                <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                            </button>
                        </div>
                    </Card>
            </section>
            
            {/* Footer Info (Minimalistic) */}
            <footer className="py-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                Powered by Tepak.id Digital Solutions © 2023. All Rights Reserved.
            </footer>
        </div>
    );
};
