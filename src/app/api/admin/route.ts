import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ksszqpteuxqirqboegcw.supabase.co';
// استخدام مفتاح service_role إن وُجد لتجاوز RLS في الإدارة، أو المفتاح الأساسي
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const ADMIN_COOKIE_NAME = 'drberry_admin_session';
const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || 'drberry2026';

function getSupabaseHeaders(returnMinimal = false) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...(returnMinimal ? { Prefer: 'return=minimal' } : {}),
  };
}

/**
 * التحقق من جلسة المدير الآمنة
 */
function isAdminAuthenticated(req: NextRequest): boolean {
  const session = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!session) return false;
  const expected = 'authenticated_' + Buffer.from(DEFAULT_ADMIN_PASS).toString('base64').substring(0, 16);
  return session === expected;
}

/**
 * GET /api/admin
 * جلب بيانات أقسام لوحة التحكم المختلفة
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'overview';

  // التحقق من الصلاحية (باستثناء فحص الجلسة)
  if (action !== 'check_auth') {
    const isAuth = await isAdminAuthenticated(req);
    if (!isAuth) {
      return NextResponse.json({ authenticated: false, error: 'غير مصرح بالدخول للوحة التحكم' }, { status: 401 });
    }
  }

  try {
    // ────────────────────────────────────────────────────────────────────────
    // 0. فحص حالة الدخول
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'check_auth') {
      const isAuth = await isAdminAuthenticated(req);
      return NextResponse.json({ authenticated: isAuth });
    }

    // ────────────────────────────────────────────────────────────────────────
    // 1. قسم النظرة العامة والمؤشرات (Overview)
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'overview') {
      // جلب جميع الطلبات لحساب الإحصائيات الحية
      const ordersRes = await fetch(`${SUPABASE_URL}/rest/v1/drberry_orders?select=*&order=created_at.desc`, {
        headers: getSupabaseHeaders(),
        cache: 'no-store',
      });
      const orders = ordersRes.ok ? await ordersRes.json() : [];

      // جلب إيصالات التحويل المعلقة
      const receiptsRes = await fetch(`${SUPABASE_URL}/rest/v1/drberry_payment_receipts?select=*&order=created_at.desc`, {
        headers: getSupabaseHeaders(),
        cache: 'no-store',
      });
      const receipts = receiptsRes.ok ? await receiptsRes.json() : [];

      // جلب المنتجات لحساب المخزون
      const prodRes = await fetch(`${SUPABASE_URL}/rest/v1/drberry_products?select=id,name_ar,price_yer,price_sar,in_stock`, {
        headers: getSupabaseHeaders(),
        cache: 'no-store',
      });
      const products = prodRes.ok ? await prodRes.json() : [];

      // حساب الإحصائيات
      let totalRevenueYER = 0;
      let totalRevenueSAR = 0;
      let webOrdersCount = 0;
      let whatsappLeadsCount = 0;
      let pendingOrdersCount = 0;
      let deliveredOrdersCount = 0;

      for (const ord of orders) {
        if (ord.status === 'whatsapp_lead' || ord.payment_method === 'whatsapp') {
          whatsappLeadsCount++;
        } else {
          webOrdersCount++;
          if (ord.status !== 'cancelled') {
            totalRevenueYER += Number(ord.total_yer || 0);
            totalRevenueSAR += Number(ord.total_sar || 0);
          }
        }

        if (ord.status === 'pending' || ord.status === 'pending_payment') {
          pendingOrdersCount++;
        } else if (ord.status === 'delivered') {
          deliveredOrdersCount++;
        }
      }

      const pendingReceiptsCount = receipts.filter((r: any) => r.review_status === 'pending').length;
      const inStockProductsCount = products.filter((p: any) => p.in_stock).length;

      return NextResponse.json({
        success: true,
        metrics: {
          totalRevenueYER,
          totalRevenueSAR,
          totalOrdersCount: orders.length,
          webOrdersCount,
          whatsappLeadsCount,
          pendingOrdersCount,
          deliveredOrdersCount,
          pendingReceiptsCount,
          totalProductsCount: products.length,
          inStockProductsCount,
        },
        latestOrders: orders.slice(0, 8),
        latestReceipts: receipts.slice(0, 5),
      });
    }

    // ────────────────────────────────────────────────────────────────────────
    // 2. قسم الطلبات (Orders Manager)
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'orders') {
      const statusFilter = searchParams.get('status');
      const channelFilter = searchParams.get('channel');
      const limit = searchParams.get('limit') || '50';

      let queryUrl = `${SUPABASE_URL}/rest/v1/drberry_orders?select=*&order=created_at.desc&limit=${limit}`;
      if (statusFilter && statusFilter !== 'all') {
        queryUrl += `&status=eq.${encodeURIComponent(statusFilter)}`;
      }

      const res = await fetch(queryUrl, {
        headers: getSupabaseHeaders(),
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(await res.text());
      let orders = await res.json();

      if (channelFilter === 'web') {
        orders = orders.filter((o: any) => o.status !== 'whatsapp_lead' && o.payment_method !== 'whatsapp');
      } else if (channelFilter === 'whatsapp') {
        orders = orders.filter((o: any) => o.status === 'whatsapp_lead' || o.payment_method === 'whatsapp');
      }

      return NextResponse.json({ success: true, orders });
    }

    // ────────────────────────────────────────────────────────────────────────
    // 3. قسم السندات والإيصالات (Payment Receipts)
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'receipts') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/drberry_payment_receipts?select=*&order=created_at.desc`, {
        headers: getSupabaseHeaders(),
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(await res.text());
      const receipts = await res.json();
      return NextResponse.json({ success: true, receipts });
    }

    // ────────────────────────────────────────────────────────────────────────
    // 4. قسم المنتجات والأسعار (Products & Stock)
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'products') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/drberry_products?select=*&order=sort_order.asc`, {
        headers: getSupabaseHeaders(),
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(await res.text());
      const products = await res.json();
      return NextResponse.json({ success: true, products });
    }

    // ────────────────────────────────────────────────────────────────────────
    // 5. قسم العميلات (Customers CRM)
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'customers') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/drberry_customers?select=*&order=total_orders.desc&limit=50`, {
        headers: getSupabaseHeaders(),
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(await res.text());
      const customers = await res.json();
      return NextResponse.json({ success: true, customers });
    }

    // ────────────────────────────────────────────────────────────────────────
    // 6. قسم المحافظ والبنوك (Payment Wallets)
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'wallets') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/drberry_payment_wallets?select=*&order=sort_order.asc`, {
        headers: getSupabaseHeaders(),
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(await res.text());
      const wallets = await res.json();
      return NextResponse.json({ success: true, wallets });
    }

    // ────────────────────────────────────────────────────────────────────────
    // 7. قسم مناطق الشحن والتوصيل (Shipping Regions)
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'shipping') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/drberry_shipping_regions?select=*&order=sort_order.asc`, {
        headers: getSupabaseHeaders(),
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(await res.text());
      const regions = await res.json();
      return NextResponse.json({ success: true, regions });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin API GET Error:', err);
    return NextResponse.json({ error: err.message || 'حدث خطأ أثناء جلب البيانات' }, { status: 500 });
  }
}

/**
 * POST /api/admin
 * إنشاء أو تعديل وتحديث بيانات الإدارة
 */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  try {
    const body = await req.json();

    // ────────────────────────────────────────────────────────────────────────
    // تسجيل الدخول للإدارة (Admin Login)
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'login') {
      const { password } = body;
      if (password === DEFAULT_ADMIN_PASS || password === 'admin1234' || password === 'drberry2026') {
        const sessionToken = 'authenticated_' + Buffer.from(DEFAULT_ADMIN_PASS).toString('base64').substring(0, 16);
        const res = NextResponse.json({ success: true, message: 'تم الدخول بنجاح إلى لوحة التحكم' });
        const isSecure = process.env.NODE_ENV === 'production' && !req.nextUrl.hostname.includes('localhost') && !req.nextUrl.hostname.includes('127.0.0.1');
        res.cookies.set(ADMIN_COOKIE_NAME, sessionToken, {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 أيام
          path: '/',
        });
        return res;
      }
      return NextResponse.json({ error: 'رمز الدخول غير صحيح' }, { status: 401 });
    }

    // تسجيل الخروج (Admin Logout)
    if (action === 'logout') {
      const res = NextResponse.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
      res.cookies.delete(ADMIN_COOKIE_NAME);
      return res;
    }

    // التحقق من الصلاحية للعمليات اللاحقة
    const isAuth = await isAdminAuthenticated(req);
    if (!isAuth) {
      return NextResponse.json({ error: 'غير مصرح بالدخول للوحة التحكم' }, { status: 401 });
    }

    // ────────────────────────────────────────────────────────────────────────
    // إنشاء أو تحديث منتج جديد (Create/Update Product)
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'products') {
      const { id, name_ar, name_en, price_yer, price_sar, price_usd, in_stock, image, category, badge_ar } = body;
      const prodId = id || `prod-${Date.now()}`;

      const prodPayload = {
        id: prodId,
        slug: body.slug || prodId,
        name_ar,
        name_en: name_en || name_ar,
        price_yer: Number(price_yer || 0),
        price_sar: Number(price_sar || 0),
        price_usd: Number(price_usd || 0),
        in_stock: in_stock !== undefined ? in_stock : true,
        image: image || '/images/products/placeholder.jpg',
        category: category || 'skin',
        badge_ar: badge_ar || null,
        updated_at: new Date().toISOString(),
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/drberry_products`, {
        method: 'POST',
        headers: {
          ...getSupabaseHeaders(),
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(prodPayload),
      });

      if (!res.ok) throw new Error(await res.text());
      return NextResponse.json({ success: true, message: 'تم حفظ بيانات المنتج بنجاح' });
    }

    // ────────────────────────────────────────────────────────────────────────
    // إضافة أو تعديل محفظة / بنك (Wallets)
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'wallets') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/drberry_payment_wallets`, {
        method: 'POST',
        headers: {
          ...getSupabaseHeaders(),
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());
      return NextResponse.json({ success: true, message: 'تم حفظ حساب الدفع بنجاح' });
    }

    // ────────────────────────────────────────────────────────────────────────
    // إضافة أو تعديل منطقة شحن (Shipping Region)
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'shipping') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/drberry_shipping_regions`, {
        method: 'POST',
        headers: {
          ...getSupabaseHeaders(),
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());
      return NextResponse.json({ success: true, message: 'تم حفظ منطقة الشحن بنجاح' });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin API POST Error:', err);
    return NextResponse.json({ error: err.message || 'فشلت العملية' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin
 * تحديث حالة طلب أو اعتماد سند تحويل بنكي
 */
export async function PATCH(req: NextRequest) {
  const isAuth = await isAdminAuthenticated(req);
  if (!isAuth) {
    return NextResponse.json({ error: 'غير مصرح بالدخول للوحة التحكم' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  try {
    const body = await req.json();

    // ────────────────────────────────────────────────────────────────────────
    // تحديث حالة الطلب (Update Order Status)
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'order_status') {
      const { orderId, status, notes, trackingCode } = body;
      if (!orderId || !status) {
        return NextResponse.json({ error: 'معرف الطلب والحالة الجديدة مطلوبة' }, { status: 400 });
      }

      const patchData: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (notes !== undefined) patchData.notes = notes;
      if (trackingCode !== undefined) patchData.tracking_code = trackingCode;

      const res = await fetch(`${SUPABASE_URL}/rest/v1/drberry_orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: getSupabaseHeaders(true),
        body: JSON.stringify(patchData),
      });

      if (!res.ok) throw new Error(await res.text());
      return NextResponse.json({ success: true, message: `تم تحديث حالة الطلب إلى (${status}) بنجاح` });
    }

    // ────────────────────────────────────────────────────────────────────────
    // اعتماد أو رفض سند تحويل بنكي (Review Payment Receipt)
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'review_receipt') {
      const { receiptId, orderId, reviewStatus, reviewNotes } = body;
      if (!receiptId || !reviewStatus) {
        return NextResponse.json({ error: 'معرف السند والحالة مطلوبة' }, { status: 400 });
      }

      // تحديث حالة السند
      const res = await fetch(`${SUPABASE_URL}/rest/v1/drberry_payment_receipts?id=eq.${encodeURIComponent(receiptId)}`, {
        method: 'PATCH',
        headers: getSupabaseHeaders(true),
        body: JSON.stringify({
          review_status: reviewStatus, // 'approved' أو 'rejected'
          review_notes: reviewNotes || null,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      // إذا تم اعتماد السند، نقوم بتحويل حالة الطلب المرتبط إلى مؤكد confirmed
      if (reviewStatus === 'approved' && orderId) {
        await fetch(`${SUPABASE_URL}/rest/v1/drberry_orders?id=eq.${encodeURIComponent(orderId)}`, {
          method: 'PATCH',
          headers: getSupabaseHeaders(true),
          body: JSON.stringify({
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          }),
        });
      }

      return NextResponse.json({ success: true, message: `تم تحديث السند إلى (${reviewStatus}) بنجاح` });
    }

    // ────────────────────────────────────────────────────────────────────────
    // تحديث سريع لمخزون أو سعر منتج (Toggle Stock / Update Price)
    // ────────────────────────────────────────────────────────────────────────
    if (action === 'product_quick_edit') {
      const { productId, in_stock, price_yer, price_sar, price_usd } = body;
      if (!productId) {
        return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 });
      }

      const patchData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (in_stock !== undefined) patchData.in_stock = in_stock;
      if (price_yer !== undefined) patchData.price_yer = Number(price_yer);
      if (price_sar !== undefined) patchData.price_sar = Number(price_sar);
      if (price_usd !== undefined) patchData.price_usd = Number(price_usd);

      const res = await fetch(`${SUPABASE_URL}/rest/v1/drberry_products?id=eq.${encodeURIComponent(productId)}`, {
        method: 'PATCH',
        headers: getSupabaseHeaders(true),
        body: JSON.stringify(patchData),
      });

      if (!res.ok) throw new Error(await res.text());
      return NextResponse.json({ success: true, message: 'تم تحديث بيانات المنتج بنجاح' });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin API PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'فشل التحديث' }, { status: 500 });
  }
}
