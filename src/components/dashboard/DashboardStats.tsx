import React from 'react';
import { cn } from '../../lib/utils';
import { 
    EyeIcon, 
    CursorArrowRaysIcon, 
    WalletIcon, 
    ArrowTrendingUpIcon, 
    ArrowTrendingDownIcon 
} from '@heroicons/react/24/solid';

interface StatCardProps {
    label: string;
    value: string;
    trend?: string;
    trendType?: 'up' | 'down' | 'neutral';
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
    label, value, trend, trendType = 'neutral', icon: Icon, iconBg, iconColor 
}) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-700 group font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex justify-between items-start mb-8">
            <div className={cn("p-5 rounded-2xl transition-all group-hover:scale-110 duration-500 shadow-sm group-hover:shadow-md", iconBg, iconColor)}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <div className={cn(
                    "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm border border-transparent",
                    trendType === 'up' ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : 
                    trendType === 'down' ? "bg-rose-50 text-rose-600 border-rose-100/50" : "bg-slate-50 text-slate-500 border-slate-100/50"
                )}>
                    {trendType === 'up' && <ArrowTrendingUpIcon className="w-3.5 h-3.5" />}
                    {trendType === 'down' && <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
                    {trend}
                </div>
            )}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{label}</p>
            <h4 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{value}</h4>
        </div>
    </div>
);

export const DashboardStats: React.FC = () => {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard 
                label="Total Impressions"
                value="12.4k"
                trend="+8.2%"
                trendType="up"
                icon={EyeIcon}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-500"
            />
            <StatCard 
                label="Conversion Rate"
                value="3.12%"
                trend="+24.1%"
                trendType="up"
                icon={CursorArrowRaysIcon}
                iconBg="bg-amber-50"
                iconColor="text-amber-500"
            />
            <StatCard 
                label="Gross Revenue"
                value="Rp 18.2M"
                trend="ALL TIME"
                icon={WalletIcon}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-500"
            />
        </section>
    );
};

export default DashboardStats;

