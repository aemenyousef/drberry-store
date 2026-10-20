'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';

export default function ContactPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = isRTL
      ? `📩 *رسالة واستفسار جديد من متجر Dr.Berry*\n\n` +
        `👤 *الاسم:* ${form.name}\n` +
        `📱 *الهاتف:* ${form.phone}\n` +
        `📌 *الموضوع:* ${form.subject}\n` +
        `💬 *الرسالة:*\n${form.message}`
      : `📩 *New Contact Message - Dr.Berry*\n\n` +
        `👤 *Name:* ${form.name}\n` +
        `📱 *Phone:* ${form.phone}\n` +
        `📌 *Subject:* ${form.subject}\n` +
        `💬 *Message:*\n${form.message}`;

    window.open(`https://wa.me/967770000000?text=${encodeURIComponent(text)}`, '_blank');
    setSubmitted(true);
  };

  const faqs = [
    {
      qAr: 'هل منتجات د. بيري آمنة للحوامل والمرضعات؟',
      qEn: 'Are Dr.Berry products safe during pregnancy and nursing?',
      aAr: 'نعم، جميع مستحضراتنا مصنعة وفق أشد المعايير الصيدلانية العالمية، وخالية تماماً من البارابين، الزئبق، الكورتيزون، والمواد الضارة. ننصح دائماً بمراجعة مكونات المنتج المكتوبة في كل عبوة.',
      aEn: 'Yes, our formulations adhere to strict pharmaceutical standards and are 100% free of parabens, mercury, and cortisone.',
    },
    {
      qAr: 'كم تستغرق مدة شحن وتوصيل الطلبات؟',
      qEn: 'How long does delivery take?',
      aAr: 'التوصيل داخل صنعاء وعدن يتم خلال 24 ساعة فقط. باقي المحافظات اليمنية يستغرق 2 إلى 3 أيام عمل عبر مكاتب الشحن المعتمدة. للشحن لدول الخليج يستغرق من 4 إلى 7 أيام عمل.',
      aEn: 'Orders within Sana’a & Aden are delivered within 24 hours. Other governorates take 2-3 business days. Gulf shipping takes 4-7 business days.',
    },
    {
      qAr: 'ما هي طرق الدفع البنكية المتاحة؟',
      qEn: 'What payment methods are supported?',
      aAr: 'نوفر الدفع عبر حساب بنك الكريمي، محفظة جوالي، جيب، ون كاش، الحسابات السعودية (الراجحي، الأهلي)، بنك مسقط، بالإضافة إلى خيار الدفع عند الاستلام داخل المدن الرئيسية.',
      aEn: 'We accept Kuraimi Bank, Jawwali, Jeeb, OneCash, Saudi bank transfers (Al Rajhi), Bank Muscat, and Cash on Delivery in major cities.',
    },
    {
      qAr: 'هل يمكنني إرجاع أو استبدال المنتج في حال وجود تلف؟',
      qEn: 'Can I return or exchange a product if damaged?',
      aAr: 'بالتأكيد. نضمن سلامة كل منتج يخرج من مستودعاتنا الطبية بنسبة 100%. في حال وصلك المنتج بأي تلف أثناء الشحن يتم استبداله فوراً بدون أي تكلفة إضافية.',
      aEn: 'Absolutely. We guarantee 100% item integrity and provide instant free replacement for any shipment damage.',
    },
  ];

  return (
    <div className="min-h-screen bg-background py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-accent bg-secondary/15 px-4 py-1.5 rounded-full inline-block">
            {isRTL ? 'خدمة العملاء والاستشارات الطبية' : 'Customer Service & Inquiries'}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-primary font-sans">
            {isRTL ? 'نحن هنا لمساعدتك دائماً' : 'We Are Here to Help'}
          </h1>
          <p className="text-sm md:text-base text-foreground/70 max-w-lg mx-auto">
            {isRTL
              ? 'يسعد فريق صيادلة وخبراء د. بيري الرد على جميع أسئلتكم ومساعدتكم في اختيار الروتين الطبي الأنسب لكم.'
              : 'Our pharmaceutical care team is ready to assist you with inquiries and personalized routine recommendations.'}
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="https://wa.me/967770000000"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-8 rounded-3xl border border-cream shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all text-center space-y-3 group"
          >
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              💬
            </div>
            <h3 className="font-bold text-lg text-primary">
              {isRTL ? 'محادثة واتساب فورية' : 'Instant WhatsApp'}
            </h3>
            <p className="text-xs text-foreground/60 leading-relaxed">
              {isRTL ? 'رد سريع من الأخصائيين على مدار الساعة' : 'Fast response around the clock'}
            </p>
            <span className="inline-block text-xs font-black text-emerald-600 pt-2 underline">
              +967 770 000 000
            </span>
          </a>

          <div className="bg-white p-8 rounded-3xl border border-cream shadow-sm hover:shadow-xl transition-all text-center space-y-3">
            <div className="w-14 h-14 bg-secondary/20 text-primary rounded-2xl mx-auto flex items-center justify-center text-2xl">
              📍
            </div>
            <h3 className="font-bold text-lg text-primary">
              {isRTL ? 'المقر والتوزيع الرسمي' : 'Official Headquarters'}
            </h3>
            <p className="text-xs text-foreground/60 leading-relaxed">
              {isRTL ? 'صنعاء - شارع حدة / عدن - المعلا' : 'Sana’a - Hadda St / Aden - Mualla'}
            </p>
            <span className="inline-block text-xs font-bold text-primary pt-2">
              {isRTL ? 'شحن وتوصيل لجميع المحافظات ودول الخليج' : 'Shipping across all governorates & GCC'}
            </span>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-cream shadow-sm hover:shadow-xl transition-all text-center space-y-3">
            <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl mx-auto flex items-center justify-center text-2xl">
              ⏰
            </div>
            <h3 className="font-bold text-lg text-primary">
              {isRTL ? 'أوقات العمل واستقبال الطلبات' : 'Working Hours'}
            </h3>
            <p className="text-xs text-foreground/60 leading-relaxed">
              {isRTL ? 'السبت - الخميس: 9:00 ص - 10:00 م' : 'Sat - Thu: 9:00 AM - 10:00 PM'}
            </p>
            <span className="inline-block text-xs font-bold text-violet-700 pt-2">
              {isRTL ? 'الطلبات الإلكترونية متاحة 24/7' : 'Online Orders accepted 24/7'}
            </span>
          </div>
        </div>

        {/* Message Form & Direct Help */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Form */}
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-cream shadow-xl space-y-6">
            <div>
              <h3 className="text-2xl font-black text-primary font-sans">
                {isRTL ? 'أرسل لنا استفسارك' : 'Send us a Message'}
              </h3>
              <p className="text-xs text-foreground/60 mt-1">
                {isRTL ? 'سيتم تحويل رسالتك مباشرة لفريق الدعم' : 'Your message will be sent directly to our support team'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground/80">{isRTL ? 'الاسم الكريم *' : 'Your Name *'}</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={isRTL ? 'اسمك' : 'Name'}
                    className="w-full px-4 py-2.5 rounded-xl border border-cream bg-background/50 focus:bg-white focus:border-primary outline-none text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground/80">{isRTL ? 'رقم الهاتف *' : 'Phone Number *'}</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder={isRTL ? '77XXXXXXX' : 'Phone'}
                    className="w-full px-4 py-2.5 rounded-xl border border-cream bg-background/50 focus:bg-white focus:border-primary outline-none text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground/80">{isRTL ? 'الموضوع' : 'Subject'}</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={isRTL ? 'مثال: استفسار عن منتج Coco Therapy' : 'e.g. Question about Coco Therapy'}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream bg-background/50 focus:bg-white focus:border-primary outline-none text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground/80">{isRTL ? 'الرسالة أو الاستفسار *' : 'Message *'}</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={isRTL ? 'اكتبي استفسارك هنا بالتفصيل...' : 'Write your inquiry here...'}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream bg-background/50 focus:bg-white focus:border-primary outline-none text-xs font-semibold resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 text-xs transition-all flex items-center justify-center gap-2"
              >
                <span>💬</span>
                <span>{isRTL ? 'إرسال الرسالة عبر الواتساب' : 'Send via WhatsApp'}</span>
              </button>
            </form>
          </div>

          {/* FAQs */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-primary font-sans">
                {isRTL ? 'الأسئلة الأكثر شيوعاً' : 'Frequently Asked Questions'}
              </h3>
              <p className="text-xs text-foreground/60 mt-1">
                {isRTL ? 'إجابات مباشرة على أهم الاستفسارات الطبية والتوصيل' : 'Quick answers to common questions'}
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-cream overflow-hidden transition-all shadow-sm"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-4 text-start font-bold text-sm text-foreground flex justify-between items-center gap-4 hover:bg-cream/20 transition-colors"
                    >
                      <span>{isRTL ? faq.qAr : faq.qEn}</span>
                      <span className="text-primary font-black text-lg">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4 pt-1 text-xs text-foreground/75 leading-relaxed border-t border-cream/50 bg-background/30">
                        {isRTL ? faq.aAr : faq.aEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}