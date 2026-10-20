'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import ProductCard from '@/components/ProductCard';
import { DR_BERRY_PRODUCTS, Product } from '@/data/products';
import { Link } from '@/i18n/routing';

export default function ProductsCatalogPage() {
  const t = useTranslations('Catalog');
  const tNav = useTranslations('Navigation');
  const tHome = useTranslations('HomePage');
  const locale = useLocale();

  const [productsList, setProductsList] = useState<Product[]>(DR_BERRY_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'priceAsc' | 'priceDesc' | 'rating'>('featured');

  // مزامنة المنتجات الحية مع قاعدة بيانات Supabase في الخلفية دون أي وميض
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
    { slug: 'all', label: t('allProducts') },
    { slug: 'hair', label: t('hairCare') },
    { slug: 'body', label: t('bodyCare') },
    { slug: 'skin', label: t('skinCare') },
    { slug: 'whitening', label: t('whiteningCare') },
  ];

  // Filter & Search logic
  const filteredProducts = productsList.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.categorySlug === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      product.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'priceAsc') return a.prices.SAR - b.prices.SAR;
    if (sortBy === 'priceDesc') return b.prices.SAR - a.prices.SAR;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // default featured
  });

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs md:text-sm text-foreground/60 font-medium">
        <Link href="/" className="hover:text-primary transition-colors">
          {tNav('home')}
        </Link>
        <span>/</span>
        <span className="text-primary font-bold">{tNav('products')}</span>
      </nav>

      {/* Catalog Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="px-4 py-1.5 bg-primary/10 text-primary text-xs font-black rounded-full tracking-wider">
          {tHome('subtitle')}
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-primary font-sans">
          {t('allProducts')}
        </h1>
        <p className="text-sm md:text-base text-foreground/70 leading-relaxed">
          {tHome('welcome')}
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-6 rounded-3xl border border-cream/80 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3.5 pr-12 pl-12 bg-background rounded-2xl border border-cream text-sm focus:outline-none focus:border-primary text-foreground"
            />
            <svg
              className="w-5 h-5 absolute right-4 rtl:right-4 ltr:right-auto ltr:left-4 top-1/2 -translate-y-1/2 text-foreground/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-4 rtl:left-4 ltr:left-auto ltr:right-4 top-1/2 -translate-y-1/2 text-xs text-foreground/40 hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-3.5 px-4 bg-background rounded-2xl border border-cream text-sm font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="featured">{t('sortFeatured')}</option>
              <option value="rating">{t('sortRating')}</option>
              <option value="priceAsc">{t('sortPriceAsc')}</option>
              <option value="priceDesc">{t('sortPriceDesc')}</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-cream/50">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-background text-foreground/70 border border-cream hover:text-primary hover:border-primary/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Results Summary */}
      <div className="flex justify-between items-center px-2 text-sm text-foreground/60">
        <span>
          {t('showing')} <strong className="text-primary font-black">{sortedProducts.length}</strong> {t('itemsOf')}
        </span>
        {searchQuery && (
          <span className="text-xs text-accent font-bold">
            &quot;{searchQuery}&quot;
          </span>
        )}
      </div>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-cream space-y-4">
          <div className="text-5xl">🔍</div>
          <h3 className="text-xl font-bold text-foreground">{t('noResultsTitle')}</h3>
          <p className="text-sm text-foreground/60 max-w-md mx-auto">
            {t('noResultsDesc')}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/90 transition-all"
          >
            {t('resetFilters')}
          </button>
        </div>
      )}
    </div>
  );
}
