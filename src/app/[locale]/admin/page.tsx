'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';

// Types
type TabType = 'overview' | 'orders' | 'receipts' | 'products' | 'customers' | 'settings';

type MetricData = {
  totalRevenueYER: number;
  totalRevenueSAR: number;
  totalOrdersCount: number;
  webOrdersCount: number;
  whatsappLeadsCount: number;
  pendingOrdersCount: number;
  deliveredOrdersCount: number;
  pendingReceiptsCount: number;
  totalProductsCount: number;
  inStockProductsCount: number;
};

type OrderRecord = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  country: string;
  governorate: string;
  city_or_area?: string;
  address_details?: string;
  shipping_method?: string;
  shipping_cost_yer?: number;
  payment_method: string;
  receipt_image_url?: string;
  total_yer: number;
  total_sar?: number;
  total_usd?: number;
  currency_used: string;
  items: Array<{
    id: string;
    title: string;
    volume?: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  status: string;
  tracking_code?: string;
  notes?: string;
  created_at: string;
};

type ReceiptRecord = {
  id: number;
  order_id: string;
  receipt_image_url: string;
  review_status: 'pending' | 'approved' | 'rejected';
  review_notes?: string;
  created_at: string;
};

type ProductRecord = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  category: string;
  price_yer: number;
  price_sar: number;
  price_usd: number;
  image: string;
  in_stock: boolean;
  badge_ar?: string;
  rating?: number;
  reviews_count?: number;
};

type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  governorate?: string;
  total_orders: number;
  total_spent_yer: number;
  loyalty_points: number;
  created_at: string;
};

export default function AdminDashboardPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // ─── Authentication State ──────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ─── Dashboard Navigation & Sound ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastOrderTimestamp, setLastOrderTimestamp] = useState<string>('');

  // ─── Data States ───────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);

  // ─── Filters & Search ──────────────────────────────────────────────────────
  const [orderFilter, setOrderFilter] = useState<'all' | 'web' | 'whatsapp' | 'pending' | 'confirmed' | 'shipped' | 'delivered'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // ─── Modals ────────────────────────────────────────────────────────────────
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // ─── Audio Tone for New Orders ─────────────────────────────────────────────
  const playBellSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15); // A6
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {}
  };

  // ─── Initial Auth Check ────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin?action=check_auth')
      .then((r) => r.json())
      .then((data) => {
        setIsAuthenticated(Boolean(data?.authenticated));
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  // ─── Login Handler ─────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setIsLoggingIn(true);
    setPinError('');

    try {
      const res = await fetch('/api/admin?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pinInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'رمز الدخول غير صحيح');
      }
      setIsAuthenticated(true);
      setPinInput('');
      showToast('مرحباً بك في لوحة تحكم د. بيري السحابية 🌿');
    } catch (err: any) {
      setPinError(err.message || 'رمز الدخول غير صحيح');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ─── Logout Handler ────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await fetch('/api/admin?action=logout', { method: 'POST' });
    setIsAuthenticated(false);
    showToast('تم تسجيل الخروج بأمان');
  };

  // ─── Fetch Active Section Data ─────────────────────────────────────────────
  const loadDashboardData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);

    try {
      if (activeTab === 'overview') {
        const res = await fetch('/api/admin?action=overview');
        const data = await res.json();
        if (data.success) {
          setMetrics(data.metrics);
          setOrders(data.latestOrders || []);
          setReceipts(data.latestReceipts || []);

          // Check if new order arrived for sound notification
          if (data.latestOrders?.length > 0) {
            const newest = data.latestOrders[0];
            if (lastOrderTimestamp && newest.created_at !== lastOrderTimestamp) {
              playBellSound();
              showToast(`🔔 وصول طلب جديد: #${newest.order_number}`);
            }
            setLastOrderTimestamp(newest.created_at);
          }
        }
      } else if (activeTab === 'orders') {
        const res = await fetch('/api/admin?action=orders&limit=100');
        const data = await res.json();
        if (data.success) setOrders(data.orders || []);
      } else if (activeTab === 'receipts') {
        const res = await fetch('/api/admin?action=receipts');
        const data = await res.json();
        if (data.success) setReceipts(data.receipts || []);
      } else if (activeTab === 'products') {
        const res = await fetch('/api/admin?action=products');
        const data = await res.json();
        if (data.success) setProducts(data.products || []);
      } else if (activeTab === 'customers') {
        const res = await fetch('/api/admin?action=customers');
        const data = await res.json();
        if (data.success) setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [isAuthenticated, activeTab]);

  // Periodic Polling for live orders stream (every 25 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (activeTab === 'overview' || activeTab === 'orders') {
        loadDashboardData();
      }
    }, 25000);
    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab, lastOrderTimestamp, soundEnabled]);

  // ─── Order Actions ─────────────────────────────────────────────────────────
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch('/api/admin?action=order_status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update in state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`تم تحديث حالة الطلب إلى (${newStatus}) بنجاح ✓`);
    } catch (err: any) {
      alert(err.message || 'فشل التحديث');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ─── Receipt Actions ───────────────────────────────────────────────────────
  const handleReviewReceipt = async (receiptId: number, orderId: string, reviewStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin?action=review_receipt', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptId, orderId, reviewStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update receipts state
      setReceipts((prev) =>
        prev.map((r) => (r.id === receiptId ? { ...r, review_status: reviewStatus } : r))
      );
      showToast(reviewStatus === 'approved' ? 'تم اعتماد سند الدفع وتأكيد الطلب ✓' : 'تم رفض السند');
    } catch (err: any) {
      alert(err.message || 'فشلت العملية');
    }
  };

  // ─── Product Stock Toggle ──────────────────────────────────────────────────
  const handleToggleStock = async (prod: ProductRecord) => {
    const updatedStock = !prod.in_stock;
    try {
      const res = await fetch('/api/admin?action=product_quick_edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: prod.id, in_stock: updatedStock }),
      });
      if (!res.ok) throw new Error('فشل تحديث المخزون');

      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, in_stock: updatedStock } : p))
      );
      showToast(updatedStock ? `أصبح المنتج (${prod.name_ar}) متوفراً في المتجر ✓` : `تم تعيين المنتج (${prod.name_ar}) كنافد من المخزون`);
    } catch {
      alert('تعذر تحديث حالة المخزون');
    }
  };

  // ─── Filtered Orders Memo ──────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Channel or status filter
      if (orderFilter === 'web' && (o.status === 'whatsapp_lead' || o.payment_method === 'whatsapp')) return false;
      if (orderFilter === 'whatsapp' && !(o.status === 'whatsapp_lead' || o.payment_method === 'whatsapp')) return false;
      if (['pending', 'confirmed', 'shipped', 'delivered'].includes(orderFilter) && o.status !== orderFilter) return false;

      // Search query
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase().trim();
        const num = (o.order_number || '').toLowerCase();
        const name = (o.customer_name || '').toLowerCase();
        const phone = (o.customer_phone || '').toLowerCase();
        return num.includes(q) || name.includes(q) || phone.includes(q);
      }
      return true;
    });
  }, [orders, orderFilter, orderSearchQuery]);

  // ─── Filtered Products Memo ────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery.trim()) return products;
    const q = productSearchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name_ar.toLowerCase().includes(q) ||
        p.name_en.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, productSearchQuery]);

  // ─── Format Currency Helpers ───────────────────────────────────────────────
  const fmtYER = (amt: number) => `${Number(amt || 0).toLocaleString('ar-YE')} ر.ي`;
  const fmtSAR = (amt: number) => `${Number(amt || 0).toLocaleString('ar-SA')} ر.س`;

  // ─── 1. Loading State ──────────────────────────────────────────────────────
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#110c11] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#ff4d8d] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-white/60">جاري التحقق من الصلاحيات السحابية...</p>
        </div>
      </div>
    );
  }

  // ─── 2. Lock Screen (Authentication Required) ──────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#140e14] flex items-center justify-center p-6 text-white" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md bg-[#1e151e] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-[#ff4d8d] to-accent" />

          {/* Logo & Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-primary/30 to-accent/30 border border-white/20 rounded-2xl flex items-center justify-center text-4xl mx-auto shadow-inner">
              🌿
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              بوابة إدارة Dr.Berry
            </h1>
            <p className="text-xs text-white/60">
              لوحة التحكم السحابية المباشرة للمبيعات والطلبات والمخزون
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {pinError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-2">
                <span>⚠️</span>
                <span>{pinError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/80 block">
                رمز مرور المشرف (PIN Code / Master Password)
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="أدخل رمز الدخول (مثلاً: drberry2026)"
                className="w-full px-4 py-3.5 bg-white/5 border border-white/15 focus:border-[#ff4d8d] rounded-2xl text-sm text-white placeholder:text-white/30 outline-none transition-all font-mono"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 bg-gradient-to-r from-primary to-[#ff4d8d] hover:opacity-95 text-white font-black rounded-2xl text-sm transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>🔓</span>
                  <span>فتح لوحة التحكم</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <Link href="/" className="text-xs text-white/50 hover:text-white transition-colors">
              ← العودة لمتجر Dr.Berry الرئيسي
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── 3. Main Admin Dashboard ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#110c11] text-white flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-5 z-50 inset-x-0 mx-auto w-fit px-5 py-3 bg-[#1e151e]/95 border border-[#ff4d8d]/50 text-white rounded-full shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-fade-in">
          <span>✨</span>
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#160f16]/95 backdrop-blur-md border-b border-white/10 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌿</span>
            <div>
              <span className="font-black text-lg text-white font-sans tracking-tight">Dr.Berry</span>
              <span className="text-[10px] bg-primary/20 text-[#ff75aa] px-2 py-0.5 rounded-full font-bold ms-2">
                سحابي حي 🟢
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Sound Bell Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              showToast(soundEnabled ? 'تم إيقاف صوت التنبيهات' : 'تم تفعيل صوت التنبيهات للطلبات الجديدة 🔔');
            }}
            title={soundEnabled ? 'جرس التنبيهات مفعّل' : 'جرس التنبيهات صامت'}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              soundEnabled
                ? 'bg-primary/20 border-primary/40 text-white'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            <span>{soundEnabled ? '🔔' : '🔕'}</span>
            <span className="hidden sm:inline">{soundEnabled ? 'الصوت مفعّل' : 'صامت'}</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadDashboardData}
            disabled={isLoading}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 transition-all text-xs font-bold flex items-center gap-1.5"
          >
            <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
            <span className="hidden md:inline">تحديث</span>
          </button>

          {/* Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white/80 transition-all hidden sm:flex items-center gap-1.5"
          >
            <span>🛍️</span>
            <span>عرض المتجر</span>
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>🔒</span>
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-[#140e14] border-b md:border-b-0 md:border-e border-white/10 p-4 space-y-1.5 flex-shrink-0">
          {[
            { id: 'overview', labelAr: 'النظرة العامة', icon: '📊', count: null },
            {
              id: 'orders',
              labelAr: 'إدارة الطلبات',
              icon: '📦',
              count: metrics?.pendingOrdersCount || null,
            },
            {
              id: 'receipts',
              labelAr: 'سندات التحويل',
              icon: '💳',
              count: metrics?.pendingReceiptsCount || null,
            },
            { id: 'products', labelAr: 'المنتجات والمخزون', icon: '🌿', count: null },
            { id: 'customers', labelAr: 'دليل العميلات', icon: '👥', count: null },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-[#ff4d8d] text-white shadow-lg shadow-primary/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.labelAr}</span>
                </div>
                {tab.count !== null && tab.count > 0 && (
                  <span className="bg-white text-black font-black text-[10px] px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-5 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* ══════════════════════════════════════════════════════════════════
              TAB 1: OVERVIEW (النظرة العامة)
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Header Title */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">مؤشرات الأداء السحابية</h2>
                <p className="text-xs sm:text-sm text-white/50 mt-1">
                  متابعة المبيعات الحية، والطلبات الواردة، والإيصالات بانتظار الاعتماد
                </p>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-[#1a121a] border border-white/10 rounded-3xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>مبيعات المتجر (YER)</span>
                    <span className="text-lg">💰</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#5dfd9b] font-mono">
                    {fmtYER(metrics?.totalRevenueYER || 0)}
                  </div>
                  <span className="text-[10px] text-white/40 block">الريال اليمني المعتمد</span>
                </div>

                <div className="p-5 bg-[#1a121a] border border-white/10 rounded-3xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>مبيعات المتجر (SAR)</span>
                    <span className="text-lg">🇸🇦</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                    {fmtSAR(metrics?.totalRevenueSAR || 0)}
                  </div>
                  <span className="text-[10px] text-white/40 block">الريال السعودي</span>
                </div>

                <div className="p-5 bg-[#1a121a] border border-white/10 rounded-3xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>طلبات المتجر المباشرة</span>
                    <span className="text-lg">🛍️</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {metrics?.webOrdersCount || 0}
                  </div>
                  <span className="text-[10px] text-emerald-400 block">شراء مؤكد مع خصم المخزون</span>
                </div>

                <div className="p-5 bg-[#1a121a] border border-white/10 rounded-3xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>طلبات الواتساب (Leads)</span>
                    <span className="text-lg">💬</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#25D366] font-mono">
                    {metrics?.whatsappLeadsCount || 0}
                  </div>
                  <span className="text-[10px] text-[#25D366]/80 block">للمتابعة واستكمال الشراء</span>
                </div>
              </div>

              {/* Secondary Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#1e151e] border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-white/50 block">سندات بانتظار الاعتماد</span>
                    <strong className="text-lg font-black text-amber-400">
                      {metrics?.pendingReceiptsCount || 0} سندات
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('receipts')}
                    className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold hover:bg-amber-500/30"
                  >
                    مراجعة
                  </button>
                </div>

                <div className="p-4 bg-[#1e151e] border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-white/50 block">طلبات بانتظار التجهيز والشحن</span>
                    <strong className="text-lg font-black text-[#ff4d8d]">
                      {metrics?.pendingOrdersCount || 0} طلبات
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderFilter('pending');
                      setActiveTab('orders');
                    }}
                    className="px-3 py-1.5 bg-primary/20 border border-primary/30 text-[#ff75aa] rounded-xl text-xs font-bold hover:bg-primary/30"
                  >
                    عرض
                  </button>
                </div>

                <div className="p-4 bg-[#1e151e] border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-white/50 block">المنتجات المتوفرة</span>
                    <strong className="text-lg font-black text-white">
                      {metrics?.inStockProductsCount || 0} من {metrics?.totalProductsCount || 9}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="px-3 py-1.5 bg-white/10 border border-white/20 text-white rounded-xl text-xs font-bold hover:bg-white/20"
                  >
                    إدارة
                  </button>
                </div>
              </div>

              {/* Latest Live Orders Stream */}
              <div className="bg-[#181118] border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <span>⚡</span>
                    <span>أحدث الطلبات الواردة لحظياً</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#ff4d8d] hover:underline font-bold"
                  >
                    عرض كافة الطلبات ←
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12 text-white/40 text-xs">
                    لا توجد طلبات مسجلة بعد. عند إتمام أول طلب سيظهر هنا فوراً.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {orders.slice(0, 6).map((ord) => (
                      <div
                        key={ord.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] rounded-xl px-2 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {ord.status === 'whatsapp_lead' || ord.payment_method === 'whatsapp' ? '💬' : '🛍️'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-white text-sm font-mono">#{ord.order_number}</strong>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  ord.status === 'confirmed'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : ord.status === 'whatsapp_lead'
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {ord.status === 'whatsapp_lead' ? 'طلب واتساب' : ord.status}
                              </span>
                            </div>
                            <p className="text-xs text-white/60 mt-0.5">
                              {ord.customer_name} • {ord.governorate} • {fmtYER(ord.total_yer)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold"
                          >
                            التفاصيل
                          </button>
                          <a
                            href={`https://wa.me/${ord.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `مرحباً ${ord.customer_name}، نتواصل معك من متجر د. بيري بخصوص طلبك #${ord.order_number} 🌿`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] rounded-xl text-xs"
                            title="مراسلة عبر واتساب"
                          >
                            💬
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 2: ORDERS MANAGER (إدارة الطلبات الفورية)
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Title & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">إدارة الطلبات</h2>
                  <p className="text-xs text-white/50">عرض ومتابعة وتحديث حالات كافة الطلبات بالمسارين</p>
                </div>
                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="بحث برقم الطلب، الاسم، أو الهاتف..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder:text-white/30 outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { id: 'all', label: 'كل الطلبات' },
                  { id: 'web', label: 'طلبات المتجر المباشرة 🛍️' },
                  { id: 'whatsapp', label: 'طلبات الواتساب 💬' },
                  { id: 'pending', label: 'قيد الانتظار' },
                  { id: 'confirmed', label: 'مؤكدة' },
                  { id: 'shipped', label: 'في الشحن' },
                  { id: 'delivered', label: 'تم التسليم' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setOrderFilter(f.id as any)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      orderFilter === f.id
                        ? 'bg-primary text-white shadow'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className="bg-[#181118] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 text-white/40 text-xs">
                    لا توجد طلبات مطابقة للفلتر المحدد.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-start text-xs">
                      <thead className="bg-white/5 text-white/60 border-b border-white/10">
                        <tr>
                          <th className="py-3 px-4 text-start font-bold">رقم الطلب</th>
                          <th className="py-3 px-4 text-start font-bold">المسار</th>
                          <th className="py-3 px-4 text-start font-bold">العميل والهاتف</th>
                          <th className="py-3 px-4 text-start font-bold">المحافظة</th>
                          <th className="py-3 px-4 text-start font-bold">المبلغ المطلوب</th>
                          <th className="py-3 px-4 text-start font-bold">الحالة</th>
                          <th className="py-3 px-4 text-end font-bold">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredOrders.map((ord) => {
                          const isWA = ord.status === 'whatsapp_lead' || ord.payment_method === 'whatsapp';
                          return (
                            <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-white">#{ord.order_number}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    isWA ? 'bg-[#25D366]/20 text-[#25D366]' : 'bg-primary/20 text-[#ff75aa]'
                                  }`}
                                >
                                  {isWA ? 'واتساب 💬' : 'موقع 🛍️'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <strong className="text-white block">{ord.customer_name}</strong>
                                <span className="text-white/40 text-[11px] font-mono">{ord.customer_phone}</span>
                              </td>
                              <td className="py-3 px-4 text-white/70">{ord.governorate}</td>
                              <td className="py-3 px-4 font-mono font-bold text-[#5dfd9b]">
                                {fmtYER(ord.total_yer)}
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={ord.status}
                                  onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                  disabled={isUpdatingStatus}
                                  className="bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white outline-none"
                                >
                                  <option className="bg-[#181118]" value="pending">معلق (Pending)</option>
                                  <option className="bg-[#181118]" value="pending_payment">بانتظار التحويل</option>
                                  <option className="bg-[#181118]" value="confirmed">مؤكد (Confirmed)</option>
                                  <option className="bg-[#181118]" value="shipped">تم الشحن (Shipped)</option>
                                  <option className="bg-[#181118]" value="delivered">تم التسليم (Delivered)</option>
                                  <option className="bg-[#181118]" value="whatsapp_lead">مسار واتساب</option>
                                  <option className="bg-[#181118]" value="cancelled">ملغي (Cancelled)</option>
                                </select>
                              </td>
                              <td className="py-3 px-4 text-end space-x-1.5 space-x-reverse">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(ord)}
                                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-bold"
                                >
                                  عرض
                                </button>
                                <a
                                  href={`https://wa.me/${ord.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `مرحباً ${ord.customer_name}، نتواصل معكِ من متجر د. بيري بخصوص طلبك #${ord.order_number} 🌿`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] rounded-lg text-[11px] font-bold"
                                >
                                  واتساب
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 3: RECEIPTS MANAGER (سندات التحويل البنكي)
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'receipts' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-white">إيصالات وسندات التحويل البنكي</h2>
                <p className="text-xs text-white/50">مطابقة واعتماد صور الحوالات المرفوعة من العملاء في السحابة</p>
              </div>

              {receipts.length === 0 ? (
                <div className="bg-[#181118] border border-white/10 rounded-3xl p-16 text-center text-white/40 text-xs">
                  لا توجد إيصالات تحويل مرفوعة حالياً. أي إيصال يرفعه العميل سيظهر هنا فوراً للمعاينة والاعتماد.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {receipts.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-[#181118] border border-white/10 rounded-3xl p-5 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-white">طلب: #{rec.order_id}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.review_status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : rec.review_status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {rec.review_status === 'approved'
                              ? 'معتمد ✓'
                              : rec.review_status === 'rejected'
                              ? 'مرفوض ✕'
                              : 'بانتظار المطابقة ⏳'}
                          </span>
                        </div>

                        {/* Image Preview */}
                        <div
                          onClick={() => setSelectedReceiptImage(rec.receipt_image_url)}
                          className="w-full h-44 bg-black/40 rounded-2xl overflow-hidden relative border border-white/10 cursor-pointer group"
                        >
                          <img
                            src={rec.receipt_image_url}
                            alt="Receipt"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                            🔍 اضغط للتكبير والمطابقة
                          </div>
                        </div>

                        {rec.review_notes && (
                          <p className="text-[11px] text-white/50">{rec.review_notes}</p>
                        )}
                      </div>

                      {/* Approval Actions */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => handleReviewReceipt(rec.id, rec.order_id, 'approved')}
                          className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow"
                        >
                          <span>✓</span>
                          <span>اعتماد الدفع</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewReceipt(rec.id, rec.order_id, 'rejected')}
                          className="py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <span>✕</span>
                          <span>رفض السند</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 4: PRODUCTS & STOCK (المنتجات والمخزون)
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">المنتجات وإدارة المخزون</h2>
                  <p className="text-xs text-white/50">تعديل الأسعار والتوفر الفوري في السحابة</p>
                </div>
                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="بحث في المنتجات..."
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder:text-white/30 outline-none"
                  />
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#181118] border border-white/10 rounded-3xl p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl overflow-hidden relative flex-shrink-0 border border-white/10">
                        <img src={p.image} alt={p.name_ar} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-white truncate block">{p.name_ar}</strong>
                        </div>
                        <span className="text-[11px] text-white/40 block truncate">{p.name_en}</span>
                        <span className="text-[10px] bg-primary/10 text-[#ff75aa] px-2 py-0.5 rounded-full mt-1 inline-block">
                          {p.category}
                        </span>
                      </div>
                    </div>

                    {/* Price & Stock Stats */}
                    <div className="p-3 bg-white/5 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">السعر باليمني:</span>
                        <strong className="text-[#5dfd9b] font-mono">{fmtYER(p.price_yer)}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">السعر بالسعودي:</span>
                        <strong className="text-amber-400 font-mono">{fmtSAR(p.price_sar)}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">السعر بالدولار:</span>
                        <strong className="text-white font-mono">${p.price_usd}</strong>
                      </div>
                    </div>

                    {/* Instant Stock Toggle */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-white/70">حالة التوفر:</span>
                      <button
                        type="button"
                        onClick={() => handleToggleStock(p)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          p.in_stock
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        <span>{p.in_stock ? '✓ متوفر بالمخزون' : '✕ نفدت الكمية'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 5: CUSTOMERS DIRECTORY (دليل العميلات)
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-white">دليل العميلات ونقاط الولاء</h2>
                <p className="text-xs text-white/50">سجلات العميلات ومجموع المشتريات التراكمي في السحابة</p>
              </div>

              {customers.length === 0 ? (
                <div className="bg-[#181118] border border-white/10 rounded-3xl p-16 text-center text-white/40 text-xs">
                  لا توجد عميلات مسجلات بعد. تُنشأ السجلات تلقائياً بمجرد إتمام أي عميلة لطلبها.
                </div>
              ) : (
                <div className="bg-[#181118] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-start text-xs">
                      <thead className="bg-white/5 text-white/60 border-b border-white/10">
                        <tr>
                          <th className="py-3 px-4 text-start font-bold">اسم العميلة</th>
                          <th className="py-3 px-4 text-start font-bold">الهاتف</th>
                          <th className="py-3 px-4 text-start font-bold">المحافظة</th>
                          <th className="py-3 px-4 text-start font-bold">عدد الطلبات</th>
                          <th className="py-3 px-4 text-start font-bold">مجموع المشتريات</th>
                          <th className="py-3 px-4 text-start font-bold">نقاط الولاء</th>
                          <th className="py-3 px-4 text-end font-bold">تواصل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {customers.map((c) => (
                          <tr key={c.id} className="hover:bg-white/[0.02]">
                            <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                            <td className="py-3 px-4 font-mono text-white/60">{c.phone}</td>
                            <td className="py-3 px-4 text-white/70">{c.governorate || '—'}</td>
                            <td className="py-3 px-4 font-bold text-primary">{c.total_orders}</td>
                            <td className="py-3 px-4 font-mono text-[#5dfd9b] font-bold">
                              {fmtYER(c.total_spent_yer)}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded-full text-[10px]">
                                ⭐ {c.loyalty_points || 0}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-end">
                              <a
                                href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] rounded-lg font-bold text-[11px]"
                              >
                                واتساب 💬
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ─── Lightbox Modal for Receipt Image ──────────────────────────────── */}
      {selectedReceiptImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedReceiptImage(null)}
        >
          <div className="relative max-w-2xl w-full bg-[#1e151e] rounded-3xl overflow-hidden border border-white/20 p-4">
            <button
              type="button"
              onClick={() => setSelectedReceiptImage(null)}
              className="absolute top-4 start-4 w-9 h-9 bg-black/60 rounded-full text-white font-black flex items-center justify-center z-10 hover:bg-black"
            >
              ✕
            </button>
            <img
              src={selectedReceiptImage}
              alt="Full Receipt"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* ─── Order Details Modal ───────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1e151e] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-white my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs text-white/50 block">تفاصيل الطلب السحابي</span>
                <h3 className="text-xl font-black font-mono text-primary">#{selectedOrder.order_number}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-white/40 block mb-0.5">اسم العميل:</span>
                <strong>{selectedOrder.customer_name}</strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-white/40 block mb-0.5">رقم الهاتف:</span>
                <strong className="font-mono">{selectedOrder.customer_phone}</strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-white/40 block mb-0.5">المحافظة والمدينة:</span>
                <strong>{selectedOrder.governorate} - {selectedOrder.city_or_area || 'المركز'}</strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-white/40 block mb-0.5">المجموع:</span>
                <strong className="text-[#5dfd9b] font-mono">{fmtYER(selectedOrder.total_yer)}</strong>
              </div>
            </div>

            {selectedOrder.address_details && (
              <div className="p-3 bg-white/5 rounded-xl text-xs">
                <span className="text-white/40 block mb-0.5">العنوان التفصيلي:</span>
                <p>{selectedOrder.address_details}</p>
              </div>
            )}

            {/* Ordered Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white/60">المنتجات المطلوبة ({selectedOrder.items?.length || 0}):</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-white/5 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {item.image && (
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <strong className="block truncate max-w-[200px]">{item.title}</strong>
                        <span className="text-white/40 text-[10px]">كمية: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-white/80">{fmtYER(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Selector in Modal */}
            <div className="p-3 bg-white/5 rounded-xl space-y-2">
              <label className="text-xs font-bold text-white/60 block">تحديث حالة الطلب:</label>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                className="w-full bg-[#140e14] border border-white/20 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="pending">معلق (Pending)</option>
                <option value="pending_payment">بانتظار التحويل (Pending Payment)</option>
                <option value="confirmed">مؤكد ومحجوز (Confirmed)</option>
                <option value="shipped">تم الشحن والتسليم للمندوب (Shipped)</option>
                <option value="delivered">تم التسليم النهائي (Delivered)</option>
                <option value="whatsapp_lead">مسار طلبات الواتساب (WhatsApp Lead)</option>
                <option value="cancelled">ملغي (Cancelled)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <a
                href={`https://wa.me/${selectedOrder.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `مرحباً ${selectedOrder.customer_name}، نتواصل معكِ من متجر د. بيري بخصوص طلبك #${selectedOrder.order_number} 🌿`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-[#25D366] hover:bg-[#20b858] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow"
              >
                <span>💬</span>
                <span>مراسلة العميل بالواتساب</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
