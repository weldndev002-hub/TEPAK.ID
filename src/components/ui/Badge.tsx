import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pro' | 'paid' | 'success' | 'pending' | 'failed' | 'ghost' | 'warning' | 'error';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, variant = 'ghost', className 
}) => {
  const variants: Record<string, string> = {
    pro: "bg-primary-container text-on-primary-container",
    paid: "bg-tertiary-container text-on-tertiary-container",
    success: "bg-green-100 text-green-700",
    standard: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    warning: "bg-amber-100 text-amber-700",
    failed: "bg-error-container text-on-error-container",
    error: "bg-rose-100 text-rose-700",
    ghost: "bg-slate-100 text-slate-500",
    soldout: "bg-slate-100 text-slate-500"
  };

  return (
    <span className={cn(
      "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export default Badge;
