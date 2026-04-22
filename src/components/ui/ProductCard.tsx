import React from 'react';
import { cn } from '../../lib/utils';
import Button from './Button';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
    id: string;
    image: string;
    title: string;
    price: string;
    description: string;
    className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
    id, image, title, price, description, className 
}) => {
    return (
        <div className={cn(
            "group bg-white rounded-[2.5rem] overflow-hidden transition-all duration-700 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.12)] hover:-translate-y-3 relative flex flex-col h-full",
            className
        )}>
            {/* PRICE BADGE (TOP FLOATING) */}
            <div className="absolute top-6 right-6 z-10 px-5 py-2 bg-white/40 backdrop-blur-xl rounded-full border border-white/20 shadow-xl shadow-black/5 animate-in fade-in zoom-in duration-1000">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{price}</span>
            </div>

            {/* PRODUCT IMAGE CONTAINER */}
            <div className="aspect-[4/3] overflow-hidden relative bg-slate-50">
                <img 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    src={image} 
                    alt={title}
                />
                {/* DARK OVERLAY ON HOVER */}
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-700"></div>
            </div>

            {/* PRODUCT INFO */}
            <div className="p-10 flex flex-col flex-1">
                <header className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-8 h-[2px] bg-primary/40"></span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Premium Collection</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight group-hover:text-primary transition-all duration-500">
                        {title}
                    </h3>
                </header>
                
                <p className="text-slate-500 text-sm mb-12 line-clamp-3 font-medium leading-relaxed tracking-tight opacity-80 flex-1">
                    {description}
                </p>

                <div className="mt-auto pt-8 border-t border-slate-50">
                    <a href={`/checkout?product_id=${id}`} className="block w-full">
                        <Button variant="primary" size="lg" className="w-full py-5 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] group/btn transition-all duration-500">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] ml-2">Dapatkan Sekarang</span>
                            <ShoppingCartIcon className="w-5 h-5 opacity-70 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
                        </Button>
                    </a>
                </div>
            </div>

            {/* DECORATIVE ELEMENT */}
            <div className="absolute -bottom-1 -left-1 w-24 h-24 bg-primary/5 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        </div>
    );
};

export default ProductCard;

