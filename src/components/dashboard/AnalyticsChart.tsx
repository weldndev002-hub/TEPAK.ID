import React, { useState, useEffect } from 'react';
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
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/analytics/dashboard?range=7d');
        if (res.ok) {
          const result = await res.json();
          setData(result.time_series);
        }
      } catch (err) {
        console.error('Chart Data Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Use API data or fallback to zeros
  const currentData = data ? data[activeTab] : [0, 0, 0, 0, 0, 0, 0];
  const labels = data ? data.labels : ['...', '...', '...', '...', '...', '...', '...'];
  
  // Find max for scaling
  const maxValue = Math.max(...currentData, 1);

  if (isLoading) {
    return <div className={cn("bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-pulse h-80 flex items-center justify-center text-slate-300 font-bold uppercase text-xs tracking-widest", className)}>Loading Chart...</div>;
  }

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

      {/* Real-time Chart using Flex Heights */}
      <div className="relative h-64 w-full flex items-end gap-1.5 md:gap-3">
          {currentData.map((val: number, index: number) => (
             <div 
                key={`${activeTab}-${index}`} 
                className="w-full bg-primary/10 border-t-4 border-primary rounded-t-lg relative group transition-all duration-500 hover:bg-primary/20"
                style={{ height: `${(val / maxValue) * 100}%`, minHeight: val > 0 ? '4px' : '2px' }}
             >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg transition-opacity font-bold whitespace-nowrap z-20">
                    {activeTab === 'sales' ? `Rp ${val.toLocaleString()}` : `${val} ${activeTab}`}
                </div>
             </div>
          ))}
      </div>
      
      {/* Dynamic X-Axis Labels */}
      <div className="flex justify-between mt-4 text-[9px] text-slate-400 font-bold uppercase tracking-wider overflow-hidden">
        {labels.map((label: string, i: number) => (
            <span key={i} className={cn(labels.length > 10 && i % 4 !== 0 ? 'hidden md:inline' : '')}>{label}</span>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsChart;
