import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { PaymentModal } from './PaymentModal';
import { SubscriptionProvider, useSubscription } from '../../context/SubscriptionContext';

const PricingFlowContent: React.FC = () => {
    const { plan } = useSubscription();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    if (plan !== 'free') {
        return (
            <Button disabled variant="primary" className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-black shadow-none border-none">
                Paket {plan.charAt(0).toUpperCase() + plan.slice(1)} Aktif
            </Button>
        );
    }

    return (
        <>
            <Button
                onClick={() => setIsPaymentOpen(true)}
                variant="primary"
                className="w-full py-5 rounded-2xl bg-white text-primary font-black hover:bg-slate-50 shadow-none border-none active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
                Upgrade Paket Sekarang
            </Button>

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
            />
        </>
    );
};

export const PricingFlow: React.FC = () => {
    return (
        <SubscriptionProvider>
            <PricingFlowContent />
        </SubscriptionProvider>
    );
};
