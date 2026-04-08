import React from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const BankInfoSettingsDashboard = () => {
    return (
        <div className="flex-1 p-8 min-h-screen bg-[#F8FAFC]">
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-[#005ab4] tracking-tight mb-2">Payout Method</h2>
                    <nav className="flex gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <a href="/settings" className="hover:text-[#005ab4] transition-colors">Settings</a>
                        <span className="text-slate-300">/</span>
                        <span className="text-[#465f89]">Payout Method</span>
                    </nav>
                </div>

                {/* Information Banner */}
                <div className="bg-gradient-to-r from-[#465f89] to-[#b7cfff] rounded-xl p-6 mb-10 flex items-start gap-4 shadow-sm">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-1">Transaction Security</h3>
                        <p className="text-white/90 text-sm leading-relaxed">This bank information is used to securely process your earnings payouts. Please ensure the data you enter is correct to avoid disbursement issues.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Section: Bank Terdaftar */}
                    <section>
                        <h4 className="text-sm font-bold text-[#005ab4] mb-4 flex items-center gap-2">
                            Registered Bank
                            <span className="h-[1px] flex-grow bg-slate-200"></span>
                        </h4>
                        <Card className="p-6 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm transition-transform hover:scale-[1.01] duration-200 border-none group cursor-pointer hover:shadow-md">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                    <div className="bg-[#005BAB] text-white font-black px-2 py-1 rounded text-xs italic">BCA</div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Bank Central Asia (BCA)</p>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl font-mono text-slate-800">••••••••5678</span>
                                        <button className="text-slate-400 hover:text-[#465f89] transition-colors focus:outline-none">
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                        </button>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 italic">a.n. John Doe</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 mt-4 sm:mt-0">
                                <Badge variant="success" className="inline-flex items-center gap-1.5 px-3 py-1 font-bold">
                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                    VERIFIED
                                </Badge>
                            </div>
                        </Card>
                    </section>

                    {/* Section: Ubah Informasi Bank */}
                    <section>
                        <h4 className="text-sm font-bold text-[#005ab4] mb-4 flex items-center gap-2">
                            Update Bank Information
                            <span className="h-[1px] flex-grow bg-slate-200"></span>
                        </h4>
                        <Card className="p-8 shadow-sm border-none">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Select Bank</label>
                                        <Select defaultValue="BCA">
                                            <option value="BCA">Bank Central Asia (BCA)</option>
                                            <option value="Mandiri">Bank Mandiri</option>
                                            <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
                                            <option value="BNI">Bank Negara Indonesia (BNI)</option>
                                            <option value="HSBC">HSBC Bank</option>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Account Number</label>
                                        <Input type="text" placeholder="Enter your account number" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Account Owner Name</label>
                                    <Input type="text" placeholder="As it appears on your bank statement" />
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Security Note */}
                    <div className="bg-slate-50 border-l-4 border-slate-300 rounded-r-xl p-5 flex items-center gap-4">
                        <span className="material-symbols-outlined text-slate-400" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                        <p className="text-xs text-slate-500 leading-relaxed">Your banking data is encrypted using standard industry protocols (AES-256). Tepak.id never stores full card information or has direct access to your account outside of automated transfer processing needs.</p>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end pt-4">
                        <Button className="bg-[#465f89] hover:bg-[#344d77] text-white px-10 border-none font-bold shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">save</span>
                            Save Bank Information
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
