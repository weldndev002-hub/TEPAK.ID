import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

export type WarningModalVariant = 'danger' | 'warning' | 'info';

export interface WarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: WarningModalVariant;
}

const variantStyles: Record<WarningModalVariant, {
    icon: string;
    iconBg: string;
    confirmBtn: string;
    border: string;
}> = {
    danger: {
        icon: 'text-rose-500',
        iconBg: 'bg-rose-50',
        confirmBtn: 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20',
        border: 'border-rose-100',
    },
    warning: {
        icon: 'text-amber-500',
        iconBg: 'bg-amber-50',
        confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20',
        border: 'border-amber-100',
    },
    info: {
        icon: 'text-blue-500',
        iconBg: 'bg-blue-50',
        confirmBtn: 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20',
        border: 'border-blue-100',
    },
};

export const WarningModal: React.FC<WarningModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Konfirmasi',
    cancelLabel = 'Batal',
    variant = 'danger',
}) => {
    if (!isOpen) return null;

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className={cn(
                "bg-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden border",
                styles.border
            )}>
                {/* Header */}
                <div className="px-8 pt-8 pb-0 flex items-start justify-between gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", styles.iconBg)}>
                        <ExclamationTriangleIcon className={cn("w-6 h-6", styles.icon)} />
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900 shrink-0 mt-1"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 pt-4 pb-8">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-black text-slate-500 hover:bg-slate-100 transition-all text-[11px] uppercase tracking-widest"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className={cn(
                            "px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95",
                            styles.confirmBtn
                        )}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarningModal;
