import React from 'react';
import { cn } from '../../lib/utils';

interface PhoneFrameProps {
  children?: React.ReactNode;
  className?: string;
  theme?: 'minimal' | 'bold' | 'warm';
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, className, theme = 'minimal' }) => {
  return (
    <div className={cn(
      "w-[320px] h-[640px] bg-white rounded-[48px] border-[10px] border-slate-900 shadow-2xl relative overflow-hidden ring-1 ring-slate-800 transition-all duration-700",
      theme === 'bold' ? "bg-slate-900 text-white" : 
      theme === 'warm' ? "bg-orange-50 text-orange-950" : 
      "bg-white text-slate-800",
      className
    )}>
      {/* Notch */}
      <div className="absolute top-0 w-32 h-6 bg-slate-900 left-1/2 -translate-x-1/2 rounded-b-2xl z-20"></div>
      
      {/* Mobile Screen Content */}
      <div className="h-full overflow-y-auto no-scrollbar pt-10 px-6 pb-20 relative z-10">
        <div className="flex flex-col items-center">
            <div className={cn(
                "w-20 h-20 rounded-full mb-4 border-4 border-white shadow-xl bg-slate-200 overflow-hidden",
                theme === 'bold' && "border-slate-800"
            )}>
                <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1myVuGIgwq81XmvMT1KbIlWlKCLouKbWS5mVzO8vJvYbYWQiLc7lFoyWFrMLfnyhHlR_yBkJcxX1-A7TDTqS6jIIWe17hHFosbhLn-s5RV19qr6lSLm6lRTK0LBBYXq85kWoVzOEyIC1JH839PewJe9pD2mQG08x7bKTKppWKY4nXAf3W_pD_L8M3Q7vrloGre2PhijR7sCJt0jJ5_kV69u8-K0s_R-t1up3AwO3xxxAW3YsOgtRgYZoYX2lvgeb_6q_rKjGw1JlR" 
                    className="w-full h-full object-cover" 
                />
            </div>
            <h4 className="font-black text-xl tracking-tight">Creator Senja</h4>
            <p className="text-xs opacity-60 mt-1">Capture moments, share stories.</p>
            
            <div className="flex gap-4 mt-6">
                {[1, 2].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border border-current opacity-20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">share</span>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 w-full space-y-4">
                {children || (
                    <>
                        {[1, 2].map((i) => (
                            <div key={i} className="w-full py-4 px-6 border border-current opacity-20 rounded-2xl font-bold flex items-center justify-between">
                                <span className="text-sm">Link {i}</span>
                                <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
      </div>
      
      {/* Glassy Overlay for Editor mode if needed */}
      <div className="absolute inset-0 bg-primary/5 pointer-events-none opacity-0 hover:opacity-10 transition-opacity"></div>
    </div>
  );
};

export default PhoneFrame;
