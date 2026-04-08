import React from 'react';
import { cn } from '../../lib/utils';

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
        <div className={cn("px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100", className)}>
            <p className="text-xs text-slate-500 font-medium">
                Menampilkan <span className="font-bold text-[#005ab4]">{endIndex - startIndex + 1}</span> dari <span className="font-bold text-[#005ab4]">{totalItems}</span> data
            </p>
            <div className="flex items-center gap-1">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => onPageChange?.(currentPage - 1)}
                    className="p-2 text-slate-400 hover:text-[#005ab4] disabled:opacity-30 disabled:hover:text-slate-400 flex items-center justify-center transition-colors"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                
                {pages.map(page => (
                    <button 
                        key={page}
                        onClick={() => onPageChange?.(page)}
                        className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors",
                            currentPage === page 
                                ? "bg-[#465f89] text-white" 
                                : "text-slate-500 hover:bg-slate-200"
                        )}
                    >
                        {page}
                    </button>
                ))}

                <button 
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange?.(currentPage + 1)}
                    className="p-2 text-slate-400 hover:text-[#005ab4] disabled:opacity-30 disabled:hover:text-slate-400 flex items-center justify-center transition-colors"
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        </div>
    );
};

export default Pagination;
