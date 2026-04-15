import React from 'react';
import ProductCard from './ProductCard';

interface ProductWithTrackingProps {
  id: string;
  image: string;
  title: string;
  price: string;
  description: string;
  merchantId: string;
}

export const ProductCardWithTracking: React.FC<ProductWithTrackingProps> = ({
  id,
  image,
  title,
  price,
  description,
  merchantId
}) => {
  const handleProductClick = async () => {
    try {
      // Track click event
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          product_id: id,
          event_type: 'click',
          path: window.location.pathname,
          browser: 'Unknown',
          os: 'Unknown',
          device_type: 'Desktop'
        })
      });
      console.log('[Analytics] Click tracked for product:', id);
    } catch (err) {
      console.error('[Analytics] Click tracking failed:', err);
    }
  };

  const handleBuy = () => {
    // Navigate to checkout (akan dihandle oleh parent atau direct navigation)
    window.location.href = `/checkout?product_id=${id}`;
  };

  return (
    <ProductCard
      id={id}
      title={title}
      price={price}
      description={description}
      imageSrc={image}
      onProductClick={handleProductClick}
      onBuy={handleBuy}
    />
  );
};

export default ProductCardWithTracking;
