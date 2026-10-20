export interface Product {
  id: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  categorySlug: 'all' | 'hair' | 'body' | 'skin' | 'whitening';
  descriptionAr: string;
  descriptionEn: string;
  benefitsAr: string[];
  benefitsEn: string[];
  volumeAr: string;
  volumeEn: string;
  prices: {
    SAR: number;
    YER: number;
    USD: number;
  };
  image: string;
  badgeAr?: string;
  badgeEn?: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
}

export const DR_BERRY_PRODUCTS: Product[] = [
  {
    id: 'coco-therapy',
    titleAr: 'بلسم ومرمم الشعر المطور | Coco Therapy',
    titleEn: 'Coco Therapy Intensive Nourishing Conditioner',
    categoryAr: 'عناية بالشعر',
    categoryEn: 'Hair Care',
    categorySlug: 'hair',
    descriptionAr: 'تركيبة علاجية فاخرة بالزبدات الطبيعية والزيوت المغذية لعلاج التلف من العمق وإعادة الحيوية والنعومة الفائقة للشعر.',
    descriptionEn: 'Intensive therapeutic formula enriched with natural butters and nourishing oils to deeply repair damage and restore softness.',
    benefitsAr: [
      'غني بالزبدات الطبيعية والزيوت المغذية',
      'يمنح الشعر ملمساً حريرياً وانسيابية فائقة',
      'يقضي على التقصف، التكسرات، والنفشة',
      'يعالج التلف الناتج عن الحرارة والمواد الكيميائية'
    ],
    benefitsEn: [
      'Enriched with botanical butters & nourishing oils',
      'Provides silky softness and effortless manageability',
      'Eliminates split ends, breakage, and frizz',
      'Repairs heat styling and chemical processing damage'
    ],
    volumeAr: '500 مل',
    volumeEn: '500 ml',
    prices: {
      SAR: 36,
      YER: 5000,
      USD: 9.5
    },
    image: '/images/products/coco-therapy.jpg',
    badgeAr: 'الأكثر طلباً ⭐',
    badgeEn: 'Best Seller ⭐',
    rating: 4.9,
    reviewsCount: 128,
    inStock: true
  },
  {
    id: 'hyaluronic-lotion',
    titleAr: 'لوشن الهيالورونيك أسيد للجسم | ترطيب عميق',
    titleEn: 'Hyaluronic Acid Intensive Body Lotion',
    categoryAr: 'عناية بالجسم',
    categoryEn: 'Body Care',
    categorySlug: 'body',
    descriptionAr: 'لوشن الترطيب والتفتيح المصنوع من حمض الهيالورونيك والكولاجين وزبدة الشيا والكاكاو وزيت اللوز وعرق السوس.',
    descriptionEn: 'Deep hydration and brightening body lotion formulated with pure Hyaluronic Acid, Collagen, Shea & Cocoa Butter, and Licorice.',
    benefitsAr: [
      'ترطيب مكثف يدوم 24 ساعة للبشرة الجافة جداً',
      'علاج التشققات الجلدية الحمراء والتخفيف من البيضاء',
      'وقاية متكاملة من الجفاف وعوامل الجو',
      'ملمس ناعم سريع الامتصاص دون أثر دهني'
    ],
    benefitsEn: [
      '24-hour intensive hydration for very dry skin',
      'Targets red stretch marks and softens appearance of white marks',
      'Comprehensive defense against environmental dryness',
      'Silky, fast-absorbing texture with zero greasy residue'
    ],
    volumeAr: '475 مل',
    volumeEn: '475 ml',
    prices: {
      SAR: 64,
      YER: 9000,
      USD: 19.0
    },
    image: '/images/products/hyaluronic-lotion.jpg',
    badgeAr: 'ترطيب 24 ساعة 💧',
    badgeEn: '24h Hydration 💧',
    rating: 5.0,
    reviewsCount: 94,
    inStock: true
  },
  {
    id: 'hair-bloom',
    titleAr: 'معالج الفروة المتطور | Hair Bloom Scalp Oil',
    titleEn: 'Hair Bloom Advanced Scalp Oil',
    categoryAr: 'عناية بالشعر',
    categoryEn: 'Hair Care',
    categorySlug: 'hair',
    descriptionAr: 'معالج الفروة المتطور والمصمم للنساء والرجال ليعيد للشعر قوته وكثافته من خلال عناية سريعة ومكثفة من الجذور.',
    descriptionEn: 'Advanced scalp therapy formulated for men and women to revitalize hair roots and restore natural density.',
    benefitsAr: [
      'تغذية الفروة وبصيلات الشعر من الجذور',
      'يحد من التساقط ويحفز إنبات الشعر الصحي',
      'تركيبة زيوت خفيفة سريعة الامتصاص',
      'مناسب للاستخدام من 2 إلى 3 مرات أسبوعياً'
    ],
    benefitsEn: [
      'Deeply nourishes scalp and hair follicles from root',
      'Significantly reduces shedding and promotes healthy growth',
      'Lightweight botanical oil blend for fast absorption',
      'Ideal for use 2 to 3 times weekly'
    ],
    volumeAr: '150 مل',
    volumeEn: '150 ml',
    prices: {
      SAR: 43,
      YER: 6000,
      USD: 12.0
    },
    image: '/images/products/hair-bloom.jpg',
    badgeAr: 'تركيبة مكثفة ✨',
    badgeEn: 'Intensive Formula ✨',
    rating: 4.8,
    reviewsCount: 86,
    inStock: true
  },
  {
    id: 'chamomile-cream',
    titleAr: 'كريم لليدين بالبابونج وشمع العسل | Botanical Therapy',
    titleEn: 'Botanical Hand Therapy Cream',
    categoryAr: 'عناية بالبشرة',
    categoryEn: 'Skin Care',
    categorySlug: 'skin',
    descriptionAr: 'مرطب ومغذي غني بحماية فائقة من الجفاف لجميع أنواع البشرة بمستخلص البابونج وشمع العسل وفيتامين E وزبدة الشيا.',
    descriptionEn: 'Rich protective botanical moisturizer for hands and dry areas with pure Chamomile, Beeswax, Vitamin E, and Shea Butter.',
    benefitsAr: [
      'حماية فائقة وترميم حاجز البشرة الواقي',
      'تهدئة فورية للبشرة المتهيجة والجافة',
      'غني بفيتامين E ومضادات الأكسدة الطبيعية',
      'ملمس مخملي وامتصاص فوري'
    ],
    benefitsEn: [
      'Ultimate protection and skin barrier restoration',
      'Instant relief and soothing for dry, irritated skin',
      'Packed with natural antioxidant Vitamin E',
      'Velvety finish with non-sticky absorption'
    ],
    volumeAr: '100 مل',
    volumeEn: '100 ml',
    prices: {
      SAR: 45,
      YER: 6200,
      USD: 12.5
    },
    image: '/images/products/chamomile-cream.jpg',
    badgeAr: 'مستخلص طبيعي 🌿',
    badgeEn: '100% Natural 🌿',
    rating: 4.9,
    reviewsCount: 112,
    inStock: true
  },
  {
    id: 'beauty-bomb',
    titleAr: 'كريم بيوتي بومب للتفتيح المكثف | Beauty Bomb',
    titleEn: 'Beauty Bomb Intensive Whitening Cream',
    categoryAr: 'تفتيح ونضارة',
    categoryEn: 'Whitening Care',
    categorySlug: 'whitening',
    descriptionAr: 'تركيبة فائقة الفعالية بالألفا أربوتين، النياسيناميد، الجلابريدين، وفيتامين C & E لتفتيح ونضارة البشرة والمناطق الحساسة بلطف وأمان.',
    descriptionEn: 'Gentle, dermatologist-tested whitening formula with Alpha Arbutin, Niacinamide, Glabridin, and Vitamins C & E for radiant skin.',
    benefitsAr: [
      'يقلل من التصبغات ويمنح تفتيحاً ملحوظاً',
      'يوحد لون البشرة ويقوي حاجزها الطبيعي',
      'مستخلص طبيعي مهدئ ومضاد للأكسدة',
      'آمن ولطيف للمناطق الحساسة ولجميع أنواع البشرة'
    ],
    benefitsEn: [
      'Visibly reduces hyperpigmentation and discoloration',
      'Evens skin tone and reinforces the natural protective barrier',
      'Natural soothing botanical antioxidant formula',
      'Safe and gentle for sensitive areas and all skin types'
    ],
    volumeAr: '50 جم',
    volumeEn: '50 g',
    prices: {
      SAR: 55,
      YER: 7500,
      USD: 15.0
    },
    image: '/images/products/beauty-bomb.jpg',
    badgeAr: 'تفتيح طبي آمن 🌸',
    badgeEn: 'Medical Whitening 🌸',
    rating: 5.0,
    reviewsCount: 153,
    inStock: true
  }
];

// Helper functions for easy localization
export function getProductTitle(product: Product, locale: string): string {
  return locale === 'en' ? product.titleEn : product.titleAr;
}

export function getProductCategory(product: Product, locale: string): string {
  return locale === 'en' ? product.categoryEn : product.categoryAr;
}

export function getProductDescription(product: Product, locale: string): string {
  return locale === 'en' ? product.descriptionEn : product.descriptionAr;
}

export function getProductBenefits(product: Product, locale: string): string[] {
  return locale === 'en' ? product.benefitsEn : product.benefitsAr;
}

export function getProductVolume(product: Product, locale: string): string {
  return locale === 'en' ? product.volumeEn : product.volumeAr;
}

export function getProductBadge(product: Product, locale: string): string | undefined {
  return locale === 'en' ? (product.badgeEn || product.badgeAr) : (product.badgeAr || product.badgeEn);
}
