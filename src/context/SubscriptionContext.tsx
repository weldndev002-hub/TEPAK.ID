import React, { createContext, useContext, useState, useEffect } from 'react';

type Plan = 'free' | 'pro' | 'enterprise';
type Status = 'SUCCESS' | 'PENDING' | 'CANCELED';

interface SubscriptionContextType {
    plan: Plan;
    expiryDate: string | null;
    autoRenewal: boolean;
    isLoading: boolean;
    upgradeToPro: (method?: string) => Promise<void>;
    cancelSubscription: () => Promise<void>;
    refreshStatus: () => Promise<void>;
    transactions: any[];
    syncStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [plan, setPlan] = useState<Plan>('free');
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
        fetchHistory();
    }, []);

    const syncStatus = async () => {
        setIsLoading(true);
        await Promise.all([refreshStatus(), fetchHistory()]);
        setIsLoading(false);
    };

    const upgradeToPro = async (method?: string) => {
        setIsLoading(true);
        try {
            // Kita kirim pilihan metode di body request
            const res = await fetch('/api/subscription/upgrade', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method }) // 'BT', 'SP', 'OV', dll
            });
            
            if (!res.ok) throw new Error('Gagal melakukan upgrade');
            
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
            expiryDate,
            autoRenewal,
            isLoading,
            upgradeToPro, 
            cancelSubscription,
            refreshStatus,
            transactions,
            syncStatus
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
