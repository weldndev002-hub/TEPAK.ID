import React from 'react';
import { cn } from '../../lib/utils';

interface PaymentMethodCardProps {
    id: string;
    title: string;
    description: string;
    icon: string;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ 
    id, title, description, icon, isSelected, onSelect 
}) => {
    return (
        <div 
            onClick={() => onSelect(id)}
            className={cn(
                "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 group",
                isSelected 
                    ? "border-secondary bg-secondary/5" 
                    : "border-outline-variant bg-surface hover:border-secondary/50 shadow-sm"
            )}
        >
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                    isSelected ? "bg-white text-primary" : "bg-white text-primary"
                )}>
                    <span className="material-symbols-outlined text-3xl">{icon}</span>
                </div>
                <div>
                    <p className={cn("font-bold text-sm tracking-tight", isSelected ? "text-on-surface" : "text-on-surface")}>
                        {title}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{description}</p>
                </div>
            </div>

            {isSelected ? (
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            ) : (
                <div className="w-6 h-6 rounded-full border-2 border-outline-variant"></div>
            )}
        </div>
    );
};

export default PaymentMethodCard;
