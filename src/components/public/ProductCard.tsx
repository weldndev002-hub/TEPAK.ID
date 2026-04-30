import React from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

export interface ProductCardProps {
  id?: string;
  title: string;
  description: string;
  price: string;
  imageSrc: string;
  badge?: string;
  ctaText?: string;
  onBuy?: () => void | Promise<void>;
  onProductClick?: () => void | Promise<void>;
  viewsCount?: number;
  className?: string;
}

const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

export const ProductCard: React.FC<ProductCardProps> = ({ 
  id,
  title, 
  description, 
  price, 
  imageSrc, 
  badge, 
  ctaText = "Beli Sekarang", 
  onBuy,
  onProductClick,
  viewsCount = 0,
  className 
}) => {
  const handleBuyClick = async () => {
    // Track click
    if (onProductClick) {
      await onProductClick();
    }
    // Call original handler
    if (onBuy) {
      await onBuy();
    }
  };

  return (
    <div className={cn("w-full max-w-xs bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden group flex flex-col", className)}>
      
      {/* Product Image Cover */}
      <div className="relative h-48 overflow-hidden shrink-0 bg-slate-100">
        <img 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            src={imageSrc} 
            alt={title} 
        />
        {badge && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-black uppercase text-primary shadow-sm">
                {badge}
            </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-slate-900 leading-tight">{title}</h3>
        <p className="text-slate-500 text-sm mt-2 line-clamp-2 flex-1">{description}</p>
        
        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <EyeIcon />
                <span className="text-[10px] font-bold uppercase tracking-widest">{viewsCount} dilihat</span>
            </div>
            <span className="text-xl font-black text-slate-900">{price}</span>
          </div>
          
          <Button 
            onClick={handleBuyClick}
            variant="primary" 
            className="px-6 py-2.5 h-auto rounded-xl shadow-lg shadow-primary/20 font-bold"
          >
            {ctaText}
          </Button>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
