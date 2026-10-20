'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';

type Mode = 'login' | 'register' | 'recover';

// ─── Country Phone Codes ──────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'YE', name: 'اليمن', nameEn: 'Yemen', dial: '+967', flag: '🇾🇪' },
  { code: 'SA', name: 'السعودية', nameEn: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'الإمارات', nameEn: 'UAE', dial: '+971', flag: '🇦🇪' },
  { code: 'KW', name: 'الكويت', nameEn: 'Kuwait', dial: '+965', flag: '🇰🇼' },
  { code: 'QA', name: 'قطر', nameEn: 'Qatar', dial: '+974', flag: '🇶🇦' },
  { code: 'BH', name: 'البحرين', nameEn: 'Bahrain', dial: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'عُمان', nameEn: 'Oman', dial: '+968', flag: '🇴🇲' },
  { code: 'JO', name: 'الأردن', nameEn: 'Jordan', dial: '+962', flag: '🇯🇴' },
  { code: 'EG', name: 'مصر', nameEn: 'Egypt', dial: '+20', flag: '🇪🇬' },
  { code: 'LB', name: 'لبنان', nameEn: 'Lebanon', dial: '+961', flag: '🇱🇧' },
  { code: 'IQ', name: 'العراق', nameEn: 'Iraq', dial: '+964', flag: '🇮🇶' },
  { code: 'SY', name: 'سوريا', nameEn: 'Syria', dial: '+963', flag: '🇸🇾' },
  { code: 'GB', name: 'المملكة المتحدة', nameEn: 'UK', dial: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'الولايات المتحدة', nameEn: 'USA', dial: '+1', flag: '🇺🇸' },
  { code: 'TR', name: 'تركيا', nameEn: 'Turkey', dial: '+90', flag: '🇹🇷' },
];

function buildE164(dialCode: string, localPhone: string): string {
  const cleaned = localPhone.replace(/\D/g, '').replace(/^0+/, '');
  if (!cleaned) return '';
  return `${dialCode}${cleaned}`;
}

// ─── Password Strength Evaluator (Client-Side) ──────────────────────────────
function getStrength(pwd: string) {
  let score = 0;
  if (!pwd) return { score: 0, label: '', color: '#ccc' };
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 11) score += 1;
  if (/[A-Za-z\u0600-\u06FF]/.test(pwd) && /[\d\u0660-\u0669]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9\u0600-\u06FF\u0660-\u0669]/.test(pwd)) score += 1;

  if (score <= 1) return { score: 1, label: 'ضعيفة', color: '#e53e3e' };
  if (score === 2) return { score: 2, label: 'متوسطة', color: '#dd6b20' };
  if (score === 3) return { score: 3, label: 'جيدة جداً', color: '#319795' };
  return { score: 4, label: 'قوية ومحمية بأعلى المعايير', color: '#38a169' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#3a1c24', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
      {hint && <small style={{ display: 'block', marginTop: '4px', color: '#80686b', fontSize: '0.75rem', lineHeight: '1.4' }}>{hint}</small>}
    </div>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div style={{
      background: '#fff0f3', border: '1px solid #f7a8ba', borderRadius: '12px',
      padding: '10px 14px', color: '#9b2745', fontSize: '0.82rem', lineHeight: '1.5'
    }}>
      🛡️ {text}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', height: '46px', borderRadius: '12px',
  border: '1px solid #e0ccd3', background: 'white', padding: '0 12px',
  fontSize: '0.88rem', color: '#3a1c24', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'var(--font-tajawal, inherit)'
};

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...inputStyle, ...props.style }}
      onFocus={e => { e.target.style.borderColor = '#7D2C42'; e.target.style.boxShadow = '0 0 0 3px rgba(125,44,66,0.12)'; }}
      onBlur={e => { e.target.style.borderColor = '#e0ccd3'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

// ─── Phone Country Selector ───────────────────────────────────────────────────
function PhoneCountryFields({
  country, localPhone, onCountryChange, onLocalPhoneChange, isRTL
}: {
  country: typeof COUNTRIES[0]; localPhone: string;
  onCountryChange: (c: typeof COUNTRIES[0]) => void;
  onLocalPhoneChange: (v: string) => void;
  isRTL: boolean;
}) {
  const locale = useLocale();
  return (
    <Field label={locale === 'ar' ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp Number'}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <select
          value={country.code}
          onChange={e => onCountryChange(COUNTRIES.find(c => c.code === e.target.value)!)}
          style={{
            height: '46px', borderRadius: '12px', border: '1px solid #e0ccd3',
            background: 'white', padding: '0 8px', fontSize: '0.82rem',
            color: '#3a1c24', outline: 'none', cursor: 'pointer', flexShrink: 0,
            fontFamily: 'var(--font-tajawal, inherit)', minWidth: '110px'
          }}
          onFocus={e => { e.target.style.borderColor = '#7D2C42'; }}
          onBlur={e => { e.target.style.borderColor = '#e0ccd3'; }}
        >
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.dial}
            </option>
          ))}
        </select>
        <StyledInput
          type="tel"
          dir="ltr"
          value={localPhone}
          onChange={e => onLocalPhoneChange(e.target.value)}
          placeholder={country.code === 'YE' ? '77 XXX XXXX' : 'XXXXXXXXX'}
          style={{ flex: 1 }}
        />
      </div>
    </Field>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onRecover, onSuccess }: { onRecover: () => void; onSuccess: (name: string) => void }) {
  const locale = useLocale();
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [localPhone, setLocalPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const phoneE164 = useMemo(() => buildE164(country.dial, localPhone), [country, localPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneE164 || !password) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phoneE164, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (locale === 'ar' ? 'فشل تسجيل الدخول. يرجى التأكد من البيانات.' : 'Login failed. Please check your credentials.'));
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(data.customer?.fullName || '');
    } catch {
      setError(locale === 'ar' ? 'تعذر الاتصال بالخادم. يرجى المحاولة بعد لحظات.' : 'Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', marginTop: '24px' }}>
      <PhoneCountryFields
        country={country} localPhone={localPhone}
        onCountryChange={setCountry} onLocalPhoneChange={setLocalPhone}
        isRTL={locale === 'ar'}
      />
      {phoneE164 && (
        <p style={{ fontSize: '0.75rem', color: '#80686b', marginTop: '-8px' }}>
          {locale === 'ar' ? 'سيتم استخدام الرقم:' : 'Will use number:'}{' '}
          <b dir="ltr">{phoneE164}</b>
        </p>
      )}

      <Field label={locale === 'ar' ? 'كلمة المرور' : 'Password'}>
        <div style={{ position: 'relative' }}>
          <StyledInput
            id="login-password"
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder={locale === 'ar' ? 'كلمة المرور الخاصة بكِ' : 'Your password'}
            style={{ paddingLeft: locale === 'ar' ? '12px' : '40px', paddingRight: locale === 'ar' ? '40px' : '12px' }}
          />
          <button type="button" onClick={() => setShowPwd(v => !v)}
            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', ...(locale === 'ar' ? { right: '12px' } : { left: '12px' }), background: 'none', border: 'none', cursor: 'pointer', color: '#80686b', fontSize: '15px' }}
          >{showPwd ? '🙈' : '👁️'}</button>
        </div>
      </Field>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: '#59484a' }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            style={{ accentColor: '#7D2C42' }}
          />
          <span>{locale === 'ar' ? 'تذكرني (جلسة آمنة لـ 30 يوماً)' : 'Remember me (Secure 30-day session)'}</span>
        </label>

        <button
          type="button"
          onClick={onRecover}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7D2C42', fontSize: '0.82rem', fontWeight: '600', padding: '0', fontFamily: 'var(--font-tajawal, inherit)' }}
        >
          {locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
        </button>
      </div>

      {error && <ErrorBox text={error} />}

      <button
        id="login-submit-btn"
        type="submit"
        disabled={loading || !phoneE164 || !password}
        style={{
          height: '48px', borderRadius: '24px', background: '#7D2C42',
          color: 'white', fontWeight: '700', fontSize: '0.95rem', border: 'none',
          cursor: loading || !phoneE164 || !password ? 'not-allowed' : 'pointer',
          opacity: loading || !phoneE164 || !password ? 0.6 : 1,
          transition: 'all 0.2s', marginTop: '4px',
          fontFamily: 'var(--font-tajawal, inherit)',
          boxShadow: '0 4px 16px rgba(125,44,66,0.3)'
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6a2438'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#7D2C42'; }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
            {locale === 'ar' ? 'جاري التحقق الآمن...' : 'Verifying securely...'}
          </span>
        ) : (locale === 'ar' ? 'تسجيل الدخول الآمن' : 'Secure Sign In')}
      </button>
    </form>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────
function RegisterForm({ onSuccess }: { onSuccess: (name: string) => void }) {
  const locale = useLocale();
  const [form, setForm] = useState({ fullName: '', email: '', localPhone: '', password: '', confirm: '', privacyConsent: false });
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const phoneE164 = useMemo(() => buildE164(country.dial, form.localPhone), [country, form.localPhone]);
  const strength = useMemo(() => getStrength(form.password), [form.password]);

  const passwordError = form.password && form.password.length < 8
    ? (locale === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters')
    : '';

  const confirmError = form.confirm && form.password !== form.confirm
    ? (locale === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
    : '';

  const isDisabled = loading || !form.fullName.trim() || !phoneE164 || !form.privacyConsent || Boolean(passwordError) || Boolean(confirmError) || !form.password || !form.confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          phoneE164,
          email: form.email || null,
          password: form.password,
          countryCode: country.code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (locale === 'ar' ? 'فشل إنشاء الحساب.' : 'Registration failed.'));
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(form.fullName);
    } catch {
      setError(locale === 'ar' ? 'تعذر الاتصال بالخادم. يرجى المحاولة بعد لحظات.' : 'Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px', marginTop: '24px' }}>
      <Field label={locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}>
        <StyledInput
          id="register-name"
          value={form.fullName}
          onChange={e => setForm({ ...form, fullName: e.target.value })}
          required
          placeholder={locale === 'ar' ? 'اسمك الكريم' : 'Your full name'}
        />
      </Field>

      <Field
        label={locale === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email Address (optional)'}
        hint={locale === 'ar'
          ? 'يلزم البريد لاستعادة كلمة المرور وإشعارات الشحن.'
          : 'Required for password recovery and order tracking.'}
      >
        <StyledInput
          id="register-email"
          type="email"
          dir="ltr"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="your@email.com"
        />
      </Field>

      <PhoneCountryFields
        country={country} localPhone={form.localPhone}
        onCountryChange={setCountry}
        onLocalPhoneChange={v => setForm({ ...form, localPhone: v })}
        isRTL={locale === 'ar'}
      />
      {phoneE164 && (
        <p style={{ fontSize: '0.75rem', color: '#80686b', marginTop: '-6px' }}>
          {locale === 'ar' ? 'سيُسجّل الرقم بصيغة:' : 'Number will be saved as:'}{' '}
          <b dir="ltr">{phoneE164}</b>
        </p>
      )}

      <Field
        label={locale === 'ar' ? 'كلمة المرور' : 'Password'}
        hint={locale === 'ar' ? '8 أحرف على الأقل، تدعم الحروف العربية والإنجليزية والأرقام.' : 'At least 8 characters.'}
      >
        <div style={{ position: 'relative' }}>
          <StyledInput
            id="register-password"
            type={showPwd ? 'text' : 'password'}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            placeholder={locale === 'ar' ? '8 أحرف على الأقل' : 'At least 8 characters'}
            style={{ paddingLeft: locale === 'ar' ? '12px' : '40px', paddingRight: locale === 'ar' ? '40px' : '12px' }}
          />
          <button type="button" onClick={() => setShowPwd(v => !v)}
            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', ...(locale === 'ar' ? { right: '12px' } : { left: '12px' }), background: 'none', border: 'none', cursor: 'pointer', color: '#80686b', fontSize: '15px' }}
          >{showPwd ? '🙈' : '👁️'}</button>
        </div>

        {/* Live Password Strength Meter */}
        {form.password && (
          <div style={{ marginTop: '6px' }}>
            <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
              {[1, 2, 3, 4].map(step => (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    borderRadius: '2px',
                    background: strength.score >= step ? strength.color : '#e2d5d8',
                    transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.72rem', color: strength.color, fontWeight: '600' }}>
              قوة كلمة المرور: {strength.label}
            </span>
          </div>
        )}

        {passwordError && <small style={{ color: '#c94a6e', fontSize: '0.76rem', display: 'block', marginTop: '4px' }}>⚠️ {passwordError}</small>}
      </Field>

      <Field label={locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}>
        <div style={{ position: 'relative' }}>
          <StyledInput
            id="register-confirm-password"
            type={showConfirm ? 'text' : 'password'}
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
            required
            style={{ paddingLeft: locale === 'ar' ? '12px' : '40px', paddingRight: locale === 'ar' ? '40px' : '12px' }}
          />
          <button type="button" onClick={() => setShowConfirm(v => !v)}
            style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', ...(locale === 'ar' ? { right: '12px' } : { left: '12px' }), background: 'none', border: 'none', cursor: 'pointer', color: '#80686b', fontSize: '15px' }}
          >{showConfirm ? '🙈' : '👁️'}</button>
        </div>
        {confirmError && <small style={{ color: '#c94a6e', fontSize: '0.76rem', display: 'block', marginTop: '4px' }}>⚠️ {confirmError}</small>}
      </Field>

      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer',
        borderRadius: '12px', border: '1px solid #eadfd8', background: '#fcfaf8',
        padding: '14px', fontSize: '0.85rem', lineHeight: '1.7', color: '#59484a',
        flexDirection: locale === 'ar' ? 'row-reverse' : 'row'
      }}>
        <input
          id="register-privacy"
          type="checkbox"
          required
          checked={form.privacyConsent}
          onChange={e => setForm({ ...form, privacyConsent: e.target.checked })}
          style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#7D2C42', flexShrink: 0 }}
        />
        <span>
          {locale === 'ar' ? 'أوافق على ' : 'I agree to the '}
          <span style={{ color: '#7D2C42', fontWeight: '700' }}>{locale === 'ar' ? 'شروط الخدمة' : 'Terms'}</span>
          {' '}{locale === 'ar' ? 'و' : 'and '}
          <span style={{ color: '#7D2C42', fontWeight: '700' }}>{locale === 'ar' ? 'سياسة الخصوصية وأمان البيانات' : 'Privacy Policy'}</span>
          {locale === 'ar' ? ' في Dr.Berry.' : ' in Dr.Berry.'}
        </span>
      </label>

      {error && <ErrorBox text={error} />}

      <button
        id="register-submit-btn"
        type="submit"
        disabled={isDisabled}
        style={{
          height: '48px', borderRadius: '24px', background: '#7D2C42',
          color: 'white', fontWeight: '700', fontSize: '0.95rem', border: 'none',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.55 : 1,
          transition: 'all 0.2s', marginTop: '4px',
          fontFamily: 'var(--font-tajawal, inherit)',
          boxShadow: isDisabled ? 'none' : '0 4px 16px rgba(125,44,66,0.3)'
        }}
        onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.background = '#6a2438'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#7D2C42'; }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
            {locale === 'ar' ? 'جاري تشفير وتأمين الحساب...' : 'Creating secure account...'}
          </span>
        ) : (locale === 'ar' ? 'إنشاء حساب آمن ومشفّر' : 'Create Secure Account')}
      </button>
    </form>
  );
}

// ─── Recover Form ─────────────────────────────────────────────────────────────
function RecoverForm({ onBack }: { onBack: () => void }) {
  const locale = useLocale();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: identifier }),
      });

      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || 'تعذر إرسال طلب الاستعادة.');
        return;
      }

      setSent(true);
      if (data.devToken) {
        setDevResetToken(data.devToken);
      }
    } catch {
      setError(locale === 'ar' ? 'تعذر الاتصال بالخادم.' : 'Connection failed.');
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      {sent ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛡️</div>
          <h3 style={{ color: '#7D2C42', fontWeight: '700', marginBottom: '8px' }}>
            {locale === 'ar' ? 'تم استلام طلب الاستعادة الآمن!' : 'Recovery request received!'}
          </h3>
          <p style={{ color: '#80686b', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.6' }}>
            {locale === 'ar'
              ? 'لحماية أمان حسابك، إذا كان هذا الحساب مسجلاً لدينا، فستصلك تعليمات الاستعادة فوراً بصلاحية 15 دقيقة.'
              : 'For security, if this account exists, recovery instructions have been sent with a 15-minute expiration.'}
          </p>

          {devResetToken && (
            <div style={{
              background: '#f8f4f0', border: '1px dashed #7D2C42', borderRadius: '12px',
              padding: '12px', marginBottom: '20px', textAlign: 'right'
            }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#7D2C42', marginBottom: '6px' }}>
                🔑 تجربة محلية (رمز الاستعادة المؤقت):
              </p>
              <Link
                href={`/reset-password?token=${devResetToken}`}
                style={{ fontSize: '0.82rem', color: '#7D2C42', textDecoration: 'underline', wordBreak: 'break-all' }}
              >
                اضغط هنا لإعادة تعيين كلمة المرور فوراً
              </Link>
            </div>
          )}

          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#7D2C42', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-tajawal, inherit)' }}>
            ← {locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <p style={{ color: '#59484a', fontSize: '0.85rem', lineHeight: '1.6' }}>
            {locale === 'ar'
              ? 'أدخلي رقم هاتفك أو بريدك الإلكتروني المسجل، وسنرسل لكِ رمز تحقق مشفر ذو صلاحية مؤقتة لإعادة تعيين كلمة المرور.'
              : 'Enter your registered phone or email, and we will issue a secure, time-limited recovery link.'}
          </p>
          <Field label={locale === 'ar' ? 'رقم الهاتف الدولي أو البريد' : 'Phone or Email'}>
            <StyledInput
              id="recover-identifier"
              dir="ltr"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
              placeholder={locale === 'ar' ? '+967XXXXXXXXX أو user@email.com' : '+967... or email'}
            />
          </Field>

          {error && <ErrorBox text={error} />}

          <button
            id="recover-submit-btn"
            type="submit"
            disabled={loading || !identifier}
            style={{
              height: '48px', borderRadius: '24px', background: '#7D2C42',
              color: 'white', fontWeight: '700', fontSize: '0.95rem', border: 'none',
              cursor: loading || !identifier ? 'not-allowed' : 'pointer',
              opacity: loading || !identifier ? 0.6 : 1,
              fontFamily: 'var(--font-tajawal, inherit)',
              boxShadow: '0 4px 16px rgba(125,44,66,0.25)'
            }}
          >
            {loading ? (locale === 'ar' ? 'جاري التحقق وإصدار الرمز...' : 'Issuing secure token...') : (locale === 'ar' ? 'إرسال رابط الاستعادة الآمن' : 'Send Secure Recovery Link')}
          </button>
          <button type="button" onClick={onBack}
            style={{ background: 'none', border: 'none', color: '#7D2C42', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-tajawal, inherit)' }}
          >
            ← {locale === 'ar' ? 'العودة' : 'Back'}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
        fontWeight: active ? '700' : '500', fontSize: '0.9rem',
        background: active ? '#7D2C42' : 'transparent',
        color: active ? 'white' : '#80686b',
        transition: 'all 0.2s', fontFamily: 'var(--font-tajawal, inherit)'
      }}
    >
      {children}
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [mode, setMode] = useState<Mode>('login');
  const [success, setSuccess] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const handleLoginSuccess = (name: string) => {
    setCustomerName(name);
    setSuccess(true);
  };

  const handleRegisterSuccess = (name: string) => {
    setCustomerName(name);
    setSuccess(true);
  };

  return (
    <main
      className="min-h-screen flex items-start justify-center py-12 px-4"
      style={{ background: 'linear-gradient(135deg, #fdf6f8 0%, #f9edf1 50%, #f4e2d1 100%)' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div style={{ width: '100%', maxWidth: '900px' }}>
        {/* Success Banner */}
        {success && (
          <div style={{
            background: 'white', borderRadius: '24px', padding: '40px 32px', textAlign: 'center',
            boxShadow: '0 18px 55px rgba(125,44,66,0.12)', marginBottom: '24px',
            border: '1px solid #eadfd8'
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🌸</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#7D2C42', marginBottom: '12px' }}>
              {locale === 'ar' ? `مرحباً بكِ في Dr.Berry${customerName ? `، ${customerName}` : ''}!` : `Welcome to Dr.Berry${customerName ? `, ${customerName}` : ''}!`}
            </h2>
            <p style={{ color: '#59484a', fontSize: '0.92rem', marginBottom: '24px', lineHeight: '1.7' }}>
              {locale === 'ar'
                ? 'تم التحقق من هويتك وتأمين جلستك بأعلى معايير التشفير والحماية السيبرانية.'
                : 'Your identity has been authenticated and secured with standard encryption.'}
            </p>
            <Link href="/" style={{
              display: 'inline-block', padding: '12px 36px', borderRadius: '24px',
              background: '#7D2C42', color: 'white', fontWeight: '700', fontSize: '0.95rem',
              textDecoration: 'none', boxShadow: '0 4px 16px rgba(125,44,66,0.3)',
              fontFamily: 'var(--font-tajawal, inherit)'
            }}>
              {locale === 'ar' ? 'تصفح المتجر الآن ←' : 'Browse Store Now →'}
            </Link>
          </div>
        )}

        {!success && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr', gap: '0',
            background: 'white', borderRadius: '28px',
            boxShadow: '0 18px 55px rgba(61,37,41,0.10)',
            overflow: 'hidden'
          }}
            className="md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
          >
            {/* ── Aside / Branding Panel ── */}
            <aside style={{ position: 'relative', overflow: 'hidden', background: '#2d1d25', padding: '40px 32px', color: 'white' }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 20% 15%, #9b6046 0, transparent 28%), radial-gradient(circle at 80% 90%, #68404a 0, transparent 34%)'
              }} />
              <div style={{ position: 'relative' }}>
                {/* Logo */}
                <div style={{ marginBottom: '28px' }}>
                  <Link href="/" style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #FCAECA 0%, #C65C7C 50%, #7D2C42 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', fontWeight: '900', color: 'white',
                        boxShadow: '0 8px 24px rgba(198,92,124,0.4)'
                      }}>Dr</div>
                      <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>Dr.Berry</span>
                    </div>
                  </Link>
                </div>

                <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', color: '#e4b58e', textTransform: 'uppercase', marginBottom: '12px' }}>
                  {locale === 'ar' ? 'الأمان والخصوصية' : 'Security & Privacy'}
                </p>
                <h1 style={{ fontSize: '1.85rem', fontWeight: '800', lineHeight: '1.3', marginBottom: '16px' }}>
                  {locale === 'ar' ? 'حسابكِ محمي بأعلى معايير الأمان السيبراني' : 'Your Account is Protected with Cyber Standards'}
                </h1>
                <p style={{ fontSize: '0.88rem', lineHeight: '1.8', color: '#e7d6cf', marginBottom: '28px' }}>
                  {locale === 'ar'
                    ? 'نطبق حماية ضد هجمات التخمين، تشفير كلمات المرور بمعايير scrypt، وجلسات مشفرة تضمن خصوصيتك التامة.'
                    : 'We enforce brute-force mitigation, scrypt password hashing, and encrypted sessions for full privacy.'}
                </p>

                <div style={{ display: 'grid', gap: '12px', fontSize: '0.85rem', color: '#e7d6cf' }}>
                  {(locale === 'ar' ? [
                    '🛡️ حماية متقدمة ضد هجمات القوة الغاشمة (Brute Force)',
                    '🔒 تشفير فوري لكلمات المرور دون حفظها نصياً',
                    '⚡ جلسات آمنة بخاصية HttpOnly لمنع الاختراق',
                    '🇾🇪 دعم مباشر لرقم الهاتف اليمني +967 وكافة الدول',
                  ] : [
                    '🛡️ Advanced brute-force attack prevention',
                    '🔒 Real-time password hashing with salt',
                    '⚡ HttpOnly tamper-proof secure sessions',
                    '🇾🇪 Native Yemen +967 & global country support',
                  ]).map((item, i) => <p key={i}>{item}</p>)}
                </div>
              </div>
            </aside>

            {/* ── Form Section ── */}
            <section style={{ padding: '36px 32px' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #eee4de', paddingBottom: '14px', marginBottom: '4px' }}>
                <Tab active={mode === 'login'} onClick={() => setMode('login')}>
                  {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </Tab>
                <Tab active={mode === 'register'} onClick={() => setMode('register')}>
                  {locale === 'ar' ? 'حساب جديد' : 'New Account'}
                </Tab>
              </div>

              {mode === 'login' && (
                <LoginForm onRecover={() => setMode('recover')} onSuccess={handleLoginSuccess} />
              )}
              {mode === 'register' && (
                <RegisterForm onSuccess={handleRegisterSuccess} />
              )}
              {mode === 'recover' && (
                <RecoverForm onBack={() => setMode('login')} />
              )}
            </section>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #ab9790 !important; }
        @media (max-width: 768px) {
          .md\\:grid-cols-\\[minmax\\(0\\,0\\.85fr\\)_minmax\\(0\\,1\\.15fr\\)\\] { grid-template-columns: 1fr !important; }
          aside { display: none !important; }
        }
      `}</style>
    </main>
  );
}
