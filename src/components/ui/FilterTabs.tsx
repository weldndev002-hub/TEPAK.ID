import React from 'react';
import { cn } from '../../lib/utils';

export interface FilterTabProps {
    label: string;
    value: string;
}

export interface FilterTabsProps {
    tabs: FilterTabProps[];
    activeTab: string;
    onTabChange?: (value: string) => void;
    className?: string;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({ tabs, activeTab, onTabChange, className }) => {
    return (
        <div className={cn("flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar", className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                    <button
                        key={tab.value}
                        onClick={() => onTabChange?.(tab.value)}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm whitespace-nowrap transition-colors",
                            isActive 
                                ? "font-bold bg-[#465f89] text-white shadow-md shadow-[#465f89]/10" 
                                : "font-medium text-slate-600 hover:bg-slate-200"
                        )}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

export default FilterTabs;
