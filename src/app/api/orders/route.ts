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
  fileName: string = 'receipt.jpg'
): Promise<string | null> {
  try {
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const safeExt = fileName.split('.').pop() || 'jpg';
    const storagePath = `receipts/${orderNumber}_${Date.now()}.${safeExt}`;

    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/drberry-media/${storagePath}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'image/jpeg',
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      console.warn('Storage upload error response:', await uploadRes.text());
      return null;
    }

    return `${SUPABASE_URL}/storage/v1/object/public/drberry-media/${storagePath}`;
  } catch (err) {
    console.warn('Failed to upload receipt to Supabase Storage:', err);
    return null;
  }
}

/**
 * دالة لخصم المخزون الحقيقي من جدول المنتجات في Supabase
 */
async function deductProductStock(productId: string, quantityDeducted: number): Promise<void> {
  try {
    const fetchUrl = `${SUPABASE_URL}/rest/v1/drberry_products?id=eq.${encodeURIComponent(
      productId
    )}&select=stock_quantity`;
    const res = await fetch(fetchUrl, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!res.ok) return;
    const data = await res.json();
    if (!data || data.length === 0) return;

    const currentStock = Number(data[0].stock_quantity) || 0;
    const newStock = Math.max(0, currentStock - quantityDeducted);

    const updateUrl = `${SUPABASE_URL}/rest/v1/drberry_products?id=eq.${encodeURIComponent(productId)}`;
    await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stock_quantity: newStock,
        in_stock: newStock > 0,
      }),
    });
  } catch (err) {
    console.warn(`Failed to deduct stock for ${productId}:`, err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload: CreateOrderPayload = await req.json();

    if (!payload.orderNumber || !payload.customerName || !payload.customerPhone) {
      return NextResponse.json(
        { error: 'جميع بيانات العميل الأساسية مطلوبة (الاسم، الهاتف، ورقم الطلب).' },
        { status: 400 }
      );
    }

    if (!payload.items || payload.items.length === 0) {
      return NextResponse.json(
        { error: 'سلة الطلب فارغة، يرجى إضافة منتج واحد على الأقل.' },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------------------
    // المسار الثاني: استفسار وطلب الواتساب السريع (WhatsApp Track)
    // -------------------------------------------------------------------------
    if (payload.channel === 'whatsapp') {
      const orderRecord = {
        order_number: payload.orderNumber,
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone,
        country: payload.country || 'اليمن',
        governorate: payload.governorate || 'صنعاء',
        city_area: payload.cityOrArea || '',
        address_details: payload.addressDetails || 'طلب استفسار عبر الواتساب',
        shipping_method: payload.shippingMethod || 'واتساب - اتفاق مباشر',
        shipping_cost_yer: 0,
        payment_method: 'whatsapp',
        currency_used: payload.currencyUsed || 'YER',
        total_yer: payload.totalYer || 0,
        total_sar: payload.totalSar || 0,
        total_usd: payload.totalUsd || 0,
        status: 'whatsapp_lead',
        items: payload.items,
        notes: payload.notes || 'طلب واتساب مباشر - بانتظار تواصل العميل',
        custom_shipping_preference: payload.customShippingPreference || '',
        created_at: new Date().toISOString(),
      };

      const insertUrl = `${SUPABASE_URL}/rest/v1/drberry_orders`;
      await fetch(insertUrl, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(orderRecord),
      });

      const customerRecord = {
        full_name: payload.customerName,
        phone: payload.customerPhone,
        governorate: payload.governorate,
        last_order_at: new Date().toISOString(),
      };
      await fetch(`${SUPABASE_URL}/rest/v1/drberry_customers`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(customerRecord),
      }).catch(() => {});

      let waText = `🌸 *طلب واستفسار جديد من متجر Dr.Berry الرسمي* 🌸\n\n`;
      waText += `📦 *رقم الطلب:* ${payload.orderNumber}\n`;
      waText += `👤 *اسم العميل:* ${payload.customerName}\n`;
      waText += `📱 *رقم الهاتف:* ${payload.customerPhone}\n`;
      waText += `📍 *الموقع:* ${payload.governorate} - ${payload.addressDetails || ''}\n\n`;
      waText += `🛍️ *المنتجات المطلوبة:*\n`;
      payload.items.forEach((item, idx) => {
        waText += `${idx + 1}. ${item.title} (${item.volume || ''}) × ${item.quantity}\n`;
      });
      waText += `\n💰 *الإجمالي المقدر:* ${payload.totalYer.toLocaleString()} ر.ي\n`;
      waText += `\n💬 *يرجى تأكيد توفر المنتجات وطريقة التوصيل والدفع.*`;

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

      return NextResponse.json({
        success: true,
        orderNumber: payload.orderNumber,
        channel: 'whatsapp',
        status: 'whatsapp_lead',
        whatsappUrl,
        message: 'تم تسجيل استفسارك بنجاح وفتح محادثة الواتساب للتأكيد.',
      });
    }

    // -------------------------------------------------------------------------
    // المسار الأول: الشراء المباشر عبر الموقع (Web Checkout)
    // -------------------------------------------------------------------------
    let receiptImageUrl: string | null = null;
    let orderStatus = 'pending_payment';

    if (payload.paymentMethod === 'bank_transfer' && payload.receiptBase64) {
      receiptImageUrl = await uploadReceiptToStorage(
        payload.orderNumber,
        payload.receiptBase64,
        payload.receiptFileName || 'receipt.jpg'
      );
      if (receiptImageUrl) {
        orderStatus = 'receipt_uploaded';
      }
    } else if (payload.paymentMethod === 'cash_on_delivery') {
      orderStatus = 'pending_confirmation';
    }

    const orderRecord = {
      order_number: payload.orderNumber,
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      country: payload.country,
      governorate: payload.governorate,
      city_area: payload.cityOrArea || '',
      address_details: payload.addressDetails,
      shipping_method: payload.shippingMethod,
      shipping_cost_yer: payload.shippingCostYer || 0,
      payment_method: payload.paymentMethod,
      wallet_id: payload.walletId || null,
      currency_used: payload.currencyUsed,
      total_yer: payload.totalYer,
      total_sar: payload.totalSar || 0,
      total_usd: payload.totalUsd || 0,
      status: orderStatus,
      items: payload.items,
      receipt_url: receiptImageUrl,
      notes: payload.notes || '',
      custom_shipping_preference: payload.customShippingPreference || '',
      created_at: new Date().toISOString(),
    };

    const insertOrderUrl = `${SUPABASE_URL}/rest/v1/drberry_orders`;
    const insertRes = await fetch(insertOrderUrl, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify(orderRecord),
    });

    if (!insertRes.ok) {
      console.warn('Failed to insert order to Supabase:', await insertRes.text());
    }

    if (receiptImageUrl) {
      const receiptRecord = {
        order_number: payload.orderNumber,
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone,
        wallet_id: payload.walletId || 'bank_transfer',
        amount_yer: payload.totalYer,
        receipt_image_url: receiptImageUrl,
        status: 'pending_review',
        created_at: new Date().toISOString(),
      };
      await fetch(`${SUPABASE_URL}/rest/v1/drberry_payment_receipts`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(receiptRecord),
      }).catch(() => {});
    }

    for (const item of payload.items) {
      await deductProductStock(item.id, item.quantity);
    }

    const customerRecord = {
      full_name: payload.customerName,
      phone: payload.customerPhone,
      country: payload.country,
      governorate: payload.governorate,
      address: payload.addressDetails,
      last_order_at: new Date().toISOString(),
    };
    await fetch(`${SUPABASE_URL}/rest/v1/drberry_customers`, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify(customerRecord),
    }).catch(() => {});

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
 * 1. استعلام التتبع العام برقم الطلب ورقم الهاتف (?lookup=1&orderNumber=...&phone=...)
 * 2. أو استعلام سجل طلبات العميل المسجل عبر الكوكي
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isLookup = searchParams.get('lookup') === '1';
    const orderNumber = searchParams.get('orderNumber')?.trim();
    const phone = searchParams.get('phone')?.trim();

    // مسار تتبع الطلب المباشر
    if (isLookup && orderNumber) {
      const ordersUrl = `${SUPABASE_URL}/rest/v1/drberry_orders?order_number=eq.${encodeURIComponent(
        orderNumber
      )}&select=*&limit=1`;

      const res = await fetch(ordersUrl, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      if (!res.ok) {
        return NextResponse.json({ success: false, message: 'تعذر جلب بيانات الطلب' }, { status: 404 });
      }

      const orders = await res.json();
      if (!orders || orders.length === 0) {
        return NextResponse.json({ success: false, message: 'لم يتم العثور على طلب بهذا الرقم' }, { status: 404 });
      }

      const order = orders[0];
      // التحقق البسيط من الهاتف لحماية الخصوصية إذا تم تزويده
      if (phone) {
        const cleanInputPhone = phone.replace(/\D/g, '').slice(-7);
        const cleanDbPhone = (order.customer_phone || '').replace(/\D/g, '').slice(-7);
        if (cleanInputPhone && cleanDbPhone && !cleanDbPhone.includes(cleanInputPhone)) {
          return NextResponse.json(
            { success: false, message: 'رقم الهاتف غير مطابق لهذا الطلب' },
            { status: 403 }
          );
        }
      }

      return NextResponse.json({ success: true, order });
    }

    // مسار العميل المسجل
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
