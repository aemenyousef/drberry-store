import { useTranslations } from 'next-intl';
import HeroBanner from '@/components/HeroBanner';
import ProductGrid from '@/components/ProductGrid';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <div className="min-h-screen bg-background">
      <HeroBanner />

      {/* قسم المنتجات الموصى بها */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-primary mb-4 font-sans tracking-tight">
            {t('ourProducts')}
          </h2>
          <div className="w-24 h-1.5 bg-accent mx-auto rounded-full"></div>
        </div>

        {/* شبكة المنتجات الحقيقية من قاعدة البيانات */}
        <ProductGrid />
        
      </section>
    </div>
  );
}
