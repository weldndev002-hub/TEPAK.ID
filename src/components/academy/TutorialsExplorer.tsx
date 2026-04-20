import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { TutorialCard, type TutorialCardProps } from './TutorialCard';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { 
    MagnifyingGlassIcon, 
    VideoCameraIcon,
    ExclamationCircleIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import { Select } from '../ui/Select';

const CATEGORIES = [
    'All',
    'Onboarding',
    'Marketing',
    'Monetization',
    'Advanced Tools'
];

export const TutorialsExplorer = () => {
    const [tutorials, setTutorials] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        fetchTutorials();
    }, []);

    const fetchTutorials = async () => {
        try {
            const res = await fetch('/api/tutorials');
            if (res.ok) {
                const data = await res.json();
                setTutorials(data);
            }
        } catch (error) {
            console.error('Error fetching tutorials:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTutorials = useMemo(() => {
        return tutorials.filter(t => {
            const title = t.title || '';
            const category = t.category || 'General';
            
            const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 category.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCategory = activeCategory === 'All' || 
                                   category.toLowerCase().trim() === activeCategory.toLowerCase().trim();
            
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, activeCategory, tutorials]);

    const [visibleCount, setVisibleCount] = useState(6);

    const tutorialsToDisplay = useMemo(() => {
        return filteredTutorials.slice(0, visibleCount);
    }, [filteredTutorials, visibleCount]);

    const hasMore = filteredTutorials.length > visibleCount;

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-slate-50 h-80 rounded-[2rem]"></div>
                ))}
            </div>
        );
    }

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

                {/* Categories Dropdown */}
                <div className="w-full lg:max-w-[200px]">
                    <Select 
                        value={activeCategory}
                        onChange={(e) => { setActiveCategory(e.target.value); setVisibleCount(6); }}
                        className="h-14 font-black shadow-sm"
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* RESULTS COUNTER */}
            <div className="flex items-center justify-center lg:justify-start gap-3 px-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Showing {tutorialsToDisplay.length} of {filteredTutorials.length} Tutorials
                    {searchTerm && <span className="text-primary ml-2 uppercase">Matching "{searchTerm}"</span>}
                </p>
            </div>

            {/* TUTORIAL GRID */}
            {filteredTutorials.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                        {tutorialsToDisplay.map((tutorial) => (
                            <TutorialCard 
                                key={tutorial.id} 
                                title={tutorial.title}
                                thumbnail={tutorial.thumbnail_url}
                                duration={tutorial.duration}
                                category={tutorial.category || 'General'}
                                views={tutorial.views?.toString() || '0'}
                                publishedAt={new Date(tutorial.created_at).toLocaleDateString()}
                                platform={tutorial.platform}
                            />
                        ))}
                    </div>

                    {/* LOAD MORE BUTTON (CONDITIONAL) */}
                    {hasMore && (
                        <div className="mt-12 flex flex-col items-center gap-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Button 
                                onClick={() => setVisibleCount(prev => prev + 6)}
                                variant="primary" 
                                className="w-full sm:w-auto px-12 py-5 bg-primary rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-95 uppercase tracking-[0.2em] text-[10px]"
                            >
                                Muat Lebih Banyak
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            </Button>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] opacity-60">
                                {filteredTutorials.length - visibleCount} Materi lainnya tersedia
                            </p>
                        </div>
                    )}
                </>
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
                        onClick={() => { setSearchTerm(''); setActiveCategory('All'); setVisibleCount(6); }}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                    >
                        Reset Pencarian
                    </Button>
                </div>
            )}
        </div>
    );
};
