'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from './ProductCard';
import { DR_BERRY_PRODUCTS, Product } from '@/data/products';

export default function ProductGrid() {
  const tCatalog = useTranslations('Catalog');
  const tTrust = useTranslations('TrustBadges');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { slug: 'all', label: tCatalog('allProducts') },
    { slug: 'hair', label: tCatalog('hairCare') },
    { slug: 'body', label: tCatalog('bodyCare') },
    { slug: 'skin', label: tCatalog('skinCare') },
    { slug: 'whitening', label: tCatalog('whiteningCare') },
  ];

  // Filter products by selected category
  const filteredProducts = DR_BERRY_PRODUCTS.filter((product) => {
    if (selectedCategory === 'all') return true;
    return product.categorySlug === selectedCategory;
  });

  return (
    <div className="space-y-12">
      {/* Categories Filter Tabs */}
      <div className="flex flex-wrap justify-center items-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              selectedCategory === cat.slug
                ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                : 'bg-white text-foreground/70 border border-cream hover:border-primary/40 hover:text-primary hover:bg-cream/20'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Count Header */}
      <div className="flex justify-between items-center px-2 text-sm text-foreground/60 border-b border-cream/50 pb-3">
        <span className="font-bold">
          {tCatalog('showing')}{' '}
          <span className="text-primary font-black">{filteredProducts.length}</span>{' '}
          {tCatalog('itemsOf')}
        </span>
        <span className="text-xs text-accent font-bold bg-accent/10 px-3 py-1 rounded-full">
          {tCatalog('certifiedBadge')}
        </span>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Store Trust Badges */}
      <div className="pt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 border-t border-cream/80 mt-16">
        <div className="bg-white/80 p-6 rounded-2xl border border-cream/60 text-center space-y-2 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-secondary/20 text-primary mx-auto flex items-center justify-center text-xl font-bold">
            🛡️
          </div>
          <h4 className="font-bold text-foreground">{tTrust('badge1Title')}</h4>
          <p className="text-xs text-foreground/60">{tTrust('badge1Desc')}</p>
        </div>

        <div className="bg-white/80 p-6 rounded-2xl border border-cream/60 text-center space-y-2 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-secondary/20 text-primary mx-auto flex items-center justify-center text-xl font-bold">
            ⚡
          </div>
          <h4 className="font-bold text-foreground">{tTrust('badge2Title')}</h4>
          <p className="text-xs text-foreground/60">{tTrust('badge2Desc')}</p>
        </div>

        <div className="bg-white/80 p-6 rounded-2xl border border-cream/60 text-center space-y-2 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-secondary/20 text-primary mx-auto flex items-center justify-center text-xl font-bold">
            🌿
          </div>
          <h4 className="font-bold text-foreground">{tTrust('badge3Title')}</h4>
          <p className="text-xs text-foreground/60">{tTrust('badge3Desc')}</p>
        </div>

        <div className="bg-white/80 p-6 rounded-2xl border border-cream/60 text-center space-y-2 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-secondary/20 text-primary mx-auto flex items-center justify-center text-xl font-bold">
            💬
          </div>
          <h4 className="font-bold text-foreground">{tTrust('badge4Title')}</h4>
          <p className="text-xs text-foreground/60">{tTrust('badge4Desc')}</p>
        </div>
      </div>
    </div>
  );
}
