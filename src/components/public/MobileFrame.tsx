import React from 'react';
import { cn } from '../../lib/utils';

export interface MobileFrameProps {
  children?: React.ReactNode;
  className?: string;
  frameClassName?: string;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ 
  children, className, frameClassName 
}) => {
  return (
    <div className={cn("flex justify-center shrink-0", className)}>
        <div className={cn(
            "w-[360px] h-[720px] bg-white rounded-[48px] border-[12px] border-slate-900 shadow-2xl relative overflow-hidden",
            frameClassName
        )}>
            {/* Mobile Screen Content Scrollable Area */}
            <div className="h-full w-full overflow-y-auto bg-slate-50 flex flex-col no-scrollbar mx-auto relative content-area z-0">
                {children}
            </div>
            
            {/* Top Notch UI Fake Hardware */}
            <div className="absolute top-0 w-32 h-6 bg-slate-900 left-1/2 -translate-x-1/2 rounded-b-2xl z-20 shadow-[0_4px_10px_rgba(0,0,0,0.1)]"></div>
        </div>
    </div>
  );
};

export default MobileFrame;
