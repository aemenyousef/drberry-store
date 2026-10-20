// ============================================================================
// مخزن الحسابات الآمن وإدارة الهوية الرقمية (Secure Customer Account Store)
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import {
  hashPassword,
  verifyPassword,
  normalizeInternationalPhone,
  normalizeEmail,
  generateSecureResetToken,
} from './authSecurity';

export type CustomerAccount = {
  id: string;
  fullName: string;
  phoneE164: string;
  email: string | null;
  passwordHash: string;
  createdAt: string;
  sessionVersion: number;
  countryCode: string;
};

export type ResetTokenRecord = {
  tokenHash: string;
  customerId: string;
  expiresAt: number;
  used: boolean;
};

// ملف تخزين البيانات الآمن للمتجر
const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'customers.json');
const TOKENS_FILE = path.join(DATA_DIR, 'reset_tokens.json');

// ذاكرة احتياطية سريعة
let memoryCustomers: Map<string, CustomerAccount> = new Map();
let memoryTokens: Map<string, ResetTokenRecord> = new Map();

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // بيئة لا تدعم الكتابة على القرص - يتم الاعتماد على الذاكرة
  }
}

function loadFromDisk() {
  ensureDataDir();
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const list: CustomerAccount[] = JSON.parse(raw);
      memoryCustomers = new Map(list.map((c) => [c.id, c]));
    }
  } catch {
    // في حال فشل القراءة
  }

  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const raw = fs.readFileSync(TOKENS_FILE, 'utf-8');
      const list: ResetTokenRecord[] = JSON.parse(raw);
      memoryTokens = new Map(list.map((t) => [t.tokenHash, t]));
    }
  } catch {
    // في حال فشل القراءة
  }
}

function saveToDisk() {
  ensureDataDir();
  try {
    const list = Array.from(memoryCustomers.values());
    fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {
    // fallback to memory
  }

  try {
    const tokens = Array.from(memoryTokens.values());
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
  } catch {
    // fallback to memory
  }
}

// تحميل أولي للبيانات
loadFromDisk();

export const CustomerStore = {
  /**
   * البحث عن حساب برقم الهاتف الدولي E.164
   */
  findByPhone(phone: string): CustomerAccount | null {
    loadFromDisk();
    try {
      const normalized = normalizeInternationalPhone(phone);
      for (const c of memoryCustomers.values()) {
        if (c.phoneE164 === normalized) return c;
      }
    } catch {
      return null;
    }
    return null;
  },

  /**
   * البحث عن حساب بالبريد الإلكتروني
   */
  findByEmail(email: string): CustomerAccount | null {
    loadFromDisk();
    const normalized = normalizeEmail(email);
    for (const c of memoryCustomers.values()) {
      if (c.email && normalizeEmail(c.email) === normalized) return c;
    }
    return null;
  },

  /**
   * البحث عن حساب بالمعرف الرقمي
   */
  findById(id: string): CustomerAccount | null {
    loadFromDisk();
    return memoryCustomers.get(id) || null;
  },

  /**
   * إنشاء حساب عميل جديد مع تشفير فوري لكلمة المرور
   */
  createCustomer(data: {
    fullName: string;
    phoneE164: string;
    email?: string | null;
    password: string;
    countryCode?: string;
  }): CustomerAccount {
    loadFromDisk();
    const normalizedPhone = normalizeInternationalPhone(data.phoneE164);
    const existing = this.findByPhone(normalizedPhone);
    if (existing) {
      throw new Error('رقم الهاتف مسجل مسبقاً. يرجى تسجيل الدخول أو استعادة كلمة المرور.');
    }

    if (data.email) {
      const normalizedEmail = normalizeEmail(data.email);
      const existingEmail = this.findByEmail(normalizedEmail);
      if (existingEmail) {
        throw new Error('البريد الإلكتروني مسجل مسبقاً لحساب آخر.');
      }
    }

    const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const passwordHash = hashPassword(data.password);

    const customer: CustomerAccount = {
      id,
      fullName: data.fullName.trim(),
      phoneE164: normalizedPhone,
      email: data.email ? normalizeEmail(data.email) : null,
      passwordHash,
      createdAt: new Date().toISOString(),
      sessionVersion: 1,
      countryCode: data.countryCode || 'YE',
    };

    memoryCustomers.set(id, customer);
    saveToDisk();
    return customer;
  },

  /**
   * التحقق من بيانات الدخول (رقم هاتف أو بريد + كلمة المرور)
   * مع حماية ضد هجمات التوقيت
   */
  authenticate(identifier: string, password: string): CustomerAccount | null {
    loadFromDisk();
    let account: CustomerAccount | null = null;

    if (identifier.includes('@')) {
      account = this.findByEmail(identifier);
    } else {
      account = this.findByPhone(identifier);
    }

    if (!account) {
      // تنفيذ عملية تحقق وهمية بنفس الوقت لمنع هجمات التوقيت (Timing Attacks)
      verifyPassword(password, 'scrypt$dummy_salt$dummy_digest');
      return null;
    }

    const isMatch = verifyPassword(password, account.passwordHash);
    return isMatch ? account : null;
  },

  /**
   * إنشاء رمز استعادة كلمة المرور المشفر
   */
  createResetToken(identifier: string): { token: string; customerId: string } | null {
    loadFromDisk();
    let account: CustomerAccount | null = null;
    if (identifier.includes('@')) {
      account = this.findByEmail(identifier);
    } else {
      account = this.findByPhone(identifier);
    }

    if (!account) return null;

    const { token, hash } = generateSecureResetToken();
    const expiresAt = Date.now() + 15 * 60 * 1000; // صلاحية 15 دقيقة فقط

    memoryTokens.set(hash, {
      tokenHash: hash,
      customerId: account.id,
      expiresAt,
      used: false,
    });

    saveToDisk();
    return { token, customerId: account.id };
  },

  /**
   * استهلاك رمز الاستعادة وتحديث كلمة المرور
   * مع زيادة sessionVersion لإنهاء كل الجلسات السابقة تلقائياً لحماية العميل
   */
  resetPasswordWithToken(token: string, newPassword: string): boolean {
    loadFromDisk();
    const { createHash } = require('node:crypto');
    const hash = createHash('sha256').update(token).digest('hex');

    const record = memoryTokens.get(hash);
    if (!record || record.used || Date.now() > record.expiresAt) {
      return false;
    }

    const customer = memoryCustomers.get(record.customerId);
    if (!customer) return false;

    // تحديث كلمة المرور ورفع إصدار الجلسة
    customer.passwordHash = hashPassword(newPassword);
    customer.sessionVersion += 1;
    record.used = true;

    saveToDisk();
    return true;
  },
};
