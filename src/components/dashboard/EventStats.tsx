import React from 'react';
import { cn } from '../../lib/utils';
import { CalendarIcon, TicketIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export interface EventStatsProps {
  className?: string;
}

export const EventStats: React.FC<EventStatsProps> = ({ className }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-8 font-['Plus_Jakarta_Sans',sans-serif]", className)}>
        
        {/* Total Events */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col items-center hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                <CalendarIcon className="w-7 h-7" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Total Events</p>
            <h4 className="text-4xl font-black text-slate-900 mt-2 uppercase tracking-tighter">24</h4>
            <div className="mt-4 text-[10px] text-emerald-600 font-black bg-emerald-50 px-3 py-1.5 rounded-xl tracking-widest uppercase border border-emerald-100/50">
                +3 This Month
            </div>
        </div>

        {/* Tickets Sold */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col items-center hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform duration-500">
                <TicketIcon className="w-7 h-7" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Tickets Sold</p>
            <h4 className="text-4xl font-black text-slate-900 mt-2 uppercase tracking-tighter">1,502</h4>
            <div className="mt-4 text-[10px] text-emerald-600 font-black bg-emerald-50 px-3 py-1.5 rounded-xl tracking-widest uppercase border border-emerald-100/50">
                +12% vs Last Week
            </div>
        </div>

        {/* Net Revenue */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col items-center hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-500">
                <CurrencyDollarIcon className="w-7 h-7" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Net Revenue</p>
            <h4 className="text-4xl font-black text-slate-900 mt-2 uppercase tracking-tighter">Rp 45M</h4>
            <div className="mt-4 text-[10px] text-slate-400 font-black bg-slate-50 px-3 py-1.5 rounded-xl tracking-widest uppercase border border-slate-100/50">
                Weekly Payout
            </div>
        </div>

    </div>
  );
};

export default EventStats;
