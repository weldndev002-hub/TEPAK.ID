import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface SubdomainInputProps {
  value: string;
  onChange: (value: string) => void;
  isTaken?: boolean;
  isAvailable?: boolean;
  isLoading?: boolean;
}

export const SubdomainInput: React.FC<SubdomainInputProps> = ({ 
  value, onChange, isTaken, isAvailable, isLoading 
}) => {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-1">Claim Your Identity</label>
      <div className="relative flex items-center group">
        <input 
          className={cn(
            "w-full pl-6 pr-28 py-5 bg-slate-50 border rounded-2xl outline-none transition-all font-black text-xs uppercase tracking-tight group-hover:border-primary/30 focus:ring-4 focus:bg-white",
            isTaken ? "border-rose-200 focus:ring-rose-500/10 text-rose-900" : 
            isAvailable ? "border-emerald-200 focus:ring-emerald-500/10 text-emerald-900" : 
            "border-slate-100 focus:ring-primary/10 focus:border-primary text-slate-900"
          )}
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder="your-store-name"
        />
        <span className="absolute right-6 text-slate-300 font-black text-[10px] tracking-widest uppercase select-none">.tepak.id</span>
      </div>
      
      <div className="mt-6 h-6 px-1 transition-all duration-300">
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400">
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">Verifying URL Signature...</span>
          </div>
        )}
        
        {isAvailable && !isLoading && (
          <div className="flex items-center gap-2 text-emerald-600 animate-in fade-in slide-in-from-top-1 transition-all">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Signature Available</span>
          </div>
        )}
        
        {isTaken && !isLoading && (
          <div className="flex items-center gap-2 text-rose-600 animate-in fade-in slide-in-from-top-1 transition-all">
            <XCircleIcon className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Already Claimed</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubdomainInput;

