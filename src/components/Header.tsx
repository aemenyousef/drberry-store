"use client";

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useStore, Currency } from '@/contexts/StoreContext';

interface CategoryItem {
  slug: string;
  icon: string;
  color: string;
  bgHover: string;
  labelKey: 'hairCareNav' | 'bodyCareNav' | 'skinCareNav' | 'whiteningCareNav' | 'giftsNav';
  giftsPage?: boolean;
}

const CATEGORIES: CategoryItem[] = [
  { slug: 'hair',       icon: '🌿', color: 'text-emerald-600', bgHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40', labelKey: 'hairCareNav'      },
  { slug: 'body',       icon: '💧', color: 'text-violet-600',  bgHover: 'hover:bg-violet-50 dark:hover:bg-violet-950/40',   labelKey: 'bodyCareNav'      },
  { slug: 'skin',       icon: '🌸', color: 'text-rose-600',    bgHover: 'hover:bg-rose-50 dark:hover:bg-rose-950/40',       labelKey: 'skinCareNav'      },
  { slug: 'whitening',  icon: '✨', color: 'text-amber-600',   bgHover: 'hover:bg-amber-50 dark:hover:bg-amber-950/40',     labelKey: 'whiteningCareNav' },
  { slug: 'gifts',      icon: '🎁', color: 'text-pink-600',    bgHover: 'hover:bg-pink-50 dark:hover:bg-pink-950/40',       labelKey: 'giftsNav', giftsPage: true },
];

export default function Header() {
  const tNav = useTranslations('Navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const { currency, setCurrency, cartCount } = useStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const nextLocale = locale === 'ar' ? 'en' : 'ar';
  const nextLocaleLabel = locale === 'ar' ? 'English' : 'العربية';
  const isRTL = locale === 'ar';

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* ===== شريط الإعلانات العلوي ===== */}
      <div className="w-full bg-primary text-white text-xs md:text-sm py-2 px-8 flex justify-between items-center font-medium relative">
        <div className="hidden md:block flex-1" />
        <div className="hidden md:flex gap-4 flex-1 justify-center whitespace-nowrap">
          <span>{tNav('customerSupport')}</span>
          <span className="opacity-50">|</span>
          <span>{tNav('freeShipping')}</span>
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto md:flex-1 justify-center md:justify-end">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-2 py-1 outline-none text-white cursor-pointer font-bold text-xs transition-colors"
          >
            <option className="text-black" value="SAR">SAR (ر.س)</option>
            <option className="text-black" value="YER">YER (ر.ي)</option>
            <option className="text-black" value="USD">USD ($)</option>
          </select>
          <span className="opacity-50">|</span>
          <Link href={pathname} locale={nextLocale} className="hover:text-secondary transition-colors font-bold">
            {nextLocaleLabel}
          </Link>
        </div>
      </div>

      {/* ===== الهيدر الرئيسي ===== */}
      <header className="w-full py-4 px-6 lg:px-10 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-cream shadow-sm dark:bg-background/95 dark:border-border">

        {/* الشعار */}
        <Link href="/" className="text-3xl md:text-4xl font-black text-primary font-sans tracking-tight hover:opacity-80 transition-opacity flex-shrink-0">
          Dr.Berry
        </Link>

        {/* ===== قائمة التنقل للشاشات الكبيرة ===== */}
        <nav className="hidden lg:flex items-center gap-1 text-foreground/80 font-semibold">
          {/* الرئيسية */}
          <Link
            href="/"
            className="px-4 py-2 rounded-xl hover:bg-primary/8 hover:text-primary transition-all duration-200"
          >
            {tNav('home')}
          </Link>

          {/* منتجاتنا مع Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onMouseEnter={() => setDropdownOpen(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-primary/8 hover:text-primary transition-all duration-200 ${dropdownOpen ? 'text-primary bg-primary/8' : ''}`}
            >
              {tNav('products')}
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* القائمة المنسدلة */}
            {dropdownOpen && (
              <div
                onMouseLeave={() => setDropdownOpen(false)}
                className={`absolute top-full mt-2 ${isRTL ? 'right-0' : 'left-0'} w-72 bg-white dark:bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200`}
              >
                {/* رأس القائمة */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-5 py-3 border-b border-border">
                  <p className="text-xs font-bold text-primary/70 uppercase tracking-widest">
                    {tNav('categories')}
                  </p>
                </div>

                {/* عرض جميع المنتجات */}
                <Link
                  href="/products"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-primary/5 transition-colors border-b border-border/50 group"
                >
                  <span className="text-xl">🛍️</span>
                  <div>
                    <p className="font-bold text-primary text-sm group-hover:text-accent transition-colors">
                      {tNav('products')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {locale === 'ar' ? 'جميع مستحضراتنا' : 'All our products'}
                    </p>
                  </div>
                  <span className={`ms-auto text-muted-foreground group-hover:text-accent transition-colors ${isRTL ? 'rotate-180' : ''}`}>→</span>
                </Link>

                {/* الفئات */}
                <div className="py-2">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={cat.giftsPage ? '/gifts' : (`/products/category/${cat.slug}` as any)}
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center gap-3 px-5 py-3 ${cat.bgHover} transition-colors group`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className={`font-semibold text-sm ${cat.color} group-hover:opacity-90`}>
                        {tNav(cat.labelKey)}
                      </span>
                      <span className={`ms-auto text-muted-foreground/50 group-hover:text-current transition-colors ${isRTL ? 'rotate-180' : ''}`}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* من نحن */}
          <Link
            href={"/about" as any}
            className="px-4 py-2 rounded-xl hover:bg-primary/8 hover:text-primary transition-all duration-200"
          >
            {tNav('about')}
          </Link>

          {/* الهدايا */}
          <Link
            href={"/gifts" as any}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-all duration-200 text-rose-500"
          >
            🎁 {tNav('gifts')}
          </Link>
        </nav>

        {/* ===== الأيقونات اليمنى ===== */}
        <div className="flex items-center gap-3 text-primary">
          {/* بحث */}
          <Link href="/products" className="hover:text-accent transition-colors p-2 rounded-xl hover:bg-primary/8" title={tNav('search')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </Link>

          {/* حساب / تسجيل الدخول */}
          <Link
            href={"/login" as any}
            className="hover:text-accent transition-colors hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-primary/8 font-semibold text-sm"
            title={locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="hidden xl:inline">{locale === 'ar' ? 'دخول' : 'Sign In'}</span>
          </Link>

          {/* سلة المشتريات */}
          <Link
            href="/cart"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all shadow-md group relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            <span className="hidden sm:inline">{tNav('cart')}</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -end-2 bg-accent text-white font-black text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* زر القائمة للموبايل */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-primary/8 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen
                ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>
                : <><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </header>

      {/* ===== قائمة الموبايل ===== */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[108px] bg-background/98 backdrop-blur-lg z-40 overflow-y-auto border-t border-border">
          <nav className="flex flex-col p-6 gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-4 rounded-2xl hover:bg-primary/8 font-bold text-lg transition-colors">
              🏠 {tNav('home')}
            </Link>
            <Link href="/products" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-4 rounded-2xl hover:bg-primary/8 font-bold text-lg transition-colors">
              🛍️ {tNav('products')}
            </Link>

            {/* الفئات في الموبايل */}
            <div className="ms-4 border-s-2 border-primary/20 ps-4 space-y-1 my-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={cat.giftsPage ? '/gifts' : (`/products/category/${cat.slug}` as any)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl ${cat.bgHover} font-semibold text-base transition-colors`}
                >
                  <span>{cat.icon}</span>
                  <span className={cat.color}>{tNav(cat.labelKey)}</span>
                </Link>
              ))}
            </div>

            <Link href={"/about" as any} onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-4 rounded-2xl hover:bg-primary/8 font-bold text-lg transition-colors">
              ℹ️ {tNav('about')}
            </Link>
            <Link href={"/gifts" as any} onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-4 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-lg text-rose-500 transition-colors">
              🎁 {tNav('gifts')}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
