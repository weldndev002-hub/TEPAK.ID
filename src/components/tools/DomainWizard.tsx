import React from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import Input from '../ui/Input';

export interface DomainWizardProps {
  className?: string;
}

export const DomainWizard: React.FC<DomainWizardProps> = ({ className }) => {
  return (
    <div className={cn("bg-white p-8 rounded-2xl border border-slate-100 shadow-sm", className)}>
        <div className="max-w-2xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-inner">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>language</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Connect Custom Domain</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Link your own domain name to your store.</p>
                </div>
            </div>

            <div className="space-y-6">
                
                {/* Domain Input */}
                <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Domain Name</label>
                    <div className="flex gap-2">
                        <Input 
                            className="flex-1 py-2.5" 
                            placeholder="myshop.com" 
                        />
                        <Button variant="primary" className="px-6 bg-slate-900 text-white rounded-xl shadow-none py-2.5 hover:bg-slate-800">
                            Verify
                        </Button>
                    </div>
                </div>

                {/* Setup Instructions */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">CNAME Configuration</h4>
                    
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">1</div>
                            <p className="text-sm text-slate-600 mt-0.5">Login to your domain provider (GoDaddy, Namecheap, etc.)</p>
                        </div>
                        
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">2</div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-600 mb-2 mt-0.5">Add a new CNAME record with these values:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest">HOST / NAME</p>
                                        <p className="text-sm font-mono font-bold text-slate-900 mt-1">www</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest">VALUE / TARGET</p>
                                        <p className="text-sm font-mono font-bold text-slate-900 mt-1">stores.tepak.id</p>
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
