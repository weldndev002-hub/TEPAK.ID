import React, { createContext, useContext, useState, useEffect } from 'react';

type Plan = 'free' | 'pro' | 'enterprise' | string;
type Status = 'SUCCESS' | 'PENDING' | 'CANCELED';
type BillingPeriod = 'monthly' | 'yearly';

interface SubscriptionContextType {
    plan: Plan;
    planDetails: any | null;
    expiryDate: string | null;
    autoRenewal: boolean;
    isLoading: boolean;
    upgradeToPro: (method?: string) => Promise<void>;
    upgradeToPlan: (planId: string, billingPeriod: BillingPeriod, method?: string) => Promise<void>;
    cancelSubscription: () => Promise<void>;
    refreshStatus: () => Promise<void>;
    transactions: any[];
    syncStatus: () => Promise<void>;
    hasFeature: (featureName: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [plan, setPlan] = useState<Plan>('free');
    const [planDetails, setPlanDetails] = useState<any | null>(null);
    const [expiryDate, setExpiryDate] = useState<string | null>(null);
    const [autoRenewal, setAutoRenewal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/subscription/history');
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (err) {
            console.error('[SubscriptionContext] Failed to fetch history:', err);
        }
    };

    const refreshStatus = async () => {
        try {
            const res = await fetch('/api/subscription/status');
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setPlan(data.plan_status as Plan);
                    setExpiryDate(data.plan_expiry);
                    setAutoRenewal(data.auto_renewal);
                    setPlanDetails(data.plan_details || null);
                }
            }
        } catch (err) {
            console.error('[SubscriptionContext] Failed to fetch status:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const hasFeature = (featureName: string): boolean => {
        // If we have plan details with features, use that
        if (planDetails?.features && Array.isArray(planDetails.features)) {
            return planDetails.features.includes(featureName);
        }

        // Fallback: For paid plans, assume they have core paid features
        // if planDetails is not available (e.g., network issues, caching)
        const isPaidPlan = plan !== 'free' && !!plan;
        if (isPaidPlan) {
            // Core features that all paid plans should have
            const corePaidFeatures = [
                'Digital Product Sales',
                'Custom Domain (CNAME)',
                'Analytics',
                'Customer Management',
                'WhatsApp Notification',
                'Facebook Pixel & GA4'
            ];
            if (corePaidFeatures.includes(featureName)) {
                console.log(`[hasFeature] Fallback: Granting "${featureName}" for paid plan "${plan}" (planDetails not loaded)`);
                return true;
            }
        }

        return false;
    };

    useEffect(() => {
        refreshStatus();
        fetchHistory();
    }, []);

    const syncStatus = async () => {
        setIsLoading(true);
        await Promise.all([refreshStatus(), fetchHistory()]);
        setIsLoading(false);
    };

    const upgradeToPro = async (method?: string) => {
        // Backward compatibility — delegate ke upgradeToPlan
        return upgradeToPlan('pro', 'monthly', method);
    };

    const upgradeToPlan = async (planId: string, billingPeriod: BillingPeriod = 'monthly', method?: string) => {
        setIsLoading(true);
        try {
            // Kirim planId, billingPeriod, dan metode pembayaran di body request
            const res = await fetch('/api/subscription/upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    method,
                    planId,
                    billingPeriod
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Gagal melakukan upgrade');
            }

            const data = await res.json();

            // Redirect to Duitku Payment URL
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                throw new Error('Payment URL tidak ditemukan');
            }
        } catch (err: any) {
            console.error('Upgrade error:', err);
            alert(err.message || 'Gagal terhubung ke sistem pembayaran');
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
            planDetails,
            expiryDate,
            autoRenewal,
            isLoading,
            upgradeToPro,
            upgradeToPlan,
            cancelSubscription,
            refreshStatus,
            transactions,
            syncStatus,
            hasFeature
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
