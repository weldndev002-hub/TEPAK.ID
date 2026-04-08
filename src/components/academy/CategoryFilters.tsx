import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

const CATEGORIES = [
  'All',
  'Link-in-Bio',
  'Digital Products',
  'Events',
  'Domain',
  'SEO',
  'Payout',
  'Analytics'
];

export const CategoryFilters: React.FC = () => {
  const [active, setActive] = useState('All');

  return (
    <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
      {CATEGORIES.map((cat) => (
        <Button
          key={cat}
          onClick={() => setActive(cat)}
          variant={active === cat ? 'primary' : 'ghost'}
          className={cn(
            "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap h-auto",
            active === cat
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-95"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          {cat}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilters;
