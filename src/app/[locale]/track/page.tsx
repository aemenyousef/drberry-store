'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useStore } from '@/contexts/StoreContext';

type OrderStatus = 'pending_payment' | 'receipt_uploaded' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'whatsapp_lead';

interface TrackedOrder {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  country: string;
  governorate: string;
  address_details: string;
  shipping_method: string;
  shipping_cost_yer: number;
  payment_method: string;
  currency_used: string;
  total_yer: number;
  total_sar?: number;
  total_usd?: number;
  status: OrderStatus;
  items: Array<{
    id: string;
    title: string;
    volume?: string;
    quantity: number;
    price: number;
  }>;
  created_at: string;
}

export default function TrackOrderPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { formatPrice } = useStore();

  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch(
        `/api/orders?lookup=1&orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(
          phone.trim()
        )}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || (isRTL ? 'لم يتم العثور على طلب مطابق للبيانات المدخلة.' : 'No matching order found.'));
      } else {
        setOrder(data.order);
      }
    } catch {
      setError(isRTL ? 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً.' : 'Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
      case 'whatsapp_lead':
        return 0;
      case 'receipt_uploaded':
        return 1;
      case 'confirmed':
        return 2;
      case 'processing':
        return 3;
      case 'shipped':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 0;
    }
  };

  const statusSteps = [
    { titleAr: 'تم استلام الطلب', titleEn: 'Order Received', descAr: 'سُجل الطلب بنجاح في النظام', descEn: 'Logged in system' },
    { titleAr: 'مراجعة الدفع', titleEn: 'Payment Review', descAr: 'تدقيق الإشعار البنكي والاعتماد', descEn: 'Receipt verification' },
    { titleAr: 'تم التأكيد', titleEn: 'Confirmed', descAr: 'تم التحقق وتأكيد توفر المنتجات', descEn: 'Order confirmed' },
    { titleAr: 'التجهيز والتغليف', titleEn: 'Packaging', descAr: 'تغليف طبي فاخر ومحكم', descEn: 'Medical packaging' },
    { titleAr: 'قيد الشحن', titleEn: 'Shipped', descAr: 'مع المندوب أو شركة التوصيل', descEn: 'With courier' },
    { titleAr: 'تم التسليم', titleEn: 'Delivered', descAr: 'وصلت الشحنة للعميل بنجاح', descEn: 'Successfully delivered' },
  ];

  return (
    <div className="min-h-screen bg-background py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-accent bg-secondary/15 px-4 py-1.5 rounded-full inline-block">
            {isRTL ? 'تتبع فوري ومباشر 24/7' : 'Live Order Tracking 24/7'}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-primary font-sans">
            {isRTL ? 'أين أصبحت شحنتك؟' : 'Track Your Shipment'}
          </h1>
          <p className="text-sm md:text-base text-foreground/70 max-w-lg mx-auto">
            {isRTL
              ? 'أدخل رقم الطلب ورقم الهاتف المسجل عند الشراء للاطلاع على الحالة الدقيقة ومسار التوصيل لحظة بلحظة.'
              : 'Enter your order number and registered phone number to view live status updates and delivery timeline.'}
          </p>
        </div>

        {/* Search Form Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-cream shadow-primary/5">
          <form onSubmit={handleLookup} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80">
                {isRTL ? 'رقم الطلب *' : 'Order Number *'}
              </label>
              <input
                type="text"
                required
                placeholder={isRTL ? 'مثال: DRB-847291' : 'e.g. DRB-847291'}
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-cream bg-background/50 focus:bg-white focus:border-primary outline-none text-sm font-semibold transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80">
                {isRTL ? 'رقم الهاتف (للتحقق)' : 'Phone Number (Verification)'}
              </label>
              <input
                type="tel"
                placeholder={isRTL ? 'مثال: 771234567' : 'e.g. 771234567'}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-cream bg-background/50 focus:bg-white focus:border-primary outline-none text-sm font-semibold transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <span>{isRTL ? 'جارٍ البحث...' : 'Searching...'}</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>{isRTL ? 'تتبع الطلب' : 'Track Order'}</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold text-center">
              {error}
            </div>
          )}
        </div>

        {/* Order Details & Timeline Result */}
        {order && (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl border border-cream space-y-8 animate-fade-in">
            {/* Top Order Overview Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-cream">
              <div>
                <span className="text-xs text-foreground/50 font-bold block">
                  {isRTL ? 'رقم الطلب' : 'Order ID'}
                </span>
                <span className="text-2xl font-black text-primary font-mono tracking-tight">
                  {order.order_number}
                </span>
                <span className="text-xs text-foreground/40 block mt-1">
                  {new Date(order.created_at).toLocaleDateString(isRTL ? 'ar-YE' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="text-end">
                <span className="text-xs text-foreground/50 font-bold block">
                  {isRTL ? 'الإجمالي النهائي' : 'Total Amount'}
                </span>
                <span className="text-2xl font-black text-accent">
                  {order.currency_used === 'SAR' && order.total_sar
                    ? `${order.total_sar.toLocaleString()} ر.س`
                    : `${order.total_yer.toLocaleString()} ر.ي`}
                </span>
                <span className="text-xs text-emerald-600 font-bold block mt-1">
                  {order.payment_method === 'bank_transfer'
                    ? (isRTL ? 'تحويل بنكي' : 'Bank Transfer')
                    : order.payment_method === 'whatsapp'
                    ? (isRTL ? 'اتفاق عبر الواتساب' : 'WhatsApp Inquiry')
                    : (isRTL ? 'الدفع عند الاستلام' : 'Cash on Delivery')}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-primary">
                {isRTL ? 'مراحل شحنتك' : 'Shipment Timeline'}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {statusSteps.map((step, idx) => {
                  const currentIdx = getStatusStepIndex(order.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-primary text-white border-primary shadow-lg scale-102 ring-4 ring-secondary/30'
                          : isDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-background/40 border-cream/80 text-foreground/40 opacity-70'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                          isCurrent
                            ? 'bg-white text-primary'
                            : isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-cream text-foreground/40'
                        }`}
                      >
                        {isDone && !isCurrent ? '✓' : idx + 1}
                      </div>
                      <h4 className="font-bold text-xs leading-tight mb-1">
                        {isRTL ? step.titleAr : step.titleEn}
                      </h4>
                      <p className={`text-[10px] leading-tight ${isCurrent ? 'text-white/80' : 'opacity-70'}`}>
                        {isRTL ? step.descAr : step.descEn}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Products List & Shipping Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-cream">
              {/* Items Card */}
              <div className="bg-background/40 p-5 rounded-2xl border border-cream space-y-3">
                <h4 className="font-bold text-sm text-primary">
                  {isRTL ? 'محتويات الشحنة' : 'Package Contents'}
                </h4>
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-cream/50 last:border-0">
                      <div>
                        <span className="font-bold text-foreground">{item.title}</span>
                        {item.volume && <span className="text-foreground/50 block">({item.volume})</span>}
                      </div>
                      <div className="font-bold text-primary">
                        × {item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address & Help */}
              <div className="bg-background/40 p-5 rounded-2xl border border-cream space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-primary mb-2">
                    {isRTL ? 'عنوان التسليم والعميل' : 'Delivery Address'}
                  </h4>
                  <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                    👤 {order.customer_name} ({order.customer_phone})<br />
                    📍 {order.country} - {order.governorate} {order.address_details ? `(${order.address_details})` : ''}<br />
                    🚚 {order.shipping_method || (isRTL ? 'توصيل مباشر' : 'Standard Delivery')}
                  </p>
                </div>

                <a
                  href={`https://wa.me/967770000000?text=${encodeURIComponent(
                    `مرحباً، أستفسر عن شحنتي رقم ${order.order_number}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <span>💬</span>
                  <span>{isRTL ? 'تواصل مع الدعم بشأن هذا الطلب' : 'Chat Support about this Order'}</span>
                </a>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}