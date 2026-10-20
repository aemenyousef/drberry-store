'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useStore } from '@/contexts/StoreContext';
import { getProductTitle, getProductCategory, getProductVolume } from '@/data/products';

export default function CartPage() {
  const t = useTranslations('Cart');
  const tNav = useTranslations('Navigation');
  const locale = useLocale();
  const { cart, removeFromCart, updateQuantity, clearCart, formatPrice, currency } = useStore();

  // Calculate totals
  const subtotalSar = cart.reduce((sum, item) => sum + item.product.prices.SAR * item.quantity, 0);
  const subtotalYer = cart.reduce((sum, item) => sum + item.product.prices.YER * item.quantity, 0);
  const subtotalUsd = cart.reduce((sum, item) => sum + item.product.prices.USD * item.quantity, 0);

  const currentSubtotalFormatted = formatPrice({
    SAR: subtotalSar,
    YER: subtotalYer,
    USD: subtotalUsd,
  });

  // Direct WhatsApp Checkout
  const whatsappNumber = '967770000000';
  const orderDetails = cart
    .map(
      (item, idx) =>
        `${idx + 1}. ${getProductTitle(item.product, locale).split('|')[0].trim()} (${getProductVolume(item.product, locale)}) × ${item.quantity} = ${formatPrice({
          SAR: item.product.prices.SAR * item.quantity,
          YER: item.product.prices.YER * item.quantity,
          USD: item.product.prices.USD * item.quantity,
        })}`
    )
    .join('\n');

  const whatsappCheckoutMsg = encodeURIComponent(
    locale === 'en'
      ? `Hello Dr.Berry, I would like to confirm the following cart order:\n\n${orderDetails}\n\nGrand Total: ${currentSubtotalFormatted}\n\nPlease provide payment details and dispatch confirmation.`
      : `مرحباً د. بيري، أرغب بتأكيد طلب السلة التالي:\n\n${orderDetails}\n\nالإجمالي الكلي: ${currentSubtotalFormatted}\n\nيرجى تزويدي بحساب التحويل والتوصيل.`
  );

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs md:text-sm text-foreground/60 font-medium">
        <Link href="/" className="hover:text-primary transition-colors">
          {tNav('home')}
        </Link>
        <span>/</span>
        <span className="text-primary font-bold">{t('title')}</span>
      </nav>

      <div className="flex justify-between items-center border-b border-cream/80 pb-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-primary font-sans">
            {t('title')}
          </h1>
          <p className="text-xs md:text-sm text-foreground/60 mt-1">
            {t('subtitle')}
          </p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-500 hover:text-red-700 font-bold px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 transition-colors"
          >
            {t('clearCart')}
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 md:p-20 text-center border border-cream/80 shadow-sm space-y-6">
          <div className="w-24 h-24 rounded-full bg-secondary/15 text-primary flex items-center justify-center text-4xl mx-auto">
            🛍️
          </div>
          <h2 className="text-2xl font-black text-foreground">{t('emptyTitle')}</h2>
          <p className="text-sm text-foreground/60 max-w-md mx-auto leading-relaxed">
            {t('emptyDesc')}
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-4 bg-primary text-white rounded-full font-black text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            {t('browseBtn')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const itemTitle = getProductTitle(item.product, locale);
              const itemCategory = getProductCategory(item.product, locale);
              const itemVolume = getProductVolume(item.product, locale);

              return (
                <div
                  key={item.product.id}
                  className="bg-white p-5 md:p-6 rounded-3xl border border-cream/80 shadow-sm flex flex-col sm:flex-row items-center gap-6 justify-between"
                >
                  {/* Image & Title */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-secondary/15 overflow-hidden flex-shrink-0 p-2 flex items-center justify-center">
                      <Image
                        src={item.product.image}
                        alt={itemTitle}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-accent px-2 py-0.5 rounded-full bg-secondary/20">
                        {itemCategory}
                      </span>
                      <Link
                        href={`/products/${item.product.id}`}
                        className="block font-black text-base text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {itemTitle.split('|')[0]}
                      </Link>
                      <span className="text-xs text-foreground/50 block">
                        {itemVolume}
                      </span>
                      <span className="text-xs font-bold text-primary block sm:hidden">
                        {formatPrice(item.product.prices)}
                      </span>
                    </div>
                  </div>

                  {/* Controls & Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-cream/60">
                    {/* Quantity */}
                    <div className="flex items-center border border-cream rounded-2xl bg-background overflow-hidden shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-primary hover:bg-cream/40 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-black text-xs text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-primary hover:bg-cream/40 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-end min-w-[90px]">
                      <span className="text-base font-black text-primary block">
                        {formatPrice({
                          SAR: item.product.prices.SAR * item.quantity,
                          YER: item.product.prices.YER * item.quantity,
                          USD: item.product.prices.USD * item.quantity,
                        })}
                      </span>
                      <span className="text-[10px] text-foreground/50">
                        ({formatPrice(item.product.prices)} {t('perItem')})
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="w-8 h-8 rounded-full text-foreground/40 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                      title={t('clearCart')}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-cream/80 shadow-sm space-y-6 sticky top-28">
            <h3 className="text-lg font-black text-primary border-b border-cream/60 pb-3">
              {t('summary')}
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-foreground/70">
                <span>{t('totalItems')}</span>
                <span className="font-bold text-foreground">
                  {cart.reduce((s, i) => s + i.quantity, 0)} {t('itemsCount')}
                </span>
              </div>
              <div className="flex justify-between text-foreground/70">
                <span>{t('subtotal')}</span>
                <span className="font-bold text-foreground">{currentSubtotalFormatted}</span>
              </div>
              <div className="flex justify-between text-foreground/70">
                <span>{t('delivery')}</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg text-xs">
                  {t('fastDelivery')}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-cream flex justify-between items-center">
              <div>
                <span className="text-xs text-foreground/60 block">{t('grandTotal')}</span>
                <span className="text-2xl font-black text-primary">
                  {currentSubtotalFormatted}
                </span>
              </div>
              <span className="text-[11px] text-foreground/50">{t('currencyLabel')} {currency}</span>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {locale === 'ar' ? 'إتمام الطلب' : 'Proceed to Checkout'}
            </Link>

            {/* Direct WhatsApp Order */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappCheckoutMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-emerald-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all shadow-md shadow-emerald-700/20 active:scale-98"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-1.107-.071-.247-.079-.569-.196-.983-.376-1.75-.762-2.884-2.533-2.971-2.65-.088-.116-.713-.949-.713-1.809 0-.86.449-1.282.609-1.455.159-.173.348-.217.464-.217.116 0 .232.001.333.006.107.005.25.042.39.38.145.348.493 1.202.536 1.29.043.087.073.189.014.305-.058.115-.087.188-.174.29-.087.102-.183.228-.261.306-.087.087-.179.182-.077.357.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.088.276.073.377-.043.102-.116.435-.508.551-.682.116-.174.232-.145.391-.087.159.058 1.014.478 1.188.565.174.088.29.131.333.203.043.073.043.42-.101.825z"/>
              </svg>
              <span>{t('whatsappCheckout')}</span>
            </a>

            <Link
              href="/products"
              className="w-full py-3.5 bg-cream/30 text-primary rounded-2xl font-bold text-xs flex items-center justify-center hover:bg-primary hover:text-white transition-all text-center block"
            >
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
