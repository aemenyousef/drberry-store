-- ============================================================================
-- إضافة وتحديث منتجات Dr.Berry في جدولك القائم (public.drberry_products)
-- الاعتماد الدقيق على الأعمدة المؤكدة 100% مع حقل image
-- ============================================================================

-- 1. تفعيل حماية الأمان (RLS) وحل التنبيه الأحمر
ALTER TABLE IF EXISTS public.drberry_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read drberry_products" ON public.drberry_products;
CREATE POLICY "Public Read drberry_products" ON public.drberry_products FOR SELECT USING (true);

-- 2. إدراج وتحديث منتجات د. بيري الخمسة الرسمية
INSERT INTO public.drberry_products (
    id,
    slug,
    name_ar,
    name_en,
    description_ar,
    description_en,
    image,
    images,
    badge_ar,
    badge_en,
    rating,
    reviews_count,
    in_stock,
    is_bundle,
    features_ar,
    features_en,
    variants,
    sort_order
)
VALUES
(
    'coco-therapy',
    'coco-therapy',
    'بلسم ومرمم الشعر المطور | Coco Therapy',
    'Coco Therapy Intensive Nourishing Conditioner',
    'تركيبة علاجية فاخرة بالزبدات الطبيعية والزيوت المغذية لعلاج التلف من العمق وإعادة الحيوية والنعومة الفائقة للشعر.',
    'Intensive therapeutic formula enriched with natural butters and nourishing oils to deeply repair damage and restore softness.',
    '/images/products/coco-therapy.jpg',
    '["/images/products/coco-therapy.jpg"]'::jsonb,
    'الأكثر طلباً ⭐',
    'Best Seller ⭐',
    4.9,
    128,
    true,
    false,
    '["غني بالزبدات الطبيعية والزيوت المغذية", "يمنح الشعر ملمساً حريرياً وانسيابية فائقة", "يقضي على التقصف، التكسرات، والنفشة", "يعالج التلف الناتج عن الحرارة والمواد الكيميائية"]'::jsonb,
    '["Enriched with botanical butters & nourishing oils", "Provides silky softness and effortless manageability", "Eliminates split ends, breakage, and frizz", "Repairs heat styling and chemical processing damage"]'::jsonb,
    '[{"size": "500 ml", "price_sar": 36, "price_yer": 5000, "price_usd": 9.5}]'::jsonb,
    1
),
(
    'hyaluronic-lotion',
    'hyaluronic-lotion',
    'لوشن الهيالورونيك أسيد للجسم | ترطيب عميق',
    'Hyaluronic Acid Intensive Body Lotion',
    'لوشن الترطيب والتفتيح المصنوع من حمض الهيالورونيك والكولاجين وزبدة الشيا والكاكاو وزيت اللوز وعرق السوس.',
    'Deep hydration and brightening body lotion formulated with pure Hyaluronic Acid, Collagen, Shea & Cocoa Butter, and Licorice.',
    '/images/products/hyaluronic-lotion.jpg',
    '["/images/products/hyaluronic-lotion.jpg"]'::jsonb,
    'ترطيب 24 ساعة 💧',
    '24h Hydration 💧',
    5.0,
    94,
    true,
    false,
    '["ترطيب مكثف يدوم 24 ساعة للبشرة الجافة جداً", "علاج التشققات الجلدية الحمراء والتخفيف من البيضاء", "وقاية متكاملة من الجفاف وعوامل الجو", "ملمس ناعم سريع الامتصاص دون أثر دهني"]'::jsonb,
    '["24-hour intensive hydration for very dry skin", "Targets red stretch marks and softens appearance of white marks", "Comprehensive defense against environmental dryness", "Silky, fast-absorbing texture with zero greasy residue"]'::jsonb,
    '[{"size": "475 ml", "price_sar": 64, "price_yer": 9000, "price_usd": 19.0}]'::jsonb,
    2
),
(
    'hair-bloom',
    'hair-bloom',
    'معالج الفروة المتطور | Hair Bloom Scalp Oil',
    'Hair Bloom Advanced Scalp Oil',
    'معالج الفروة المتطور والمصمم للنساء والرجال ليعيد للشعر قوته وكثافته من خلال عناية سريعة ومكثفة من الجذور.',
    'Advanced scalp therapy formulated for men and women to revitalize hair roots and restore natural density.',
    '/images/products/hair-bloom.jpg',
    '["/images/products/hair-bloom.jpg"]'::jsonb,
    'تركيبة مكثفة ✨',
    'Intensive Formula ✨',
    4.8,
    86,
    true,
    false,
    '["تغذية الفروة وبصيلات الشعر من الجذور", "يحد من التساقط ويحفز إنبات الشعر الصحي", "تركيبة زيوت خفيفة سريعة الامتصاص", "مناسب للاستخدام من 2 إلى 3 مرات أسبوعياً"]'::jsonb,
    '["Deeply nourishes scalp and hair follicles from root", "Significantly reduces shedding and promotes healthy growth", "Lightweight botanical oil blend for fast absorption", "Ideal for use 2 to 3 times weekly"]'::jsonb,
    '[{"size": "150 ml", "price_sar": 43, "price_yer": 6000, "price_usd": 12.0}]'::jsonb,
    3
),
(
    'chamomile-cream',
    'chamomile-cream',
    'كريم لليدين بالبابونج وشمع العسل | Botanical Therapy',
    'Botanical Hand Therapy Cream',
    'مرطب ومغذي غني بحماية فائقة من الجفاف لجميع أنواع البشرة بمستخلص البابونج وشمع العسل وفيتامين E وزبدة الشيا.',
    'Rich protective botanical moisturizer for hands and dry areas with pure Chamomile, Beeswax, Vitamin E, and Shea Butter.',
    '/images/products/chamomile-cream.jpg',
    '["/images/products/chamomile-cream.jpg"]'::jsonb,
    'مستخلص طبيعي 🌿',
    '100% Natural 🌿',
    4.9,
    112,
    true,
    false,
    '["حماية فائقة وترميم حاجز البشرة الواقي", "تهدئة فورية للبشرة المتهيجة والجافة", "غني بفيتامين E ومضادات الأكسدة الطبيعية", "ملمس مخملي وامتصاص فوري"]'::jsonb,
    '["Ultimate protection and skin barrier restoration", "Instant relief and soothing for dry, irritated skin", "Packed with natural antioxidant Vitamin E", "Velvety finish with non-sticky absorption"]'::jsonb,
    '[{"size": "100 ml", "price_sar": 45, "price_yer": 6200, "price_usd": 12.5}]'::jsonb,
    4
),
(
    'beauty-bomb',
    'beauty-bomb',
    'كريم بيوتي بومب للتفتيح المكثف | Beauty Bomb',
    'Beauty Bomb Intensive Whitening Cream',
    'تركيبة فائقة الفعالية بالألفا أربوتين، النياسيناميد، الجلابريدين، وفيتامين C & E لتفتيح ونضارة البشرة والمناطق الحساسة بلطف وأمان.',
    'Gentle, dermatologist-tested whitening formula with Alpha Arbutin, Niacinamide, Glabridin, and Vitamins C & E for radiant skin.',
    '/images/products/beauty-bomb.jpg',
    '["/images/products/beauty-bomb.jpg"]'::jsonb,
    'تفتيح طبي آمن 🌸',
    'Medical Whitening 🌸',
    5.0,
    153,
    true,
    false,
    '["يقلل من التصبغات ويمنح تفتيحاً ملحوظاً", "يوحد لون البشرة ويقوي حاجزها الطبيعي", "مستخلص طبيعي مهدئ ومضاد للأكسدة", "آمن ولطيف للمناطق الحساسة ولجميع أنواع البشرة"]'::jsonb,
    '["Visibly reduces hyperpigmentation and discoloration", "Evens skin tone and reinforces the natural protective barrier", "Natural soothing botanical antioxidant formula", "Safe and gentle for sensitive areas and all skin types"]'::jsonb,
    '[{"size": "50 g", "price_sar": 55, "price_yer": 7500, "price_usd": 15.0}]'::jsonb,
    5
)
ON CONFLICT (id) DO UPDATE 
SET 
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar,
    description_en = EXCLUDED.description_en,
    image = EXCLUDED.image,
    images = EXCLUDED.images,
    badge_ar = EXCLUDED.badge_ar,
    badge_en = EXCLUDED.badge_en,
    rating = EXCLUDED.rating,
    reviews_count = EXCLUDED.reviews_count,
    in_stock = EXCLUDED.in_stock,
    is_bundle = EXCLUDED.is_bundle,
    features_ar = EXCLUDED.features_ar,
    features_en = EXCLUDED.features_en,
    variants = EXCLUDED.variants,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();
