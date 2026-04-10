import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, hasError, children, ...props }, ref) => {
        return (
            <div className="relative w-full ">
                <select
                    ref={ref}
                    className={cn(
                        "w-full h-12 text-sm font-black outline-none transition-all appearance-none rounded-xl px-4 pr-10 uppercase tracking-tight",
                        hasError 
                            ? "bg-rose-50 border border-rose-500 text-slate-900 focus:ring-4 focus:ring-rose-500/10" 
                            : "bg-slate-50 border border-slate-100 hover:border-primary/20 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 text-slate-900",
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300" />
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;

