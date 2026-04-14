import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface LinkPerformance {
  slug: string;
  url: string;
  clicks: number;
  conversion: string;
}

const DEFAULT_LINKS: LinkPerformance[] = [
  { slug: '/black-friday-sale', url: 'tepak.id/ateliershop/bf24', clicks: 12402, conversion: '8.2%' },
  { slug: '/new-course-launch', url: 'tepak.id/academy/ui-mastery', clicks: 8912, conversion: '12.5%' },
  { slug: '/newsletter-signup', url: 'tepak.id/join/creator-pulse', clicks: 4120, conversion: '31.2%' }
];

export const TopLinksTable: React.FC<{ links?: LinkPerformance[] }> = ({ links: propLinks }) => {
  const [links, setLinks] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/analytics/dashboard?range=30d');
        if (res.ok) {
          const result = await res.json();
          setLinks(result.top_links || []);
        }
      } catch (err) {
        console.error('Top Links Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayLinks = propLinks || links;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm h-full">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h4 className="text-lg font-bold text-slate-900">Top Performing Links</h4>
        <div className="px-2 py-1 bg-slate-50 rounded text-[9px] font-black text-slate-400 uppercase tracking-widest">30 Days</div>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
            <div className="p-12 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest animate-pulse">Loading Links...</div>
        ) : (
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Link Path</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Views</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Clicks</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">CTR</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {displayLinks.map((link, idx) => {
                    const ctr = link.views > 0 ? ((link.clicks / link.views) * 100).toFixed(1) + '%' : '0%';
                    return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                            <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{link.path}</span>
                            </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                            <span className="text-xs font-bold text-slate-400">{(link.views || 0).toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                            <span className="text-sm font-black text-slate-900">{(link.clicks || 0).toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                            <span className="text-[10px] font-black px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">{ctr}</span>
                            </td>
                        </tr>
                    );
                })}
                {displayLinks.length === 0 && (
                    <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-300 font-bold text-xs">No link data recorded yet</td>
                    </tr>
                )}
            </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default TopLinksTable;
