import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

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
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 transition-all hover:border-slate-300">
      <label className="block text-sm font-semibold text-slate-700 mb-2 font-headline uppercase tracking-wide">Pilih URL Anda</label>
      <div className="relative flex items-center group">
        <input 
          className={cn(
            "w-full pl-4 pr-24 py-4 bg-white border rounded-xl outline-none transition-all font-medium text-slate-900 group-hover:border-slate-400 focus:ring-2",
            isTaken ? "border-error focus:ring-error" : 
            isAvailable ? "border-emerald-500 focus:ring-emerald-500" : 
            "border-slate-300 focus:ring-primary focus:border-primary"
          )}
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder="nama-toko-anda"
        />
        <span className="absolute right-4 text-slate-400 font-bold text-sm select-none">.tepak.id</span>
      </div>
      
      <div className="mt-4 h-6 transition-all duration-300 overflow-hidden">
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 animate-pulse">
            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
            <span className="text-xs font-medium">Mengecek ketersediaan...</span>
          </div>
        )}
        
        {isAvailable && !isLoading && (
          <div className="flex items-center gap-1.5 text-emerald-600 animate-in fade-in slide-in-from-top-1">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="text-xs font-bold uppercase tracking-wider">Tersedia</span>
          </div>
        )}
        
        {isTaken && !isLoading && (
          <div className="flex items-center gap-1.5 text-error animate-in fade-in slide-in-from-top-1">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
            <span className="text-xs font-bold uppercase tracking-wider">Sudah digunakan</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubdomainInput;
