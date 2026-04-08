import React from 'react';
import { cn } from '../../lib/utils';

export interface EventStatsProps {
  className?: string;
}

export const EventStats: React.FC<EventStatsProps> = ({ className }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
        
        {/* Total Events */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
            <span className="material-symbols-outlined text-primary mb-2 text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>event</span>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mt-1">Total Events</p>
            <h4 className="text-3xl font-black text-slate-900 mt-2">24</h4>
            <div className="mt-3 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded tracking-wide">
                +3 this month
            </div>
        </div>

        {/* Tickets Sold */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
            <span className="material-symbols-outlined text-secondary mb-2 text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>confirmation_number</span>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mt-1">Tickets Sold</p>
            <h4 className="text-3xl font-black text-slate-900 mt-2">1,502</h4>
            <div className="mt-3 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded tracking-wide">
                +12% vs last week
            </div>
        </div>

        {/* Net Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
            <span className="material-symbols-outlined text-emerald-500 mb-2 text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>monetization_on</span>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mt-1">Net Revenue</p>
            <h4 className="text-3xl font-black text-slate-900 mt-2">Rp 45M</h4>
            <div className="mt-3 text-[10px] text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded tracking-wide">
                Payout every Monday
            </div>
        </div>

    </div>
  );
};

export default EventStats;
