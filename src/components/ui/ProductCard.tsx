import React from 'react';
import { cn } from '../../lib/utils';
import Button from './Button';

interface ProductCardProps {
    image: string;
    title: string;
    price: string;
    description: string;
    className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
    image, title, price, description, className 
}) => {
    return (
        <div className={cn(
            "group bg-white rounded-[2rem] overflow-hidden transition-all duration-500 border border-slate-100/50 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-2",
            className
        )}>
            {/* PRODUCT IMAGE */}
            <div className="aspect-[16/10] overflow-hidden relative">
                <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    src={image} 
                    alt={title}
                />
                <div className="absolute top-4 right-4 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{price}</span>
                </div>
            </div>

            {/* PRODUCT INFO */}
            <div className="p-8">
                <header className="mb-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Premium Aset</span>
                    <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                </header>
                
                <p className="text-slate-500 text-sm mb-8 line-clamp-2 font-medium leading-relaxed tracking-tight">
                    {description}
                </p>

                <a href="/checkout">
                    <Button variant="amber" size="lg" className="w-full shadow-none py-4 text-xs font-black uppercase tracking-widest">
                        <span>Beli Sekarang</span>
                        <span className="material-symbols-outlined text-lg">shopping_cart</span>
                    </Button>
                </a>
            </div>
        </div>
    );
};

export default ProductCard;
