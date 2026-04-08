import React from 'react';
import { cn } from '../../lib/utils';
import { 
    ArrowTrendingUpIcon, 
    ArrowTrendingDownIcon 
} from '@heroicons/react/24/outline';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string; // e.g. "+12.5%" or "-1.2%"
  trendDirection?: 'up' | 'down' | 'neutral';
  colorTheme?: 'primary' | 'tertiary' | 'green' | 'slate';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title, value, icon: Icon, trend, trendDirection, colorTheme = 'primary', className
}) => {
  const iconThemeClasses = {
    primary: "bg-amber-50 text-primary",
    tertiary: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    slate: "bg-slate-50 text-slate-600"
  };

  const trendRender = () => {
    if (!trend) return null;
    
    if (trendDirection === 'neutral') {
      return (
        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">
          {trend}
        </span>
      );
    }

    const isUp = trendDirection === 'up';
    return (
      <span className={cn(
        "font-bold text-xs flex items-center",
        isUp ? "text-green-500" : "text-red-500"
      )}>
        {trend}
        {isUp ? (
            <ArrowTrendingUpIcon className="w-3.5 h-3.5 ml-1" />
        ) : (
            <ArrowTrendingDownIcon className="w-3.5 h-3.5 ml-1" />
        )}
      </span>
    );
  };

  return (
    <div className={cn(
      "bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:ring-2 hover:ring-primary/10 transition-all font-['Plus_Jakarta_Sans',sans-serif]",
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-xl", iconThemeClasses[colorTheme])}>
          <Icon className="w-6 h-6" />
        </div>
        {trendRender()}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h4>
    </div>
  );
};

export default StatCard;

