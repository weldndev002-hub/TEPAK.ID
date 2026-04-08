import React from 'react';
import { cn } from '../../lib/utils';

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ 
  label, className, ...props 
}) => {
  return (
    <label className={cn("relative inline-flex items-center cursor-pointer", className)}>
      <input type="checkbox" className="sr-only peer" {...props} />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      {label && <span className="ml-3 text-sm font-medium text-slate-700">{label}</span>}
    </label>
  );
};

export default Toggle;
