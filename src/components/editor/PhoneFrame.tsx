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
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ 
    children, 
    className, 
    theme = 'minimal',
    profileName,
    profileBio,
    profileImage
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
                "w-24 h-24 rounded-full mb-6 border-4 border-white shadow-2xl bg-slate-100 overflow-hidden group/avatar cursor-pointer",
                theme === 'bold' && "border-slate-800 shadow-slate-900/50"
            )}>
                <img 
                    src={profileImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuD1myVuGIgwq81XmvMT1KbIlWlKCLouKbWS5mVzO8vJvYbYWQiLc7lFoyWFrMLfnyhHlR_yBkJcxX1-A7TDTqS6jIIWe17hHFosbhLn-s5RV19qr6lSLm6lRTK0LBBYXq85kWoVzOEyIC1JH839PewJe9pD2mQG08x7bKTKppWKY4nXAf3W_pD_L8M3Q7vrloGre2PhijR7sCJt0jJ5_kV69u8-K0s_R-t1up3AwO3xxxAW3YsOgtRgYZoYX2lvgeb_6q_rKjGw1JlR"} 
                    className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-700" 
                />
            </div>
            <h4 className="font-black text-2xl tracking-tighter uppercase line-clamp-1">{profileName || 'Your Name'}</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-2 italic leading-relaxed">
                {profileBio || 'Capture moments, share stories.'}
            </p>
            
            <div className="flex gap-6 mt-8">
                {[1, 2].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border border-current opacity-20 hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-slate-50 cursor-pointer">
                        <ShareIcon className="w-5 h-5" />
                    </div>
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
