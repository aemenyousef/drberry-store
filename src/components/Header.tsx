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
  const { currency, setCurrency, cartCount, wishlistCount } = useStore();

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
      <div className="w-full bg-[#521927] text-white text-xs md:text-sm py-2 px-6 lg:px-10 flex justify-between items-center font-medium relative">
        <div className="hidden md:flex gap-4 flex-1 justify-start whitespace-nowrap">
          <span>{tNav('customerSupport')}</span>
          <span className="opacity-40">|</span>
          <span>{tNav('freeShipping')}</span>
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto md:flex-1 justify-center md:justify-end">
          <Link href="/track" className="hover:text-secondary transition-colors text-xs font-bold flex items-center gap-1">
            <span>🚚</span>
            <span>{isRTL ? 'تتبع طلبك' : 'Track Order'}</span>
          </Link>
          <span className="opacity-40">|</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-2 py-0.5 outline-none text-white cursor-pointer font-bold text-xs transition-colors"
          >
            <option className="text-black" value="SAR">SAR (ر.س)</option>
            <option className="text-black" value="YER">YER (ر.ي)</option>
            <option className="text-black" value="USD">USD ($)</option>
          </select>
          <span className="opacity-40">|</span>
          <Link href={pathname} locale={nextLocale} className="hover:text-secondary transition-colors font-bold text-xs">
            {nextLocaleLabel}
          </Link>
        </div>
      </div>

      {/* ===== الهيدر الرئيسي ===== */}
      <header className="w-full py-4 px-6 lg:px-10 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-cream shadow-xs dark:bg-background/95 dark:border-border">

        {/* الشعار */}
        <Link href="/" className="text-3xl md:text-4xl font-black text-primary font-sans tracking-tight hover:opacity-85 transition-opacity flex-shrink-0">
          Dr.Berry
        </Link>

        {/* ===== قائمة التنقل للشاشات الكبيرة ===== */}
        <nav className="hidden lg:flex items-center gap-1 text-foreground/80 font-bold text-sm">
          {/* الرئيسية */}
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl hover:bg-primary/8 hover:text-primary transition-all duration-200"
          >
            {tNav('home')}
          </Link>

          {/* منتجاتنا مع Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onMouseEnter={() => setDropdownOpen(true)}
              className={`flex items-center gap-1 px-3.5 py-2 rounded-xl hover:bg-primary/8 hover:text-primary transition-all duration-200 ${dropdownOpen ? 'text-primary bg-primary/8' : ''}`}
            >
              <span>{tNav('products')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            {dropdownOpen && (
              <div
                onMouseLeave={() => setDropdownOpen(false)}
                className={`absolute top-full mt-2 w-64 bg-white dark:bg-card rounded-2xl shadow-2xl border border-cream/80 dark:border-border p-2 z-50 ${isRTL ? 'right-0' : 'left-0'} animate-in fade-in-0 zoom-in-95 duration-150`}
              >
                <Link
                  href="/products"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/8 text-primary font-black text-xs transition-colors border-b border-cream/50 mb-1"
                >
                  <span>✨</span>
                  <span>{isRTL ? 'عرض جميع المنتجات' : 'View All Products'}</span>
                </Link>

                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={cat.giftsPage ? '/gifts' : (`/products/category/${cat.slug}` as any)}
                    onClick={() => setDropdownOpen(false)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl ${cat.bgHover} transition-colors group`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className={`text-xs font-bold ${cat.color} group-hover:text-primary`}>
                      {tNav(cat.labelKey)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* العروض الخاصة */}
          <Link
            href="/offers"
            className="px-3.5 py-2 rounded-xl hover:bg-primary/8 text-primary font-black transition-all duration-200 flex items-center gap-1"
          >
            <span>⭐</span>
            <span>{isRTL ? 'العروض الحصرية' : 'Offers'}</span>
          </Link>

          {/* الهدايا */}
          <Link
            href="/gifts"
            className="px-3.5 py-2 rounded-xl hover:bg-primary/8 hover:text-primary transition-all duration-200"
          >
            {tNav('gifts')}
          </Link>

          {/* من نحن */}
          <Link
            href="/about"
            className="px-3.5 py-2 rounded-xl hover:bg-primary/8 hover:text-primary transition-all duration-200"
          >
            {tNav('about')}
          </Link>

          {/* تواصل معنا */}
          <Link
            href="/contact"
            className="px-3.5 py-2 rounded-xl hover:bg-primary/8 hover:text-primary transition-all duration-200"
          >
            {isRTL ? 'تواصل معنا' : 'Contact'}
          </Link>
        </nav>

        {/* ===== أيقونات الإجراءات (المفضلة + السلة + الدخول) ===== */}
        <div className="flex items-center gap-2.5">
          {/* المفضلة */}
          <Link
            href="/wishlist"
            className="p-2.5 rounded-full hover:bg-primary/8 transition-colors text-foreground/70 hover:text-rose-600 relative"
            aria-label="Wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={wishlistCount > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={wishlistCount > 0 ? "text-rose-500" : ""}>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -end-1 bg-rose-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* تسجيل الدخول */}
          <Link
            href="/login"
            className="p-2.5 rounded-full hover:bg-primary/8 transition-colors text-foreground/70 hover:text-primary hidden sm:flex items-center gap-1.5 text-xs font-bold"
            aria-label="Account"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="hidden xl:inline">{locale === 'ar' ? 'حسابي' : 'Account'}</span>
          </Link>

          {/* سلة المشتريات */}
          <Link
            href="/cart"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all shadow-md group relative text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            <span className="hidden sm:inline">{tNav('cart')}</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -end-1.5 bg-accent text-white font-black text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
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
              className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-primary/8 font-bold text-base transition-colors">
              🏠 {tNav('home')}
            </Link>
            <Link href="/products" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-primary/8 font-bold text-base transition-colors">
              🛍️ {tNav('products')}
            </Link>
            <Link href="/offers" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 text-amber-900 font-bold text-base transition-colors">
              ⭐ {isRTL ? 'العروض الحصرية' : 'Offers'}
            </Link>
            <Link href="/track" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-primary/8 font-bold text-base text-secondary transition-colors">
              🚚 {isRTL ? 'تتبع الطلب' : 'Track Order'}
            </Link>
            <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-primary/8 font-bold text-base text-rose-500 transition-colors">
              ❤️ {isRTL ? 'المفضلة' : 'Wishlist'} ({wishlistCount})
            </Link>

            {/* الفئات في الموبايل */}
            <div className="ms-4 border-s-2 border-primary/20 ps-4 space-y-1 my-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={cat.giftsPage ? '/gifts' : (`/products/category/${cat.slug}` as any)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl ${cat.bgHover} font-semibold text-sm transition-colors`}
                >
                  <span>{cat.icon}</span>
                  <span className={cat.color}>{tNav(cat.labelKey)}</span>
                </Link>
              ))}
            </div>

            <Link href="/about" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-primary/8 font-bold text-base transition-colors">
              ℹ️ {tNav('about')}
            </Link>
            <Link href="/gifts" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-rose-50 font-bold text-base text-rose-500 transition-colors">
              🎁 {tNav('gifts')}
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-primary/8 font-bold text-base transition-colors">
              💬 {isRTL ? 'تواصل معنا' : 'Contact Us'}
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-primary/8 font-bold text-base transition-colors">
              👤 {isRTL ? 'تسجيل الدخول / حسابي' : 'Sign In / Account'}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}