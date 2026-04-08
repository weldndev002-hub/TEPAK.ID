import React from 'react';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string; // e.g. "+12.5%" or "-1.2%"
  trendDirection?: 'up' | 'down' | 'neutral';
  colorTheme?: 'primary' | 'tertiary' | 'green' | 'slate';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title, value, icon, trend, trendDirection, colorTheme = 'primary', className
}) => {
  const iconThemeClasses = {
    primary: "bg-amber-50 text-primary",
    tertiary: "bg-blue-50 text-tertiary",
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
        <span className="material-symbols-outlined text-sm ml-1" style={{ fontVariationSettings: "'FILL' 0" }}>
          {isUp ? 'trending_up' : 'trending_down'}
        </span>
      </span>
    );
  };

  return (
    <div className={cn(
      "bg-surface-container-lowest p-6 rounded-lg shadow-sm group hover:ring-2 hover:ring-primary-container/20 transition-all",
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-lg", iconThemeClasses[colorTheme])}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>{icon}</span>
        </div>
        {trendRender()}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-2xl font-extrabold text-on-surface">{value}</h4>
    </div>
  );
};

export default StatCard;
