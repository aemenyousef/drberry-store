'use client';

import { redirect } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';

// Register redirects to the unified login/register page with register tab
export default function RegisterPage() {
  const locale = useLocale();

  useEffect(() => {
    // Redirect to login page - the register tab is there
    window.location.replace(`/${locale}/login`);
  }, [locale]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid #FCAECA',
          borderTopColor: '#7D2C42', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
        }} />
        <p style={{ color: '#80686b', fontFamily: 'var(--font-tajawal, inherit)' }}>جاري التوجيه...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
