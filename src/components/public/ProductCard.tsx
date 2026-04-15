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
  onBuy?: () => void;
  onProductClick?: () => void;
  className?: string;
}

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
  className 
}) => {
  const handleBuyClick = () => {
    // Track click
    if (onProductClick) {
      onProductClick();
    }
    // Call original handler
    if (onBuy) {
      onBuy();
    }
  };

  return (
    <div className={cn("w-full max-w-xs bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden group flex flex-col", className)}>
      
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
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Harga</span>
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
