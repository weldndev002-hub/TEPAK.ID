import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps {
  src?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, fallback, size = 'md', bordered = false, className 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-12 h-12 text-sm",
    lg: "w-20 h-20 text-lg"
  };

  const borderClasses = bordered ? (size === 'lg' ? "border-4 border-surface-container-low shadow-lg" : "border-2 border-white shadow-md") : "";

  return (
    <div className={cn(
      "rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-on-primary-container bg-primary-container shrink-0",
      sizeClasses[size],
      borderClasses,
      className
    )}>
      {src ? (
        <img className="w-full h-full object-cover" src={src} alt="Avatar" />
      ) : (
        <span>{fallback?.substring(0, 2).toUpperCase() || '?'}</span>
      )}
    </div>
  );
};

export default Avatar;
