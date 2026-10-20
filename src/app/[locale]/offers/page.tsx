'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useStore } from '@/contexts/StoreContext';
import { DR_BERRY_PRODUCTS } from '@/data/products';

export default function OffersPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { formatPrice, addToCart } = useStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const hairProduct1 = DR_BERRY_PRODUCTS.find((p) => p.id === 'coco-therapy');
  const hairProduct2 = DR_BERRY_PRODUCTS.find((p) => p.id === 'hair-bloom');

  const skinProduct1 = DR_BERRY_PRODUCTS.find((p) => p.id === 'beauty-bomb');
  const skinProduct2 = DR_BERRY_PRODUCTS.find((p) => p.id === 'chamomile-cream');

  const handleAddHairBundle = () => {
    if (hairProduct1) addToCart(hairProduct1);
    if (hairProduct2) addToCart(hairProduct2);
  };

  const handleAddSkinBundle = () => {
    if (skinProduct1) addToCart(skinProduct1);
    if (skinProduct2) addToCart(skinProduct2);
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-accent bg-secondary/15 px-4 py-1.5 rounded-full inline-block">
            {isRTL ? 'تخفيضات موسمية حصرية' : 'Exclusive Seasonal Offers'}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-primary font-sans flex items-center justify-center gap-3">
            <span>{isRTL ? 'عروض وحزم Dr.Berry الفاخرة' : 'Dr.Berry Luxury Offers & Bundles'}</span>
            <span>✨</span>
          </h1>
          <p className="text-sm md:text-base text-foreground/70 max-w-xl mx-auto">
            {isRTL
              ? 'استمتعي بأقوى الباقات العلاجية المتكاملة مع خصومات خاصة وتغليف شحن مجاني عند طلب البكجات.'
              : 'Enjoy complete therapeutic care bundles with special savings and complimentary gift packaging.'}
          </p>
        </div>

        {/* Coupons Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-primary to-accent text-white p-6 rounded-3xl shadow-lg flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">
                {isRTL ? 'خصم 10% للعملاء الجدد' : '10% OFF First Order'}
              </span>
              <h3 className="text-xl font-black font-mono tracking-widest">DRBERRY10</h3>
              <p className="text-xs text-white/80">
                {isRTL ? 'يُطبق في صفحة إتمام الطلب' : 'Apply at checkout'}
              </p>
            </div>
            <button
              onClick={() => copyCoupon('DRBERRY10')}
              className="px-5 py-2.5 bg-white text-primary rounded-xl font-bold text-xs hover:bg-cream transition-colors shadow-md flex-shrink-0"
            >
              {copiedCode === 'DRBERRY10' ? (isRTL ? 'تم النسخ ✓' : 'Copied ✓') : (isRTL ? 'نسخ الكود' : 'Copy Code')}
            </button>
          </div>

          <div className="bg-gradient-to-r from-violet-900 to-purple-700 text-white p-6 rounded-3xl shadow-lg flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">
                {isRTL ? 'توصيل مجاني للطلبات الكبيرة' : 'Free Shipping VIP'}
              </span>
              <h3 className="text-xl font-black font-mono tracking-widest">VIPCARE</h3>
              <p className="text-xs text-white/80">
                {isRTL ? 'على الطلبات فوق 10,000 ر.ي / 100 ر.س' : 'On orders above 10,000 YER / 100 SAR'}
              </p>
            </div>
            <button
              onClick={() => copyCoupon('VIPCARE')}
              className="px-5 py-2.5 bg-white text-violet-900 rounded-xl font-bold text-xs hover:bg-cream transition-colors shadow-md flex-shrink-0"
            >
              {copiedCode === 'VIPCARE' ? (isRTL ? 'تم النسخ ✓' : 'Copied ✓') : (isRTL ? 'نسخ الكود' : 'Copy Code')}
            </button>
          </div>
        </div>

        {/* Featured Bundles */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-primary">
            {isRTL ? 'البكجات الطبية الأكثر طلباً' : 'Best-Selling Medical Care Bundles'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Bundle 1: Hair Care */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-cream shadow-xl space-y-6 flex flex-col justify-between hover:shadow-2xl transition-all">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    {isRTL ? 'باقة ترميم الشعر المكثفة' : 'Intensive Hair Repair Bundle'}
                  </span>
                  <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    {isRTL ? 'توفير 15%' : 'SAVE 15%'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2">
                  <div className="relative h-40 bg-secondary/10 rounded-2xl overflow-hidden p-2">
                    <Image src="/images/products/coco-therapy.jpg" alt="Coco Therapy" fill className="object-contain" />
                  </div>
                  <div className="relative h-40 bg-secondary/10 rounded-2xl overflow-hidden p-2">
                    <Image src="/images/products/hair-bloom.jpg" alt="Hair Bloom" fill className="object-contain" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-primary">
                    {isRTL ? 'بكج الترميم العميق وإنبات الشعر' : 'Deep Repair & Scalp Bloom Bundle'}
                  </h3>
                  <p className="text-xs text-foreground/70 leading-relaxed mt-2">
                    {isRTL
                      ? 'يجمع بين بلسم ومرمم Coco Therapy الفاخر بالزبدات الطبيعية مع زيت الفروة المعالج Hair Bloom لإنهاء التقصف والتساقط تماماً.'
                      : 'Combines Coco Therapy conditioner with Hair Bloom scalp therapy oil to eliminate breakage and promote growth.'}
                  </p>
                </div>

                <div className="bg-background/60 p-4 rounded-xl text-xs space-y-1.5 text-foreground/80 font-medium">
                  <p>✓ 1× بلسم ومرمم كوكو ثيرابي (500 مل)</p>
                  <p>✓ 1× معالج الفروة هير بلوم (100 مل)</p>
                  <p>✓ تغليف هدايا مجاني فاخر</p>
                </div>
              </div>

              <div className="pt-4 border-t border-cream flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-foreground/40 block line-through">
                    {formatPrice({ SAR: 65, YER: 9000, USD: 17 })}
                  </span>
                  <span className="text-2xl font-black text-primary">
                    {formatPrice({ SAR: 55, YER: 7500, USD: 14.5 })}
                  </span>
                </div>

                <button
                  onClick={handleAddHairBundle}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                >
                  <span>🛒</span>
                  <span>{isRTL ? 'إضافة البكج للسلة' : 'Add Bundle to Cart'}</span>
                </button>
              </div>
            </div>

            {/* Bundle 2: Glow & Whitening */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-cream shadow-xl space-y-6 flex flex-col justify-between hover:shadow-2xl transition-all">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                    {isRTL ? 'باقة النضارة والتفتيح المخملي' : 'Velvet Glow & Whitening Bundle'}
                  </span>
                  <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    {isRTL ? 'توفير 20%' : 'SAVE 20%'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2">
                  <div className="relative h-40 bg-secondary/10 rounded-2xl overflow-hidden p-2">
                    <Image src="/images/products/beauty-bomb.jpg" alt="Beauty Bomb" fill className="object-contain" />
                  </div>
                  <div className="relative h-40 bg-secondary/10 rounded-2xl overflow-hidden p-2">
                    <Image src="/images/products/chamomile-cream.jpg" alt="Chamomile Cream" fill className="object-contain" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-primary">
                    {isRTL ? 'بكج التفتيح وتوحيد لون البشرة واليدين' : 'Skin Whitening & Velvet Hands Bundle'}
                  </h3>
                  <p className="text-xs text-foreground/70 leading-relaxed mt-2">
                    {isRTL
                      ? 'كريم بيوتي بومب المركز للتفتيح الآمن مع كريم البابونج وشمع العسل لترطيب وحماية اليدين طوال اليوم.'
                      : 'Beauty Bomb intensive brightening cream paired with Botanical Chamomile hand therapy.'}
                  </p>
                </div>

                <div className="bg-background/60 p-4 rounded-xl text-xs space-y-1.5 text-foreground/80 font-medium">
                  <p>✓ 1× كريم بيوتي بومب للتفتيح (150 مل)</p>
                  <p>✓ 1× كريم البابونج لليدين (100 مل)</p>
                  <p>✓ عينة هدية خاصة مع الطلب</p>
                </div>
              </div>

              <div className="pt-4 border-t border-cream flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-foreground/40 block line-through">
                    {formatPrice({ SAR: 60, YER: 8500, USD: 16 })}
                  </span>
                  <span className="text-2xl font-black text-primary">
                    {formatPrice({ SAR: 48, YER: 6800, USD: 12.8 })}
                  </span>
                </div>

                <button
                  onClick={handleAddSkinBundle}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                >
                  <span>🛒</span>
                  <span>{isRTL ? 'إضافة البكج للسلة' : 'Add Bundle to Cart'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}