import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { StoreProvider } from '@/contexts/StoreContext';
import "../globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drberry.com';
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google-site-verification-placeholder';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dr. Berry | منتجات العناية الطبية والتجميلية الفاخرة",
    template: "%s | Dr. Berry د. بيري",
  },
  description: "المتجر الرسمي لعلامة د. بيري (Dr. Berry) للمستحضرات الطبية التجميلية والعناية الفائقة بالبشرة والشعر ومكافحة التصبغات.",
  keywords: [
    "د. بيري",
    "Dr. Berry",
    "عناية بالبشرة",
    "عناية بالشعر",
    "Coco Therapy",
    "بلسم ومرمم الشعر",
    "تفتيح ونضارة",
    "مستحضرات طبية تجميلية",
    "متجر د. بيري",
    "مستحضرات تجميل اليمن",
    "مستحضرات تجميل السعودية",
  ],
  authors: [{ name: "Dr. Berry Laboratories", url: siteUrl }],
  creator: "Dr. Berry",
  publisher: "Dr. Berry",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'ar': '/ar',
      'en': '/en',
      'x-default': '/ar',
    },
  },
  openGraph: {
    title: "Dr. Berry | منتجات العناية الطبية والتجميلية",
    description: "المتجر الرسمي لمنتجات د. بيري الطبية الفاخرة للعناية بالبشرة والشعر.",
    url: siteUrl,
    siteName: "Dr. Berry Store",
    locale: "ar_SA",
    type: "website",
    images: [
      {
        url: "/images/products/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Dr. Berry Medical Cosmetic Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Berry | منتجات العناية الطبية والتجميلية",
    description: "المتجر الرسمي لمنتجات د. بيري الطبية الفاخرة للعناية بالبشرة والشعر.",
    images: ["/images/products/hero.jpg"],
  },
  verification: {
    google: googleVerification,
  },
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet" />
        {/* Dynamic Google Site Verification meta tag */}
        <meta name="google-site-verification" content={googleVerification} />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          <StoreProvider>
            <Header />
            {children}
            <Footer />
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
