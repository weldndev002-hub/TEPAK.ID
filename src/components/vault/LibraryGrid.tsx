import React from 'react';
import { cn } from '../../lib/utils';

interface PurchasedItem {
    id: string;
    title: string;
    image: string;
    type: 'ebook' | 'video' | 'course';
    progress?: number;
}

export const LibraryGrid: React.FC = () => {
    const purchasedItems: PurchasedItem[] = [
        { 
            id: 'ebook-01', 
            title: 'The Creator Blueprint (E-Book)', 
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjjyluzSxIJ5m-78CwTFr1titoEU8JGT-PqmwcEF-21PHJ6cqH04cc3__Q37EJcF_rDYTOGM8loDPhEI5dF3mUKBzumESfBpcChiPS50-YTG33SduZrSvcaCOUwzjQkC3G808320Q3u9LUzcgQCziaSC6it3Uyi5Gw24ZA67TP36T3gJasAxoblawtCJnAOAdNfh5PFa2P9gPHYimVHxiuuN-MNrEX86JMagD4hQ-at05QqRa29rEoSu8qcRVDTEpxUqdQOt4V6G-x',
            type: 'ebook'
        },
        { 
            id: 'course-01', 
            title: 'Cinematic Urban Presets & Masterclass', 
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAr07NKIXEP2HaT46rcrRfslmZae_DeX5iXM36noVPM6sa3cSqe7EOf6qXgBXY7SUatW22NE0QJZn97uJ0CVU4rP-bxhKGm9nOfCwt_VqEDRCX93WcxM6TEYfmMQwlHocS6MUk-88gjjKUm96CjXjG9_70H2LAvwYtq47kCg2ahlBeH67N81JDi2M96RqXBwX0yoF4j7uaQgOhJf2naT9YT-m5fW7BH01YotLgDs8Wt3BDEXouZB3DHQpjJEZrOi8oxSD7OvlkcJKNh',
            type: 'video',
            progress: 45
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {purchasedItems.map((item) => (
                <div key={item.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col">
                    <div className="aspect-[4/3] overflow-hidden relative">
                        <img 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            src={item.image} 
                            alt={item.title}
                        />
                        <div className="absolute top-4 left-4">
                            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-primary uppercase tracking-widest shadow-sm">
                                {item.type}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 flex-grow flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-4 tracking-tight">
                            {item.title}
                        </h3>

                        {item.progress !== undefined && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progres Belajar</span>
                                    <span className="text-[10px] font-black text-primary">{item.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${item.progress}%` }} />
                                </div>
                            </div>
                        )}

                        <div className="mt-auto">
                            <a href={`/vault/${item.id}`} className="block w-full text-center py-4 bg-[#F1F5F9] text-slate-900 hover:bg-primary hover:text-white transition-all rounded-2xl font-bold text-sm">
                                Buka Produk
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LibraryGrid;
