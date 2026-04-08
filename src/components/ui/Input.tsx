import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    iconLeft?: React.ElementType;
    iconRight?: React.ReactNode;
    addonRight?: string;
    hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, iconLeft: IconLeft, iconRight, addonRight, hasError, ...props }, ref) => {
        return (
            <div className={cn(
                "relative flex w-full overflow-hidden transition-colors rounded-xl",
                addonRight ? "border focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10" : ""
            )}>
                {IconLeft && !addonRight && (
                    <div className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                        hasError ? "text-error" : "text-slate-400 peer-focus:text-primary"
                    )}>
                        <IconLeft className="w-5 h-5" />
                    </div>
                )}
                
                <input
                    ref={ref}
                    className={cn(
                        "flex-1 h-12 text-sm font-medium placeholder:text-slate-400/70 outline-none transition-all peer",
                        IconLeft && !addonRight ? "pl-12" : "pl-4",
                        iconRight && !addonRight ? "pr-12" : "pr-4",
                        addonRight 
                            ? "bg-white border-none focus:ring-0" 
                            : (hasError 
                                ? "bg-error/5 border border-error text-slate-900 focus:ring-4 focus:ring-error/20 rounded-xl" 
                                : "bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 text-slate-800 rounded-xl"),
                        className
                    )}
                    {...props}
                />

                {iconRight && !addonRight && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                        {iconRight}
                    </div>
                )}
                
                {addonRight && (
                    <span className="bg-slate-100/80 px-4 flex items-center text-slate-500 font-bold text-[13px] border-l border-slate-200">
                        {addonRight}
                    </span>
                )}
            </div>

        );
    }
);

Input.displayName = 'Input';

export default Input;

