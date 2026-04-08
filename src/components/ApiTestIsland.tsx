import React, { useState, useEffect } from 'react';

const ApiTestIsland: React.FC = () => {
    const [data, setData] = useState<{ message: string; timestamp: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchHello = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/hello');
            if (!res.ok) throw new Error('API Error');
            const result = await res.json();
            setData(result);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHello();
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hono API Data:</span>
                <button 
                    onClick={fetchHello}
                    disabled={loading}
                    className="p-2 text-xs transition-all border rounded-md hover:bg-neutral-800 disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {loading ? (
                <div className="w-full h-8 rounded-md bg-neutral-800/50 animate-pulse" />
            ) : error ? (
                <div className="p-2 text-xs text-red-400 bg-red-950/20 border border-red-900/50 rounded-md">
                    Error: {error}
                </div>
            ) : (
                <div className="p-3 font-mono text-xs rounded-md bg-neutral-950/50 border border-white/5">
                    <p className="text-neutral-300">"message": "{data?.message}"</p>
                    <p className="text-neutral-500 text-[10px] mt-1">{data?.timestamp}</p>
                </div>
            )}
        </div>
    );
};

export default ApiTestIsland;
