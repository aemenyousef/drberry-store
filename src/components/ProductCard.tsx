'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Product,
  getProductTitle,
  getProductCategory,
  getProductDescription,
  getProductBenefits,
  getProductVolume,
  getProductBadge,
} from '@/data/products';
import { useStore } from '@/contexts/StoreContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations('ProductCard');
  const tDetail = useTranslations('ProductDetail');
  const { formatPrice, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [isAdded, setIsAdded] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const title = getProductTitle(product, locale);
  const category = getProductCategory(product, locale);
  const description = getProductDescription(product, locale);
  const volume = getProductVolume(product, locale);
  const badge = getProductBadge(product, locale);
  const benefits = getProductBenefits(product, locale);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <>
      <div className="group bg-white rounded-3xl shadow-sm border border-cream/80 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col justify-between hover:-translate-y-1.5 relative">
        {/* Top Badges & Image */}
        <div className="relative w-full h-80 bg-gradient-to-b from-secondary/10 to-transparent flex items-center justify-center overflow-hidden p-6">
          <Link href={`/products/${product.id}`} className="relative w-full h-full block">
            <Image
              src={product.image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain p-4 group-hover:scale-108 transition-transform duration-700 ease-out"
            />
          </Link>

          {/* Badge */}
          {badge && (
            <div className="absolute top-4 right-4 bg-primary/95 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black shadow-md z-10 tracking-wide pointer-events-none">
              {badge}
            </div>
          )}

          {/* Volume */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-foreground/70 px-3 py-1 rounded-full text-xs font-bold border border-cream shadow-sm z-10 pointer-events-none">
            {volume}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            aria-label="Wishlist"
            className={`absolute top-4 left-4 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-sm z-20 ${
              isWishlisted
                ? 'bg-rose-500 text-white scale-110 shadow-rose-200'
                : 'bg-white/85 text-foreground/50 hover:text-rose-500 hover:bg-white'
            }`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>

          {/* Quick View Floating Button */}
          <button
            onClick={() => setShowQuickView(true)}
            className="absolute bottom-4 left-4 bg-white/95 text-primary text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white flex items-center gap-1.5 z-10"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{t('quickView')}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1 justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-accent bg-secondary/15 px-2.5 py-0.5 rounded-md">
                {category}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <span>★</span>
                <span>{product.rating}</span>
                <span className="text-foreground/40 text-[10px]">({product.reviewsCount})</span>
              </div>
            </div>

            <Link href={`/products/${product.id}`} className="block group-hover:text-primary transition-colors">
              <h3 className="font-bold text-lg text-foreground line-clamp-1">
                {title}
              </h3>
            </Link>

            <p className="text-xs text-foreground/65 line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Pricing & Add to Cart */}
          <div className="pt-4 border-t border-cream/70 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-foreground/50 block font-bold">{t('priceLabel')}</span>
              <span className="text-xl font-black text-primary tracking-tight">
                {formatPrice(product.prices)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shadow-md ${
                isAdded
                  ? 'bg-emerald-600 text-white scale-105'
                  : 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg shadow-primary/20'
              }`}
            >
              {isAdded ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t('added')}</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>{t('addToCart')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-8 overflow-hidden shadow-2xl relative border border-cream animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setShowQuickView(false)}
              className="absolute top-6 left-6 text-foreground/40 hover:text-foreground text-2xl font-bold w-10 h-10 rounded-full bg-cream/40 flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Image */}
              <div className="relative w-full h-72 bg-secondary/10 rounded-2xl overflow-hidden flex items-center justify-center">
                <Image
                  src={product.image}
                  alt={title}
                  fill
                  className="object-contain p-4"
                />
              </div>

              {/* Info */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-accent px-3 py-1 rounded-full bg-secondary/20">
                  {category}
                </span>
                <h3 className="text-2xl font-black text-primary leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-foreground/50 font-medium">
                  {locale === 'ar' ? product.titleEn : product.titleAr}
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {description}
                </p>

                {/* Benefits */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground/70">{tDetail('tabBenefits')}:</h4>
                  <ul className="space-y-1.5">
                    {benefits.map((b, idx) => (
                      <li key={idx} className="text-xs text-foreground/80 flex items-start gap-2">
                        <span className="text-accent font-black">✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-cream flex items-center justify-between">
                  <div>
                    <span className="text-xs text-foreground/50">{tDetail('volumeLabel')} {volume}</span>
                    <p className="text-2xl font-black text-primary">
                      {formatPrice(product.prices)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleAddToCart();
                      setTimeout(() => setShowQuickView(false), 800);
                    }}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md text-sm"
                  >
                    {t('addToCart')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
