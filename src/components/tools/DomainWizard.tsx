import React from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

export interface DomainWizardProps {
  className?: string;
}

export const DomainWizard: React.FC<DomainWizardProps> = ({ className }) => {
  return (
    <div className={cn("bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm font-['Plus_Jakarta_Sans',sans-serif]", className)}>
        <div className="max-w-2xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center gap-6 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <GlobeAltIcon className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Connect Custom Domain</h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-black uppercase tracking-widest leading-none">Link your own domain name to your store.</p>
                </div>
            </div>

            <div className="space-y-8">
                
                {/* Domain Input */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Domain Name</label>
                    <div className="flex gap-4">
                        <Input 
                            className="flex-1 py-4 rounded-2xl border-slate-100 font-black text-xs uppercase tracking-tight bg-slate-50/50" 
                            placeholder="myshop.com" 
                        />
                        <Button variant="primary" className="px-10 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/10 py-4 font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
                            Verify
                        </Button>
                    </div>
                </div>

                {/* Setup Instructions */}
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 border-dashed">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">CNAME Configuration</h4>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-5">
                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-900 shrink-0 shadow-sm">1</div>
                            <p className="text-[11px] font-black text-slate-500 mt-2 uppercase tracking-tight">Login to your domain provider (GoDaddy, Namecheap, etc.)</p>
                        </div>
                        
                        <div className="flex items-start gap-5">
                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-900 shrink-0 shadow-sm">2</div>
                            <div className="flex-1">
                                <p className="text-[11px] font-black text-slate-500 mb-4 mt-2 uppercase tracking-tight">Add a new CNAME record with these values:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-[9px] text-slate-300 font-black tracking-widest uppercase mb-1">HOST / NAME</p>
                                        <p className="text-xs font-mono font-black text-slate-900">www</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <p className="text-[9px] text-slate-300 font-black tracking-widest uppercase mb-1">VALUE / TARGET</p>
                                        <p className="text-xs font-mono font-black text-slate-900">stores.tepak.id</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};

export default DomainWizard;

