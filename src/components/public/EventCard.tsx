import React from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

export interface EventCardProps {
  title: string;
  type?: string; 
  location?: string;
  date: string;
  time: string;
  imageSrc: string;
  ticketsLeft?: number;
  ctaText?: string;
  onBuy?: () => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  title, type = "Event", location, date, time, imageSrc, ticketsLeft, ctaText = "Beli Tiket", onBuy, className 
}) => {
  return (
    <div className={cn("w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-lg", className)}>
      
      {/* Event Image Cover (Left on Desktop, Top on Mobile) */}
      <div className="md:w-40 h-48 md:h-auto relative shrink-0">
        <img 
            className="w-full h-full object-cover" 
            src={imageSrc} 
            alt={title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent md:hidden"></div>
      </div>

      {/* Event Details */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wide">
            {type}
          </span>
          {location && (
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide truncate">
                • {location}
            </span>
          )}
        </div>
        
        <h3 className="font-bold text-xl text-slate-900 mb-4 line-clamp-2">{title}</h3>
        
        <div className="space-y-2 mb-6 flex-1">
          <div className="flex items-center gap-3 text-slate-600 text-sm">
            <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 0" }}>calendar_today</span>
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 text-sm">
            <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 0" }}>schedule</span>
            <span className="font-medium">{time}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="text-sm font-medium text-slate-500">
            {ticketsLeft !== undefined ? (
                <>Sisa <span className="text-error font-bold">{ticketsLeft} Tiket</span></>
            ) : (
                <span className="text-emerald-600 font-bold">Tersedia</span>
            )}
          </div>
          
          <Button 
            onClick={onBuy}
            variant="primary" 
            className="px-6 py-2 h-auto rounded-lg"
          >
            {ctaText}
          </Button>
        </div>
      </div>

    </div>
  );
};

export default EventCard;
