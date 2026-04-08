import React from 'react';
import { cn } from '../../lib/utils';

interface Step {
    label: string;
    description?: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number; // 0-indexed
    className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, className }) => {
    return (
        <div className={cn("flex items-center justify-center gap-2 py-10 mb-6 px-4", className)}>
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    {/* STEP CIRCLE & LABEL */}
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 shadow-sm border-2",
                            index === currentStep 
                                ? "bg-primary border-primary text-white scale-110 shadow-xl shadow-primary/20" 
                                : index < currentStep 
                                    ? "bg-white border-primary text-primary" 
                                    : "bg-white border-slate-100 text-slate-300"
                        )}>
                            {index < currentStep ? (
                                <span className="material-symbols-outlined text-lg">check</span>
                            ) : (
                                index + 1
                            )}
                        </div>
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em] transition-colors whitespace-nowrap",
                            index === currentStep ? "text-slate-900" : "text-slate-300"
                        )}>
                            {step.label}
                        </span>
                    </div>

                    {/* CONNECTOR LINE */}
                    {index < steps.length - 1 && (
                        <div className={cn(
                            "w-16 h-0.5 mx-4 flex-shrink-0 rounded-full transition-all duration-500",
                            index < currentStep ? "bg-primary" : "bg-slate-100"
                        )} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Stepper;
