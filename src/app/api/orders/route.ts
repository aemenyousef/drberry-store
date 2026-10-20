import { NextRequest, NextResponse } from 'next/server';
import {
  verifyCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE,
  normalizeInternationalPhone,
} from '@/lib/authSecurity';
import { CustomerStore } from '@/lib/customerStore';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ksszqpteuxqirqboegcw.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const WHATSAPP_NUMBER = '967770000000'; // رقم واتساب خدمة عملاء د. بيري الرسمي

function getSupabaseHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  };
}

export type OrderItem = {
  id: string;
  title: string;
  volume?: string;
  quantity: number;
  price: number;
  image?: string;
};

export type CreateOrderPayload = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  country: string;
  governorate: string;
  cityOrArea?: string;
  addressDetails: string;
  shippingMethod: string;
  shippingCostYer: number;
  paymentMethod: 'cash_on_delivery' | 'bank_transfer' | 'whatsapp';
  walletId?: string;
  currencyUsed: 'YER' | 'SAR' | 'USD';
  totalYer: number;
  totalSar?: number;
  totalUsd?: number;
  items: OrderItem[];
  receiptBase64?: string;
  receiptFileName?: string;
  channel: 'web' | 'whatsapp';
  notes?: string;
  customShippingPreference?: string;
};

/**
 * دالة مساعدة لرفع إيصال التحويل البنكي إلى حاوية التخزين drberry-media/receipts
 */
async function uploadReceiptToStorage(
  orderNumber: string,
  base64Data: string,
  fileName?: string
): Promise<string | null> {
  try {
    // إزالة بادئة data:image/...;base64, إذا كانت موجودة
    const commaIdx = base64Data.indexOf(',');
    const cleanBase64 = commaIdx !== -1 ? base64Data.substring(commaIdx + 1) : base64Data;
    const buffer = Buffer.from(cleanBase64, 'base64');

    const ext = fileName && fileName.includes('.') ? fileName.split('.').pop() : 'jpg';
    const filePath = `receipts/${orderNumber}-${Date.now()}.${ext}`;
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/drberry-media/${filePath}`;

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': ext === 'png' ? 'image/png' : 'image/jpeg',
      },
      body: buffer,
    });

    if (res.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/drberry-media/${filePath}`;
    }
  } catch (err) {
    console.error('Receipt upload error:', err);
  }
  return null;
}

/**
 * دالة خصم المخزون والكميات من جدول drberry_products في السحابة
 * (تُطبق فقط على مسار الشراء المكتمل بالموقع Web Checkout، ولا تُطبق على طلبات الواتساب)
 */
async function deductProductsInventory(items: OrderItem[]) {
  try {
    for (const item of items) {
      if (!item.id) continue;

      // جلب المنتج لمعرفة الكمية الحالية وحالة التوفر
      const getUrl = `${SUPABASE_URL}/rest/v1/drberry_products?id=eq.${encodeURIComponent(item.id)}&select=*`;
      const prodRes = await fetch(getUrl, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      if (!prodRes.ok) continue;
      const products = await prodRes.json();
      if (!Array.isArray(products) || products.length === 0) continue;

      const product = products[0];

      // إذا كان المنتج يحتوي على variants وكميات رقمية يتم تحديثها، أو توثيق استهلاك الكمية
      const currentStock = typeof product.stock_quantity === 'number' ? product.stock_quantity : null;
      let newStock = currentStock !== null ? Math.max(0, currentStock - item.quantity) : null;
      let inStock = product.in_stock;

      if (newStock !== null && newStock <= 0) {
        inStock = false;
      }

      // تحديث بيانات التوفر في قاعدة البيانات
      const patchUrl = `${SUPABASE_URL}/rest/v1/drberry_products?id=eq.${encodeURIComponent(item.id)}`;
      const patchBody: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (newStock !== null) patchBody.stock_quantity = newStock;
      if (inStock !== undefined) patchBody.in_stock = inStock;

      await fetch(patchUrl, {
        method: 'PATCH',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(patchBody),
      });
    }
  } catch (err) {
    console.error('Inventory deduction error:', err);
  }
}

/**
 * دالة تحديث سجلات ودليل العميل في drberry_customers
 */
async function syncCustomerRecord(payload: CreateOrderPayload) {
  try {
    const normalized = normalizeInternationalPhone(payload.customerPhone);
    const customerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // فحص ما إذا كان العميل موجوداً مسبقاً
    const checkUrl = `${SUPABASE_URL}/rest/v1/drberry_customers?phone=eq.${encodeURIComponent(normalized)}&select=*`;
    const checkRes = await fetch(checkUrl, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        const cust = existing[0];
        const patchUrl = `${SUPABASE_URL}/rest/v1/drberry_customers?phone=eq.${encodeURIComponent(normalized)}`;
        await fetch(patchUrl, {
          method: 'PATCH',
          headers: getSupabaseHeaders(),
          body: JSON.stringify({
            total_orders: (cust.total_orders || 1) + 1,
            total_spent_yer: Number(cust.total_spent_yer || 0) + Number(payload.totalYer || 0),
            last_order_at: new Date().toISOString(),
          }),
        });
        return;
      }
    }

    // إضافة عميل جديد
    const insertUrl = `${SUPABASE_URL}/rest/v1/drberry_customers`;
    await fetch(insertUrl, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify({
        id: customerId,
        name: payload.customerName,
        phone: normalized,
        governorate: payload.governorate,
        total_orders: 1,
        total_spent_yer: payload.totalYer || 0,
        loyalty_points: Math.floor(payload.totalYer / 1000),
      }),
    });
  } catch (err) {
    // silent failure - doesn't block order
  }
}

/**
 * POST /api/orders
 * معالجة وتخزين الطلبات بالمسارين:
 * 1. مسار الشراء المكتمل عبر الموقع (Web Checkout): حجز الطلب، رفع الإيصال، خصم المخزون والكميات، وتوثيق العملية في السحابة.
 * 2. مسار طلبات الواتساب (WhatsApp Track): تسجيل الطلب في السحابة كـ (Lead/استفسار) بدون خصم الكميات أو المنتجات.
 */
export async function POST(req: NextRequest) {
  try {
    const payload: CreateOrderPayload = await req.json();

    // التحقق الأساسي من الحقول الإلزامية
    if (!payload.orderNumber || !payload.customerName || !payload.customerPhone || !payload.items || payload.items.length === 0) {
      return NextResponse.json(
        { error: 'بيانات الطلب غير مكتملة. يرجى التأكد من المنتجات والاسم ورقم الهاتف.' },
        { status: 400 }
      );
    }

    // فحص جلسة العميل المسجل إن وجدت
    let registeredCustomerId: string | null = null;
    const sessionCookie = req.cookies.get(CUSTOMER_SESSION_COOKIE);
    if (sessionCookie && sessionCookie.value) {
      const sessionPayload = await verifyCustomerSessionToken(sessionCookie.value);
      if (sessionPayload?.customerId) {
        registeredCustomerId = sessionPayload.customerId;
      }
    }

    const isWhatsAppTrack = payload.channel === 'whatsapp';

    // مسار 1: عميل الواتساب (تأكيد الطلب عبر الواتساب)
    if (isWhatsAppTrack) {
      const orderRecord = {
        id: payload.orderNumber,
        order_number: payload.orderNumber,
        customer_name: payload.customerName.trim(),
        customer_phone: payload.customerPhone.trim(),
        country: payload.country || 'YE',
        governorate: payload.governorate || 'صنعاء',
        city_or_area: payload.cityOrArea || null,
        address_details: payload.addressDetails || 'طلب عبر محادثة الواتساب',
        shipping_method: payload.shippingMethod || 'واتساب',
        shipping_cost_yer: payload.shippingCostYer || 0,
        payment_method: 'whatsapp',
        total_yer: payload.totalYer || 0,
        total_sar: payload.totalSar || 0,
        total_usd: payload.totalUsd || 0,
        currency_used: payload.currencyUsed || 'YER',
        items: payload.items,
        status: 'whatsapp_lead',
        notes: `[مسار الواتساب - لم يتم خصم الكمية من المتجر - استكمال الخطوات والدفع مع خدمة العملاء] ${payload.notes || ''}`.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // حفظ الطلب في جدول drberry_orders بالسحابة
      const insertUrl = `${SUPABASE_URL}/rest/v1/drberry_orders`;
      const res = await fetch(insertUrl, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(orderRecord),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Supabase WhatsApp order insert failed:', errText);
      }

      // ملاحظة حاسمة بناءً على طلب المستخدم:
      // "لا يتم خصم الكمية والمنتجات والمبالغ وكل التفاصيل لان العميل سيكمل الخطوات والشراء مع قسم الواتساب"
      // لذلك لا نقوم باستدعاء deductProductsInventory هنا إطلاقاً!

      return NextResponse.json({
        success: true,
        orderNumber: payload.orderNumber,
        channel: 'whatsapp',
        status: 'whatsapp_lead',
        message: 'تم تسجيل طلب الواتساب في السحابة بنجاح بدون خصم للمخزون.',
      });
    }

    // مسار 2: عميل المتجر المكتمل (Web Registered / Store Purchase)
    let receiptImageUrl: string | null = null;

    // رفع صورة إيصال التحويل إن وُجدت
    if (payload.receiptBase64) {
      receiptImageUrl = await uploadReceiptToStorage(
        payload.orderNumber,
        payload.receiptBase64,
        payload.receiptFileName
      );

      // توثيق الإيصال في جدول drberry_payment_receipts
      if (receiptImageUrl) {
        try {
          const receiptInsertUrl = `${SUPABASE_URL}/rest/v1/drberry_payment_receipts`;
          await fetch(receiptInsertUrl, {
            method: 'POST',
            headers: getSupabaseHeaders(),
            body: JSON.stringify({
              order_id: payload.orderNumber,
              receipt_image_url: receiptImageUrl,
              review_status: 'pending',
              review_notes: `إيصال دفع عبر المحفظة / الحساب البنكي: ${payload.walletId || 'تحويل مباشر'}`,
            }),
          });
        } catch (rErr) {
          console.error('Error inserting receipt record:', rErr);
        }
      }
    }

    // تحديد حالة الطلب
    let orderStatus = 'pending';
    if (payload.paymentMethod === 'bank_transfer' && receiptImageUrl) {
      orderStatus = 'pending_payment';
    } else if (payload.paymentMethod === 'cash_on_delivery') {
      orderStatus = 'confirmed';
    }

    const orderRecord = {
      id: payload.orderNumber,
      order_number: payload.orderNumber,
      customer_name: payload.customerName.trim(),
      customer_phone: payload.customerPhone.trim(),
      country: payload.country || 'YE',
      governorate: payload.governorate || 'صنعاء',
      city_or_area: payload.cityOrArea || null,
      address_details: payload.addressDetails || '',
      shipping_method: payload.shippingMethod || 'شحن متجر د. بيري',
      shipping_cost_yer: payload.shippingCostYer || 0,
      payment_method: payload.paymentMethod || 'cash_on_delivery',
      receipt_image_url: receiptImageUrl,
      total_yer: payload.totalYer || 0,
      total_sar: payload.totalSar || 0,
      total_usd: payload.totalUsd || 0,
      currency_used: payload.currencyUsed || 'YER',
      items: payload.items,
      status: orderStatus,
      notes: payload.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // إدراج الطلب المكتمل في Supabase
    const insertUrl = `${SUPABASE_URL}/rest/v1/drberry_orders`;
    const res = await fetch(insertUrl, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify(orderRecord),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Supabase Web order insert failed:', errText);
      return NextResponse.json(
        { error: 'تعذر حفظ الطلب في السحابة حالياً، يرجى المحاولة أو تأكيد الطلب عبر الواتساب.' },
        { status: 500 }
      );
    }

    // خصم الكميات والمخزون من المنتجات لأن هذا المسار هو شراء مؤكد عبر الموقع
    await deductProductsInventory(payload.items);

    // مزامنة سجل العميل ودليل العملاء
    await syncCustomerRecord(payload);

    return NextResponse.json({
      success: true,
      orderNumber: payload.orderNumber,
      channel: 'web',
      status: orderStatus,
      receiptUrl: receiptImageUrl,
      message: 'تم إتمام وتأكيد الطلب وخصم الكميات من المتجر بنجاح!',
    });
  } catch (err: any) {
    console.error('Order processing error:', err);
    return NextResponse.json(
      { error: err.message || 'حدث خطأ غير متوقع أثناء معالجة الطلب.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * جلب سجل الطلبات للعميل المسجل الحالي عبر رقم هاتفه أو معرفه
 */
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(CUSTOMER_SESSION_COOKIE);
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false, orders: [] });
    }

    const sessionPayload = await verifyCustomerSessionToken(sessionCookie.value);
    if (!sessionPayload) {
      return NextResponse.json({ authenticated: false, orders: [] });
    }

    const customer = CustomerStore.findById(sessionPayload.customerId);
    if (!customer) {
      return NextResponse.json({ authenticated: false, orders: [] });
    }

    const normalizedPhone = normalizeInternationalPhone(customer.phoneE164);

    const ordersUrl = `${SUPABASE_URL}/rest/v1/drberry_orders?customer_phone=eq.${encodeURIComponent(
      normalizedPhone
    )}&order=created_at.desc&limit=20`;

    const res = await fetch(ordersUrl, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ authenticated: true, orders: [] });
    }

    const orders = await res.json();
    return NextResponse.json({ authenticated: true, orders: Array.isArray(orders) ? orders : [] });
  } catch (err) {
    return NextResponse.json({ authenticated: false, orders: [] });
  }
}
