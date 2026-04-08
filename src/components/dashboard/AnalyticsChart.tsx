import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export interface AnalyticsChartProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ 
  title = "Performance Overview", 
  subtitle = "Growth over the last 30 days",
  className 
}) => {
  const [activeTab, setActiveTab] = useState<'views' | 'clicks' | 'sales'>('views');

  // Dummy data arrays to simulate chart switching
  const chartData = {
      views: [66, 50, 75, 40, 60, 100, 80],
      clicks: [40, 30, 45, 60, 50, 70, 90],
      sales: [20, 40, 30, 80, 60, 50, 100]
  };

  const currentData = chartData[activeTab];

  return (
    <div className={cn("bg-white p-8 rounded-2xl shadow-sm border border-slate-100", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('views')}
            className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'views' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
              Views
          </button>
          <button 
            onClick={() => setActiveTab('clicks')}
            className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'clicks' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
              Klik
          </button>
          <button 
            onClick={() => setActiveTab('sales')}
            className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'sales' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
              Penjualan
          </button>
        </div>
      </div>

      {/* Pseudo-Chart Base using Flex Heights */}
      <div className="relative h-64 w-full flex items-end gap-1">
          {currentData.map((val, index) => (
             <div 
                key={`${activeTab}-${index}`} 
                className="w-full bg-primary/10 border-t-4 border-primary rounded-t-lg relative group transition-all duration-500 hover:bg-primary/20"
                style={{ height: `${val}%` }}
             >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg transition-opacity font-bold">
                    {val * 12}
                </div>
             </div>
          ))}
      </div>
      
      {/* Chart X-Axis Labels */}
      <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <span>MAY 01</span>
        <span className="hidden sm:inline">MAY 07</span>
        <span>MAY 14</span>
        <span className="hidden sm:inline">MAY 21</span>
        <span>MAY 28</span>
        <span>JUN 01</span>
      </div>
    </div>
  );
};

export default AnalyticsChart;
