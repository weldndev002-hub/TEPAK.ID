import React from 'react';
import { cn } from '../../lib/utils';
import { 
    ShareIcon, 
    ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline';

interface PhoneFrameProps {
  children?: React.ReactNode;
  className?: string;
  theme?: 'minimal' | 'bold' | 'warm';
  profileName?: string;
  profileBio?: string;
  profileImage?: string;
  socials?: { icon: string; url: string | null }[];
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ 
    children, 
    className, 
    theme = 'minimal',
    profileName,
    profileBio,
    profileImage,
    socials = []
}) => {
  const isDark = theme === 'atelier-dark' || theme === 'bold';
  const isSunrise = theme === 'sunrise-glow';
  const isMinimal = theme === 'clean-minimal' || theme === 'minimal';

  return (
    <div className={cn(
      "w-[340px] h-[680px] rounded-[56px] border-[12px] border-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] relative overflow-hidden ring-1 ring-slate-800 transition-all duration-1000",
      isDark ? "bg-slate-900 text-white" : 
      isSunrise ? "bg-gradient-to-br from-amber-50 to-rose-100 text-slate-900" : 
      "bg-white text-slate-800",
      className
    )}>
      {isSunrise && (
        <>
            <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-rose-200/40 blur-[60px] rounded-full"></div>
            <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-amber-200/30 blur-[60px] rounded-full"></div>
        </>
      )}
      {isDark && (
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/[0.08] blur-[80px] rounded-full"></div>
      )}
      {/* Notch */}
      <div className="absolute top-0 w-36 h-7 bg-slate-900 left-1/2 -translate-x-1/2 rounded-b-[1.75rem] z-20 flex items-center justify-center">
        <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
      </div>
      
      {/* Mobile Screen Content */}
      <div className="h-full overflow-y-auto no-scrollbar pt-14 px-8 pb-24 relative z-10">
        <div className="flex flex-col items-center text-center">
            <div className={cn(
                "w-24 h-24 rounded-3xl mb-8 border-[6px] border-white shadow-2xl bg-white overflow-hidden group/avatar cursor-pointer transition-all duration-700",
                theme === 'bold' && "border-slate-800 shadow-slate-900/50"
            )}>
                <img 
                    src={profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                    className="w-full h-full object-cover group-hover/avatar:scale-105 transition-transform duration-700" 
                />
            </div>
            <h4 className="font-black text-3xl tracking-tighter line-clamp-2 leading-tight px-2">{profileName || 'Your Name'}</h4>
            <p className={cn(
                "text-sm font-medium opacity-80 mt-4 leading-relaxed px-4",
                isDark ? "text-slate-400" : isSunrise ? "text-slate-600" : "text-slate-500"
            )}>
                {profileBio || 'Capture moments, share stories.'}
            </p>

            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
                {socials.map((social, i) => (
                    <a 
                      key={i} 
                      href={social.url || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-500 shadow-sm border",
                        isDark ? "bg-slate-800 text-slate-400 border-slate-700 hover:bg-primary hover:text-white" :
                        isSunrise ? "bg-white/50 text-rose-400 border-white hover:bg-rose-500 hover:text-white" :
                        "bg-slate-50 text-slate-400 border-slate-100 hover:bg-primary hover:text-white"
                      )}
                    >
                        <div dangerouslySetInnerHTML={{ __html: social.icon }} className="w-5 h-5" />
                    </a>
                ))}
            </div>
            
            <div className="mt-10 w-full space-y-5">
                {children || (
                    <>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-full py-5 px-6 border border-current opacity-10 hover:opacity-100 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-between transition-all hover:scale-[1.02] cursor-pointer group/link">
                                <span className="opacity-80 group-hover/link:opacity-100 transition-opacity">Link Perspective {i}</span>
                                <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-40 group-hover/link:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
      </div>
      
      {/* Decorative Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-900/10 rounded-full z-20"></div>
    </div>
  );
};

export default PhoneFrame;
