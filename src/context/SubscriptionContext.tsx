import React, { createContext, useContext, useState, useEffect } from 'react';

type Plan = 'STANDARD' | 'PRO';
type Status = 'SUCCESS' | 'PENDING' | 'CANCELED';

interface Transaction {
    id: string;
    plan: Plan;
    amount: string;
    date: string;
    status: Status;
}

interface SubscriptionContextType {
    plan: Plan;
    expiryDate: string;
    autoRenewal: boolean;
    transactions: Transaction[];
    upgradeToPro: () => void;
    cancelSubscription: () => Promise<void>;
    addTransaction: (id: string, plan: Plan, amount: string, status: Status) => void;
    updateTransactionStatus: (id: string, status: Status) => void;
    syncStatus: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [plan, setPlan] = useState<Plan>('STANDARD');
    const [autoRenewal, setAutoRenewal] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const savedPlan = localStorage.getItem('user_plan') as Plan;
        const savedAutoRenew = localStorage.getItem('auto_renewal');
        const savedTx = localStorage.getItem('billing_history');
        if (savedPlan) setPlan(savedPlan);
        if (savedAutoRenew) setAutoRenewal(savedAutoRenew === 'true');
        if (savedTx) setTransactions(JSON.parse(savedTx));
    }, []);

    useEffect(() => {
        localStorage.setItem('user_plan', plan);
        localStorage.setItem('auto_renewal', String(autoRenewal));
        localStorage.setItem('billing_history', JSON.stringify(transactions));
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('plan-updated', { detail: plan }));
    }, [plan, transactions]);

    const upgradeToPro = () => {
        setPlan('PRO');
        setAutoRenewal(true);
    };

    const cancelSubscription = async () => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAutoRenewal(false);
    };

    const addTransaction = (id: string, plan: Plan, amount: string, status: Status) => {
        const newTx: Transaction = { id, plan, amount, date: new Date().toLocaleString(), status };
        setTransactions(prev => [newTx, ...prev]);
    };

    const updateTransactionStatus = (id: string, status: Status) => {
        setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status } : tx));
        if (status === 'SUCCESS') setPlan('PRO');
    };

    const syncStatus = () => {
        // Simulate cron job: find first pending and resolve it
        const pending = transactions.find(tx => tx.status === 'PENDING');
        if (pending) {
            updateTransactionStatus(pending.id, 'SUCCESS');
        }
    };

    return (
        <SubscriptionContext.Provider value={{ 
            plan, 
            expiryDate: '24 November 2024',
            autoRenewal,
            transactions, 
            upgradeToPro, 
            cancelSubscription,
            addTransaction, 
            updateTransactionStatus, 
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
