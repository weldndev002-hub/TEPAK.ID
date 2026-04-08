import React from 'react';
import { cn } from '../../lib/utils';

export interface Step {
  id: string | number;
  label: string;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStepIndex: number;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  steps, 
  currentStepIndex,
  className 
}) => {
  return (
    <div className={cn("flex flex-col w-full max-w-2xl mx-auto relative", className)}>
        {/* Background Lines */}
        <div className="absolute top-5 left-8 right-8 h-1 flex z-0">
             {steps.map((_, index) => {
                 if (index === steps.length - 1) return null;
                 const isCompleted = index < currentStepIndex;
                 return (
                     <div key={index} className={cn(
                         "flex-1 h-full transition-all duration-300", 
                         isCompleted ? "bg-primary" : "bg-slate-200"
                     )}></div>
                 );
             })}
        </div>

        {/* Nodes */}
        <div className="flex items-start justify-between w-full relative z-10">
            {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isUpcoming = index > currentStepIndex;

                return (
                    <div key={step.id} className="flex flex-col items-center gap-2 bg-transparent">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300",
                            isCompleted ? "bg-primary text-white" : 
                            isCurrent ? "bg-primary text-white ring-4 ring-primary/20 shadow-md" : 
                            "bg-slate-200 text-slate-400"
                        )}>
                            {isCompleted ? <span className="material-symbols-outlined text-sm font-bold">check</span> : step.id}
                        </div>
                        <span className={cn(
                            "text-xs transition-colors",
                            isCurrent ? "font-bold text-primary" : 
                            "font-medium text-slate-400"
                        )}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default StepIndicator;
