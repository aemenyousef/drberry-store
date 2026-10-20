'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';

function ResetPasswordForm() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordError = password && password.length < 8
    ? (locale === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters')
    : '';

  const confirmError = confirm && password !== confirm
    ? (locale === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
    : '';

  const isDisabled = loading || !token || !password || !confirm || Boolean(passwordError) || Boolean(confirmError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'فشل إعادة تعيين كلمة المرور.');
        return;
      }

      setSuccess(true);
    } catch {
      setError(locale === 'ar' ? 'تعذر الاتصال بالخادم.' : 'Connection failed.');
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: '#7D2C42', fontWeight: '800', marginBottom: '12px' }}>
          {locale === 'ar' ? 'رابط الاستعادة غير مكتمل' : 'Invalid Reset Link'}
        </h2>
        <p style={{ color: '#80686b', fontSize: '0.88rem', marginBottom: '24px' }}>
          {locale === 'ar'
            ? 'يبدو أن الرابط المستخدم لا يحتوي على رمز الأمان المطلوب. يرجى طلب رابط جديد.'
            : 'The reset link is missing a security token. Please request a new one.'}
        </p>
        <Link href="/login" style={{
          display: 'inline-block', padding: '12px 32px', borderRadius: '24px',
          background: '#7D2C42', color: 'white', fontWeight: '700', fontSize: '0.9rem',
          textDecoration: 'none'
        }}>
          {locale === 'ar' ? 'الذهاب لصفحة تسجيل الدخول' : 'Go to Sign In'}
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ color: '#7D2C42', fontWeight: '800', marginBottom: '12px' }}>
          {locale === 'ar' ? 'تم تحديث كلمة المرور بنجاح!' : 'Password Updated!'}
        </h2>
        <p style={{ color: '#59484a', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.7' }}>
          {locale === 'ar'
            ? 'تم تشفير كلمة المرور الجديدة وإنهاء كافة الجلسات السابقة لحمايتك. يمكنكِ الآن تسجيل الدخول بكلمة المرور الجديدة.'
            : 'Your password was encrypted and previous sessions invalidated. You can now sign in.'}
        </p>
        <Link href="/login" style={{
          display: 'inline-block', padding: '12px 36px', borderRadius: '24px',
          background: '#7D2C42', color: 'white', fontWeight: '700', fontSize: '0.95rem',
          textDecoration: 'none', boxShadow: '0 4px 16px rgba(125,44,66,0.3)'
        }}>
          {locale === 'ar' ? 'تسجيل الدخول الآن ←' : 'Sign In Now →'}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#3a1c24', marginBottom: '6px' }}>
          {locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder={locale === 'ar' ? '8 أحرف على الأقل' : 'At least 8 characters'}
            style={{
              display: 'block', width: '100%', height: '46px', borderRadius: '12px',
              border: '1px solid #e0ccd3', background: 'white', padding: '0 12px',
              fontSize: '0.88rem', color: '#3a1c24', outline: 'none', boxSizing: 'border-box'
            }}
          />
          <button type="button" onClick={() => setShowPwd(v => !v)}
            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: locale === 'ar' ? 'auto' : '12px', right: locale === 'ar' ? '12px' : 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#80686b', fontSize: '15px' }}
          >{showPwd ? '🙈' : '👁️'}</button>
        </div>
        {passwordError && <small style={{ color: '#c94a6e', fontSize: '0.76rem', display: 'block', marginTop: '4px' }}>⚠️ {passwordError}</small>}
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#3a1c24', marginBottom: '6px' }}>
          {locale === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
        </label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          style={{
            display: 'block', width: '100%', height: '46px', borderRadius: '12px',
            border: '1px solid #e0ccd3', background: 'white', padding: '0 12px',
            fontSize: '0.88rem', color: '#3a1c24', outline: 'none', boxSizing: 'border-box'
          }}
        />
        {confirmError && <small style={{ color: '#c94a6e', fontSize: '0.76rem', display: 'block', marginTop: '4px' }}>⚠️ {confirmError}</small>}
      </div>

      {error && (
        <div style={{ background: '#fff0f3', border: '1px solid #f7a8ba', borderRadius: '12px', padding: '10px 14px', color: '#9b2745', fontSize: '0.82rem' }}>
          ⚠️ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isDisabled}
        style={{
          height: '48px', borderRadius: '24px', background: '#7D2C42',
          color: 'white', fontWeight: '700', fontSize: '0.95rem', border: 'none',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.6 : 1, marginTop: '8px',
          boxShadow: '0 4px 16px rgba(125,44,66,0.3)',
          fontFamily: 'var(--font-tajawal, inherit)'
        }}
      >
        {loading ? (locale === 'ar' ? 'جاري الحفظ والتأمين...' : 'Saving securely...') : (locale === 'ar' ? 'حفظ كلمة المرور الجديدة' : 'Save New Password')}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const locale = useLocale();

  return (
    <main
      className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{ background: 'linear-gradient(135deg, #fdf6f8 0%, #f9edf1 50%, #f4e2d1 100%)' }}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div style={{
        width: '100%', maxWidth: '480px', background: 'white', borderRadius: '28px',
        padding: '36px 32px', boxShadow: '0 18px 55px rgba(61,37,41,0.10)',
        border: '1px solid #eadfd8'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #FCAECA 0%, #C65C7C 50%, #7D2C42 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: '900', color: 'white', marginBottom: '12px'
          }}>Dr</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#3a1c24' }}>
            {locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
          </h1>
          <p style={{ color: '#80686b', fontSize: '0.82rem', marginTop: '4px' }}>
            {locale === 'ar' ? 'اختر كلمة مرور قوية لحماية حسابك في Dr.Berry' : 'Choose a strong password to protect your account'}
          </p>
        </div>

        <Suspense fallback={<p style={{ textAlign: 'center', color: '#80686b' }}>جاري التحميل...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
