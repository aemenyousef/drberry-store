// ============================================================================
// مستودع المنتجات الذكي - متوافق مع جدول drberry_products القائم في Supabase
// ============================================================================

import { DR_BERRY_PRODUCTS, Product } from '@/data/products';
import { isSupabaseConfigured } from '@/lib/supabaseAuth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let cachedProducts: Product[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 30 * 1000; // 30 ثانية

/**
 * دالة ذكية تحول بيانات الصف من جدول drberry_products أو products إلى واجهة Product الموحدة
 */
function mapDbRowToProduct(row: any): Product {
  // استخراج الصورة من مصفوفة images أو حقل image_url
  let image = '/images/products/placeholder.jpg';
  if (Array.isArray(row.images) && row.images.length > 0) {
    image = typeof row.images[0] === 'string' ? row.images[0] : row.images[0]?.url || image;
  } else if (typeof row.image_url === 'string' && row.image_url) {
    image = row.image_url;
  }

  // استخراج المميزات
  let benefitsAr: string[] = [];
  if (Array.isArray(row.features_ar)) {
    benefitsAr = row.features_ar;
  } else if (Array.isArray(row.benefits_ar)) {
    benefitsAr = row.benefits_ar;
  }

  let benefitsEn: string[] = [];
  if (Array.isArray(row.features_en)) {
    benefitsEn = row.features_en;
  } else if (Array.isArray(row.benefits_en)) {
    benefitsEn = row.benefits_en;
  }

  // استخراج الأسعار بالعملات المختلفة
  let priceSar = Number(row.price_sar || row.base_price || row.price || 0);
  let priceYer = Number(row.price_yer || 0);
  let priceUsd = Number(row.price_usd || 0);

  // إذا كانت الأسعار داخل variants
  if ((!priceSar && !priceYer) && Array.isArray(row.variants) && row.variants.length > 0) {
    const firstVar = row.variants[0];
    priceSar = Number(firstVar.price_sar || firstVar.price || priceSar);
    priceYer = Number(firstVar.price_yer || priceYer);
    priceUsd = Number(firstVar.price_usd || priceUsd);
  }

  // حساب تلقائي للعملات إذا كانت عملة واحدة متوفرة
  if (priceSar > 0 && priceYer === 0) priceYer = Math.round(priceSar * 140);
  if (priceYer > 0 && priceSar === 0) priceSar = Math.round(priceYer / 140);
  if (priceSar > 0 && priceUsd === 0) priceUsd = Math.round((priceSar / 3.75) * 10) / 10;

  return {
    id: String(row.id || row.slug),
    titleAr: row.name_ar || row.title_ar || '',
    titleEn: row.name_en || row.title_en || '',
    categoryAr: row.category_ar || 'عناية د. بيري',
    categoryEn: row.category_en || 'Dr.Berry Care',
    categorySlug: (row.category_slug as any) || (row.category as any) || 'all',
    descriptionAr: row.description_ar || '',
    descriptionEn: row.description_en || '',
    benefitsAr,
    benefitsEn,
    volumeAr: row.volume_ar || row.volume || '',
    volumeEn: row.volume_en || row.volume || '',
    prices: {
      SAR: priceSar,
      YER: priceYer,
      USD: priceUsd,
    },
    image,
    badgeAr: row.badge_ar || undefined,
    badgeEn: row.badge_en || undefined,
    rating: Number(row.rating || 5.0),
    reviewsCount: Number(row.reviews_count || 0),
    inStock: Boolean(row.in_stock ?? true),
  };
}

export const ProductsRepository = {
  /**
   * جلب المنتجات من جدول drberry_products المعتمد في السحابة
   */
  async getAllProducts(options?: {
    category?: string;
    search?: string;
    sortBy?: 'featured' | 'priceAsc' | 'priceDesc' | 'rating';
  }): Promise<Product[]> {
    const now = Date.now();
    let all: Product[] = [];

    if (cachedProducts && now - lastFetchTime < CACHE_TTL) {
      all = cachedProducts;
    } else if (isSupabaseConfigured()) {
      // 1. محاولة الجلب من جدول drberry_products القائم في حسابك
      try {
        const endpoint = `${SUPABASE_URL}/rest/v1/drberry_products?select=*&order=sort_order.asc`;
        const res = await fetch(endpoint, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          next: { revalidate: 60 },
        });

        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0) {
            all = rows.map(mapDbRowToProduct);
            cachedProducts = all;
            lastFetchTime = now;
          }
        }
      } catch (err) {
        // في حال حدوث خطأ
      }

      // 2. إذا لم يكن جدول drberry_products يحتوي على بيانات بعد، محاولة فحص جدول products
      if (all.length === 0) {
        try {
          const fallbackEndpoint = `${SUPABASE_URL}/rest/v1/products?select=*&order=sort_order.asc`;
          const res = await fetch(fallbackEndpoint, {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
            next: { revalidate: 60 },
          });

          if (res.ok) {
            const rows = await res.json();
            if (Array.isArray(rows) && rows.length > 0) {
              all = rows.map(mapDbRowToProduct);
              cachedProducts = all;
              lastFetchTime = now;
            }
          }
        } catch {
          // fallback
        }
      }
    }

    // 3. Fallback: إذا لم تتوفر بعد صفوف في السحابة، استخدام الكتالوج المحلي المعتمد
    if (!all || all.length === 0) {
      all = DR_BERRY_PRODUCTS;
    }

    // الفلترة والبحث
    let result = [...all];

    if (options?.category && options.category !== 'all') {
      result = result.filter(
        (p) => p.categorySlug.toLowerCase() === options.category?.toLowerCase()
      );
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.titleAr.toLowerCase().includes(q) ||
          p.titleEn.toLowerCase().includes(q) ||
          p.descriptionAr.toLowerCase().includes(q) ||
          p.descriptionEn.toLowerCase().includes(q)
      );
    }

    if (options?.sortBy) {
      if (options.sortBy === 'priceAsc') {
        result.sort((a, b) => a.prices.SAR - b.prices.SAR);
      } else if (options.sortBy === 'priceDesc') {
        result.sort((a, b) => b.prices.SAR - a.prices.SAR);
      } else if (options.sortBy === 'rating') {
        result.sort((a, b) => b.rating - a.rating);
      }
    }

    return result;
  },

  async getProductById(id: string): Promise<Product | null> {
    const all = await this.getAllProducts();
    const cleanId = id.trim().toLowerCase();

    const match = all.find(
      (p) => p.id.toLowerCase() === cleanId || (p as any).slug?.toLowerCase() === cleanId
    );
    if (match) return match;

    const index = parseInt(id, 10);
    if (!isNaN(index) && index >= 1 && index <= all.length) {
      return all[index - 1];
    }

    return null;
  },
};
