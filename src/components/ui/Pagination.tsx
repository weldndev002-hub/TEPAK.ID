import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange?: (page: number) => void;
    className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ 
    currentPage, 
    totalPages, 
    totalItems, 
    itemsPerPage,
    onPageChange,
    className 
}) => {
    // Generate page numbers
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className={cn("px-8 py-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-slate-50 font-['Plus_Jakarta_Sans',sans-serif]", className)}>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Showing <span className="text-primary">{startIndex}-{endIndex}</span> of <span className="text-slate-900">{totalItems}</span> Records
            </p>
            <div className="flex items-center gap-2">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => onPageChange?.(currentPage - 1)}
                    className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-20 disabled:hover:text-slate-400 disabled:hover:border-slate-100 transition-all active:scale-90"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-2xl border border-slate-100/50">
                    {pages.map(page => (
                        <button 
                            key={page}
                            onClick={() => onPageChange?.(page)}
                            className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all uppercase tracking-tight",
                                currentPage === page 
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" 
                                    : "text-slate-400 hover:bg-white hover:text-primary"
                            )}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button 
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange?.(currentPage + 1)}
                    className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 disabled:opacity-20 disabled:hover:text-slate-400 disabled:hover:border-slate-100 transition-all active:scale-90"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;

