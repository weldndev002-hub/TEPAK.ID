import React from 'react';
import { cn } from '../../lib/utils';
import Button from './Button';
import Badge from './Badge';

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
            "flex flex-col md:flex-row bg-white rounded-[2rem] overflow-hidden p-3 border border-slate-100/60 shadow-sm hover:shadow-xl transition-all duration-700 group",
            className
        )}>
            {/* EVENT IMAGE */}
            <div className="md:w-56 h-40 rounded-[1.5rem] overflow-hidden shrink-0 relative">
                <img 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    src={image} 
                    alt={title}
                />
                <div className="absolute top-3 left-3">
                    <Badge variant="pro" className="text-[9px] px-3 py-1.5 shadow-xl">{type}</Badge>
                </div>
            </div>

            {/* EVENT INFO */}
            <div className="flex flex-col justify-center p-6 md:pl-8 flex-grow">
                <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{date}</span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4 tracking-tighter">
                    {title}
                </h3>

                {slotsLeft !== undefined && (
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-error bg-error/10 px-3 py-1 rounded-full uppercase tracking-widest">
                            Sisa {slotsLeft} Slot
                        </span>
                    </div>
                )}
            </div>

            {/* ACTION BUTTON */}
            <div className="flex items-center p-4 md:pr-6 shrink-0">
                <a href="/checkout" className="w-full md:w-auto">
                    <Button variant="outline" size="lg" className="w-full md:w-auto px-10 py-4 font-black uppercase tracking-widest text-[10px] border-2 border-slate-100 hover:border-primary">
                        Beli Tiket
                    </Button>
                </a>
            </div>
        </div>
    );
};

export default EventCard;
