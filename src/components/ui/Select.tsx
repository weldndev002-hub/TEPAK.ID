import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, hasError, children, ...props }, ref) => {
        return (
            <div className="relative w-full">
                <select
                    ref={ref}
                    className={cn(
                        "w-full h-12 text-sm font-medium outline-none transition-all appearance-none rounded-xl px-4 pr-10",
                        hasError 
                            ? "bg-red-50 border border-red-500 text-slate-900 focus:ring-4 focus:ring-red-500/20" 
                            : "bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 text-slate-800",
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    expand_more
                </span>
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
