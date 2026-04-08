import React from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
    label: string;
    value: string;
    trend?: string;
    trendType?: 'up' | 'down' | 'neutral';
    icon: string;
    iconBg: string;
    iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
    label, value, trend, trendType = 'neutral', icon, iconBg, iconColor 
}) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
        <div className="flex justify-between items-start mb-6">
            <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500", iconBg, iconColor)}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            {trend && (
                <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1",
                    trendType === 'up' ? "bg-emerald-50 text-emerald-600" : 
                    trendType === 'down' ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"
                )}>
                    {trendType === 'up' && <span className="material-symbols-outlined text-[10px]">trending_up</span>}
                    {trendType === 'down' && <span className="material-symbols-outlined text-[10px]">trending_down</span>}
                    {trend}
                </div>
            )}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h4>
        </div>
    </div>
);

export const DashboardStats: React.FC = () => {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard 
                label="Total Views"
                value="12.482"
                trend="+8%"
                trendType="up"
                icon="visibility"
                iconBg="bg-blue-50"
                iconColor="text-blue-500"
            />
            <StatCard 
                label="Total Clicks"
                value="3.120"
                trend="+24%"
                trendType="up"
                icon="ads_click"
                iconBg="bg-orange-50"
                iconColor="text-orange-500"
            />
            <StatCard 
                label="Earnings"
                value="Rp 18.2M"
                trend="Semua Waktu"
                icon="account_balance_wallet"
                iconBg="bg-emerald-50"
                iconColor="text-emerald-500"
            />
        </section>
    );
};

export default DashboardStats;
