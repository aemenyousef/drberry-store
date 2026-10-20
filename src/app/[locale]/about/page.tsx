import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'من نحن | Dr.Berry - متجر العناية الطبية',
  description: 'تعرف على قصة Dr.Berry ورحلتنا نحو تقديم أفضل منتجات العناية الطبية بالبشرة والشعر.',
};

const VALUES = [
  { icon: '🏆', titleKey: 'value1Title', descKey: 'value1Desc' },
  { icon: '🔬', titleKey: 'value2Title', descKey: 'value2Desc' },
  { icon: '💬', titleKey: 'value3Title', descKey: 'value3Desc' },
  { icon: '📦', titleKey: 'value4Title', descKey: 'value4Desc' },
] as const;

const CERTS = [
  { icon: '✅', key: 'cert1' },
  { icon: '🔬', key: 'cert2' },
  { icon: '🌿', key: 'cert3' },
  { icon: '🚫', key: 'cert4' },
] as const;

const WHATSAPP_NUMBER = '966500000000';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-primary/90 to-accent/80 py-28 px-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 border border-white/20 mb-6">
            <span className="text-accent font-bold">Dr.Berry</span>
            <span className="text-white/60">|</span>
            <span className="text-white/80 text-sm">{locale === 'ar' ? 'العلامة التجارية' : 'The Brand'}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-2xl text-white/75 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* قصتنا */}
      <section className="py-24 px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="w-16 h-1.5 bg-accent rounded-full mb-6" />
            <h2 className="text-4xl font-black text-primary mb-8">{t('storyTitle')}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">{t('storyText1')}</p>
            <p className="text-lg text-muted-foreground leading-relaxed">{t('storyText2')}</p>
          </div>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 border border-primary/20">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-primary mb-3">{t('missionTitle')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('missionText')}</p>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-3xl p-8 border border-accent/20">
              <div className="text-3xl mb-3">🌟</div>
              <h3 className="text-xl font-bold text-primary mb-3">{t('visionTitle')}</h3>
              <p className="text-muted-foreground leading-relaxed">{t('visionText')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* قيمنا */}
      <section className="py-20 px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-16 h-1.5 bg-accent rounded-full mx-auto mb-6" />
            <h2 className="text-4xl font-black text-primary">
              {locale === 'ar' ? 'قيمنا الأساسية' : 'Our Core Values'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.titleKey}
                className="bg-background rounded-3xl p-8 border border-border hover:border-accent/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center"
              >
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="text-lg font-bold text-primary mb-3">{t(v.titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(v.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* الشهادات */}
      <section className="py-24 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-16 h-1.5 bg-accent rounded-full mx-auto mb-6" />
          <h2 className="text-4xl font-black text-primary">{t('certTitle')}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CERTS.map((cert) => (
            <div
              key={cert.key}
              className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl p-6 border border-accent/20 text-center hover:scale-105 transition-transform duration-300"
            >
              <div className="text-4xl mb-3">{cert.icon}</div>
              <p className="text-sm font-semibold text-primary">{t(cert.key)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8 bg-gradient-to-br from-primary via-primary/90 to-accent/80">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-6">💬</div>
          <h2 className="text-4xl font-black text-white mb-6">{t('teamTitle')}</h2>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-green-500/30"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t('contactWhatsapp')}
          </a>
        </div>
      </section>
    </div>
  );
}
