import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface PaymentMethodCardProps {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ 
    id, title, description, icon: Icon, isSelected, onSelect 
}) => {
    return (
        <div 
            onClick={() => onSelect(id)}
            className={cn(
                "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 group",
                isSelected 
                    ? "border-secondary bg-secondary/5 font-['Plus_Jakarta_Sans',sans-serif]" 
                    : "border-outline-variant bg-surface hover:border-secondary/50 shadow-sm font-['Plus_Jakarta_Sans',sans-serif]"
            )}
        >
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center transition-colors shadow-sm bg-white",
                    isSelected ? "text-primary" : "text-primary"
                )}>
                    <Icon className="w-7 h-7" />
                </div>
                <div>
                    <p className={cn("font-bold text-sm tracking-tight", isSelected ? "text-on-surface" : "text-on-surface")}>
                        {title}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{description}</p>
                </div>
            </div>

            {isSelected ? (
                <CheckCircleIcon className="w-6 h-6 text-secondary" />
            ) : (
                <div className="w-6 h-6 rounded-full border-2 border-outline-variant"></div>
            )}
        </div>
    );
};

export default PaymentMethodCard;

