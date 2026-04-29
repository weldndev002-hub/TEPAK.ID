import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { PaymentModal } from './PaymentModal';
import { SubscriptionProvider, useSubscription } from '../../context/SubscriptionContext';

const PricingFlowContent: React.FC = () => {
    const { plan, planDetails } = useSubscription();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [allPlans, setAllPlans] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/plans')
            .then(res => res.json())
            .then(data => setAllPlans(data || []))
            .catch(err => console.error('Failed to fetch plans:', err));
    }, []);

    const currentPlanInfo = allPlans.find((p: any) => p.id === plan);
    const currentPrice = Number(currentPlanInfo?.price_monthly || 0);
    const upgradeablePlans = allPlans.filter((p: any) => Number(p.price_monthly) > currentPrice);
    const hasUpgrade = upgradeablePlans.length > 0;

    if (plan !== 'free' && !hasUpgrade) {
        return (
            <Button disabled variant="primary" className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-black shadow-none border-none">
                Paket {plan.charAt(0).toUpperCase() + plan.slice(1)} Aktif — Paket Tertinggi
            </Button>
        );
    }

    if (plan !== 'free' && hasUpgrade) {
        return (
            <>
                <Button
                    onClick={() => setIsPaymentOpen(true)}
                    variant="primary"
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary to-amber-500 text-white font-black hover:opacity-90 shadow-xl shadow-primary/20 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                    Upgrade Paket
                </Button>

                <PaymentModal
                    isOpen={isPaymentOpen}
                    onClose={() => setIsPaymentOpen(false)}
                />
            </>
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
