'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DR_BERRY_PRODUCTS } from '@/data/products';
import ProductCard from '@/components/ProductCard';

const CATEGORY_CONFIG = {
  hair: {
    titleKey: 'hairTitle',
    subtitleKey: 'hairSubtitle',
    gradient: 'from-emerald-900 via-teal-800 to-emerald-700',
    accentColor: 'bg-emerald-400',
    icon: '🌿',
    filterSlug: 'hair',
  },
  body: {
    titleKey: 'bodyTitle',
    subtitleKey: 'bodySubtitle',
    gradient: 'from-violet-900 via-purple-800 to-fuchsia-700',
    accentColor: 'bg-violet-400',
    icon: '💧',
    filterSlug: 'body',
  },
  skin: {
    titleKey: 'skinTitle',
    subtitleKey: 'skinSubtitle',
    gradient: 'from-rose-900 via-pink-800 to-rose-700',
    accentColor: 'bg-rose-400',
    icon: '🌸',
    filterSlug: 'skin',
  },
  whitening: {
    titleKey: 'whiteningTitle',
    subtitleKey: 'whiteningSubtitle',
    gradient: 'from-amber-900 via-yellow-800 to-amber-700',
    accentColor: 'bg-amber-400',
    icon: '✨',
    filterSlug: 'whitening',
  },
};

export default function CategoryPage() {
  const t = useTranslations('Category');
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const config = CATEGORY_CONFIG[slug as keyof typeof CATEGORY_CONFIG];

  if (!config) {
    router.push(`/${locale}/products`);
    return null;
  }

  const filteredProducts = DR_BERRY_PRODUCTS.filter(
    (p) => p.categorySlug === config.filterSlug
  );

  const isRTL = locale === 'ar';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner للفئة */}
      <div className={`relative bg-gradient-to-br ${config.gradient} py-24 px-8 overflow-hidden`}>
        {/* خلفية زخرفية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="text-7xl mb-6">{config.icon}</div>
          <div className={`inline-block px-4 py-1.5 rounded-full ${config.accentColor} bg-opacity-20 text-white text-sm font-semibold mb-4 border border-white/20`}>
            Dr.Berry Collection
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            {t(config.titleKey as any)}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {t(config.subtitleKey as any)}
          </p>

          {/* عدد المنتجات */}
          <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <span className="text-2xl font-bold text-white">{filteredProducts.length}</span>
            <span className="text-white/80">{t('productsFound')}</span>
          </div>
        </div>
      </div>

      {/* زر الرجوع */}
      <div className={`max-w-7xl mx-auto px-8 pt-8 ${isRTL ? 'text-right' : 'text-left'}`}>
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium group"
        >
          <span className={`transition-transform ${isRTL ? 'group-hover:translate-x-1 rotate-180' : 'group-hover:-translate-x-1'}`}>←</span>
          {t('backToAll')}
        </Link>
      </div>

      {/* شبكة المنتجات */}
      <section className="py-12 px-8 max-w-7xl mx-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-muted-foreground text-xl">{t('emptyCategory')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
