import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';

// ============================================================================
// 1. سياسة وقوة كلمات المرور (Password Security Policy)
// ============================================================================
export const PASSWORD_POLICY = {
  minLength: 8,
  requireLetters: true,
  requireDigits: true,
};

export type PasswordStrength = {
  score: number; // 0: ضعيف جداً, 1: ضعيف, 2: متوسط, 3: جيد, 4: قوي جداً
  labelAr: string;
  labelEn: string;
  isValid: boolean;
  errors: string[];
};

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const errors: string[] = [];
  let score = 0;

  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`يجب أن تتكون كلمة المرور من ${PASSWORD_POLICY.minLength} أحرف على الأقل.`);
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
  }

  // دعم الأحرف العربية والإنجليزية
  const hasLetter = /[A-Za-z\u0600-\u06FF]/.test(password);
  if (!hasLetter) {
    errors.push('يجب أن تحتوي كلمة المرور على حرف واحد على الأقل.');
  }

  // دعم الأرقام العربية والغربية
  const hasDigit = /[\d\u0660-\u0669]/.test(password);
  if (!hasDigit) {
    errors.push('يجب أن تحتوي كلمة المرور على رقم واحد على الأقل.');
  }

  // الرموز الخاصة
  const hasSpecial = /[^A-Za-z0-9\u0600-\u06FF\u0660-\u0669]/.test(password);
  if (hasSpecial) score += 1;

  if (hasLetter && hasDigit) score += 1;

  score = Math.min(4, score);

  const labels = [
    { ar: 'ضعيفة جداً', en: 'Very Weak' },
    { ar: 'ضعيفة', en: 'Weak' },
    { ar: 'متوسطة', en: 'Moderate' },
    { ar: 'قوية', en: 'Strong' },
    { ar: 'قوية جداً ومحمية', en: 'Very Strong' },
  ];

  return {
    score,
    labelAr: labels[score].ar,
    labelEn: labels[score].en,
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// 2. التشفير القياسي لكلمات المرور (Scrypt + Salt + Timing-Safe Verification)
// ============================================================================
/**
 * تشفير كلمة المرور باستخدام خوارزمية scrypt المشهورة بمقاومتها لهجمات ASIC/GPU
 * مع Salt عشوائي 16 بايت وتوليد digest بطول 64 بايت
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const digest = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${digest}`;
}

/**
 * التحقق من كلمة المرور ضد الهاش المخزن
 * تستخدم timingSafeEqual لمنع هجمات التوقيت الجانبية (Timing Attacks)
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

  const [, salt, digest] = parts;
  try {
    const expected = Buffer.from(digest, 'hex');
    const actual = scryptSync(password, salt, 64);
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

// ============================================================================
// 3. تطبيع المدخلات ومنع ثغرات الحسابات (Input Sanitization & Normalization)
// ============================================================================
export function normalizeInternationalPhone(phone: string): string {
  const compact = phone.replace(/[\s\-()]/g, '');
  if (!/^\+[1-9]\d{7,14}$/.test(compact)) {
    throw new Error('يرجى إدخال رقم هاتف دولي صحيح مع رمز الدولة.');
  }
  return compact;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashIdentifier(id: string): string {
  return createHash('sha256').update(id.trim().toLowerCase()).digest('hex');
}

// ============================================================================
// 4. إدارة رموز الجلسات الموقعة رقمياً (Cryptographically Signed Session JWT)
// ============================================================================
const DEFAULT_SECRET = 'drberry_store_secure_master_key_993817264819_jwt_secret';
const encoder = new TextEncoder();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || DEFAULT_SECRET;
  return encoder.encode(secret);
}

export const CUSTOMER_SESSION_COOKIE = 'drberry_customer_session';
export const STANDARD_SESSION_SECONDS = 60 * 60 * 24 * 7; // أسبوع كامل
export const REMEMBERED_SESSION_SECONDS = 60 * 60 * 24 * 30; // 30 يوماً

export type SessionPayload = {
  customerId: string;
  phoneE164: string;
  fullName: string;
  email?: string | null;
  sessionVersion: number;
};

export async function signCustomerSessionToken(
  payload: SessionPayload,
  rememberMe = false
): Promise<string> {
  const duration = rememberMe ? REMEMBERED_SESSION_SECONDS : STANDARD_SESSION_SECONDS;
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${duration}s`)
    .sign(getJwtSecret());
}

export async function verifyCustomerSessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ============================================================================
// 5. رموز استعادة كلمة المرور المشفرة (Cryptographic Reset Tokens)
// ============================================================================
export type PasswordResetToken = {
  token: string;
  customerId: string;
  expiresAt: number; // timestamp ms
  used: boolean;
};

export function generateSecureResetToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('hex');
  const hash = createHash('sha256').update(token).digest('hex');
  return { token, hash };
}
