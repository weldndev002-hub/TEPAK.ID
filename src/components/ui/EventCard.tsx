import React from 'react';
import { cn } from '../../lib/utils';
import Button from './Button';
import Badge from './Badge';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface EventCardProps {
    image: string;
    title: string;
    date: string;
    type: 'Webinar' | 'Workshop' | 'Seminar';
    slotsLeft?: number;
    className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({ 
    image, title, date, type, slotsLeft, className 
}) => {
    return (
        <div className={cn(
            "flex flex-col md:flex-row bg-white rounded-[2.5rem] overflow-hidden p-3 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-700 group ",
            className
        )}>
            {/* EVENT IMAGE */}
            <div className="md:w-64 h-48 md:h-auto rounded-[2rem] overflow-hidden shrink-0 relative">
                <img 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    src={image} 
                    alt={title}
                />
                <div className="absolute top-4 left-4">
                    <Badge variant="pro" className="text-[9px] px-4 py-2 shadow-xl backdrop-blur-md bg-white/90 text-primary border-none font-black uppercase tracking-widest">{type}</Badge>
                </div>
            </div>

            {/* EVENT INFO */}
            <div className="flex flex-col justify-center p-8 md:px-10 flex-grow">
                <div className="flex items-center gap-3 mb-4">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{date}</span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-5 tracking-tighter uppercase max-w-lg">
                    {title}
                </h3>

                {slotsLeft !== undefined && (slotsLeft < 10) && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-4 py-2 rounded-full uppercase tracking-widest border border-rose-100/50">
                            Only {slotsLeft} Slots Left
                        </span>
                    </div>
                )}
            </div>

            {/* ACTION BUTTON */}
            <div className="flex items-center p-6 md:pr-10 shrink-0">
                <a href="/checkout" className="w-full md:w-auto">
                    <Button variant="outline" className="w-full md:w-auto px-10 py-5 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl border-2 border-slate-100 hover:border-primary hover:text-primary transition-all active:scale-95">
                        Get Ticket
                    </Button>
                </a>
            </div>
        </div>
    );
};

export default EventCard;

