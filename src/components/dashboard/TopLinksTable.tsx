import React from 'react';
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

export const TopLinksTable: React.FC<{ links?: LinkPerformance[] }> = ({ links = DEFAULT_LINKS }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h4 className="text-lg font-bold text-slate-900">Top Performing Links</h4>
        <button className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Link Slug</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Clicks</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Conversion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {links.map((link, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{link.slug}</span>
                    <span className="text-xs text-slate-500 truncate max-w-[200px]">{link.url}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-bold text-slate-900">{link.clicks.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-md">{link.conversion}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopLinksTable;
