-- ============================================================================
-- مخطط قاعدة بيانات متجر Dr.Berry الرسمي (Supabase / PostgreSQL Schema)
-- ============================================================================

-- تفعيل إضافات الأمان والتوليد
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. جدول التصنيفات (Categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(80) UNIQUE NOT NULL,
    name_ar VARCHAR(160) NOT NULL,
    name_en VARCHAR(160) NOT NULL,
    icon VARCHAR(20),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول المنتجات الرسمي (Products)
CREATE TABLE IF NOT EXISTS public.products (
    id VARCHAR(100) PRIMARY KEY, -- مثل 'coco-therapy'
    title_ar VARCHAR(240) NOT NULL,
    title_en VARCHAR(240) NOT NULL,
    category_slug VARCHAR(80) REFERENCES public.categories(slug) ON UPDATE CASCADE ON DELETE SET NULL,
    category_ar VARCHAR(100),
    category_en VARCHAR(100),
    description_ar TEXT,
    description_en TEXT,
    benefits_ar TEXT[] DEFAULT '{}',
    benefits_en TEXT[] DEFAULT '{}',
    volume_ar VARCHAR(60),
    volume_en VARCHAR(60),
    price_sar NUMERIC(10, 2) NOT NULL,
    price_yer NUMERIC(10, 2) NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL,
    image_url TEXT NOT NULL,
    badge_ar VARCHAR(100),
    badge_en VARCHAR(100),
    rating NUMERIC(2, 1) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    in_stock BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول تقييمات وآراء العملاء (Product Reviews)
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(100) REFERENCES public.products(id) ON DELETE CASCADE,
    author_name VARCHAR(120) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. سياسات الأمان والحماية (Row Level Security - RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- السماح للجميع (الزوار والعملاء) بقراءة المنتجات والتصنيفات والتقييمات
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.product_reviews FOR SELECT USING (true);

-- 5. إدراج تصنيفات Dr.Berry الرسمية
INSERT INTO public.categories (slug, name_ar, name_en, icon, sort_order)
VALUES
    ('hair', 'عناية بالشعر', 'Hair Care', '🌿', 1),
    ('body', 'عناية بالجسم', 'Body Care', '💧', 2),
    ('skin', 'عناية بالبشرة', 'Skin Care', '🌸', 3),
    ('whitening', 'تفتيح ونضارة', 'Whitening Care', '✨', 4)
ON CONFLICT (slug) DO UPDATE 
SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en, icon = EXCLUDED.icon;

-- 6. إدراج منتجات Dr.Berry الخمسة الرسمية ببياناتها وأسعارها المتعددة (SAR, YER, USD)
INSERT INTO public.products (
    id, title_ar, title_en, category_slug, category_ar, category_en,
    description_ar, description_en, benefits_ar, benefits_en,
    volume_ar, volume_en, price_sar, price_yer, price_usd,
    image_url, badge_ar, badge_en, rating, reviews_count, in_stock, is_featured, sort_order
)
VALUES
(
    'coco-therapy',
    'بلسم ومرمم الشعر المطور | Coco Therapy',
    'Coco Therapy Intensive Nourishing Conditioner',
    'hair',
    'عناية بالشعر',
    'Hair Care',
    'تركيبة علاجية فاخرة بالزبدات الطبيعية والزيوت المغذية لعلاج التلف من العمق وإعادة الحيوية والنعومة الفائقة للشعر.',
    'Intensive therapeutic formula enriched with natural butters and nourishing oils to deeply repair damage and restore softness.',
    ARRAY[
      'غني بالزبدات الطبيعية والزيوت المغذية',
      'يمنح الشعر ملمساً حريرياً وانسيابية فائقة',
      'يقضي على التقصف، التكسرات، والنفشة',
      'يعالج التلف الناتج عن الحرارة والمواد الكيميائية'
    ],
    ARRAY[
      'Enriched with botanical butters & nourishing oils',
      'Provides silky softness and effortless manageability',
      'Eliminates split ends, breakage, and frizz',
      'Repairs heat styling and chemical processing damage'
    ],
    '500 مل',
    '500 ml',
    36.00,
    5000.00,
    9.50,
    '/images/products/coco-therapy.jpg',
    'الأكثر طلباً ⭐',
    'Best Seller ⭐',
    4.9,
    128,
    TRUE,
    TRUE,
    1
),
(
    'hyaluronic-lotion',
    'لوشن الهيالورونيك أسيد للجسم | ترطيب عميق',
    'Hyaluronic Acid Intensive Body Lotion',
    'body',
    'عناية بالجسم',
    'Body Care',
    'لوشن الترطيب والتفتيح المصنوع من حمض الهيالورونيك والكولاجين وزبدة الشيا والكاكاو وزيت اللوز وعرق السوس.',
    'Deep hydration and brightening body lotion formulated with pure Hyaluronic Acid, Collagen, Shea & Cocoa Butter, and Licorice.',
    ARRAY[
      'ترطيب مكثف يدوم 24 ساعة للبشرة الجافة جداً',
      'علاج التشققات الجلدية الحمراء والتخفيف من البيضاء',
      'وقاية متكاملة من الجفاف وعوامل الجو',
      'ملمس ناعم سريع الامتصاص دون أثر دهني'
    ],
    ARRAY[
      '24-hour intensive hydration for very dry skin',
      'Targets red stretch marks and softens appearance of white marks',
      'Comprehensive defense against environmental dryness',
      'Silky, fast-absorbing texture with zero greasy residue'
    ],
    '475 مل',
    '475 ml',
    64.00,
    9000.00,
    19.00,
    '/images/products/hyaluronic-lotion.jpg',
    'ترطيب 24 ساعة 💧',
    '24h Hydration 💧',
    5.0,
    94,
    TRUE,
    TRUE,
    2
),
(
    'hair-bloom',
    'معالج الفروة المتطور | Hair Bloom Scalp Oil',
    'Hair Bloom Advanced Scalp Oil',
    'hair',
    'عناية بالشعر',
    'Hair Care',
    'معالج الفروة المتطور والمصمم للنساء والرجال ليعيد للشعر قوته وكثافته من خلال عناية سريعة ومكثفة من الجذور.',
    'Advanced scalp therapy formulated for men and women to revitalize hair roots and restore natural density.',
    ARRAY[
      'تغذية الفروة وبصيلات الشعر من الجذور',
      'يحد من التساقط ويحفز إنبات الشعر الصحي',
      'تركيبة زيوت خفيفة سريعة الامتصاص',
      'مناسب للاستخدام من 2 إلى 3 مرات أسبوعياً'
    ],
    ARRAY[
      'Deeply nourishes scalp and hair follicles from root',
      'Significantly reduces shedding and promotes healthy growth',
      'Lightweight botanical oil blend for fast absorption',
      'Ideal for use 2 to 3 times weekly'
    ],
    '150 مل',
    '150 ml',
    43.00,
    6000.00,
    12.00,
    '/images/products/hair-bloom.jpg',
    'تركيبة مكثفة ✨',
    'Intensive Formula ✨',
    4.8,
    86,
    TRUE,
    TRUE,
    3
),
(
    'chamomile-cream',
    'كريم لليدين بالبابونج وشمع العسل | Botanical Therapy',
    'Botanical Hand Therapy Cream',
    'skin',
    'عناية بالبشرة',
    'Skin Care',
    'مرطب ومغذي غني بحماية فائقة من الجفاف لجميع أنواع البشرة بمستخلص البابونج وشمع العسل وفيتامين E وزبدة الشيا.',
    'Rich protective botanical moisturizer for hands and dry areas with pure Chamomile, Beeswax, Vitamin E, and Shea Butter.',
    ARRAY[
      'حماية فائقة وترميم حاجز البشرة الواقي',
      'تهدئة فورية للبشرة المتهيجة والجافة',
      'غني بفيتامين E ومضادات الأكسدة الطبيعية',
      'ملمس مخملي وامتصاص فوري'
    ],
    ARRAY[
      'Ultimate protection and skin barrier restoration',
      'Instant relief and soothing for dry, irritated skin',
      'Packed with natural antioxidant Vitamin E',
      'Velvety finish with non-sticky absorption'
    ],
    '100 مل',
    '100 ml',
    45.00,
    6200.00,
    12.50,
    '/images/products/chamomile-cream.jpg',
    'مستخلص طبيعي 🌿',
    '100% Natural 🌿',
    4.9,
    112,
    TRUE,
    TRUE,
    4
),
(
    'beauty-bomb',
    'كريم بيوتي بومب للتفتيح المكثف | Beauty Bomb',
    'Beauty Bomb Intensive Whitening Cream',
    'whitening',
    'تفتيح ونضارة',
    'Whitening Care',
    'تركيبة فائقة الفعالية بالألفا أربوتين، النياسيناميد، الجلابريدين، وفيتامين C & E لتفتيح ونضارة البشرة والمناطق الحساسة بلطف وأمان.',
    'Gentle, dermatologist-tested whitening formula with Alpha Arbutin, Niacinamide, Glabridin, and Vitamins C & E for radiant skin.',
    ARRAY[
      'يقلل من التصبغات ويمنح تفتيحاً ملحوظاً',
      'يوحد لون البشرة ويقوي حاجزها الطبيعي',
      'مستخلص طبيعي مهدئ ومضاد للأكسدة',
      'آمن ولطيف للمناطق الحساسة ولجميع أنواع البشرة'
    ],
    ARRAY[
      'Visibly reduces hyperpigmentation and discoloration',
      'Evens skin tone and reinforces the natural protective barrier',
      'Natural soothing botanical antioxidant formula',
      'Safe and gentle for sensitive areas and all skin types'
    ],
    '50 جم',
    '50 g',
    55.00,
    7500.00,
    15.00,
    '/images/products/beauty-bomb.jpg',
    'تفتيح طبي آمن 🌸',
    'Medical Whitening 🌸',
    5.0,
    153,
    TRUE,
    TRUE,
    5
)
ON CONFLICT (id) DO UPDATE 
SET 
    title_ar = EXCLUDED.title_ar,
    title_en = EXCLUDED.title_en,
    category_slug = EXCLUDED.category_slug,
    category_ar = EXCLUDED.category_ar,
    category_en = EXCLUDED.category_en,
    description_ar = EXCLUDED.description_ar,
    description_en = EXCLUDED.description_en,
    benefits_ar = EXCLUDED.benefits_ar,
    benefits_en = EXCLUDED.benefits_en,
    volume_ar = EXCLUDED.volume_ar,
    volume_en = EXCLUDED.volume_en,
    price_sar = EXCLUDED.price_sar,
    price_yer = EXCLUDED.price_yer,
    price_usd = EXCLUDED.price_usd,
    image_url = EXCLUDED.image_url,
    badge_ar = EXCLUDED.badge_ar,
    badge_en = EXCLUDED.badge_en,
    rating = EXCLUDED.rating,
    reviews_count = EXCLUDED.reviews_count,
    in_stock = EXCLUDED.in_stock,
    is_featured = EXCLUDED.is_featured,
    updated_at = NOW();
