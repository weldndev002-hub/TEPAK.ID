import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Card, CardContent } from '../ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { 
    BanknotesIcon, 
    BuildingLibraryIcon, 
    ArrowTrendingUpIcon, 
    CreditCardIcon, 
    ChartBarIcon, 
    ArrowRightIcon, 
    BoltIcon, 
    ChevronDownIcon 
} from '@heroicons/react/24/outline';

export const WalletDashboard = () => {
    return (
        <div className="max-w-7xl w-full mx-auto space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
            {/* Page Header */}
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Dompet & Pendapatan</h1>
                <p className="text-slate-500 font-medium">Kelola saldo, penarikan, dan pantau riwayat transaksi Anda secara real-time.</p>
            </header>

            {/* Top Section: Balance Card */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative overflow-hidden bg-slate-900 rounded-3xl p-8 flex flex-col justify-between min-h-[220px] shadow-lg shadow-slate-900/10">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <BanknotesIcon className="w-32 h-32 text-white" />
                    </div>
                    
                    <div className="relative z-10">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Saldo Tersedia</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">Rp 12.450.000</h2>
                    </div>
                    
                    <div className="relative z-10 flex flex-wrap items-center gap-4 mt-6">
                        <Button variant="outline" className="bg-white text-slate-900 hover:bg-slate-50 px-6 py-3 rounded-xl font-black flex items-center gap-2 border-none uppercase text-[11px]"
                                onClick={() => window.location.href='/withdraw'}>
                            <BuildingLibraryIcon className="w-4 h-4" />
                            Tarik Saldo
                        </Button>
                        <button className="bg-white/10 text-white px-6 py-3 rounded-xl font-black hover:bg-white/20 transition-all text-[11px] uppercase tracking-wider">
                            Mutasi Saldo
                        </button>
                    </div>
                </div>
                
                <Card className="p-8 flex flex-col justify-between border border-slate-100 shadow-sm relative z-0 rounded-3xl">
                    <div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">Pendapatan Bulan Ini</p>
                        <h3 className="text-2xl font-black text-slate-900 uppercase">Rp 4.820.000</h3>
                        <p className="text-emerald-500 text-[11px] font-black flex items-center gap-1 mt-2 uppercase tracking-wider">
                            <ArrowTrendingUpIcon className="w-4 h-4" />
                            +12.5% dari bulan lalu
                        </p>
                    </div>
                    <div className="pt-6 mt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Penarikan Mendatang</span>
                            <span className="text-primary font-black">Rp 0</span>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Middle Section: Two-column layout */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Withdrawal History) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Riwayat Penarikan</h3>
                        <button className="text-primary text-[11px] font-black hover:underline uppercase tracking-widest">Lihat Semua</button>
                    </div>
                    
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="uppercase text-[10px] font-black tracking-widest">Request ID</TableHead>
                                    <TableHead className="uppercase text-[10px] font-black tracking-widest">Bank</TableHead>
                                    <TableHead className="uppercase text-[10px] font-black tracking-widest">Amount</TableHead>
                                    <TableHead className="uppercase text-[10px] font-black tracking-widest">Date</TableHead>
                                    <TableHead className="uppercase text-[10px] font-black tracking-widest">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="text-primary font-black">
                                        <a href="/withdrawal-details" className="hover:underline">#WD-82910</a>
                                    </TableCell>
                                    <TableCell className="text-slate-600 font-bold">Bank BCA</TableCell>
                                    <TableCell className="text-slate-900 font-black">Rp 2.500.000</TableCell>
                                    <TableCell className="text-slate-400 text-[11px] font-medium">24 Oct 2023</TableCell>
                                    <TableCell>
                                        <Badge variant="success">Berhasil</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-primary font-black">
                                        <a href="/withdrawal-details" className="hover:underline">#WD-82905</a>
                                    </TableCell>
                                    <TableCell className="text-slate-600 font-bold">Mandiri</TableCell>
                                    <TableCell className="text-slate-900 font-black">Rp 1.200.000</TableCell>
                                    <TableCell className="text-slate-400 text-[11px] font-medium">18 Oct 2023</TableCell>
                                    <TableCell>
                                        <Badge variant="success">Berhasil</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-primary font-black">
                                        <a href="/withdrawal-details" className="hover:underline">#WD-82901</a>
                                    </TableCell>
                                    <TableCell className="text-slate-600 font-bold">Bank BCA</TableCell>
                                    <TableCell className="text-slate-900 font-black">Rp 5.000.000</TableCell>
                                    <TableCell className="text-slate-400 text-[11px] font-medium">12 Oct 2023</TableCell>
                                    <TableCell>
                                        <Badge variant="pending">Tertunda</Badge>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Right Column (Wallet Actions) */}
                <div className="space-y-6">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Aksi Dompet</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <button className="flex flex-col gap-3 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm text-left group hover:bg-slate-50 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-primary transition-colors">
                                <CreditCardIcon className="w-5 h-5 text-slate-500 group-hover:text-white" />
                            </div>
                            <div>
                                <span className="block text-slate-900 font-black group-hover:text-primary transition-colors text-sm uppercase tracking-tight">Tambah Rekening Bank</span>
                                <span className="block text-[11px] text-slate-400 mt-1 transition-colors font-medium">Daftarkan rekening baru untuk pencairan</span>
                            </div>
                        </button>
                        <button className="flex flex-col gap-3 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm text-left group hover:bg-slate-50 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-primary transition-colors">
                                <ChartBarIcon className="w-5 h-5 text-slate-500 group-hover:text-white" />
                            </div>
                            <div>
                                <span className="block text-slate-900 font-black group-hover:text-primary transition-colors text-sm uppercase tracking-tight">Lihat Laporan Penjualan</span>
                                <span className="block text-[11px] text-slate-400 mt-1 transition-colors font-medium">Unduh rekapitulasi performa toko Anda</span>
                            </div>
                        </button>
                    </div>

                    {/* Promo/Information Banner */}
                    <div className="amber-gradient rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-primary/20">
                        <div className="relative z-10">
                            <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest mb-3 inline-block">Info</span>
                            <p className="font-black mb-1 text-sm uppercase">Transfer Instan</p>
                            <p className="text-xs text-white/80 mb-4 leading-relaxed font-medium">Nikmati biaya admin Rp 0 untuk penarikan ke sesama Bank BCA.</p>
                            <button className="text-white text-[11px] font-black flex items-center gap-2 hover:underline uppercase tracking-widest">
                                Pelajari Ketentuan <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <BoltIcon className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
                    </div>
                </div>
            </section>

            {/* Bottom Section: Detailed Transactions */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Transaksi Terkini</h3>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="bg-white border border-slate-100 uppercase tracking-widest text-[10px]">Filter</Button>
                        <Button variant="ghost" size="sm" className="bg-white border border-slate-100 uppercase tracking-widest text-[10px]">Export .CSV</Button>
                    </div>
                </div>
                
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="uppercase text-[10px] font-black tracking-widest">Buyer Info</TableHead>
                                    <TableHead className="uppercase text-[10px] font-black tracking-widest">Product</TableHead>
                                    <TableHead className="uppercase text-[10px] font-black tracking-widest">Date</TableHead>
                                    <TableHead className="text-right uppercase text-[10px] font-black tracking-widest">Net Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar size="sm" fallback="AR" />
                                            <div>
                                                <p className="text-slate-900 font-black text-sm uppercase tracking-tight">Ahmad Rifqi</p>
                                                <p className="text-[10px] text-slate-400 font-medium">rifqi.ahmad@mail.com</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="pro">Premium Mockup Bundle</Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-400 text-[11px] font-medium">Hari ini, 14:20</TableCell>
                                    <TableCell className="text-right text-emerald-500 font-black">+Rp 450.000</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar size="sm" fallback="SL" />
                                            <div>
                                                <p className="text-slate-900 font-black text-sm uppercase tracking-tight">Siska Lestari</p>
                                                <p className="text-[10px] text-slate-400 font-medium">siska.les@mail.com</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="paid">Design System Pack</Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-400 text-[11px] font-medium">Hari ini, 11:05</TableCell>
                                    <TableCell className="text-right text-emerald-500 font-black">+Rp 1.200.000</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar size="sm" fallback="BP" />
                                            <div>
                                                <p className="text-slate-900 font-black text-sm uppercase tracking-tight">Bambang Pamungkas</p>
                                                <p className="text-[10px] text-slate-400 font-medium">bambang@outlook.com</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="ghost">UI Icon Set v2.0</Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-400 text-[11px] font-medium">Kemarin, 19:45</TableCell>
                                    <TableCell className="text-right text-emerald-500 font-black">+Rp 125.000</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <div className="px-6 py-4 bg-slate-50 text-center border-t border-slate-100">
                            <button className="text-slate-400 text-[11px] font-black hover:text-primary transition-all flex items-center gap-2 mx-auto disabled:opacity-50 uppercase tracking-widest">
                                Load 20 More Transactions
                                <ChevronDownIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
            </section>
            
            {/* Footer Info (Minimalistic) */}
            <footer className="py-8 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
                Powered by Tepak.id Digital Solutions © 2024. All Rights Reserved.
            </footer>
        </div>
    );
};

