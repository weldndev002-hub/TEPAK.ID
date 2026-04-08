import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'amber' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', isLoading, className, ...props 
}) => {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/10",
    secondary: "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80",
    destructive: "border-2 border-error text-error hover:bg-error/5",
    ghost: "text-slate-500 hover:bg-slate-100",
    amber: "amber-gradient text-white shadow-[0_20px_40px_-12px_rgba(129,85,0,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(129,85,0,0.4)] transition-all duration-300",
    outline: "border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-[10px]",
    md: "px-4 py-2 text-xs",
    lg: "px-6 py-4 text-base"
  };

  return (
    <button 
      className={cn(
        "font-black rounded-[1.25rem] transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed tracking-tight",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-3 w-3 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
