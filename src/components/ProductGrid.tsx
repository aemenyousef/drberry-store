'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from './ProductCard';
import { DR_BERRY_PRODUCTS, Product } from '@/data/products';

export default function ProductGrid() {
  const tCatalog = useTranslations('Catalog');
  const tTrust = useTranslations('TrustBadges');

  const [productsList, setProductsList] = useState<Product[]>(DR_BERRY_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'priceAsc' | 'priceDesc'>('featured');

  // مزامنة الأسعار والمخزون في الخلفية مع Supabase إن وُجد
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProductsList(data.products);
        }
      })
      .catch(() => {});
  }, []);

  const categories = [
    { slug: 'all', label: tCatalog('allProducts') },
    { slug: 'hair', label: tCatalog('hairCare') },
    { slug: 'body', label: tCatalog('bodyCare') },
    { slug: 'skin', label: tCatalog('skinCare') },
    { slug: 'whitening', label: tCatalog('whiteningCare') },
  ];

  // Filtering & Search
  let filteredProducts = productsList.filter((product) => {
    const matchCategory = selectedCategory === 'all' || product.categorySlug === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      product.titleAr.toLowerCase().includes(q) ||
      product.titleEn.toLowerCase().includes(q) ||
      product.descriptionAr.toLowerCase().includes(q) ||
      product.descriptionEn.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  // Sorting
  filteredProducts.sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'priceAsc') return a.prices.YER - b.prices.YER;
    if (sortBy === 'priceDesc') return b.prices.YER - a.prices.YER;
    return 0;
  });

  return (
    <div className="space-y-10">
      {/* Search and Sort Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-cream shadow-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder={tCatalog('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pe-10 rounded-2xl border border-cream/80 bg-background/50 focus:bg-white focus:border-primary outline-none text-xs font-semibold transition-colors"
          />
          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-foreground/40 text-sm pointer-events-none">
            🔍
          </span>
        </div>

        {/* Categories Filter Tabs */}
        <div className="flex flex-wrap justify-center items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedCategory === cat.slug
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-102'
                  : 'bg-cream/30 text-foreground/70 hover:bg-cream/60 hover:text-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-foreground/50 font-bold whitespace-nowrap">{tCatalog('sortBy')}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-cream bg-white text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="featured">{tCatalog('sortFeatured')}</option>
            <option value="rating">{tCatalog('sortRating')}</option>
            <option value="priceAsc">{tCatalog('sortPriceAsc')}</option>
            <option value="priceDesc">{tCatalog('sortPriceDesc')}</option>
          </select>
        </div>
      </div>

      {/* Product Count Header */}
      <div className="flex justify-between items-center px-2 text-xs text-foreground/60 border-b border-cream/50 pb-3 font-bold">
        <span>
          {tCatalog('showing')}{' '}
          <span className="text-primary font-black text-sm">{filteredProducts.length}</span>{' '}
          {tCatalog('itemsOf')}
        </span>
        <span className="text-[11px] text-accent bg-secondary/15 px-3 py-1 rounded-full">
          {tCatalog('certifiedBadge')}
        </span>
      </div>

      {/* Grid of Product Cards */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-cream">
          <span className="text-4xl block">🔍</span>
          <h4 className="font-bold text-lg text-primary">{tCatalog('noResultsTitle')}</h4>
          <p className="text-xs text-foreground/60">{tCatalog('noResultsDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Store Trust Badges */}
      <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 border-t border-cream/80 mt-12">
        <div className="bg-white p-6 rounded-2xl border border-cream/70 text-center space-y-2 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-secondary/20 text-primary mx-auto flex items-center justify-center text-xl font-bold">
            🛡️
          </div>
          <h4 className="font-bold text-sm text-foreground">{tTrust('badge1Title')}</h4>
          <p className="text-xs text-foreground/60 leading-relaxed">{tTrust('badge1Desc')}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-cream/70 text-center space-y-2 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-secondary/20 text-primary mx-auto flex items-center justify-center text-xl font-bold">
            ⚡
          </div>
          <h4 className="font-bold text-sm text-foreground">{tTrust('badge2Title')}</h4>
          <p className="text-xs text-foreground/60 leading-relaxed">{tTrust('badge2Desc')}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-cream/70 text-center space-y-2 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-secondary/20 text-primary mx-auto flex items-center justify-center text-xl font-bold">
            🌿
          </div>
          <h4 className="font-bold text-sm text-foreground">{tTrust('badge3Title')}</h4>
          <p className="text-xs text-foreground/60 leading-relaxed">{tTrust('badge3Desc')}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-cream/70 text-center space-y-2 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-secondary/20 text-primary mx-auto flex items-center justify-center text-xl font-bold">
            💬
          </div>
          <h4 className="font-bold text-sm text-foreground">{tTrust('badge4Title')}</h4>
          <p className="text-xs text-foreground/60 leading-relaxed">{tTrust('badge4Desc')}</p>
        </div>
      </div>
    </div>
  );
}