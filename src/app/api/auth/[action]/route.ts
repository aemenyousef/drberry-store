import { NextRequest, NextResponse } from 'next/server';
import {
  evaluatePasswordStrength,
  normalizeInternationalPhone,
  normalizeEmail,
  signCustomerSessionToken,
  verifyCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE,
  STANDARD_SESSION_SECONDS,
  REMEMBERED_SESSION_SECONDS,
} from '@/lib/authSecurity';
import { RateLimiter } from '@/lib/rateLimiter';
import { CustomerStore } from '@/lib/customerStore';
import { SupabaseAuth, isSupabaseConfigured } from '@/lib/supabaseAuth';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ action: string }> }
) {
  const { action } = await context.params;
  const clientIp = getClientIp(req);

  try {
    // ========================================================================
    // 1. تسجيل حساب جديد (Register)
    // ========================================================================
    if (action === 'register') {
      const regLimit = RateLimiter.checkAndRecord(
        `reg_ip:${clientIp}`,
        6,
        60 * 60 * 1000, // 6 تسجيلات في الساعة لكل IP
        60 * 60 * 1000
      );
      if (!regLimit.allowed) {
        return NextResponse.json(
          { error: regLimit.message || 'تم تجاوز الحد المسموح به لإنشاء الحسابات مؤقتاً.' },
          { status: 429 }
        );
      }

      const body = await req.json();
      const { fullName, phoneE164, email, password, countryCode } = body;

      if (!fullName || !phoneE164 || !password) {
        return NextResponse.json(
          { error: 'جميع الحقول الإلزامية مطلوبة (الاسم الكامل، رقم الهاتف، كلمة المرور).' },
          { status: 400 }
        );
      }

      // فحص سياسة وقوة كلمة المرور
      const strength = evaluatePasswordStrength(password);
      if (!strength.isValid) {
        return NextResponse.json(
          { error: strength.errors[0] || 'كلمة المرور لا تحقق معايير الأمان المطلوبة.' },
          { status: 400 }
        );
      }

      let normalizedPhone: string;
      try {
        normalizedPhone = normalizeInternationalPhone(phoneE164);
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }

      // التحقق من تكرار الهاتف
      const existing = CustomerStore.findByPhone(normalizedPhone);
      if (existing) {
        return NextResponse.json(
          { error: 'رقم الهاتف هذا مسجل مسبقاً في Dr.Berry. يرجى تسجيل الدخول.' },
          { status: 409 }
        );
      }

      // إنشاء الحساب محلياً
      const customer = CustomerStore.createCustomer({
        fullName,
        phoneE164: normalizedPhone,
        email: email ? normalizeEmail(email) : null,
        password,
        countryCode: countryCode || 'YE',
      });

      // مزامنة مع Supabase إذا كانت مفاتيح الخدمة مفعّلة
      if (isSupabaseConfigured()) {
        try {
          await SupabaseAuth.signUp({
            email: customer.email || undefined,
            phone: customer.phoneE164,
            password,
            metadata: { full_name: fullName, customer_id: customer.id },
          });
        } catch {
          // استمرار عمل المتجر حتى لو كانت خدمة خارجية متعطلة
        }
      }

      // إنشاء جلسة آمنة
      const token = await signCustomerSessionToken({
        customerId: customer.id,
        phoneE164: customer.phoneE164,
        fullName: customer.fullName,
        email: customer.email,
        sessionVersion: customer.sessionVersion,
      });

      const response = NextResponse.json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح وتأمينه بأعلى معايير الحماية.',
        customer: {
          id: customer.id,
          fullName: customer.fullName,
          phoneE164: customer.phoneE164,
          email: customer.email,
        },
      });

      response.cookies.set({
        name: CUSTOMER_SESSION_COOKIE,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: STANDARD_SESSION_SECONDS,
      });

      return response;
    }

    // ========================================================================
    // 2. تسجيل الدخول الآمن (Login with Brute-Force & Lockout Protection)
    // ========================================================================
    if (action === 'login') {
      const body = await req.json();
      const { identifier, password, rememberMe } = body;

      if (!identifier || !password) {
        return NextResponse.json(
          { error: 'يرجى إدخال رقم الهاتف أو البريد وكلمة المرور.' },
          { status: 400 }
        );
      }

      const ipKey = `login_ip:${clientIp}`;
      const idKey = `login_id:${identifier.trim().toLowerCase()}`;

      // فحص الحظر من هجمات التخمين
      const ipLock = RateLimiter.isLocked(ipKey);
      if (ipLock.locked) {
        return NextResponse.json(
          { error: `تم تعليق المحاولات لحماية الحساب من هجمات التخمين. يرجى الانتظار ${ipLock.retryAfterSeconds} ثانية.` },
          { status: 429 }
        );
      }

      const idLock = RateLimiter.isLocked(idKey);
      if (idLock.locked) {
        return NextResponse.json(
          { error: `تم قفل محاولات الدخول لهذا الحساب مؤقتاً بسبب تكرار المحاولات الخاطئة. يرجى الانتظار ${idLock.retryAfterSeconds} ثانية.` },
          { status: 429 }
        );
      }

      // محاولة التحقق
      const customer = CustomerStore.authenticate(identifier, password);

      if (!customer) {
        // تسجيل محاولة فاشلة لكل من الـ IP والحساب
        RateLimiter.checkAndRecord(ipKey, 5, 15 * 60 * 1000, 15 * 60 * 1000);
        const limitCheck = RateLimiter.checkAndRecord(idKey, 5, 15 * 60 * 1000, 15 * 60 * 1000);

        // رسالة أمان موحدة تمنع تسريب أسماء المستخدمين (User Enumeration Protection)
        const errorMsg = limitCheck.locked
          ? limitCheck.message
          : 'بيانات الدخول غير صحيحة. يرجى التأكد من رقم الهاتف وكلمة المرور.';

        return NextResponse.json({ error: errorMsg }, { status: 401 });
      }

      // تصفير المحاولات الفاشلة عند النجاح
      RateLimiter.reset(ipKey);
      RateLimiter.reset(idKey);

      // توقيع توكن الجلسة
      const duration = rememberMe ? REMEMBERED_SESSION_SECONDS : STANDARD_SESSION_SECONDS;
      const token = await signCustomerSessionToken(
        {
          customerId: customer.id,
          phoneE164: customer.phoneE164,
          fullName: customer.fullName,
          email: customer.email,
          sessionVersion: customer.sessionVersion,
        },
        Boolean(rememberMe)
      );

      const response = NextResponse.json({
        success: true,
        customer: {
          id: customer.id,
          fullName: customer.fullName,
          phoneE164: customer.phoneE164,
          email: customer.email,
        },
      });

      response.cookies.set({
        name: CUSTOMER_SESSION_COOKIE,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: duration,
      });

      return response;
    }

    // ========================================================================
    // 3. طلب استعادة كلمة المرور (Password Recovery Request)
    // ========================================================================
    if (action === 'recover') {
      const recLimit = RateLimiter.checkAndRecord(
        `recover_ip:${clientIp}`,
        4,
        60 * 60 * 1000, // 4 طلبات استعادة في الساعة كحد أقصى
        60 * 60 * 1000
      );
      if (!recLimit.allowed) {
        return NextResponse.json(
          { error: 'تم تجاوز الحد المسموح به لطلبات الاستعادة. يرجى المحاولة لاحقاً.' },
          { status: 429 }
        );
      }

      const body = await req.json();
      const { emailOrPhone } = body;

      if (!emailOrPhone) {
        return NextResponse.json(
          { error: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف.' },
          { status: 400 }
        );
      }

      // محاولة إنشاء التوكن
      const result = CustomerStore.createResetToken(emailOrPhone);

      // إذا كان Supabase مفعلاً ولديه بريد
      if (emailOrPhone.includes('@') && isSupabaseConfigured()) {
        try {
          await SupabaseAuth.resetPasswordForEmail(emailOrPhone);
        } catch {
          // استمرار العمل
        }
      }

      // رسالة أمان عامة لحماية خصوصية المستخدمين وعدم كشف وجود الحساب
      return NextResponse.json({
        success: true,
        message: 'إذا كان هذا الحساب مسجلاً لدينا، فستصلك تعليمات استعادة كلمة المرور فوراً.',
        // في بيئة التطوير المحلية، نرفق رمز الاستعادة لتسهيل تجربة المطور
        devToken: process.env.NODE_ENV !== 'production' && result ? result.token : undefined,
      });
    }

    // ========================================================================
    // 4. تأكيد وإعادة تعيين كلمة المرور (Reset Password Confirmation)
    // ========================================================================
    if (action === 'reset-password') {
      const body = await req.json();
      const { token, newPassword } = body;

      if (!token || !newPassword) {
        return NextResponse.json(
          { error: 'رمز الاستعادة وكلمة المرور الجديدة مطلوبان.' },
          { status: 400 }
        );
      }

      // فحص سياسة كلمة المرور الجديدة
      const strength = evaluatePasswordStrength(newPassword);
      if (!strength.isValid) {
        return NextResponse.json(
          { error: strength.errors[0] || 'كلمة المرور لا تحقق معايير الأمان.' },
          { status: 400 }
        );
      }

      const ok = CustomerStore.resetPasswordWithToken(token, newPassword);
      if (!ok) {
        return NextResponse.json(
          { error: 'رمز الاستعادة غير صالح أو انتهت صلاحيته الزمنية (15 دقيقة).' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'تم تغيير كلمة المرور بنجاح! تم إنهاء كافة الجلسات السابقة لحمايتك.',
      });
    }

    // ========================================================================
    // 5. تسجيل الخروج الآمن (Logout)
    // ========================================================================
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'تم تسجيل الخروج بنجاح.' });
      response.cookies.set({
        name: CUSTOMER_SESSION_COOKIE,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return response;
    }

    return NextResponse.json({ error: 'إجراء غير معروف.' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'حدث خطأ غير متوقع أثناء معالجة الطلب.' },
      { status: 500 }
    );
  }
}

// ============================================================================
// 6. التحقق من جلسة العميل الحالية (GET /api/auth/me)
// ============================================================================
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ action: string }> }
) {
  const { action } = await context.params;

  if (action === 'me') {
    const sessionCookie = req.cookies.get(CUSTOMER_SESSION_COOKIE);
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false, customer: null });
    }

    const payload = await verifyCustomerSessionToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ authenticated: false, customer: null });
    }

    const customer = CustomerStore.findById(payload.customerId);
    if (!customer) {
      return NextResponse.json({ authenticated: false, customer: null });
    }

    // التحقق من إصدار الجلسة (إلغاء الصلاحية فور تغيير كلمة المرور)
    if (customer.sessionVersion !== payload.sessionVersion) {
      return NextResponse.json({ authenticated: false, customer: null });
    }

    return NextResponse.json({
      authenticated: true,
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        phoneE164: customer.phoneE164,
        email: customer.email,
        countryCode: customer.countryCode,
      },
    });
  }

  return NextResponse.json({ error: 'إجراء غير معروف.' }, { status: 404 });
}
