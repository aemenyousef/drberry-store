// ============================================================================
// عميل Supabase Auth المتكامل (Lightweight, High-Performance Supabase Client)
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function isSupabaseConfigured(): boolean {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_ANON_KEY.includes('...')
  );
}

function getSupabaseHeaders(token?: string) {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
}

export const SupabaseAuth = {
  /**
   * تسجيل حساب جديد في Supabase
   */
  async signUp(params: {
    email?: string;
    phone?: string;
    password: string;
    metadata?: Record<string, any>;
  }) {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const endpoint = `${SUPABASE_URL}/auth/v1/signup`;
    const body: Record<string, any> = {
      password: params.password,
      data: params.metadata || {},
    };

    if (params.email) body.email = params.email;
    if (params.phone) body.phone = params.phone;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.msg || data.error_description || data.message || 'فشل التسجيل في Supabase');
    }
    return data;
  },

  /**
   * تسجيل الدخول في Supabase
   */
  async signInWithPassword(params: {
    email?: string;
    phone?: string;
    password: string;
  }) {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const endpoint = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
    const body: Record<string, any> = { password: params.password };
    if (params.email) body.email = params.email;
    if (params.phone) body.phone = params.phone;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.msg || data.error_description || data.message || 'بيانات الدخول غير صحيحة');
    }
    return data;
  },

  /**
   * طلب استعادة كلمة المرور عبر Supabase
   */
  async resetPasswordForEmail(email: string, redirectTo?: string) {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const endpoint = `${SUPABASE_URL}/auth/v1/recover`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: getSupabaseHeaders(),
      body: JSON.stringify({
        email,
        gotrue_meta_security: {},
      }),
    });

    const data = await res.json();
    return res.ok;
  },
};
