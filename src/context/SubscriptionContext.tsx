import React, { createContext, useContext, useState, useEffect } from 'react';

type Plan = 'free' | 'pro' | 'enterprise';
type Status = 'SUCCESS' | 'PENDING' | 'CANCELED';

interface SubscriptionContextType {
    plan: Plan;
    expiryDate: string | null;
    autoRenewal: boolean;
    isLoading: boolean;
    upgradeToPro: () => Promise<void>;
    cancelSubscription: () => Promise<void>;
    refreshStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [plan, setPlan] = useState<Plan>('free');
    const [expiryDate, setExpiryDate] = useState<string | null>(null);
    const [autoRenewal, setAutoRenewal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const refreshStatus = async () => {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                const settings = data.settings;
                if (settings) {
                    setPlan(settings.plan_status as Plan);
                    setExpiryDate(settings.plan_expiry);
                    setAutoRenewal(settings.auto_renewal);
                }
            }
        } catch (err) {
            console.error('[SubscriptionContext] Failed to fetch status:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshStatus();
    }, []);

    const upgradeToPro = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/subscription/upgrade', { method: 'POST' });
            if (!res.ok) throw new Error('Gagal melakukan upgrade');
            await refreshStatus();
        } catch (err) {
            console.error('Upgrade error:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const cancelSubscription = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/subscription/cancel', { method: 'POST' });
            if (!res.ok) throw new Error('Gagal membatalkan perpanjangan');
            await refreshStatus();
        } catch (err) {
            console.error('Cancel error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SubscriptionContext.Provider value={{ 
            plan, 
            expiryDate,
            autoRenewal,
            isLoading,
            upgradeToPro, 
            cancelSubscription,
            refreshStatus
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) throw new Error('useSubscription must be used within a SubscriptionProvider');
    return context;
};
