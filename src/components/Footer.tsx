'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <footer className="w-full bg-[#4a1622] text-white mt-auto border-t border-white/10">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Col 1 & 2: Brand Info */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="text-3xl font-black font-sans tracking-tight text-white hover:opacity-90 inline-block">
            Dr.Berry
          </Link>
          <p className="text-xs text-white/75 leading-relaxed max-w-sm">
            {isRTL
              ? 'المتجر الرسمي لعلامة د. بيري للمستحضرات الطبية التجميلية والعناية الفائقة بالشعر والبشرة. مصنعة وفق أعلى معايير الجودة الصيدلانية.'
              : 'Official Dr.Berry medical cosmetic store for advanced hair and skin care. Formulated according to the highest pharmaceutical quality standards.'}
          </p>

          <div className="pt-2 flex items-center gap-3 text-xs text-secondary font-bold">
            <span>🛡️ {isRTL ? 'منتجات أصلية 100%' : '100% Authentic'}</span>
            <span>•</span>
            <span>🌿 {isRTL ? 'خالٍ من البارابين' : 'Paraben Free'}</span>
          </div>

          <div className="pt-2">
            <span className="text-[11px] text-white/50 block mb-1">
              {isRTL ? 'حسابات التحويل المعتمدة:' : 'Accepted Bank Accounts:'}
            </span>
            <div className="flex flex-wrap gap-2 text-[10px] text-white/80 font-mono">
              <span className="bg-white/10 px-2 py-1 rounded">بنك الكريمي</span>
              <span className="bg-white/10 px-2 py-1 rounded">جوالي / ون كاش</span>
              <span className="bg-white/10 px-2 py-1 rounded">الراجحي (السعودية)</span>
              <span className="bg-white/10 px-2 py-1 rounded">بنك مسقط (عُمان)</span>
            </div>
          </div>
        </div>

        {/* Col 3: Shopping */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-secondary uppercase tracking-wider">
            {isRTL ? 'التسوق والأقسام' : 'Shop & Collections'}
          </h4>
          <ul className="space-y-2 text-xs text-white/80 font-medium">
            <li>
              <Link href="/products" className="hover:text-secondary transition-colors block">
                {isRTL ? 'جميع المنتجات' : 'All Products'}
              </Link>
            </li>
            <li>
              <Link href="/products/category/hair" className="hover:text-secondary transition-colors block">
                {isRTL ? 'عناية بالشعر (Coco Therapy)' : 'Hair Care'}
              </Link>
            </li>
            <li>
              <Link href="/products/category/whitening" className="hover:text-secondary transition-colors block">
                {isRTL ? 'التفتيح والنضارة (Beauty Bomb)' : 'Whitening Care'}
              </Link>
            </li>
            <li>
              <Link href="/offers" className="hover:text-secondary transition-colors block text-amber-300 font-bold">
                {isRTL ? 'العروض الحصرية والبكجات ⭐' : 'Special Offers ⭐'}
              </Link>
            </li>
            <li>
              <Link href="/gifts" className="hover:text-secondary transition-colors block">
                {isRTL ? 'خدمة تغليف الهدايا 🎁' : 'Gift Service 🎁'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Customer Care */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-secondary uppercase tracking-wider">
            {isRTL ? 'خدمة العملاء' : 'Customer Care'}
          </h4>
          <ul className="space-y-2 text-xs text-white/80 font-medium">
            <li>
              <Link href="/track" className="hover:text-secondary transition-colors block font-bold text-secondary">
                {isRTL ? 'تتبع الطلب والشحنة 🚚' : 'Track Order 🚚'}
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-secondary transition-colors block">
                {isRTL ? 'قائمة المفضلة ❤️' : 'My Wishlist ❤️'}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-secondary transition-colors block">
                {isRTL ? 'تواصل معنا والأسئلة الشائعة' : 'Contact & FAQs'}
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-secondary transition-colors block">
                {isRTL ? 'قصة د. بيري ومعاييرنا' : 'About Dr.Berry'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 5: Direct Contact */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-secondary uppercase tracking-wider">
            {isRTL ? 'تواصل مباشر' : 'Contact Us'}
          </h4>
          <div className="space-y-2 text-xs text-white/80 font-medium">
            <p className="flex items-center gap-2">
              <span>📱</span>
              <span dir="ltr">+967 770 000 000</span>
            </p>
            <p className="flex items-center gap-2">
              <span>💬</span>
              <a
                href="https://wa.me/967770000000"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary underline"
              >
                {isRTL ? 'واتساب الدعم السريع' : 'WhatsApp Support'}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <span>📍</span>
              <span>صنعاء / عدن / دول الخليج</span>
            </p>
            <div className="pt-2">
              <Link
                href="/admin"
                className="text-[10px] text-white/40 hover:text-white transition-colors block"
              >
                {isRTL ? 'بوابة إدارة المتجر 🔒' : 'Admin Portal 🔒'}
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6 px-6 text-center text-xs text-white/50">
        <p>
          © {new Date().getFullYear()} Dr.Berry Laboratories. {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved.'}
        </p>
      </div>
    </footer>
  );
}