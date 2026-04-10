import React from 'react';
import { cn } from '../../lib/utils';
import { CheckIcon } from '@heroicons/react/24/outline';

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
    <div className={cn("flex flex-col w-full max-w-2xl mx-auto relative ", className)}>
        {/* Background Lines */}
        <div className="absolute top-6 left-10 right-10 h-[2px] flex z-0">
             {steps.map((_, index) => {
                 if (index === steps.length - 1) return null;
                 const isCompleted = index < currentStepIndex;
                 return (
                     <div key={index} className={cn(
                         "flex-1 h-full transition-all duration-700", 
                         isCompleted ? "bg-primary" : "bg-slate-100"
                     )}></div>
                 );
             })}
        </div>

        {/* Nodes */}
        <div className="flex items-start justify-between w-full relative z-10">
            {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                    <div key={step.id} className="flex flex-col items-center gap-4 bg-transparent">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                            isCompleted ? "bg-primary text-white shadow-lg shadow-primary/20" : 
                            isCurrent ? "bg-primary text-white shadow-xl shadow-primary/30 scale-110" : 
                            "bg-white border border-slate-100 text-slate-300 shadow-sm"
                        )}>
                            {isCompleted ? (
                                <CheckIcon className="w-6 h-6 stroke-[3]" />
                            ) : (
                                <span className="text-[10px] font-black">{step.id}</span>
                            )}
                        </div>
                        <div className="flex flex-col items-center">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                                isCurrent ? "text-slate-900" : "text-slate-400"
                            )}>
                                {step.label}
                            </span>
                            {isCurrent && (
                                <span className="text-[8px] font-black text-primary uppercase tracking-tighter mt-1">Current</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default StepIndicator;

