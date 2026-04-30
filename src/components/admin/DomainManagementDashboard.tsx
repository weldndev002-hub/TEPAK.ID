import React, { useState, useEffect } from 'react';
import { 
  GlobeAltIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface DomainRecord {
  id: string;
  email: string;
  username: string;
  custom_domain: string;
  custom_domain_status: 'pending' | 'active' | 'failed' | null;
}

export const DomainManagementDashboard: React.FC = () => {
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/admin/domains');
      const data = await res.json();
      if (Array.isArray(data)) setDomains(data);
    } catch (err) {
      console.error('Failed to fetch domains', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleUpdateStatus = async (userId: string, status: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status })
      });
      if (res.ok) {
        fetchDomains();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDomains = domains.filter(d => 
    d.custom_domain?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase()) ||
    d.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Manual Domain Activation</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Review and activate custom domains requested by Pro users.</p>
        </div>
        
        <div className="relative group">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Search domain, email, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl w-full md:w-80 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-sm"
          />
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Domain & User</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading requests...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDomains.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    No domain requests found
                  </td>
                </tr>
              ) : filteredDomains.map((domain) => (
                <tr key={domain.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner">
                        <GlobeAltIcon className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900 tracking-tight lowercase">{domain.custom_domain}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase">@{domain.username}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">UID: {domain.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    {domain.custom_domain_status === 'active' ? (
                      <Badge variant="success" className="px-4 py-2 font-black text-[10px] bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-2 w-fit">
                        <CheckBadgeIcon className="w-4 h-4" />
                        ACTIVE
                      </Badge>
                    ) : domain.custom_domain_status === 'pending' ? (
                      <Badge className="px-4 py-2 font-black text-[10px] bg-amber-50 text-amber-600 border-amber-100 flex items-center gap-2 w-fit">
                        <ClockIcon className="w-4 h-4" />
                        PENDING VERIFICATION
                      </Badge>
                    ) : (
                      <Badge className="px-4 py-2 font-black text-[10px] bg-slate-100 text-slate-500 border-slate-200 flex items-center gap-2 w-fit">
                        <XCircleIcon className="w-4 h-4" />
                        FAILED/INACTIVE
                      </Badge>
                    )}
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 transition-opacity">
                      {domain.custom_domain_status !== 'active' && (
                        <Button 
                          onClick={() => handleUpdateStatus(domain.id, 'active')}
                          disabled={actionLoading === domain.id}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 flex items-center gap-2"
                        >
                          {actionLoading === domain.id ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                          Activate
                        </Button>
                      )}
                      {domain.custom_domain_status !== 'pending' && (
                        <Button 
                          onClick={() => handleUpdateStatus(domain.id, 'pending')}
                          disabled={actionLoading === domain.id}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                          Set to Pending
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
