import React, { useState, useEffect } from 'react';
import { StatCard } from './StatCard';
import { 
  EyeIcon, 
  CursorArrowRaysIcon, 
  ArrowTrendingUpIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

export const IntegratedStatsGrid: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/analytics/dashboard?range=30d');
                if (!res.ok) throw new Error('Failed to fetch dashboard stats');
                const result = await res.json();
                setData(result);
            } catch (err) {
                console.error('Dashboard Stats Error:', err);
                setError('Failed to load metrics');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse h-32 flex items-center justify-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                        Loading...
                    </div>
                ))}
            </div>
        );
    }

    const metrics = [
        {
            title: "Total Views",
            value: data?.totalViews?.toLocaleString() || "0",
            icon: EyeIcon,
            colorTheme: "tertiary" as const,
            isEmpty: !data?.totalViews,
            emptyMessage: "Pelajari cara menjangkau audiens"
        },
        {
            title: "Total Clicks",
            value: data?.totalClicks?.toLocaleString() || "0",
            icon: CursorArrowRaysIcon,
            colorTheme: "primary" as const,
            isEmpty: !data?.totalClicks,
            emptyMessage: "Menunggu klik pertama Anda"
        },
        {
            title: "Conversion Rate (CTR)",
            value: data?.avgCTR || "0%",
            icon: ArrowTrendingUpIcon,
            colorTheme: "slate" as const
        },
        {
            title: "Gross Revenue",
            value: `Rp ${(data?.sales?.total_revenue || 0).toLocaleString()}`,
            icon: CurrencyDollarIcon,
            colorTheme: "green" as const
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, idx) => (
                <StatCard key={idx} {...metric} />
            ))}
        </div>
    );
};
