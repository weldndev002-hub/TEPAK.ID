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

  // Extract domain from description or use a default if it looks like a link
  const displayDomain = description?.toLowerCase().includes('shopee') ? 'shopee.co.id' : 
                        description?.toLowerCase().includes('tokopedia') ? 'tokopedia.com' : 'tepak.id';

  return (
    <div className={cn("w-full max-w-sm bg-[#16302B] rounded-[2rem] overflow-hidden shadow-2xl group flex flex-col border border-white/5", className)}>
      
      {/* Product Image Cover */}
      <div className="relative aspect-square overflow-hidden shrink-0 bg-slate-100">
        <img 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            src={imageSrc} 
            alt={title} 
        />
        {badge && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-primary shadow-lg">
                {badge}
            </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-bold text-xl text-white leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">
            {title}
        </h3>
        <p className="text-white/60 text-sm mt-3 line-clamp-3 leading-relaxed font-medium">
            {description}
        </p>
        
        <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mb-1">{displayDomain}</span>
                    <span className="text-2xl font-black text-white">{price}</span>
                </div>
                
                <Button 
                    onClick={handleBuyClick}
                    variant="primary" 
                    className="px-8 py-3 h-auto rounded-2xl shadow-xl shadow-primary/20 font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all"
                >
                    {ctaText}
                </Button>
            </div>
            
            <div className="flex items-center gap-1.5 text-white/20 pt-4 border-t border-white/5">
                <EyeIcon />
                <span className="text-[9px] font-bold uppercase tracking-widest">{viewsCount} views</span>
            </div>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
