import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { TutorialCard, type TutorialCardProps } from './TutorialCard';
import { Input } from '../ui/Input';
import Button from '../ui/Button';
import { 
    MagnifyingGlassIcon, 
    VideoCameraIcon,
    ExclamationCircleIcon 
} from '@heroicons/react/24/outline';

interface TutorialsExplorerProps {
    tutorials: TutorialCardProps[];
}

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

export const TutorialsExplorer: React.FC<TutorialsExplorerProps> = ({ tutorials }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredTutorials = useMemo(() => {
        return tutorials.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 t.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, activeCategory, tutorials]);

    return (
        <div className="space-y-10 ">
            
            {/* SEARCH & FILTERS CONTROLS */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Search Bar */}
                <div className="w-full lg:max-w-md">
                    <Input 
                        placeholder="Search tutorials by title, feature, or category..." 
                        className="h-14 bg-white border-slate-100 shadow-sm rounded-2xl text-[13px] font-medium placeholder:text-slate-400 group focus-within:ring-4 focus-within:ring-primary/10 transition-all px-6"
                        iconLeft={MagnifyingGlassIcon}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Categories Scrollable */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                    {CATEGORIES.map((cat) => (
                        <Button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            variant={activeCategory === cat ? 'primary' : 'ghost'}
                            className={cn(
                                "px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap h-auto border",
                                activeCategory === cat
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-95"
                                    : "bg-white text-slate-500 border-slate-100 hover:border-primary/20 hover:text-primary"
                            )}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {/* RESULTS COUNTER */}
            <div className="flex items-center gap-3 px-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Showing {filteredTutorials.length} Tutorials
                    {searchTerm && <span className="text-primary ml-2">Matching "{searchTerm}"</span>}
                </p>
            </div>

            {/* TUTORIAL GRID */}
            {filteredTutorials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                    {filteredTutorials.map((tutorial, idx) => (
                        <TutorialCard key={idx} {...tutorial} />
                    ))}
                </div>
            ) : (
                /* EMPTY STATE */
                <div className="py-32 flex flex-col items-center text-center space-y-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm text-slate-300">
                        <VideoCameraIcon className="w-10 h-10" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Tutorial tidak ditemukan</h4>
                        <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                            Kami tidak dapat menemukan video yang sesuai dengan kata kunci ini. Coba gunakan istilah lain atau bersihkan filter.
                        </p>
                    </div>
                    <Button 
                        variant="primary" 
                        onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                    >
                        Reset Pencarian
                    </Button>
                </div>
            )}
        </div>
    );
};
