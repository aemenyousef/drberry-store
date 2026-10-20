import { MetadataRoute } from 'next';
import { ProductsRepository } from '@/lib/productsRepository';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drberry.com';
  const locales = ['ar', 'en'];
  const categories = ['all', 'hair', 'body', 'skin', 'whitening'];
  const staticPages = ['', '/about', '/gifts', '/products'];

  const sitemapEntries: MetadataRoute.Sitemap = [];
  const products = await ProductsRepository.getAllProducts();

  // Static Pages for each locale
  locales.forEach((locale) => {
    staticPages.forEach((page) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    });

    // Category Pages
    categories.forEach((cat) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/products/category/${cat}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });

    // Product Detail Pages
    products.forEach((product) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/products/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    });
  });

  return sitemapEntries;
}
