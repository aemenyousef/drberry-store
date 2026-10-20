'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  DR_BERRY_PRODUCTS,
  Product,
  getProductTitle,
  getProductCategory,
  getProductDescription,
  getProductBenefits,
  getProductVolume,
  getProductBadge,
} from '@/data/products';
import { useStore } from '@/contexts/StoreContext';
import ProductCard from '@/components/ProductCard';

interface ProductPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = use(params);

  // البحث الأولي الفوري في الكتالوج المحلي لضمان عدم وجود تأخير في العرض
  const initialProduct = DR_BERRY_PRODUCTS.find(
    (p) => p.id.toLowerCase() === id.toLowerCase() || p.id === id
  ) || DR_BERRY_PRODUCTS[Number(id) - 1] || null;

  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);

  // مزامنة المنتج المباشر مع Supabase
  useEffect(() => {
    fetch(`/api/products/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
        }
      })
      .catch(() => {
        // إذا فشل الاتصال، نحافظ على المنتج الأولي
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (!product && !loading) {
    notFound();
  }

  if (!product && loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return <ProductDetailContent product={product!} />;
}

function ProductDetailContent({ product }: { product: Product }) {
  const locale = useLocale();
  const tDetail = useTranslations('ProductDetail');
  const tNav = useTranslations('Navigation');
  const tCard = useTranslations('ProductCard');
  const tTrust = useTranslations('TrustBadges');
  const { formatPrice, addToCart, currency } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'ingredients' | 'usage' | 'shipping'>('benefits');
  const [isAdded, setIsAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(product.image);

  const title = getProductTitle(product, locale);
  const category = getProductCategory(product, locale);
  const description = getProductDescription(product, locale);
  const volume = getProductVolume(product, locale);
  const badge = getProductBadge(product, locale);
  const benefits = getProductBenefits(product, locale);

  // Related products from other items
  const relatedProducts = DR_BERRY_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // WhatsApp direct order message
  const whatsappNumber = '967770000000';
  const currentPriceFormatted = formatPrice(product.prices);
  const whatsappMsg = encodeURIComponent(
    locale === 'en'
      ? `Hello Dr.Berry, I would like to order:\n- Product: ${title}\n- Size: ${volume}\n- Quantity: ${quantity}\n- Price: ${currentPriceFormatted}\nPlease confirm availability and delivery.`
      : `مرحباً د. بيري، أرغب بطلب:\n- المنتج: ${title}\n- الحجم: ${volume}\n- الكمية: ${quantity}\n- السعر: ${currentPriceFormatted}\nيرجى تأكيد التوفر وطريقة التوصيل.`
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    image: product.image,
    description: description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Dr. Berry',
    },
    offers: {
      '@type': 'Offer',
      url: `https://drberry.com/${locale}/products/${product.id}`,
      priceCurrency: 'SAR',
      price: product.prices.SAR,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
    },
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Schema.org Product Rich Snippet for Google Search Console */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs md:text-sm text-foreground/60 mb-8 font-medium">
        <Link href="/" className="hover:text-primary transition-colors">
          {tNav('home')}
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary transition-colors">
          {tNav('products')}
        </Link>
        <span>/</span>
        <span className="text-primary font-bold truncate max-w-[200px] md:max-w-none">{title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
        {/* Gallery / Image Section */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-cream/80 shadow-sm flex items-center justify-center p-8 group">
            {badge && (
              <span className="absolute top-6 right-6 rtl:right-6 ltr:right-auto ltr:left-6 z-10 px-4 py-1.5 rounded-full text-xs font-black bg-accent text-accent-foreground shadow-md">
                {badge}
              </span>
            )}
            <Image
              src={activeImage}
              alt={title}
              fill
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black tracking-widest text-secondary uppercase bg-secondary/10 px-3 py-1 rounded-full">
              {category}
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-primary font-sans leading-tight">
              {title}
            </h1>
            {volume && (
              <p className="text-sm font-bold text-foreground/60">
                {tDetail('volume')}: <span className="text-primary">{volume}</span>
              </p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex text-amber-400 text-sm">
              {'★'.repeat(Math.floor(product.rating))}
              {product.rating % 1 !== 0 && '½'}
            </div>
            <span className="text-xs font-bold text-foreground/80">
              {product.rating} ({product.reviewsCount} {tDetail('reviewsCount')})
            </span>
          </div>

          {/* Price */}
          <div className="p-4 rounded-2xl bg-cream/30 border border-cream flex items-baseline gap-3">
            <span className="text-3xl font-black text-primary">
              {currentPriceFormatted}
            </span>
            <span className="text-xs text-foreground/60 font-medium">
              {tDetail('taxIncluded')}
            </span>
          </div>

          {/* Short Description */}
          <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
            {description}
          </p>

          {/* Quantity & CTA */}
          <div className="space-y-4 pt-4 border-t border-cream">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-foreground/70">{tDetail('quantity')}:</span>
              <div className="flex items-center border border-cream rounded-2xl bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2 text-foreground/70 hover:bg-cream/40 transition-colors font-bold"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-black text-primary min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 py-2 text-foreground/70 hover:bg-cream/40 transition-colors font-bold"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isAdded
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-primary text-white hover:bg-primary/90 shadow-primary/30 active:scale-98'
                }`}
              >
                {isAdded ? (
                  <>
                    <span>✓</span>
                    <span>{tCard('addedToCart')}</span>
                  </>
                ) : (
                  <>
                    <span>🛍️</span>
                    <span>{tCard('addToCart')}</span>
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl font-black text-sm tracking-wide bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2"
              >
                <span>💬</span>
                <span>{locale === 'en' ? 'Order via WhatsApp' : 'طلب مباشر بالواتساب'}</span>
              </a>
            </div>
          </div>

          {/* Quick Trust Features */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-cream/80">
            <div className="flex items-center gap-2 text-xs text-foreground/70">
              <span className="text-primary text-base">🛡️</span>
              <span>{tTrust('badge1Title')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/70">
              <span className="text-primary text-base">🚚</span>
              <span>{tTrust('badge2Title')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/70">
              <span className="text-primary text-base">🌿</span>
              <span>{tTrust('badge3Title')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/70">
              <span className="text-primary text-base">💬</span>
              <span>{tTrust('badge4Title')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section for Deep Details */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-cream/80 shadow-sm mb-20">
        <div className="flex border-b border-cream/80 gap-6 overflow-x-auto pb-4">
          <button
            onClick={() => setActiveTab('benefits')}
            className={`font-black text-sm md:text-base pb-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'benefits'
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground/60 hover:text-primary'
            }`}
          >
            {tDetail('tabBenefits')}
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`font-black text-sm md:text-base pb-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'ingredients'
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground/60 hover:text-primary'
            }`}
          >
            {tDetail('tabIngredients')}
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`font-black text-sm md:text-base pb-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'usage'
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground/60 hover:text-primary'
            }`}
          >
            {tDetail('tabUsage')}
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`font-black text-sm md:text-base pb-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground/60 hover:text-primary'
            }`}
          >
            {tDetail('tabShipping')}
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === 'benefits' && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-primary">{tDetail('tabBenefits')}:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3 bg-cream/15 p-4 rounded-2xl border border-cream/60">
                    <span className="w-6 h-6 rounded-full bg-secondary/30 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                      ✓
                    </span>
                    <span className="text-sm font-medium text-foreground/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-primary">{tDetail('tabIngredients')}:</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {locale === 'en'
                  ? 'Expertly formulated using pure natural extracts, essential oils, and dermatologically certified ingredients free from harsh sulfates or parabens.'
                  : 'تم تركيب هذا المنتج بعناية صيدلانية متقدمة باستخدام خلاصات وزيوت نقية خالية من البارابين، السلفات، والمواد القاسية على البشرة والشعر:'}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-secondary/20 text-primary font-bold text-xs">
                  {locale === 'en' ? '100% Pure Botanical Extracts' : 'زبدات وزيوت طبيعية 100%'}
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-secondary/20 text-primary font-bold text-xs">
                  {locale === 'en' ? 'Paraben-Free' : 'خالٍ من البارابين'}
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-secondary/20 text-primary font-bold text-xs">
                  {locale === 'en' ? 'Enriched with Vitamins E & C' : 'فيتامينات مغذية (E & C)'}
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-secondary/20 text-primary font-bold text-xs">
                  {locale === 'en' ? 'Hyaluronic Acid & Collagen' : 'حمض الهيالورونيك والكولاجين'}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-primary">{tDetail('tabUsage')}:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/80 leading-relaxed bg-cream/10 p-5 rounded-2xl border border-cream/50">
                {locale === 'en' ? (
                  <>
                    <li>Gently cleanse and pat dry the targeted area before application.</li>
                    <li>Apply an appropriate amount and massage gently in circular motions until fully absorbed.</li>
                    <li>Use consistently as part of your daily routine or as directed on package.</li>
                    <li>Store in a cool, dry place away from direct sunlight.</li>
                  </>
                ) : (
                  <>
                    <li>تنظيف المنطقة المستهدفة بلطف وتجفيفها جيداً قبل التطبيق.</li>
                    <li>وضع كمية مناسبة من المستحضر وتدليكها برفق بحركات دائرية حتى يتم الامتصاص الكامل.</li>
                    <li>يُفضل الالتزام بالاستخدام اليومي أو حسب الإرشادات المدونة على العبوة للحصول على النتائج المستمرة.</li>
                    <li>يُحفظ في مكان جاف وبارد بعيداً عن أشعة الشمس المباشرة.</li>
                  </>
                )}
              </ol>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-primary">{tDetail('tabShipping')}:</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {locale === 'en'
                  ? 'All Dr.Berry items are shipped in temperature-regulated, clinical-grade packaging to protect active ingredients. Fast delivery across all cities with cash-on-delivery and verified bank transfer options.'
                  : 'نحرص على وصول كافة المنتجات في ظروف حرارية ملائمة تحافظ على جودة المواد الفعالة. التوصيل متاح لكافة المحافظات مع إمكانية الدفع عند الاستلام أو عبر الحوالات المصرفية المعتمدة.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-primary">
              {tDetail('relatedTitle')}
            </h2>
            <div className="w-16 h-1 bg-accent mx-auto rounded-full mt-3"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
