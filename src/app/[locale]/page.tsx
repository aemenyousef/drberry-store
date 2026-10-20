'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import HeroBanner from '@/components/HeroBanner';
import ProductGrid from '@/components/ProductGrid';
import { DR_BERRY_PRODUCTS } from '@/data/products';
import { useStore } from '@/contexts/StoreContext';

export default function HomePage() {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { formatPrice, addToCart } = useStore();

  const heroProduct = DR_BERRY_PRODUCTS.find((p) => p.id === 'coco-therapy');
  const beautyBomb = DR_BERRY_PRODUCTS.find((p) => p.id === 'beauty-bomb');

  const categories = [
    {
      slug: 'hair',
      titleAr: 'العناية بالشعر',
      titleEn: 'Hair Care',
      descAr: 'ترميم وتكثيف وعلاج التقصف',
      descEn: 'Repair & Scalp Therapy',
      icon: '🌿',
      count: 'منتجان معتمدان',
      bg: 'from-emerald-500/10 to-teal-500/5',
      border: 'border-emerald-200/60',
    },
    {
      slug: 'body',
      titleAr: 'العناية بالجسم',
      titleEn: 'Body Care',
      descAr: 'ترطيب عميق بالهيالورونيك',
      descEn: 'Deep Hyaluronic Moisture',
      icon: '💧',
      count: 'منتج فاخر',
      bg: 'from-violet-500/10 to-purple-500/5',
      border: 'border-violet-200/60',
    },
    {
      slug: 'whitening',
      titleAr: 'التفتيح والنضارة',
      titleEn: 'Glow & Whitening',
      descAr: 'تفتيح آمن وتوحيد اللون',
      descEn: 'Intensive Brightening',
      icon: '✨',
      count: 'الأعلى طلباً',
      bg: 'from-amber-500/10 to-yellow-500/5',
      border: 'border-amber-200/60',
    },
    {
      slug: 'skin',
      titleAr: 'عناية اليدين والبشرة',
      titleEn: 'Skin & Hand Therapy',
      descAr: 'شمع العسل والبابونج الطبيعي',
      descEn: 'Beeswax & Chamomile',
      icon: '🌸',
      count: 'تركيبة عشبية',
      bg: 'from-rose-500/10 to-pink-500/5',
      border: 'border-rose-200/60',
    },
  ];

  const testimonials = [
    {
      nameAr: 'د. مروة الشميري',
      nameEn: 'Dr. Marwa Al-Shumairi',
      cityAr: 'صنعاء',
      cityEn: 'Sanaa',
      productAr: 'بلسم Coco Therapy',
      productEn: 'Coco Therapy Conditioner',
      rating: 5,
      textAr:
        'بصفتي صيدلانية، انبهرت بالتركيبة الفاخرة للبلسم! شعري كان مجهداً جداً من الصبغة والاستشوار، ومن أول أسبوع رجعت له الحيوية والنعومة بدون أي أثر دهني.',
      textEn:
        'As a pharmacist, I was amazed by the formulation! My hair was severely damaged by coloring, and within a week it regained softness and vitality.',
    },
    {
      nameAr: 'ريما القحطاني',
      nameEn: 'Rima Al-Qahtani',
      cityAr: 'الرياض',
      cityEn: 'Riyadh',
      productAr: 'كريم Beauty Bomb',
      productEn: 'Beauty Bomb Cream',
      rating: 5,
      textAr:
        'وصلني الطلب للرياض بتغليف ملكي يفتح النفس. كريم التفتيح نتائجه واضحة وسريعة بدون أي تحسس أو احمرار، مستحيل أستغني عنه!',
      textEn:
        'Delivered to Riyadh in exquisite royal packaging. The brightening results were noticeably fast without irritation. Absolutely essential!',
    },
    {
      nameAr: 'سارة العريقي',
      nameEn: 'Sara Al-Oraiqi',
      cityAr: 'عدن',
      cityEn: 'Aden',
      productAr: 'زيت Hair Bloom',
      productEn: 'Hair Bloom Scalp Oil',
      rating: 5,
      textAr:
        'زيت الفروة خفيف جداً ويمتصه الرأس بسرعة ورائحته لطيفة جداً. خفف التساقط بشكل ملحوظ وبدأت ألاحظ بيبي هير في مقدمة الرأس.',
      textEn:
        'Very lightweight scalp oil that absorbs quickly with a pleasant scent. Noticeably reduced shedding and encouraged new baby hairs.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Horizontal Quick Features Strip */}
      <section className="bg-white border-y border-cream/70 py-6 px-4 md:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">🔬</span>
            <div className="text-start">
              <h4 className="font-bold text-xs md:text-sm text-primary">
                {isRTL ? 'معايير طبية صيدلانية' : 'Pharmaceutical Grade'}
              </h4>
              <p className="text-[10px] text-foreground/55">
                {isRTL ? 'تركيبات علاجية معتمدة وآمنة' : 'Certified Safe Formulations'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">🚚</span>
            <div className="text-start">
              <h4 className="font-bold text-xs md:text-sm text-primary">
                {isRTL ? 'شحن لجميع المحافظات والخليج' : 'All Governorates & GCC'}
              </h4>
              <p className="text-[10px] text-foreground/55">
                {isRTL ? 'توصيل سريع ومتابعة مباشرة' : 'Express Delivery & Tracking'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">💳</span>
            <div className="text-start">
              <h4 className="font-bold text-xs md:text-sm text-primary">
                {isRTL ? 'دفع مرن وإشعار فوري' : 'Flexible & Secure Payment'}
              </h4>
              <p className="text-[10px] text-foreground/55">
                {isRTL ? 'الكريمي، الراجحي، ومحافظ إلكترونية' : 'Kuraimi, Rajhi, & Wallets'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">💬</span>
            <div className="text-start">
              <h4 className="font-bold text-xs md:text-sm text-primary">
                {isRTL ? 'استشارات صيدلانية 24/7' : '24/7 Expert Consultation'}
              </h4>
              <p className="text-[10px] text-foreground/55">
                {isRTL ? 'تواصل مباشر عبر الواتساب' : 'Direct WhatsApp Support'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Showcase Cards */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-accent bg-secondary/15 px-4 py-1 rounded-full inline-block">
            {isRTL ? 'أقسام العناية التخصصية' : 'Specialized Care Collections'}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-primary font-sans">
            {isRTL ? 'استكشف حسب احتياجك' : 'Shop by Category'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products/category/${cat.slug}`}
              className={`p-6 rounded-3xl bg-gradient-to-br ${cat.bg} border ${cat.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block group`}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-lg text-primary">{isRTL ? cat.titleAr : cat.titleEn}</h3>
                <span className="text-[10px] font-bold text-foreground/50 bg-white/70 px-2 py-0.5 rounded-full">
                  {cat.count}
                </span>
              </div>
              <p className="text-xs text-foreground/70">{isRTL ? cat.descAr : cat.descEn}</p>
              <div className="mt-4 flex items-center text-xs font-bold text-primary group-hover:text-accent gap-1">
                <span>{isRTL ? 'تصفح المجموعة' : 'Explore'}</span>
                <span>{isRTL ? '←' : '→'}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Best-Seller Spotlight: Coco Therapy */}
      {heroProduct && (
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-primary via-[#682335] to-[#4c1624] text-white rounded-3xl md:rounded-4xl p-8 md:p-14 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-secondary">
                  <span>⭐</span>
                  <span>{isRTL ? 'المنتج الأكثر مبيعاً وتقييماً' : 'Best-Selling Cosmetic Remedy'}</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black leading-tight font-sans">
                  {isRTL ? heroProduct.titleAr : heroProduct.titleEn}
                </h2>

                <p className="text-sm md:text-base text-white/85 leading-relaxed">
                  {isRTL ? heroProduct.descriptionAr : heroProduct.descriptionEn}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {(isRTL ? heroProduct.benefitsAr : heroProduct.benefitsEn).slice(0, 4).map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-white/90 font-medium">
                      <span className="text-secondary font-black">✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-5">
                  <span className="text-3xl font-black text-secondary">
                    {formatPrice(heroProduct.prices)}
                  </span>
                  <button
                    onClick={() => addToCart(heroProduct)}
                    className="px-8 py-3.5 bg-white text-primary rounded-full font-bold shadow-xl hover:bg-cream transition-all text-xs flex items-center gap-2"
                  >
                    <span>🛒</span>
                    <span>{isRTL ? 'إضافة للسلة فوراً' : 'Add to Cart Now'}</span>
                  </button>
                  <Link
                    href={`/products/${heroProduct.id}`}
                    className="text-xs text-white/80 hover:text-white underline font-bold"
                  >
                    {isRTL ? 'عرض كامل التفاصيل' : 'View Full Details'}
                  </Link>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="relative w-72 h-80 sm:w-80 sm:h-96 bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/20 p-6 flex items-center justify-center shadow-2xl">
                  <Image
                    src={heroProduct.image}
                    alt={heroProduct.titleAr}
                    fill
                    className="object-contain p-4 drop-shadow-2xl"
                  />
                  <div className="absolute -bottom-4 bg-white text-primary text-xs font-black px-5 py-2 rounded-full shadow-lg">
                    {heroProduct.volumeAr}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Main Product Catalog Grid */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-accent bg-secondary/15 px-4 py-1 rounded-full inline-block">
            {isRTL ? 'المجموعة الكاملة' : 'Complete Medical Collection'}
          </span>
          <h2 className="text-4xl font-black text-primary font-sans">
            {t('ourProducts')}
          </h2>
          <div className="w-24 h-1.5 bg-accent mx-auto rounded-full"></div>
        </div>

        {/* Product Grid with Filters & Badges */}
        <ProductGrid />
      </section>

      {/* 6. Luxury Gifts Promo Banner */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-100 rounded-3xl border border-pink-200/70 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="space-y-3 text-center md:text-start">
            <span className="text-2xl">🎁</span>
            <h3 className="text-2xl md:text-3xl font-black text-primary font-sans">
              {t('ctaTitle')}
            </h3>
            <p className="text-xs md:text-sm text-foreground/70 max-w-xl leading-relaxed">
              {t('ctaSubtitle')}
            </p>
          </div>

          <Link
            href="/gifts"
            className="px-8 py-3.5 bg-primary text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-xs flex-shrink-0"
          >
            {t('ctaBtn')}
          </Link>
        </div>
      </section>

      {/* 7. Testimonials & Verified Reviews */}
      <section className="py-16 px-4 md:px-8 bg-white border-t border-cream/70">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-accent bg-secondary/15 px-4 py-1 rounded-full inline-block">
              {isRTL ? 'آراء وتجارب حقيقية' : 'Real Customer Experiences'}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-primary font-sans">
              {t('testimonialsTitle')}
            </h2>
            <p className="text-xs md:text-sm text-foreground/60 max-w-lg mx-auto">
              {t('testimonialsSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((review, idx) => (
              <div
                key={idx}
                className="bg-background/40 p-8 rounded-3xl border border-cream shadow-xs space-y-4 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500 text-sm">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-xs md:text-sm text-foreground/80 leading-relaxed italic">
                    "{isRTL ? review.textAr : review.textEn}"
                  </p>
                </div>

                <div className="pt-4 border-t border-cream/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-primary">{isRTL ? review.nameAr : review.nameEn}</h4>
                    <span className="text-[10px] text-foreground/50">{isRTL ? review.cityAr : review.cityEn}</span>
                  </div>
                  <span className="text-[10px] font-bold text-accent bg-secondary/15 px-2 py-0.5 rounded-md">
                    {isRTL ? review.productAr : review.productEn}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Medical Quality & Natural Pledge */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-secondary/20 text-primary mx-auto flex items-center justify-center text-3xl">
          🌿
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-primary font-sans">
          {isRTL ? 'تعهد Dr.Berry للجودة والسلامة الطبية' : 'Dr.Berry Quality & Safety Pledge'}
        </h3>
        <p className="text-xs md:text-sm text-foreground/70 max-w-2xl mx-auto leading-relaxed">
          {isRTL
            ? 'نصنع مستحضراتنا من أنقى الخلاصات الطبيعية والزيوت العلاجية بالتعاون مع معامل صيدلانية متخصصة. تركيباتنا خالية تماماً من البارابين، السلفات، الزيوت المعدنية، والمواد الكيميائية القاسية، ومطابقة لأدق معايير هيئة الغذاء والدواء.'
            : 'Formulated with botanical extracts and therapeutic actives under strict pharmaceutical standards. 100% free of parabens, sulfates, and mineral oils.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <span className="px-4 py-1.5 rounded-full bg-white border border-cream text-xs font-bold text-primary">
            ✓ Paraben-Free
          </span>
          <span className="px-4 py-1.5 rounded-full bg-white border border-cream text-xs font-bold text-primary">
            ✓ Cruelty-Free
          </span>
          <span className="px-4 py-1.5 rounded-full bg-white border border-cream text-xs font-bold text-primary">
            ✓ 100% Original Formula
          </span>
          <span className="px-4 py-1.5 rounded-full bg-white border border-cream text-xs font-bold text-primary">
            ✓ GMP Certified Lab
          </span>
        </div>
      </section>

      {/* 9. Floating WhatsApp Widget */}
      <a
        href="https://wa.me/967770000000"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Support"
        className="fixed bottom-6 left-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 md:p-4 rounded-full shadow-2xl flex items-center gap-2 hover:scale-108 transition-all duration-300 ring-4 ring-emerald-400/20"
      >
        <span className="text-2xl">💬</span>
        <span className="hidden md:inline font-bold text-xs">
          {isRTL ? 'استشارة صيدلانية مباشرة' : 'Live Consultation'}
        </span>
      </a>
    </div>
  );
}