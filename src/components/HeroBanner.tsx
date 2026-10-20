import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function HeroBanner() {
  const t = useTranslations('HomePage');

  return (
    <section className="relative w-full h-[600px] bg-secondary/20 flex items-center overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      
      <div className="max-w-6xl mx-auto px-8 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-6 text-center md:text-start">
          <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold tracking-wider inline-block">
            {t('eyebrow')}
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-primary leading-tight font-sans">
            {t('heroHeadline1')} <br />
            <span className="text-accent">{t('heroHeadline2')}</span>
          </h1>
          <p className="text-lg text-foreground/80 max-w-lg leading-relaxed">
            {t('welcome')}
          </p>
          <div className="pt-4 flex gap-4 justify-center md:justify-start">
            <Link href="/products" className="px-8 py-4 bg-primary text-white rounded-full font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-1 inline-block">
              {t('shopProducts')}
            </Link>
            <Link href="/products" className="px-8 py-4 bg-white text-primary border border-cream rounded-full font-bold shadow-sm hover:bg-cream/50 transition-all inline-block">
              {t('discoverMore')}
            </Link>
          </div>
        </div>
        
        <div className="hidden md:flex justify-center relative">
          <div className="w-80 h-80 rounded-t-full bg-secondary/30 border-8 border-white shadow-2xl relative flex items-center justify-center overflow-hidden">
            <Image 
              src="/images/products/hero.jpg" 
              alt="Featured Product" 
              fill 
              priority
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
