import React from 'react';
import { cn } from '../../lib/utils';
import { CheckIcon } from '@heroicons/react/24/outline';

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
        <div className={cn("flex flex-wrap items-center justify-center gap-6 py-12 mb-8 px-6 ", className)}>
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    {/* STEP CIRCLE & LABEL */}
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-500 shadow-sm border-2",
                            index === currentStep 
                                ? "bg-primary border-primary text-white scale-110 shadow-xl shadow-primary/20" 
                                : index < currentStep 
                                    ? "bg-white border-primary text-primary" 
                                    : "bg-white border-slate-100 text-slate-300"
                        )}>
                            {index < currentStep ? (
                                <CheckIcon className="w-6 h-6 stroke-[3]" />
                            ) : (
                                index + 1
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em] transition-colors whitespace-nowrap",
                                index === currentStep ? "text-slate-900" : "text-slate-300"
                            )}>
                                {step.label}
                            </span>
                            {step.description && index === currentStep && (
                                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter mt-0.5">
                                    Current Status
                                </span>
                            )}
                        </div>
                    </div>

                    {/* CONNECTOR LINE */}
                    {index < steps.length - 1 && (
                        <div className={cn(
                            "hidden md:block w-12 h-[2px] mx-2 flex-shrink-0 rounded-full transition-all duration-700",
                            index < currentStep ? "bg-primary" : "bg-slate-100"
                        )} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Stepper;

