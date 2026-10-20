'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useStore } from '@/contexts/StoreContext';
import { getProductTitle, getProductVolume } from '@/data/products';

const WHATSAPP_NUMBER = '967770000000';

// ─── Supported Countries & Regions ──────────────────────────────────────────
interface CountryConfig {
  code: string;
  nameAr: string;
  nameEn: string;
  dialCode: string;
  flag: string;
  defaultCurrency: 'YER' | 'SAR' | 'USD';
  regions: { id: string; nameAr: string; nameEn: string; isCapital?: boolean }[];
}

const COUNTRIES: CountryConfig[] = [
  {
    code: 'YE',
    nameAr: 'اليمن',
    nameEn: 'Yemen',
    dialCode: '+967',
    flag: '🇾🇪',
    defaultCurrency: 'YER',
    regions: [
      { id: 'sanaa_city', nameAr: 'أمانة العاصمة (صنعاء)', nameEn: 'Sana\'a (Capital)', isCapital: true },
      { id: 'sanaa_gov', nameAr: 'محافظة صنعاء', nameEn: 'Sana\'a Governorate', isCapital: true },
      { id: 'aden', nameAr: 'عدن', nameEn: 'Aden' },
      { id: 'taiz', nameAr: 'تعز', nameEn: 'Taiz' },
      { id: 'mukalla', nameAr: 'حضرموت - المكلا والساحل', nameEn: 'Hadhramout (Mukalla)' },
      { id: 'seiyun', nameAr: 'حضرموت - سيئون والوادي', nameEn: 'Hadhramout (Seiyun)' },
      { id: 'ibb', nameAr: 'إب', nameEn: 'Ibb' },
      { id: 'hodeidah', nameAr: 'الحديدة', nameEn: 'Al-Hodeidah' },
      { id: 'dhamar', nameAr: 'ذمار', nameEn: 'Dhamar' },
      { id: 'marib', nameAr: 'مأرب', nameEn: 'Marib' },
      { id: 'shabwah', nameAr: 'شبوة (عتق)', nameEn: 'Shabwah (Ataq)' },
      { id: 'lahj', nameAr: 'لحج', nameEn: 'Lahj' },
      { id: 'abyan', nameAr: 'أبين', nameEn: 'Abyan' },
      { id: 'almahrah', nameAr: 'المهرة (الغيضة)', nameEn: 'Al-Mahrah' },
      { id: 'amran', nameAr: 'عمران', nameEn: 'Amran' },
      { id: 'hajjah', nameAr: 'حجة', nameEn: 'Hajjah' },
      { id: 'saadah', nameAr: 'صعدة', nameEn: 'Sa\'adah' },
      { id: 'aldhale', nameAr: 'الضالع', nameEn: 'Al-Dhale' },
      { id: 'albayda', nameAr: 'البيضاء', nameEn: 'Al-Bayda' },
      { id: 'almahweet', nameAr: 'المحويت', nameEn: 'Al-Mahweet' },
      { id: 'raymah', nameAr: 'ريمة', nameEn: 'Raymah' },
      { id: 'socotra', nameAr: 'أرخبيل سقطرى', nameEn: 'Socotra' },
      { id: 'aljawf', nameAr: 'الجوف', nameEn: 'Al-Jawf' },
    ],
  },
  {
    code: 'SA',
    nameAr: 'المملكة العربية السعودية',
    nameEn: 'Saudi Arabia',
    dialCode: '+966',
    flag: '🇸🇦',
    defaultCurrency: 'SAR',
    regions: [
      { id: 'riyadh', nameAr: 'منطقة الرياض', nameEn: 'Riyadh' },
      { id: 'makkah', nameAr: 'منطقة مكة المكرمة وجدة', nameEn: 'Makkah & Jeddah' },
      { id: 'madinah', nameAr: 'منطقة المدينة المنورة', nameEn: 'Madinah' },
      { id: 'eastern', nameAr: 'المنطقة الشرقية (الدمام والخبر)', nameEn: 'Eastern Province' },
      { id: 'qassim', nameAr: 'منطقة القصيم', nameEn: 'Al-Qassim' },
      { id: 'asir', nameAr: 'منطقة عسير وأبها', nameEn: 'Asir & Abha' },
      { id: 'tabuk', nameAr: 'منطقة تبوك', nameEn: 'Tabuk' },
      { id: 'hail', nameAr: 'منطقة حائل', nameEn: 'Hail' },
      { id: 'jizan', nameAr: 'منطقة جازان', nameEn: 'Jizan' },
      { id: 'najran', nameAr: 'منطقة نجران', nameEn: 'Najran' },
    ],
  },
  {
    code: 'AE',
    nameAr: 'دولة الإمارات العربية المتحدة',
    nameEn: 'United Arab Emirates',
    dialCode: '+971',
    flag: '🇦🇪',
    defaultCurrency: 'USD',
    regions: [
      { id: 'dubai', nameAr: 'إمارة دبي', nameEn: 'Dubai' },
      { id: 'abudhabi', nameAr: 'إمارة أبوظبي', nameEn: 'Abu Dhabi' },
      { id: 'sharjah', nameAr: 'إمارة الشارقة', nameEn: 'Sharjah' },
      { id: 'ajman', nameAr: 'إمارة عجمان', nameEn: 'Ajman' },
    ],
  },
  {
    code: 'OM',
    nameAr: 'سلطنة عُمان',
    nameEn: 'Oman',
    dialCode: '+968',
    flag: '🇴🇲',
    defaultCurrency: 'USD',
    regions: [
      { id: 'muscat', nameAr: 'محافظة مسقط', nameEn: 'Muscat' },
      { id: 'dhofar', nameAr: 'محافظة ظفار (صلالة)', nameEn: 'Dhofar' },
      { id: 'batinah', nameAr: 'محافظة شمال وجنوب الباطنة', nameEn: 'Al Batinah' },
    ],
  },
];

// ─── Yemeni Payment Wallets ──────────────────────────────────────────────────
interface YemeniWallet {
  id: string;
  nameAr: string;
  nameEn: string;
  accountNumber: string;
  beneficiary: string;
  instructionsAr: string;
  instructionsEn: string;
  icon: string;
  badge: string;
}

const YEMENI_WALLETS: YemeniWallet[] = [
  {
    id: 'kuraimi',
    nameAr: 'بنك الكريمي (الكريمي جوال / مميز)',
    nameEn: 'Al-Kuraimi Bank (Kuraimi Jawali)',
    accountNumber: '3029845612',
    beneficiary: 'د. بيري للعناية الطبية Dr.Berry',
    instructionsAr: 'التحويل عبر تطبيق كريمي جوال أو إيداع في أي فرع باسم المستفيد الموضح.',
    instructionsEn: 'Transfer via Kuraimi Jawali app or deposit at any branch with the beneficiary name.',
    icon: '🏦',
    badge: 'الأكثر استخداماً',
  },
  {
    id: 'floosak',
    nameAr: 'محفظة فلوسك (Floosak)',
    nameEn: 'Floosak Wallet',
    accountNumber: '730123456',
    beneficiary: 'Dr. Berry Store',
    instructionsAr: 'التحويل من محفظة فلوسك إلى رقم المحفظة، ثم إرفاق إشعار العملية أدناه.',
    instructionsEn: 'Transfer from your Floosak wallet to the number above, then attach receipt below.',
    icon: '📱',
    badge: 'فوري',
  },
  {
    id: 'cash_wallet',
    nameAr: 'محفظة كاش (Cash Wallet)',
    nameEn: 'Cash Wallet',
    accountNumber: '770987654',
    beneficiary: 'د. بيري كير',
    instructionsAr: 'التحويل من تطبيق كاش إلى رقم المحفظة الظاهر واكتبي رقم الطلب في البيان.',
    instructionsEn: 'Transfer via Cash wallet app to the number shown with order number note.',
    icon: '💳',
    badge: 'معتمد',
  },
  {
    id: 'jeeb',
    nameAr: 'محفظة جيب (Jeeb)',
    nameEn: 'Jeeb Wallet',
    accountNumber: '710554433',
    beneficiary: 'Dr. Berry Yemen',
    instructionsAr: 'التحويل متاح فوري عبر تطبيق جيب، راجعي اسم المستفيد قبل الإرسال.',
    instructionsEn: 'Instant transfer via Jeeb app. Please verify the beneficiary name before confirming.',
    icon: '⚡',
    badge: 'سريع',
  },
  {
    id: 'onecash',
    nameAr: 'محفظة ون كاش (OneCash)',
    nameEn: 'OneCash Wallet',
    accountNumber: '780112233',
    beneficiary: 'Dr. Berry Medical Care',
    instructionsAr: 'تحويل مباشر من محفظتك برقم الهاتف الموضح أعلاه.',
    instructionsEn: 'Direct transfer using the wallet phone number shown above.',
    icon: '🪙',
    badge: 'فوري',
  },
  {
    id: 'cacbank',
    nameAr: 'كاك بنك / كاك باي (CAC Bank)',
    nameEn: 'CAC Bank / CAC Pay',
    accountNumber: '100876543',
    beneficiary: 'مؤسسة د. بيري للتجميل',
    instructionsAr: 'التحويل عبر تطبيق كاك موبايل أو تطبيق كاك باي أو أي فرع للبنك.',
    instructionsEn: 'Transfer via CAC Mobile or CAC Pay app or any bank branch.',
    icon: '🏛️',
    badge: 'بنكي',
  },
];

// ─── Shipping Method Definition ──────────────────────────────────────────────
interface ShippingOption {
  id: string;
  nameAr: string;
  nameEn: string;
  companyNameAr?: string;
  companyNameEn?: string;
  timeAr: string;
  timeEn: string;
  costYER: number;
  costSAR: number;
  costUSD: number;
  freeAboveYER?: number;
  freeAboveSAR?: number;
  freeAboveUSD?: number;
  noteAr?: string;
  noteEn?: string;
  icon: string;
  tag?: string;
}

export default function CheckoutPage() {
  const t = useTranslations('Checkout');
  const tNav = useTranslations('Navigation');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const { cart, currency: contextCurrency, clearCart } = useStore();

  // Selected Currency
  const [selectedCurrency, setSelectedCurrency] = useState<'YER' | 'SAR' | 'USD'>(
    contextCurrency || 'YER'
  );

  // Form State
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    countryCode: 'YE',
    regionId: 'sanaa_city',
    city: 'صنعاء',
    address: '',
    notes: '',
    shippingMethodId: 'sanaa_express',
    customShippingPreference: '',
    paymentMethod: 'cash_on_delivery' as 'cash_on_delivery' | 'bank_transfer',
    selectedWalletId: 'kuraimi',
    couponCode: '',
  });

  // Flow State
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0);
  const [submitted, setSubmitted] = useState(false);
  const [submittedChannel, setSubmittedChannel] = useState<'web' | 'whatsapp'>('web');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingChannel, setSubmittingChannel] = useState<'web' | 'whatsapp' | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);

  // Auto-fill profile if logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data?.authenticated && data.customer) {
          setForm((prev) => ({
            ...prev,
            fullName: prev.fullName || data.customer.fullName || '',
            phone: prev.phone || data.customer.phoneE164 || '',
            countryCode: data.customer.countryCode || prev.countryCode,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Coupon State
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Receipt Attachment State (Before submitting!)
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);

  // Cleanup object URL
  useEffect(() => {
    if (!receiptFile) {
      setReceiptPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(receiptFile);
    setReceiptPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [receiptFile]);

  // Active Country & Regions
  const currentCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === form.countryCode) || COUNTRIES[0],
    [form.countryCode]
  );

  const currentRegion = useMemo(
    () => currentCountry.regions.find((r) => r.id === form.regionId) || currentCountry.regions[0],
    [currentCountry, form.regionId]
  );

  // ─── Multiple Dynamic Shipping Methods (Admin-ready & Localized) ───────────
  const availableShippingMethods = useMemo<ShippingOption[]>(() => {
    if (form.countryCode === 'YE') {
      if (form.regionId === 'sanaa_city' || form.regionId === 'sanaa_gov') {
        return [
          {
            id: 'sanaa_express',
            nameAr: 'توصيل فوري خلال 24 ساعة (لباب المنزل)',
            nameEn: 'Express Home Delivery within 24 hours',
            companyNameAr: 'مندوب متجر د. بيري السريع',
            companyNameEn: 'Dr. Berry Express Courier',
            timeAr: 'خلال 24 ساعة (نفس اليوم)',
            timeEn: 'Within 24 hours (Same day)',
            costYER: 1500,
            costSAR: 12,
            costUSD: 3,
            freeAboveYER: 20000,
            freeAboveSAR: 150,
            freeAboveUSD: 40,
            noteAr: 'توصيل مباشر حتى باب منزلك عبر مندوبنا الخاص مع فحص الطلب',
            noteEn: 'Direct doorstep delivery with package inspection',
            icon: '⚡',
            tag: 'الأسرع والأكثر طلباً',
          },
          {
            id: 'sanaa_standard',
            nameAr: 'توصيل عادي اقتصادي (خلال 24 إلى 48 ساعة)',
            nameEn: 'Standard Economic Delivery (24-48 hrs)',
            companyNameAr: 'المندوب المجدول',
            companyNameEn: 'Scheduled Courier',
            timeAr: 'خلال 24 - 48 ساعة',
            timeEn: 'Within 24 - 48 hours',
            costYER: 1000,
            costSAR: 8,
            costUSD: 2,
            freeAboveYER: 15000,
            freeAboveSAR: 120,
            freeAboveUSD: 30,
            noteAr: 'توصيل هادئ واقتصادي لأي حي في صنعاء',
            noteEn: 'Cost-effective scheduled local delivery',
            icon: '🛵',
            tag: 'اقتصادي',
          },
          {
            id: 'sanaa_pickup',
            nameAr: 'استلام مباشر من مقر متجر د. بيري (صنعاء - حدة)',
            nameEn: 'Direct Store Pick-up (Sana\'a - Hadda)',
            companyNameAr: 'فرع متجر د. بيري الرئيسي',
            companyNameEn: 'Dr. Berry Main Branch',
            timeAr: 'جاهز خلال ساعتين من تأكيد الطلب',
            timeEn: 'Ready within 2 hours of confirmation',
            costYER: 0,
            costSAR: 0,
            costUSD: 0,
            noteAr: 'شارع حدة - أمام مركز الكميم التجاري (أوقات الدوام: 9 ص - 10 م)',
            noteEn: 'Hadda St. - In front of Al-Kumaim Center (9am - 10pm)',
            icon: '🏢',
            tag: 'مجاناً بدون رسوم',
          },
        ];
      }

      // Other Yemeni Governorates (Rich choices of certified cargo companies)
      return [
        {
          id: 'yemen_nemr',
          nameAr: 'شحن عبر شركة ومكتب النمر للنقل السريع',
          nameEn: 'Al-Nemr Express Cargo',
          companyNameAr: 'شركة النمر للنقل الدولي والداخلي',
          companyNameEn: 'Al-Nemr Transport Co.',
          timeAr: 'من 24 إلى 48 ساعة',
          timeEn: '24 to 48 hours',
          costYER: 3000,
          costSAR: 25,
          costUSD: 6,
          freeAboveYER: 35000,
          freeAboveSAR: 250,
          freeAboveUSD: 70,
          noteAr: 'شحن سريع وموثوق مع استلام فوري من مكتب النمر بمركز المحافظة',
          noteEn: 'Fast & trusted cargo pickup from governorate branch',
          icon: '🚚',
          tag: 'موصى به للمحافظات',
        },
        {
          id: 'yemen_ruwaishan',
          nameAr: 'شحن عبر شركة الرويشان للنقل السريع',
          nameEn: 'Al-Ruwaishan Express Cargo',
          companyNameAr: 'مكتب الرويشان للشحن',
          companyNameEn: 'Al-Ruwaishan Cargo',
          timeAr: 'من 1 إلى 2 أيام عمل',
          timeEn: '1 to 2 business days',
          costYER: 3000,
          costSAR: 25,
          costUSD: 6,
          freeAboveYER: 35000,
          freeAboveSAR: 250,
          freeAboveUSD: 70,
          noteAr: 'تغطية واسعة لكافة المحافظات والمدن الرئيسية',
          noteEn: 'Broad coverage across all major governorates',
          icon: '🚛',
          tag: 'واسع الانتشار',
        },
        {
          id: 'yemen_buraq',
          nameAr: 'شحن عبر شركة البراق للشحن والنقل',
          nameEn: 'Al-Buraq Cargo & Transport',
          companyNameAr: 'مكتب البراق للنقليات',
          companyNameEn: 'Al-Buraq Transport',
          timeAr: 'من 1 إلى 3 أيام عمل',
          timeEn: '1 to 3 business days',
          costYER: 3000,
          costSAR: 25,
          costUSD: 6,
          freeAboveYER: 35000,
          freeAboveSAR: 250,
          freeAboveUSD: 70,
          noteAr: 'شحن آمن مع رسائل نصية برقم البوليصة عند الوصول',
          noteEn: 'Secure cargo with SMS notification upon arrival',
          icon: '📦',
          tag: 'معتمد',
        },
        {
          id: 'yemen_raha',
          nameAr: 'شحن عبر شركة راحة للنقل البري',
          nameEn: 'Raha Express Transport',
          companyNameAr: 'شركة راحة للنقل',
          companyNameEn: 'Raha Transport',
          timeAr: 'من 24 إلى 48 ساعة',
          timeEn: '24 to 48 hours',
          costYER: 3500,
          costSAR: 28,
          costUSD: 7,
          freeAboveYER: 40000,
          freeAboveSAR: 300,
          freeAboveUSD: 80,
          noteAr: 'خدمة شحن ممتازة خاصة لخطوط عدن والمكلا ومأرب',
          noteEn: 'Premium cargo service for Aden, Mukalla & Marib',
          icon: '🚍',
          tag: 'سريع للخطوط الرئيسية',
        },
        {
          id: 'yemen_door_express',
          nameAr: 'توصيل مخصص لباب المنزل في مركز المحافظة',
          nameEn: 'Door-to-Door Dedicated Governorate Delivery',
          companyNameAr: 'مندوب التوصيل المباشر في المحافظة',
          companyNameEn: 'Local Governorate Courier',
          timeAr: 'من 24 إلى 48 ساعة',
          timeEn: '24 to 48 hours',
          costYER: 5000,
          costSAR: 40,
          costUSD: 10,
          freeAboveYER: 50000,
          freeAboveSAR: 380,
          freeAboveUSD: 100,
          noteAr: 'تسليم يدوي مباشر لعنوانك دون الحاجة للذهاب إلى مكاتب الشحن',
          noteEn: 'Direct home delivery in the governorate center',
          icon: '🛵',
          tag: 'لباب المنزل',
        },
        {
          id: 'yemen_custom',
          nameAr: 'مكتب شحن آخر حسب رغبتك (يُحدد في الملاحظات)',
          nameEn: 'Custom Cargo Office (Specify in notes)',
          companyNameAr: 'مكتب الشحن المحدد من قبل العميل',
          companyNameEn: 'Customer Specified Cargo',
          timeAr: 'حسب المكتب المختار',
          timeEn: 'Based on chosen carrier',
          costYER: 3000,
          costSAR: 25,
          costUSD: 6,
          freeAboveYER: 35000,
          freeAboveSAR: 250,
          freeAboveUSD: 70,
          noteAr: 'سنتواصل معك لتنسيق التسليم للمكتب الذي تفضلينه',
          noteEn: 'We will contact you to arrange delivery to your chosen carrier',
          icon: '📝',
          tag: 'حسب رغبتك',
        },
      ];
    }

    // Gulf / International Shipping Options
    return [
      {
        id: 'intl_dhl',
        nameAr: 'شحن دولي سريع ومباشر عبر DHL Express',
        nameEn: 'Express International Shipping via DHL Express',
        companyNameAr: 'شركة DHL العالمية',
        companyNameEn: 'DHL International',
        timeAr: 'من 2 إلى 4 أيام عمل',
        timeEn: '2 to 4 business days',
        costYER: 28000,
        costSAR: 70,
        costUSD: 18,
        freeAboveYER: 90000,
        freeAboveSAR: 500,
        freeAboveUSD: 135,
        noteAr: 'شحن جوي فائق السرعة مع رقم تتبع فوري حتى باب بيتك',
        noteEn: 'Fastest air delivery with real-time tracking to your door',
        icon: '✈️',
        tag: 'الأسرع دولياً',
      },
      {
        id: 'intl_aramex',
        nameAr: 'شحن سريع عبر شركة Aramex',
        nameEn: 'Priority Shipping via Aramex',
        companyNameAr: 'شركة أرامكس للنقل السريع',
        companyNameEn: 'Aramex International',
        timeAr: 'من 4 إلى 6 أيام عمل',
        timeEn: '4 to 6 business days',
        costYER: 24000,
        costSAR: 55,
        costUSD: 15,
        freeAboveYER: 80000,
        freeAboveSAR: 450,
        freeAboveUSD: 120,
        noteAr: 'شحن معتمد مع تغليف فندقي محمي وخدمة التتبع',
        noteEn: 'Trusted shipping with protective luxury packaging',
        icon: '📦',
        tag: 'شحن موثوق',
      },
    ];
  }, [form.countryCode, form.regionId]);

  // Selected Shipping Option
  const selectedShipping = useMemo(() => {
    const found = availableShippingMethods.find((s) => s.id === form.shippingMethodId);
    return found || availableShippingMethods[0];
  }, [availableShippingMethods, form.shippingMethodId]);

  // Calculations
  const subtotalYER = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.prices.YER * item.quantity, 0),
    [cart]
  );
  const subtotalSAR = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.prices.SAR * item.quantity, 0),
    [cart]
  );
  const subtotalUSD = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.prices.USD * item.quantity, 0),
    [cart]
  );

  const subtotalCurrent =
    selectedCurrency === 'YER'
      ? subtotalYER
      : selectedCurrency === 'SAR'
      ? subtotalSAR
      : subtotalUSD;

  // Discount
  const discountAmount = appliedDiscount ? Math.round(subtotalCurrent * (appliedDiscount.percent / 100)) : 0;

  // Free shipping check
  const isFreeShipping = useMemo(() => {
    if (!selectedShipping) return false;
    if (selectedCurrency === 'YER' && selectedShipping.freeAboveYER) {
      return subtotalYER >= selectedShipping.freeAboveYER;
    }
    if (selectedCurrency === 'SAR' && selectedShipping.freeAboveSAR) {
      return subtotalSAR >= selectedShipping.freeAboveSAR;
    }
    if (selectedCurrency === 'USD' && selectedShipping.freeAboveUSD) {
      return subtotalUSD >= selectedShipping.freeAboveUSD;
    }
    return selectedShipping.costYER === 0;
  }, [selectedShipping, selectedCurrency, subtotalYER, subtotalSAR, subtotalUSD]);

  const shippingCost = isFreeShipping
    ? 0
    : selectedCurrency === 'YER'
    ? selectedShipping?.costYER || 0
    : selectedCurrency === 'SAR'
    ? selectedShipping?.costSAR || 0
    : selectedShipping?.costUSD || 0;

  const grandTotal = Math.max(0, subtotalCurrent - discountAmount + shippingCost);

  // Format with currency
  const formatAmount = (amt: number, curr: 'YER' | 'SAR' | 'USD' = selectedCurrency) => {
    const symbol = curr === 'YER' ? (locale === 'ar' ? 'ر.ي' : 'YER') : curr === 'SAR' ? (locale === 'ar' ? 'ر.س' : 'SAR') : '$';
    return `${amt.toLocaleString(locale === 'ar' ? 'ar-YE' : 'en-US')} ${symbol}`;
  };

  // Selected Wallet
  const selectedWallet = useMemo(
    () => YEMENI_WALLETS.find((w) => w.id === form.selectedWalletId) || YEMENI_WALLETS[0],
    [form.selectedWalletId]
  );

  // Handle Input Changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // If country changed, auto update currency & reset region
      if (name === 'countryCode') {
        const c = COUNTRIES.find((item) => item.code === value) || COUNTRIES[0];
        updated.regionId = c.regions[0].id;
        updated.city = c.regions[0].nameAr;
        setSelectedCurrency(c.defaultCurrency);
      }
      // If region changed, update city name
      if (name === 'regionId') {
        const c = COUNTRIES.find((item) => item.code === updated.countryCode) || COUNTRIES[0];
        const r = c.regions.find((item) => item.id === value);
        if (r) updated.city = r.nameAr;
      }
      return updated;
    });
  };

  // Apply Coupon
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = form.couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'DRBERRY10') {
      setAppliedDiscount({ code, percent: 10 });
    } else if (code === 'WELCOME' || code === 'FIRSTORDER') {
      setAppliedDiscount({ code, percent: 5 });
    } else if (code === 'BEAUTY') {
      setAppliedDiscount({ code, percent: 15 });
    } else {
      setCouponError(t('invalidCoupon'));
    }
  };

  // Copy Account Number
  const copyAccountNumber = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  // Copy Order Number
  const copyOrderNumber = (ord: string) => {
    navigator.clipboard.writeText(ord);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2500);
  };

  // Build Comprehensive WhatsApp Message
  const buildWhatsAppMessage = (ordNum: string) => {
    const cartLines = cart
      .map(
        (item, i) =>
          `  ${i + 1}. *${getProductTitle(item.product, locale).split('|')[0].trim()}* (${getProductVolume(item.product, locale)}) × ${item.quantity} = ${formatAmount(
            (selectedCurrency === 'YER'
              ? item.product.prices.YER
              : selectedCurrency === 'SAR'
              ? item.product.prices.SAR
              : item.product.prices.USD) * item.quantity
          )}`
      )
      .join('\n');

    const paymentText =
      form.paymentMethod === 'cash_on_delivery'
        ? locale === 'ar'
          ? '💵 الدفع عند الاستلام (كاش للمندوب)'
          : '💵 Cash on Delivery'
        : locale === 'ar'
        ? `🏦 تحويل عبر: ${selectedWallet.nameAr}\n  🔢 رقم الحساب: ${selectedWallet.accountNumber}\n  👤 المستفيد: ${selectedWallet.beneficiary}\n  📸 إيصال التحويل: ${receiptFile ? `تم إرفاق صورة الإيصال (${receiptFile.name}) - [سأرسلها الآن]` : 'سيتم إرسال صورة الإيصال في هذه المحادثة'}`
        : `🏦 Bank Transfer via: ${selectedWallet.nameEn}\n  🔢 Account: ${selectedWallet.accountNumber}\n  👤 Beneficiary: ${selectedWallet.beneficiary}\n  📸 Receipt: ${receiptFile ? `Attached (${receiptFile.name})` : 'Will send screenshot here'}`;

    const discountLine = appliedDiscount
      ? locale === 'ar'
        ? `\n🎁 *كود الخصم المطبق:* ${appliedDiscount.code} (-${appliedDiscount.percent}%) = -${formatAmount(discountAmount)}`
        : `\n🎁 *Applied Coupon:* ${appliedDiscount.code} (-${appliedDiscount.percent}%) = -${formatAmount(discountAmount)}`
      : '';

    const customShippingLine = form.customShippingPreference
      ? locale === 'ar'
        ? `\n🏢 *تفضيل الشحن الخاص:* ${form.customShippingPreference}`
        : `\n🏢 *Custom Carrier Preference:* ${form.customShippingPreference}`
      : '';

    if (locale === 'ar') {
      return `✨ *طلب جديد من متجر Dr.Berry للعناية الطبية* ✨

🆔 *رقم الطلب:* #${ordNum}
━━━━━━━━━━━━━━━━━━
👤 *اسم العميل:* ${form.fullName}
📞 *رقم الهاتف:* ${form.phone}
🌍 *الدولة:* ${currentCountry.nameAr}
📍 *المحافظة:* ${currentRegion.nameAr}
🏙️ *المدينة / المديرية:* ${form.city}
🏠 *العنوان التفصيلي:* ${form.address}
${form.notes ? `📝 *ملاحظات التوصيل:* ${form.notes}\n` : ''}━━━━━━━━━━━━━━━━━━
🛒 *المنتجات المطلوبة:*
${cartLines}

🚚 *طريقة الشحن المختارة:* ${selectedShipping.nameAr}
⏱️ *وقت التسليم المتوقع:* ${selectedShipping.timeAr}${customShippingLine}
📦 *رسوم الشحن:* ${isFreeShipping ? 'مجاني 🚚' : formatAmount(shippingCost)}${discountLine}
💰 *المجموع النهائي المطلوب:* *${formatAmount(grandTotal)}*
━━━━━━━━━━━━━━━━━━
💳 *طريقة الدفع:*
${paymentText}

_يرجى مراجعة الطلب واعتماده وتحديد موعد التسليم_ 🌿`;
    }

    return `✨ *New Order from Dr.Berry Medical Store* ✨

🆔 *Order Number:* #${ordNum}
━━━━━━━━━━━━━━━━━━
👤 *Customer Name:* ${form.fullName}
📞 *Phone Number:* ${form.phone}
🌍 *Country:* ${currentCountry.nameEn}
📍 *Governorate / Region:* ${currentRegion.nameEn}
🏙️ *City:* ${form.city}
🏠 *Detailed Address:* ${form.address}
${form.notes ? `📝 *Delivery Notes:* ${form.notes}\n` : ''}━━━━━━━━━━━━━━━━━━
🛒 *Ordered Items:*
${cartLines}

🚚 *Shipping Option:* ${selectedShipping.nameEn}
⏱️ *Estimated Delivery:* ${selectedShipping.timeEn}${customShippingLine}
📦 *Shipping Fee:* ${isFreeShipping ? 'Free 🚚' : formatAmount(shippingCost)}${discountLine}
💰 *Grand Total:* *${formatAmount(grandTotal)}*
━━━━━━━━━━━━━━━━━━
💳 *Payment Method:*
${paymentText}

_Please review and confirm dispatch schedule_ 🌿`;
  };

  // Helper to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Submit Order - Dual Track (Web Store Checkout vs WhatsApp Inquiry)
  const handleExecuteOrder = async (channel: 'web' | 'whatsapp') => {
    if (isSubmitting) return;
    setSubmitError(null);

    if (!canProceedStep(0) || !canProceedStep(1)) {
      setSubmitError(
        locale === 'ar'
          ? 'يرجى مراجعة وتعبئة الاسم ورقم الهاتف والعنوان بشكل صحيح.'
          : 'Please check your name, phone number, and address.'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmittingChannel(channel);

    const generatedOrder = `DRB-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      let receiptBase64: string | undefined = undefined;
      if (receiptFile) {
        try {
          receiptBase64 = await fileToBase64(receiptFile);
        } catch {
          // ignore receipt conversion error
        }
      }

      const orderPayload = {
        orderNumber: generatedOrder,
        customerName: form.fullName.trim(),
        customerPhone: form.phone.trim(),
        country: form.countryCode,
        governorate: currentRegion.nameAr,
        cityOrArea: form.city,
        addressDetails: form.address.trim(),
        shippingMethod: selectedShipping.nameAr,
        shippingCostYer: selectedShipping.costYER || 0,
        paymentMethod: channel === 'whatsapp' ? 'whatsapp' : form.paymentMethod,
        walletId: form.selectedWalletId,
        currencyUsed: selectedCurrency,
        totalYer: subtotalYER + (isFreeShipping ? 0 : (selectedShipping.costYER || 0)),
        totalSar: subtotalSAR + (isFreeShipping ? 0 : (selectedShipping.costSAR || 0)),
        totalUsd: subtotalUSD + (isFreeShipping ? 0 : (selectedShipping.costUSD || 0)),
        items: cart.map((item) => ({
          id: item.product.id,
          title: getProductTitle(item.product, locale),
          volume: getProductVolume(item.product, locale),
          quantity: item.quantity,
          price:
            selectedCurrency === 'YER'
              ? item.product.prices.YER
              : selectedCurrency === 'SAR'
              ? item.product.prices.SAR
              : item.product.prices.USD,
          image: item.product.image,
        })),
        receiptBase64,
        receiptFileName: receiptFile?.name,
        channel,
        notes: form.notes,
        customShippingPreference: form.customShippingPreference,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل إرسال الطلب إلى السحابة');
      }

      setOrderNumber(generatedOrder);
      setSubmittedChannel(channel);
      setSubmitted(true);

      // If WhatsApp Track: open formatted WhatsApp message
      if (channel === 'whatsapp') {
        const msg = buildWhatsAppMessage(generatedOrder);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
      }

      clearCart();
    } catch (err: any) {
      console.error('Submit order error:', err);
      setSubmitError(
        err.message ||
          (locale === 'ar'
            ? 'حدث خطأ أثناء معالجة الطلب، يمكنك إعادة المحاولة أو التواصل مباشرة عبر الواتساب.'
            : 'Error processing order. Please retry or contact us on WhatsApp.')
      );
    } finally {
      setIsSubmitting(false);
      setSubmittingChannel(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteOrder('web');
  };

  // Validation before step forward
  const canProceedStep = (step: number): boolean => {
    if (step === 0) {
      return form.fullName.trim().length >= 3 && form.phone.trim().length >= 7;
    }
    if (step === 1) {
      return (
        Boolean(form.countryCode) &&
        Boolean(form.regionId) &&
        form.address.trim().length >= 5 &&
        Boolean(form.shippingMethodId)
      );
    }
    return true;
  };

  // ─── Empty Cart State ──────────────────────────────────────────────────────
  if (cart.length === 0 && !submitted) {
    return (
      <div className="min-h-[75vh] bg-background flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-md bg-card border border-border/80 rounded-3xl p-10 shadow-sm">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            🛍️
          </div>
          <h1 className="text-2xl font-black text-primary mb-3">{t('emptyCartTitle')}</h1>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">{t('emptyCartDesc')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="px-6 py-3.5 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all text-sm shadow-md"
            >
              {t('browseShopping')}
            </Link>
            <Link
              href="/cart"
              className="px-6 py-3.5 bg-background border border-border text-foreground rounded-2xl font-bold hover:bg-primary/5 transition-all text-sm"
            >
              {t('backToCart')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Post-Order Success Screen ─────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-background py-16 px-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Main Success Box */}
          <div className="bg-card rounded-3xl border border-border p-8 sm:p-10 shadow-lg text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-green-500 via-primary to-accent" />

            <div className="w-20 h-20 bg-green-50 dark:bg-green-950/40 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 ring-8 ring-green-500/10 animate-bounce">
              ✓
            </div>

            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${submittedChannel === 'web' ? 'text-primary bg-primary/10' : 'text-green-700 bg-green-100 dark:bg-green-950/60'}`}>
              {submittedChannel === 'web'
                ? (locale === 'ar' ? '✓ مسار شراء مؤكد عبر الموقع' : '✓ Store Purchase Confirmed')
                : (locale === 'ar' ? '💬 مسار طلب واستفسار عبر الواتساب' : '💬 WhatsApp Assisted Order')}
            </span>

            <h1 className="text-3xl font-black text-foreground mt-3 mb-2">
              {submittedChannel === 'web'
                ? (locale === 'ar' ? 'تم تأكيد طلبك وحجز المنتجات!' : 'Order Confirmed & Reserved!')
                : (locale === 'ar' ? 'تم تسجيل طلبك عبر الواتساب!' : 'WhatsApp Order Recorded!')}
            </h1>

            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              {submittedChannel === 'web'
                ? (locale === 'ar'
                    ? 'شكراً لثقتكِ بـ Dr.Berry! تم حجز المنتجات وخصم الكميات وتسجيل الطلب في السحابة بنجاح.'
                    : 'Thank you for trusting Dr.Berry! Items reserved and order registered in cloud.')
                : (locale === 'ar'
                    ? 'تم توجيه طلبك إلى فريق خدمة العملاء عبر الواتساب. لم يتم خصم الكميات من المتجر؛ ستكملين وتؤكدين التفاصيل مع المبيعات.'
                    : 'Your inquiry was routed to WhatsApp sales. No stock deducted; finalize with support.')}
            </p>

            {/* Order Number Box */}
            <div className="mt-6 p-5 bg-background rounded-2xl border border-border flex items-center justify-between gap-4">
              <div className="text-start">
                <span className="text-xs text-muted-foreground block">{t('orderNumber')}</span>
                <span className="text-2xl font-mono font-black text-primary tracking-wider" dir="ltr">
                  #{orderNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyOrderNumber(orderNumber)}
                className="px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                {copiedOrder ? t('copiedAccount') : t('copyOrderNumber')}
              </button>
            </div>

            {/* Receipt Notice on Success */}
            {receiptFile && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-green-700 dark:text-green-400">
                <span>📸</span>
                <span>{locale === 'ar' ? `تم إرفاق صورة الإيصال بنجاح (${receiptFile.name})` : `Receipt image attached (${receiptFile.name})`}</span>
              </div>
            )}

            {/* Order Brief */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-start text-xs border-t border-border pt-6">
              <div className="p-3 bg-background rounded-xl">
                <span className="text-muted-foreground block mb-1">{t('fullName')}</span>
                <strong className="text-foreground text-sm">{form.fullName}</strong>
              </div>
              <div className="p-3 bg-background rounded-xl">
                <span className="text-muted-foreground block mb-1">{t('governorate')}</span>
                <strong className="text-foreground text-sm">{currentRegion.nameAr}</strong>
              </div>
              <div className="p-3 bg-background rounded-xl">
                <span className="text-muted-foreground block mb-1">{t('paymentMethod')}</span>
                <strong className="text-foreground text-sm">
                  {form.paymentMethod === 'cash_on_delivery' ? t('payWhatsapp') : selectedWallet.nameAr}
                </strong>
              </div>
              <div className="p-3 bg-background rounded-xl">
                <span className="text-muted-foreground block mb-1">{t('total')}</span>
                <strong className="text-primary text-sm font-black">{formatAmount(grandTotal)}</strong>
              </div>
            </div>
          </div>

          {/* What Happens Next? */}
          <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm">
            <h3 className="font-black text-base text-foreground mb-4 flex items-center gap-2">
              <span>📋</span> {t('whatHappensNext')}
            </h3>
            <div className="space-y-4">
              {[
                { num: '1', desc: t('step1Desc') },
                { num: '2', desc: t('step2Desc') },
                { num: '3', desc: t('step3Desc') },
              ].map((step) => (
                <div key={step.num} className="flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step.num}
                  </span>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-0.5">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                const msg = buildWhatsAppMessage(orderNumber);
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="w-full py-4 bg-[#25D366] hover:bg-[#20b858] text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-sm"
            >
              <span>💬</span> {t('placeOrder')}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/products"
                className="py-3.5 bg-card border border-border text-foreground hover:bg-primary/5 rounded-2xl font-bold text-center text-xs transition-all"
              >
                ← {locale === 'ar' ? 'العودة للمتجر' : 'Back to Store'}
              </Link>
              <Link
                href="/"
                className="py-3.5 bg-primary text-white hover:bg-primary/90 rounded-2xl font-bold text-center text-xs transition-all shadow"
              >
                {locale === 'ar' ? 'الصفحة الرئيسية' : 'Homepage'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Checkout Form ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-accent/80 py-10 px-6 text-center text-white">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1 border border-white/20 text-xs font-semibold">
            <span>🛡️</span>
            <span>{t('secureOrder')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">{t('title')}</h1>
          <p className="text-white/80 text-xs sm:text-sm">{t('subtitle')}</p>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            {tNav('home')}
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-primary transition-colors">
            {tNav('cart')}
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">{t('title')}</span>
        </nav>
      </div>

      {/* Currency Switcher Bar */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">💱</span>
            <div>
              <p className="text-xs font-bold text-foreground">{t('paymentCurrency')}</p>
              <p className="text-[11px] text-muted-foreground">{t('currencyRateNotice')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(['YER', 'SAR', 'USD'] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setSelectedCurrency(curr)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  selectedCurrency === curr
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {curr === 'YER'
                  ? locale === 'ar'
                    ? 'الريال اليمني (YER)'
                    : 'YER (Yemeni Rial)'
                  : curr === 'SAR'
                  ? locale === 'ar'
                    ? 'الريال السعودي (SAR)'
                    : 'SAR (Saudi Rial)'
                  : locale === 'ar'
                  ? 'الدولار (USD)'
                  : 'USD ($)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-2">
        <div className="flex items-center gap-2">
          {[
            { step: 0, title: t('stepInfo'), icon: '👤' },
            { step: 1, title: t('stepShipping'), icon: '🚚' },
            { step: 2, title: t('stepPayment'), icon: '💳' },
          ].map(({ step, title, icon }) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => step < currentStep && setCurrentStep(step as any)}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all flex-shrink-0 ${
                  step < currentStep
                    ? 'bg-green-600 text-white cursor-pointer'
                    : step === currentStep
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-border text-muted-foreground cursor-not-allowed'
                }`}
              >
                {step < currentStep ? '✓' : step + 1}
              </button>
              <span
                className={`text-xs font-bold hidden sm:inline ${
                  step === currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {icon} {title}
              </span>
              {step < 2 && (
                <div
                  className={`flex-1 h-0.5 rounded-full mx-1 ${
                    step < currentStep ? 'bg-green-600' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Form + Summary */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Step Forms */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── STEP 0: Recipient Information ── */}
            {currentStep === 0 && (
              <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-foreground">{t('stepInfo')}</h2>
                    <p className="text-xs text-muted-foreground">
                      {locale === 'ar'
                        ? 'يرجى إدخال اسم ورقم المستلم لتأكيد التوصيل'
                        : 'Enter recipient name and phone to confirm delivery'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    {t('fullName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder={t('fullNamePlaceholder')}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    {t('phone')} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="px-3.5 py-3 bg-background border border-border rounded-xl text-xs font-mono font-bold text-muted-foreground flex items-center gap-1">
                      <span>{currentCountry.flag}</span>
                      <span dir="ltr">{currentCountry.dialCode}</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      required
                      dir="ltr"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={t('phonePlaceholder')}
                      className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={!canProceedStep(0)}
                    onClick={() => setCurrentStep(1)}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  >
                    {locale === 'ar' ? 'التالي: خيارات الشحن والموقع ←' : 'Next: Shipping Options & Location →'}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 1: Shipping & Location (Multiple Choices) ── */}
            {currentStep === 1 && (
              <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-xl">
                    📍
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-foreground">{t('stepShipping')}</h2>
                    <p className="text-xs text-muted-foreground">
                      {locale === 'ar'
                        ? 'اختاري المحافظة وشركة أو طريقة الشحن التي تناسبك'
                        : 'Select governorate and your preferred shipping company or method'}
                    </p>
                  </div>
                </div>

                {/* Country & Governorate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      {t('country')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="countryCode"
                      value={form.countryCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {locale === 'ar' ? c.nameAr : c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      {t('governorate')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="regionId"
                      value={form.regionId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-semibold"
                    >
                      {currentCountry.regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {locale === 'ar' ? r.nameAr : r.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* City & Address */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    {t('city')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder={t('cityPlaceholder')}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    {t('address')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    rows={2}
                    required
                    value={form.address}
                    onChange={handleChange}
                    placeholder={t('addressPlaceholder')}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>

                {/* Shipping Method Selector (Multiple Choices) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-foreground">
                      {t('shippingMethod')} <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      ({availableShippingMethods.length} {locale === 'ar' ? 'خيارات متاحة لمنطقتك' : 'options available'})
                    </span>
                  </div>

                  <div className="space-y-3">
                    {availableShippingMethods.map((method) => {
                      const isSelected = form.shippingMethodId === method.id;
                      const fee =
                        isFreeShipping && isSelected
                          ? 0
                          : selectedCurrency === 'YER'
                          ? method.costYER
                          : selectedCurrency === 'SAR'
                          ? method.costSAR
                          : method.costUSD;

                      return (
                        <label
                          key={method.id}
                          className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/40 bg-background'
                          }`}
                        >
                          <input
                            type="radio"
                            name="shippingMethodId"
                            value={method.id}
                            checked={isSelected}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <span className="text-2xl mt-0.5">{method.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-sm text-foreground">
                                  {locale === 'ar' ? method.nameAr : method.nameEn}
                                </p>
                                {method.tag && (
                                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                                    {method.tag}
                                  </span>
                                )}
                              </div>
                              <span className="font-black text-sm text-primary flex-shrink-0">
                                {fee === 0 ? (
                                  <span className="text-green-600 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full text-xs">
                                    {t('deliveryFree')} 🚚
                                  </span>
                                ) : (
                                  formatAmount(fee)
                                )}
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground mt-1">
                              ⏱️ {locale === 'ar' ? method.timeAr : method.timeEn}
                            </p>

                            {method.noteAr && (
                              <p className="text-[11px] text-muted-foreground/80 mt-1 leading-relaxed">
                                ℹ️ {locale === 'ar' ? method.noteAr : method.noteEn}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Custom Shipping Office or Delivery Window */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    {t('customShippingNote')}
                  </label>
                  <input
                    type="text"
                    name="customShippingPreference"
                    value={form.customShippingPreference}
                    onChange={handleChange}
                    placeholder={t('customShippingPlaceholder')}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    {t('notes')}
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder={t('notesPlaceholder')}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Step Navigation */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(0)}
                    className="flex-1 py-3.5 bg-background border border-border text-foreground rounded-2xl font-bold text-sm hover:bg-primary/5 transition-all"
                  >
                    {locale === 'ar' ? '← رجوع' : '← Back'}
                  </button>
                  <button
                    type="button"
                    disabled={!canProceedStep(1)}
                    onClick={() => setCurrentStep(2)}
                    className="flex-[2] py-3.5 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  >
                    {locale === 'ar' ? 'التالي: طريقة الدفع والمحافظ ←' : 'Next: Payment & Wallets →'}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Payment Method & Yemeni Wallets & Receipt Attachment ── */}
            {currentStep === 2 && (
              <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-xl">
                    💳
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-foreground">{t('stepPayment')}</h2>
                    <p className="text-xs text-muted-foreground">
                      {locale === 'ar'
                        ? 'اختاري وسيلة الدفع أو المحفظة الإلكترونية، وأرفقي صورة الإيصال للتحقق الفوري'
                        : 'Select payment method or local digital wallet and attach receipt screenshot'}
                    </p>
                  </div>
                </div>

                {/* Payment Method Radio */}
                <div className="space-y-3">
                  <label
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      form.paymentMethod === 'cash_on_delivery'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40 bg-background'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={form.paymentMethod === 'cash_on_delivery'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-2xl mt-0.5">💵</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-foreground">{t('payWhatsapp')}</p>
                      <p className="text-xs text-muted-foreground">{t('payWhatsappDesc')}</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      form.paymentMethod === 'bank_transfer'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40 bg-background'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={form.paymentMethod === 'bank_transfer'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-2xl mt-0.5">🏦</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-foreground">{t('payTransfer')}</p>
                      <p className="text-xs text-muted-foreground">{t('payTransferDesc')}</p>
                    </div>
                  </label>
                </div>

                {/* Yemeni Wallets & Pre-submission Receipt Attachment */}
                {form.paymentMethod === 'bank_transfer' && (
                  <div className="p-5 bg-background rounded-2xl border border-primary/20 space-y-5">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">
                      {t('selectWallet')}
                    </p>

                    {/* Wallets Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {YEMENI_WALLETS.map((wallet) => {
                        const isSelected = form.selectedWalletId === wallet.id;
                        return (
                          <button
                            key={wallet.id}
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({ ...prev, selectedWalletId: wallet.id }))
                            }
                            className={`p-3.5 rounded-xl border text-start transition-all flex items-start gap-3 ${
                              isSelected
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border bg-card hover:border-primary/40'
                            }`}
                          >
                            <span className="text-2xl">{wallet.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <strong className="text-xs text-foreground truncate">
                                  {locale === 'ar' ? wallet.nameAr : wallet.nameEn}
                                </strong>
                                <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-bold">
                                  {wallet.badge}
                                </span>
                              </div>
                              <span className="text-xs font-mono text-muted-foreground block mt-1" dir="ltr">
                                {wallet.accountNumber}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Wallet Details Card */}
                    <div className="p-4 bg-card rounded-xl border border-border space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs text-muted-foreground block">{t('accountNumber')}</span>
                          <strong className="text-base font-mono text-primary font-black" dir="ltr">
                            {selectedWallet.accountNumber}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyAccountNumber(selectedWallet.accountNumber)}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all"
                        >
                          {copiedAccount ? t('copiedAccount') : t('copyAccount')}
                        </button>
                      </div>

                      <div className="border-t border-border/80 pt-2 text-xs">
                        <span className="text-muted-foreground">{t('beneficiary')}: </span>
                        <span className="font-bold text-foreground">{selectedWallet.beneficiary}</span>
                      </div>

                      <p className="text-[11px] text-muted-foreground bg-background p-2.5 rounded-lg leading-relaxed">
                        ℹ️ {locale === 'ar' ? selectedWallet.instructionsAr : selectedWallet.instructionsEn}
                      </p>
                    </div>

                    {/* ── PRE-SUBMISSION RECEIPT ATTACHMENT SECTION ── */}
                    <div className="p-4 sm:p-5 bg-card rounded-2xl border-2 border-primary/30 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📸</span>
                          <div>
                            <h4 className="font-black text-sm text-foreground">{t('receiptAttachTitle')}</h4>
                            <p className="text-[11px] text-muted-foreground">{t('receiptAttachDesc')}</p>
                          </div>
                        </div>
                        {receiptFile && (
                          <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950/40 px-2.5 py-1 rounded-full">
                            {t('receiptAttachedBadge')}
                          </span>
                        )}
                      </div>

                      {/* Dropzone / Upload Area */}
                      {!receiptFile ? (
                        <div className="border border-dashed border-primary/40 rounded-xl p-5 text-center bg-background hover:bg-primary/5 transition-colors">
                          <input
                            type="file"
                            id="checkoutReceiptInput"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setReceiptFile(file);
                            }}
                            className="hidden"
                          />
                          <label htmlFor="checkoutReceiptInput" className="cursor-pointer block space-y-2">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl mx-auto">
                              📤
                            </div>
                            <p className="text-xs font-bold text-primary">{t('clickToUpload')}</p>
                            <p className="text-[10px] text-muted-foreground">{t('receiptFileFormats')}</p>
                          </label>
                        </div>
                      ) : (
                        /* Attached Receipt Preview Card */
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-background rounded-xl border border-border">
                          {receiptPreviewUrl && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden relative border border-border flex-shrink-0">
                              <Image
                                src={receiptPreviewUrl}
                                alt="Receipt Preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 text-center sm:text-start">
                            <strong className="text-xs text-foreground block truncate">{receiptFile.name}</strong>
                            <span className="text-[11px] text-muted-foreground block mt-0.5">
                              {(receiptFile.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                            <span className="text-[11px] text-green-600 font-bold block mt-1">
                              ✓ {t('receiptAttachedBadge')}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="file"
                              id="changeReceiptInput"
                              accept="image/jpeg,image/png,image/webp,image/jpg"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setReceiptFile(file);
                              }}
                              className="hidden"
                            />
                            <label
                              htmlFor="changeReceiptInput"
                              className="cursor-pointer px-3 py-1.5 bg-card border border-border text-foreground text-xs font-bold rounded-lg hover:border-primary transition-all"
                            >
                              {t('changeReceipt')}
                            </label>
                            <button
                              type="button"
                              onClick={() => setReceiptFile(null)}
                              className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-all"
                            >
                              {t('removeReceipt')}
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                        💡 {t('receiptRequiredNotice')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Final Review Card */}
                <div className="bg-background rounded-2xl p-4 border border-border space-y-2 text-xs">
                  <p className="font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    {locale === 'ar' ? 'مراجعة بيانات الاستلام قبل الإرسال' : 'Review Delivery Summary'}
                  </p>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">{t('fullName')}:</span>
                    <strong className="text-foreground">{form.fullName}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">{t('phone')}:</span>
                    <strong className="text-foreground font-mono" dir="ltr">
                      {currentCountry.dialCode} {form.phone}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">{t('governorate')}:</span>
                    <strong className="text-foreground">
                      {currentCountry.nameAr} — {currentRegion.nameAr}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">{t('shippingMethod')}:</span>
                    <strong className="text-primary">{selectedShipping.nameAr}</strong>
                  </div>
                  {form.paymentMethod === 'bank_transfer' && (
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">صورة الإيصال:</span>
                      <strong className={receiptFile ? 'text-green-600 font-bold' : 'text-amber-600'}>
                        {receiptFile ? `تم إرفاق (${receiptFile.name}) ✓` : 'لم يتم إرفاق إيصال بعد (يمكن إرساله عبر واتساب)'}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {submitError && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Step Navigation - Dual Track Buttons */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="sm:w-28 py-4 bg-background border border-border text-foreground rounded-2xl font-bold text-sm hover:bg-primary/5 transition-all text-center"
                    >
                      {locale === 'ar' ? '← رجوع' : '← Back'}
                    </button>

                    {/* Track 1: Web Store Checkout (خصم الكميات وتأكيد السحابة) */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleExecuteOrder('web')}
                      className="flex-1 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-primary/25 hover:scale-[1.01] disabled:opacity-60"
                    >
                      {isSubmitting && submittingChannel === 'web' ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{locale === 'ar' ? 'جاري تأكيد الشراء...' : 'Processing...'}</span>
                        </>
                      ) : (
                        <>
                          <span>🛍️</span>
                          <span>{locale === 'ar' ? 'تأكيد وإتمام الشراء عبر الموقع' : 'Complete Purchase on Store'}</span>
                        </>
                      )}
                    </button>

                    {/* Track 2: WhatsApp Inquiry Track (لا يتم خصم الكميات) */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleExecuteOrder('whatsapp')}
                      className="flex-1 py-4 bg-[#25D366] hover:bg-[#20b858] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.01] disabled:opacity-60"
                    >
                      {isSubmitting && submittingChannel === 'whatsapp' ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{locale === 'ar' ? 'جاري التحويل للواتساب...' : 'Redirecting...'}</span>
                        </>
                      ) : (
                        <>
                          <span>💬</span>
                          <span>{locale === 'ar' ? 'تأكيد واستكمال الشراء عبر الواتساب' : 'Confirm via WhatsApp'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Micro-notes for customer transparency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
                    <div className="flex items-start gap-1.5 bg-primary/5 p-2.5 rounded-xl border border-primary/10">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{locale === 'ar' ? 'مسار الموقع: يحجز الطلب في السحابة ويخصم الكميات من المتجر فوراً.' : 'Store Track: Records order and deducts stock automatically.'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 bg-green-500/5 p-2.5 rounded-xl border border-green-500/10">
                      <span className="text-green-600 mt-0.5">💬</span>
                      <span>{locale === 'ar' ? 'مسار الواتساب: بدون خصم للكميات؛ ستكملين التفاصيل والدفع مع خدمة العملاء.' : 'WhatsApp Track: No stock deduction; finalize details directly with support.'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ── Order Summary Sidebar ── */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-4">
            <h3 className="text-base font-black text-foreground pb-3 border-b border-border flex items-center justify-between">
              <span>{t('orderSummary')}</span>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full">
                {cart.length} {locale === 'ar' ? 'منتجات' : 'items'}
              </span>
            </h3>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => {
                const itemPrice =
                  selectedCurrency === 'YER'
                    ? item.product.prices.YER
                    : selectedCurrency === 'SAR'
                    ? item.product.prices.SAR
                    : item.product.prices.USD;

                return (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 overflow-hidden flex-shrink-0 relative border border-border/80">
                      <Image
                        src={item.product.image}
                        alt={getProductTitle(item.product, locale)}
                        fill
                        className="object-contain p-1"
                      />
                      <span className="absolute -top-1 -end-1 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {getProductTitle(item.product, locale).split('|')[0].trim()}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {getProductVolume(item.product, locale)}
                      </p>
                    </div>
                    <span className="text-xs font-black text-primary flex-shrink-0">
                      {formatAmount(itemPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-border">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={form.couponCode}
                  onChange={(e) => setForm({ ...form, couponCode: e.target.value })}
                  placeholder={t('couponPlaceholder')}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs uppercase text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                >
                  {t('applyCoupon')}
                </button>
              </form>
              {appliedDiscount && (
                <p className="text-[11px] text-green-600 font-bold mt-1.5 flex items-center gap-1">
                  <span>✓</span> {t('couponApplied')} (-{appliedDiscount.percent}%)
                </p>
              )}
              {couponError && (
                <p className="text-[11px] text-red-600 font-bold mt-1.5">{couponError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-border pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>{t('subtotal')}</span>
                <span className="font-bold text-foreground">{formatAmount(subtotalCurrent)}</span>
              </div>

              {appliedDiscount && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>
                    {t('discount')} ({appliedDiscount.code})
                  </span>
                  <span>-{formatAmount(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground items-center">
                <span>{t('delivery')}</span>
                {isFreeShipping ? (
                  <span className="text-green-600 font-bold bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full text-[11px]">
                    {t('deliveryFree')} 🚚
                  </span>
                ) : (
                  <span className="font-bold text-foreground">{formatAmount(shippingCost)}</span>
                )}
              </div>
            </div>

            {/* Final Total */}
            <div className="pt-4 border-t border-border flex justify-between items-center">
              <span className="font-black text-sm text-foreground">{t('total')}</span>
              <span className="text-xl font-black text-primary">{formatAmount(grandTotal)}</span>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="bg-card rounded-2xl p-4 border border-border/80 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <span>🔒</span>
              <span>{t('secureOrder')}</span>
            </div>
            <p className="text-[11px] leading-relaxed">{t('guarantee')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
