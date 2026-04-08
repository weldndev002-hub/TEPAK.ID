import React from 'react';
import { cn } from '../../lib/utils';
import { EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { PlayIcon as PlayIconSolid } from '@heroicons/react/24/solid';

export interface TutorialCardProps {
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
  views: string;
  publishedAt: string;
  platform?: 'YouTube' | 'Vimeo' | 'Native';
  className?: string;
}

export const TutorialCard: React.FC<TutorialCardProps> = ({
  title,
  thumbnail,
  duration,
  category,
  views,
  publishedAt,
  platform = 'YouTube',
  className
}) => {
  return (
    <div className={cn(
      "group bg-white rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border border-slate-100 hover:border-primary/10 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]",
      className
    )}>
      {/* Thumbnail Area */}
      <div className="aspect-video relative overflow-hidden bg-slate-100">
        <img 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          src={thumbnail} 
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-500">
            <PlayIconSolid className="w-10 h-10" />
          </div>
        </div>
        
        {/* Duration Badge */}
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-white tracking-widest">
          {duration}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-md">
            {category}
          </span>
          
          {/* Platform Icon */}
          <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
            {platform === 'YouTube' && (
              <>
                <svg className="w-4 h-4 fill-red-600" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
                </svg>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">YouTube</span>
              </>
            )}
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors mb-4 uppercase tracking-tight">
          {title}
        </h3>

        {/* Card Footer Stats */}
        <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
          <div className="flex items-center gap-2 text-slate-400">
            <EyeIcon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{views} Views</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <ClockIcon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{publishedAt} ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialCard;

