import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import Input from '../ui/Input';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export interface SubdomainCheckProps {
    domainSuffix?: string;
    defaultValue?: string;
    className?: string;
}

export const SubdomainCheck: React.FC<SubdomainCheckProps> = ({ 
    domainSuffix = ".tepak.id",
    defaultValue = "",
    className
}) => {
    const [value, setValue] = useState(defaultValue);
    
    // Simulasi logic ketersediaan domain UI Kit
    const isTaken = value.toLowerCase() === "kopi";
    const isEmpty = value.trim() === "";
    
    return (
        <div className={cn("bg-white p-8 rounded-[2rem] border border-slate-100 ", className)}>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-1">Claim Your URL</label>
            
            <Input 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                addonRight={domainSuffix}
                hasError={isTaken}
                placeholder="yourname"
                className="py-4 font-black uppercase tracking-tight rounded-2xl bg-slate-50 border-slate-100"
            />
            
            {!isEmpty && (
                <div className={cn(
                    "mt-4 flex items-center gap-2 px-1",
                    isTaken ? "text-rose-600" : "text-emerald-600"
                )}>
                    {isTaken ? (
                        <XCircleIcon className="w-5 h-5" />
                    ) : (
                        <CheckCircleIcon className="w-5 h-5" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {isTaken ? "Already Taken" : "Available"}
                    </span>
                </div>
            )}
        </div>
    );
};

export default SubdomainCheck;

