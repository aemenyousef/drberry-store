'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { DR_BERRY_PRODUCTS, getProductTitle } from '@/data/products';

const WHATSAPP_NUMBER = '966500000000';

const WHY_ITEMS = [
  { icon: '🎁', titleKey: 'why1Title', descKey: 'why1Desc' },
  { icon: '✍️', titleKey: 'why2Title', descKey: 'why2Desc' },
  { icon: '🚚', titleKey: 'why3Title', descKey: 'why3Desc' },
  { icon: '⭐', titleKey: 'why4Title', descKey: 'why4Desc' },
] as const;

export default function GiftsPage() {
  const t = useTranslations('Gifts');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [form, setForm] = useState({
    yourName: '',
    yourPhone: '',
    recipientName: '',
    giftMessage: '',
    selectedProduct: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProductObj = DR_BERRY_PRODUCTS.find(p => p.id === form.selectedProduct);
    const productName = selectedProductObj ? getProductTitle(selectedProductObj, locale) : form.selectedProduct;

    const message = locale === 'ar'
      ? `🎁 *طلب هدية - Dr.Berry*\n\n` +
        `👤 *اسم المشتري:* ${form.yourName}\n` +
        `📞 *الهاتف:* ${form.yourPhone}\n` +
        `🎀 *المُهدى إليه/إليها:* ${form.recipientName}\n` +
        `📦 *المنتج:* ${productName}\n` +
        (form.giftMessage ? `💌 *رسالة الهدية:* ${form.giftMessage}\n` : '') +
        `\n_تم الطلب من متجر Dr.Berry الرسمي_`
      : `🎁 *Gift Order - Dr.Berry*\n\n` +
        `👤 *Sender Name:* ${form.yourName}\n` +
        `📞 *Phone:* ${form.yourPhone}\n` +
        `🎀 *Recipient:* ${form.recipientName}\n` +
        `📦 *Product:* ${productName}\n` +
        (form.giftMessage ? `💌 *Gift Message:* ${form.giftMessage}\n` : '') +
        `\n_Ordered from Dr.Berry Official Store_`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-900 via-pink-800 to-fuchsia-700 py-28 px-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* تأثير نجوم صغيرة */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['✨', '🌸', '💫', '🎀', '⭐'].map((emoji, i) => (
            <span
              key={i}
              className="absolute text-2xl opacity-20 animate-bounce"
              style={{
                top: `${15 + i * 18}%`,
                left: `${5 + i * 20}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${2 + i * 0.5}s`
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="text-7xl mb-6">🎁</div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-2xl text-white/80 mb-4">{t('heroSubtitle')}</p>
          <p className="text-lg text-white/65 max-w-2xl mx-auto leading-relaxed">{t('heroDesc')}</p>

          <a
            href="#gift-form"
            className="inline-flex items-center gap-3 mt-10 bg-white text-rose-700 font-bold text-lg px-10 py-5 rounded-2xl hover:bg-rose-50 transition-all duration-300 hover:scale-105 shadow-2xl"
          >
            🎀 {t('orderBtn')}
          </a>
        </div>
      </section>

      {/* لماذا Dr.Berry كهدية */}
      <section className="py-24 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-16 h-1.5 bg-accent rounded-full mx-auto mb-6" />
          <h2 className="text-4xl font-black text-primary">{t('whyTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_ITEMS.map((item) => (
            <div
              key={item.titleKey}
              className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-3xl p-8 border border-rose-100 dark:border-rose-900/30 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center"
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-primary mb-3">{t(item.titleKey)}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t(item.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* نموذج الطلب */}
      <section id="gift-form" className="py-20 px-8 bg-card scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-5xl mb-4">✍️</div>
            <div className="w-16 h-1.5 bg-rose-400 rounded-full mx-auto mb-6" />
            <h2 className="text-4xl font-black text-primary mb-4">{t('formTitle')}</h2>
            <p className="text-muted-foreground">{t('formDesc')}</p>
          </div>

          <form
            onSubmit={handleWhatsAppSubmit}
            className="bg-background rounded-3xl p-8 md:p-10 border border-border shadow-xl space-y-6"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* اسمك */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                {t('yourName')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="yourName"
                value={form.yourName}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 transition-all"
                placeholder={isRTL ? 'اسمك الكريم...' : 'Your full name...'}
              />
            </div>

            {/* رقم الهاتف */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                {t('yourPhone')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="yourPhone"
                value={form.yourPhone}
                onChange={handleChange}
                required
                dir="ltr"
                className="w-full px-5 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 transition-all"
                placeholder="+966 5X XXX XXXX"
              />
            </div>

            {/* اسم المُهدى إليه */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                {t('recipientName')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="recipientName"
                value={form.recipientName}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 transition-all"
                placeholder={isRTL ? 'اسم من ستهديه/ستهديها...' : "Recipient's name..."}
              />
            </div>

            {/* اختيار المنتج */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                {t('selectedProduct')} <span className="text-rose-500">*</span>
              </label>
              <select
                name="selectedProduct"
                value={form.selectedProduct}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 transition-all appearance-none cursor-pointer"
              >
                <option value="">{t('selectProduct')}</option>
                {DR_BERRY_PRODUCTS.map((product) => (
                  <option key={product.id} value={product.id}>
                    {getProductTitle(product, locale)}
                  </option>
                ))}
              </select>
            </div>

            {/* رسالة الهدية */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                {t('giftMessage')}
              </label>
              <textarea
                name="giftMessage"
                value={form.giftMessage}
                onChange={handleChange}
                rows={4}
                className="w-full px-5 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 transition-all resize-none"
                placeholder={t('giftMessagePlaceholder')}
              />
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-green-500/30"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t('submitBtn')}
            </button>
          </form>
        </div>
      </section>

      {/* منتجات مثالية للإهداء */}
      <section className="py-24 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-1.5 bg-accent rounded-full mx-auto mb-6" />
          <h2 className="text-4xl font-black text-primary mb-4">{t('suitableTitle')}</h2>
          <p className="text-muted-foreground">{t('suitableSubtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DR_BERRY_PRODUCTS.slice(0, 3).map((product) => {
            const productTitle = getProductTitle(product, locale);
            const productCategory = locale === 'ar' ? product.categoryAr : product.categoryEn;
            return (
              <Link
                key={product.id}
                href={`/${locale}/products/${product.id}`}
                className="group bg-card rounded-3xl overflow-hidden border border-border hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 bg-gradient-to-br from-rose-100 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 flex items-center justify-center">
                  <div className="text-6xl">🎁</div>
                  <div className="absolute top-3 end-3 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {locale === 'ar' ? 'هدية مثالية' : 'Perfect Gift'}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs text-muted-foreground mb-2">{productCategory}</p>
                  <h3 className="font-bold text-primary group-hover:text-accent transition-colors line-clamp-2">
                    {productTitle}
                  </h3>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-black text-accent">
                      {product.prices.SAR} SAR
                    </span>
                    <span className="text-sm text-rose-500 font-medium">
                      {locale === 'ar' ? 'اهدِ الآن →' : 'Gift Now →'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
