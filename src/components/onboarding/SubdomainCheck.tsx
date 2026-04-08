import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import Input from '../ui/Input';

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
        <div className={cn("bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-slate-200", className)}>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih URL Anda</label>
            
            <Input 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                addonRight={domainSuffix}
                hasError={isTaken}
                placeholder="namamu"
                className="py-3"
            />
            
            {!isEmpty && (
                <div className={cn(
                    "mt-3 flex items-center gap-1.5",
                    isTaken ? "text-error" : "text-emerald-600"
                )}>
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isTaken ? "cancel" : "check_circle"}
                    </span>
                    <span className="text-xs font-medium">
                        {isTaken ? "Sudah digunakan" : "Tersedia"}
                    </span>
                </div>
            )}
        </div>
    );
};

export default SubdomainCheck;
