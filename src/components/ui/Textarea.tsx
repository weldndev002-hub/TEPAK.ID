import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, hasError, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    "w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 text-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all resize-none",
                    hasError ? "bg-error/5 border-error text-slate-900 focus:ring-error/20" : "",
                    className
                )}
                {...props}
            />
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
