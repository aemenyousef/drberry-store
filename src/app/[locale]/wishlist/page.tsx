'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useStore } from '@/contexts/StoreContext';
import { DR_BERRY_PRODUCTS } from '@/data/products';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { wishlist, addToCart } = useStore();

  const wishlistedProducts = DR_BERRY_PRODUCTS.filter((p) => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    wishlistedProducts.forEach((p) => addToCart(p));
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-accent bg-secondary/15 px-4 py-1.5 rounded-full inline-block">
            {isRTL ? 'مختاراتك الخاصة' : 'Your Personal Favorites'}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-primary font-sans flex items-center justify-center gap-3">
            <span>{isRTL ? 'قائمة المفضلة' : 'My Wishlist'}</span>
            <span className="text-rose-500 text-3xl">❤️</span>
          </h1>
          <p className="text-sm md:text-base text-foreground/70 max-w-lg mx-auto">
            {isRTL
              ? 'المنتجات التي حفظتها للإطلاع عليها والشراء لاحقاً في أي وقت.'
              : 'Products you have saved to view or purchase whenever you are ready.'}
          </p>
        </div>

        {wishlistedProducts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm border border-cream space-y-6">
            <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-400 mx-auto flex items-center justify-center text-4xl">
              🤍
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-primary">
                {isRTL ? 'قائمة المفضلة فارغة حالياً' : 'Your Wishlist is Empty'}
              </h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                {isRTL
                  ? 'لم تقم بحفظ أي منتج حتى الآن. تصفح مجموعتنا الطبية الفاخرة واضغط على علامة القلب على أي منتج يعجبك.'
                  : 'You have not saved any items yet. Browse our medical cosmetic collection and tap the heart icon on any product.'}
              </p>
            </div>
            <Link
              href="/products"
              className="inline-block px-8 py-3.5 bg-primary text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5 text-sm"
            >
              {isRTL ? 'استكشف المنتجات الآن' : 'Browse Products'}
            </Link>
          </div>
        ) : (
          /* Populated Wishlist */
          <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 md:px-8 rounded-2xl border border-cream">
              <span className="font-bold text-sm text-foreground/70">
                {isRTL ? 'المنتجات المحفوظة:' : 'Saved Items:'}{' '}
                <span className="text-primary font-black text-base">{wishlistedProducts.length}</span>
              </span>

              <button
                onClick={handleAddAllToCart}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>🛒</span>
                <span>{isRTL ? 'إضافة جميع المنتجات إلى السلة' : 'Add All to Cart'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlistedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}