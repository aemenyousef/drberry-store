// ============================================================================
// نظام الحماية من هجمات التخمين وإغراق الطلبات (Brute-Force & Rate Limiting)
// ============================================================================

type RateLimitRecord = {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  lockedUntil: number | null;
};

// مخزن الذاكرة المحلي للطلبات
const rateLimitMap = new Map<string, RateLimitRecord>();

// تنظيف دوري للذاكرة كل 10 دقائق لتجنب تضخم الذاكرة
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (record.lockedUntil && record.lockedUntil > now) continue;
      // مسح السجلات التي مر عليها أكثر من ساعة
      if (now - record.lastAttempt > 60 * 60 * 1000) {
        rateLimitMap.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export type RateLimitResult = {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
  locked: boolean;
  message?: string;
};

export const RateLimiter = {
  /**
   * فحص ما إذا كان المفتاح (IP أو رقم هاتف أو بريد) محظوراً حالياً
   */
  isLocked(key: string): { locked: boolean; retryAfterSeconds: number } {
    const record = rateLimitMap.get(key);
    if (!record || !record.lockedUntil) {
      return { locked: false, retryAfterSeconds: 0 };
    }

    const now = Date.now();
    if (record.lockedUntil > now) {
      const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { locked: true, retryAfterSeconds };
    }

    // انتهاء مدة الحظر
    record.lockedUntil = null;
    record.attempts = 0;
    return { locked: false, retryAfterSeconds: 0 };
  },

  /**
   * فحص وتطبيق محاولة مع تحديد حد أقصى
   * @param key المفتاح الفريد (مثل: ip + action أو phone + login)
   * @param maxAttempts أقصى عدد محاولات مسموح به
   * @param windowMs النافذة الزمنية بالمللي ثانية
   * @param lockoutMs مدة الحظر في حال تجاوز الحد
   */
  checkAndRecord(
    key: string,
    maxAttempts = 5,
    windowMs = 15 * 60 * 1000, // 15 دقيقة
    lockoutMs = 15 * 60 * 1000  // حظر 15 دقيقة
  ): RateLimitResult {
    const now = Date.now();
    let record = rateLimitMap.get(key);

    if (!record) {
      record = {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
        lockedUntil: null,
      };
      rateLimitMap.set(key, record);
      return {
        allowed: true,
        remainingAttempts: maxAttempts - 1,
        retryAfterSeconds: 0,
        locked: false,
      };
    }

    // التحقق من حالة الحظر الحالية
    if (record.lockedUntil && record.lockedUntil > now) {
      const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
        locked: true,
        message: `تم تعليق المحاولات مؤقتاً لحماية الحساب. يرجى الانتظار ${retryAfterSeconds} ثانية.`,
      };
    }

    // إعادة التصفير إذا انتهت النافذة الزمنية
    if (now - record.firstAttempt > windowMs) {
      record.attempts = 1;
      record.firstAttempt = now;
      record.lastAttempt = now;
      record.lockedUntil = null;
      return {
        allowed: true,
        remainingAttempts: maxAttempts - 1,
        retryAfterSeconds: 0,
        locked: false,
      };
    }

    // زيادة عدد المحاولات
    record.attempts += 1;
    record.lastAttempt = now;

    if (record.attempts > maxAttempts) {
      record.lockedUntil = now + lockoutMs;
      const retryAfterSeconds = Math.ceil(lockoutMs / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
        locked: true,
        message: `تم تجاوز الحد الأقصى للمحاولات الفاشلة. تم تعليق المحاولات لمدة ${Math.ceil(lockoutMs / 60000)} دقيقة للحماية من الاختراق.`,
      };
    }

    return {
      allowed: true,
      remainingAttempts: maxAttempts - record.attempts,
      retryAfterSeconds: 0,
      locked: false,
    };
  },

  /**
   * تصفير المحاولات عند نجاح العملية (مثل تسجيل دخول صحيح)
   */
  reset(key: string): void {
    rateLimitMap.delete(key);
  },
};
