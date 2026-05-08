export type RestaurantCategory = "الكل" | "شاورما" | "برجر" | "مشاوي" | "حلويات" | "فطور";

export interface RestaurantMenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: string;
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  category: Exclude<RestaurantCategory, "الكل">;
  description: string;
  rating: string;
  deliveryTime: string;
  deliveryFee: string;
  image: string;
  isOpen: boolean;
  menuItems: RestaurantMenuItem[];
}

export const restaurantCategories: RestaurantCategory[] = ["الكل", "شاورما", "برجر", "مشاوي", "حلويات", "فطور"];

export const mockRestaurants: Restaurant[] = [
  {
    id: "shawarma-alreem",
    slug: "shawarma-alreem",
    name: "شاورما الريم",
    category: "شاورما",
    description: "شاورما دجاج ولحم مع صوصات خاصة وخبز طازج يوميًا.",
    rating: "4.8",
    deliveryTime: "20 - 30 دقيقة",
    deliveryFee: "5 شيكل",
    image: "🥙",
    isOpen: true,
    menuItems: [
      { id: "reem-1", category: "سندويشات", name: "وجبة شاورما دجاج", description: "بطاطا ومخلل وثومية", price: "22 شيكل" },
      { id: "reem-2", category: "سندويشات", name: "ساندويش شاورما عربي", description: "مقطع مع الثومية والبطاطا", price: "18 شيكل" },
      { id: "reem-3", category: "أطباق", name: "صحن شاورما", description: "شاورما مع خبز وصوص وسلطة", price: "29 شيكل" },
    ],
  },
  {
    id: "shawarma-albalad",
    slug: "shawarma-albalad",
    name: "شاورما البلد",
    category: "شاورما",
    description: "نكهة شامية مع تتبيلة تقليدية وخيارات عائلية.",
    rating: "4.6",
    deliveryTime: "25 - 35 دقيقة",
    deliveryFee: "4 شيكل",
    image: "🌯",
    isOpen: true,
    menuItems: [
      { id: "balad-1", category: "سندويشات", name: "وجبة شاورما لحم", description: "لحم متبل وخبز صاج", price: "25 شيكل" },
      { id: "balad-2", category: "سندويشات", name: "شاورما سوبر", description: "إضافة جبنة ومخللات", price: "21 شيكل" },
      { id: "balad-3", category: "أطباق", name: "صحن عربي دجاج", description: "شاورما مع بطاطا وصوص", price: "31 شيكل" },
    ],
  },
  {
    id: "shawarma-altazej",
    slug: "shawarma-altazej",
    name: "شاورما الطازج",
    category: "شاورما",
    description: "تحضير سريع ومكونات يومية طازجة مع عروض للطلاب.",
    rating: "4.5",
    deliveryTime: "15 - 25 دقيقة",
    deliveryFee: "3 شيكل",
    image: "🥪",
    isOpen: false,
    menuItems: [
      { id: "tazej-1", category: "سندويشات", name: "سندويش شاورما دجاج", description: "خبز عربي وخيار وثومية", price: "16 شيكل" },
      { id: "tazej-2", category: "وجبات", name: "بوكس شاورما", description: "شاورما مع بطاطا ومشروب", price: "24 شيكل" },
      { id: "tazej-3", category: "أطباق", name: "صحن دبل شاورما", description: "كمية أكبر مع خبز محمص", price: "34 شيكل" },
    ],
  },
  {
    id: "burger-town",
    slug: "burger-town",
    name: "برجر تاون",
    category: "برجر",
    description: "برجر مشوي وصوصات خاصة وخيارات بطاطا مميزة.",
    rating: "4.7",
    deliveryTime: "20 - 30 دقيقة",
    deliveryFee: "6 شيكل",
    image: "🍔",
    isOpen: true,
    menuItems: [
      { id: "town-1", category: "برجر", name: "كلاسيك برجر", description: "لحم بقري وخس وجبنة", price: "24 شيكل" },
      { id: "town-2", category: "برجر", name: "تشيز برجر", description: "شريحتا جبن وصوص خاص", price: "27 شيكل" },
      { id: "town-3", category: "برجر", name: "كرسبي تشيكن برجر", description: "دجاج مقرمش مع صوص رانش", price: "26 شيكل" },
    ],
  },
  {
    id: "burger-house",
    slug: "burger-house",
    name: "برجر هاوس",
    category: "برجر",
    description: "مطعم برجر شبابي مع إضافات عديدة وحجمين للوجبات.",
    rating: "4.4",
    deliveryTime: "25 - 35 دقيقة",
    deliveryFee: "5 شيكل",
    image: "🍟",
    isOpen: true,
    menuItems: [
      { id: "house-1", category: "برجر", name: "هاوس برجر", description: "لحم مدخن وبصل مكرمل", price: "29 شيكل" },
      { id: "house-2", category: "برجر", name: "مشروم برجر", description: "صوص فطر وجبنة سويسرية", price: "28 شيكل" },
      { id: "house-3", category: "مقبلات", name: "بطاطا ويدجز", description: "مع صوص جبنة", price: "12 شيكل" },
    ],
  },
  {
    id: "crunchy-burger",
    slug: "crunchy-burger",
    name: "كرانشي برجر",
    category: "برجر",
    description: "وجبات دجاج مقرمش وبرجر لحم بطبقات مميزة.",
    rating: "4.9",
    deliveryTime: "18 - 28 دقيقة",
    deliveryFee: "7 شيكل",
    image: "🍗",
    isOpen: false,
    menuItems: [
      { id: "crunchy-1", category: "برجر", name: "سبايسي كرانشي", description: "دجاج مقرمش حار", price: "25 شيكل" },
      { id: "crunchy-2", category: "برجر", name: "تشيز كرانشي", description: "دجاج مقرمش وجبنة أمريكية", price: "26 شيكل" },
      { id: "crunchy-3", category: "وجبات", name: "بوكس برجر", description: "برجر مع بطاطا ومشروب", price: "33 شيكل" },
    ],
  },
  {
    id: "mashawi-alkaram",
    slug: "mashawi-alkaram",
    name: "مشاوي الكرم",
    category: "مشاوي",
    description: "مشاوي فحم طازجة وأطباق عائلية وسلطات شرقية.",
    rating: "4.8",
    deliveryTime: "30 - 40 دقيقة",
    deliveryFee: "8 شيكل",
    image: "🍢",
    isOpen: true,
    menuItems: [
      { id: "karam-1", category: "مشاوي", name: "كباب مشوي", description: "لحم مشوي مع أرز وسلطة", price: "34 شيكل" },
      { id: "karam-2", category: "مشاوي", name: "شيش طاووق", description: "دجاج متبل ومشوي على الفحم", price: "31 شيكل" },
      { id: "karam-3", category: "مشاوي", name: "مشكل مشاوي", description: "تشكيلة كباب وكفتة وشيش", price: "49 شيكل" },
    ],
  },
  {
    id: "mashawi-alsham",
    slug: "mashawi-alsham",
    name: "مشاوي الشام",
    category: "مشاوي",
    description: "نكهات شامية أصلية مع خبز طابون طازج.",
    rating: "4.7",
    deliveryTime: "28 - 38 دقيقة",
    deliveryFee: "6 شيكل",
    image: "🥩",
    isOpen: true,
    menuItems: [
      { id: "sham-1", category: "مشاوي", name: "كفتة بالصينية", description: "كفتة مع بطاطا وطماطم", price: "32 شيكل" },
      { id: "sham-2", category: "مشاوي", name: "شيش لحم", description: "أسياخ لحم مع صوص دبس الرمان", price: "38 شيكل" },
      { id: "sham-3", category: "مقبلات", name: "حمص وصنوبر", description: "طبق حمص دافئ", price: "13 شيكل" },
    ],
  },
  {
    id: "matam-alsaha",
    slug: "matam-alsaha",
    name: "مطعم الساحة",
    category: "مشاوي",
    description: "مطعم عائلي يقدم مشاوي وأطباق عربية متنوعة.",
    rating: "4.6",
    deliveryTime: "25 - 35 دقيقة",
    deliveryFee: "5 شيكل",
    image: "🍽️",
    isOpen: false,
    menuItems: [
      { id: "saha-1", category: "مشاوي", name: "أوصال لحم", description: "مع أرز وخضار مشوية", price: "41 شيكل" },
      { id: "saha-2", category: "مشاوي", name: "نصف دجاج على الفحم", description: "مع بطاطا وثوم", price: "36 شيكل" },
      { id: "saha-3", category: "سلطات", name: "تبولة", description: "سلطة طازجة مع ليمون", price: "10 شيكل" },
    ],
  },
  {
    id: "halawiyat-zaman",
    slug: "halawiyat-zaman",
    name: "حلويات زمان",
    category: "حلويات",
    description: "حلويات شرقية يومية وكنافة طازجة وقهوة عربية.",
    rating: "4.9",
    deliveryTime: "20 - 30 دقيقة",
    deliveryFee: "4 شيكل",
    image: "🧁",
    isOpen: true,
    menuItems: [
      { id: "zaman-1", category: "حلويات", name: "كنافة نابلسية", description: "جبنة نابلسية وقطر خفيف", price: "18 شيكل" },
      { id: "zaman-2", category: "حلويات", name: "قطايف", description: "قشطة أو جوز حسب الطلب", price: "15 شيكل" },
      { id: "zaman-3", category: "حلويات", name: "بسبوسة", description: "قطعة سميد مع جوز الهند", price: "9 شيكل" },
    ],
  },
  {
    id: "kunafa-albalad",
    slug: "kunafa-albalad",
    name: "كنافة البلد",
    category: "حلويات",
    description: "متخصص بالكنافة النابلسية والحلويات الساخنة.",
    rating: "4.8",
    deliveryTime: "15 - 20 دقيقة",
    deliveryFee: "3 شيكل",
    image: "🍮",
    isOpen: true,
    menuItems: [
      { id: "kunafa-1", category: "حلويات", name: "كنافة ناعمة", description: "صحن فردي ساخن", price: "16 شيكل" },
      { id: "kunafa-2", category: "حلويات", name: "كنافة خشنة", description: "مع جبنة إضافية", price: "19 شيكل" },
      { id: "kunafa-3", category: "مشروبات", name: "قهوة عربية", description: "فنجان مع هيل", price: "6 شيكل" },
    ],
  },
  {
    id: "sweet-house",
    slug: "sweet-house",
    name: "سويت هاوس",
    category: "حلويات",
    description: "حلويات غربية وشرقية وصناديق هدايا جاهزة.",
    rating: "4.5",
    deliveryTime: "25 - 35 دقيقة",
    deliveryFee: "5 شيكل",
    image: "🍰",
    isOpen: false,
    menuItems: [
      { id: "sweet-1", category: "حلويات", name: "تشيز كيك", description: "قطع فردية بنكهات متعددة", price: "14 شيكل" },
      { id: "sweet-2", category: "حلويات", name: "بسبوسة بالقشطة", description: "صينية مقطعة", price: "12 شيكل" },
      { id: "sweet-3", category: "حلويات", name: "صندوق ميني سويت", description: "تشكيلة 6 قطع", price: "28 شيكل" },
    ],
  },
  {
    id: "beit-alfutoor",
    slug: "beit-alfotoor",
    name: "بيت الفطور",
    category: "فطور",
    description: "فطور عربي صباحي مع مناقيش وفلافل طازجة.",
    rating: "4.7",
    deliveryTime: "15 - 25 دقيقة",
    deliveryFee: "4 شيكل",
    image: "🍳",
    isOpen: true,
    menuItems: [
      { id: "futoor-1", category: "فطور", name: "حمص وفلافل", description: "صحن حمص و10 حبات فلافل", price: "14 شيكل" },
      { id: "futoor-2", category: "مناقيش", name: "مناقيش زعتر", description: "خبز طازج وزعتر بلدي", price: "8 شيكل" },
      { id: "futoor-3", category: "فطور", name: "فول بالزيت", description: "طبق فول مع خضار", price: "11 شيكل" },
    ],
  },
  {
    id: "futoor-alsabah",
    slug: "futoor-alsabah",
    name: "فطور الصباح",
    category: "فطور",
    description: "ساندويشات صباحية وبيض ومخبوزات خفيفة.",
    rating: "4.4",
    deliveryTime: "18 - 28 دقيقة",
    deliveryFee: "3 شيكل",
    image: "🥚",
    isOpen: true,
    menuItems: [
      { id: "sabah-1", category: "فطور", name: "بيض مقلي", description: "مع خبز وخضار", price: "10 شيكل" },
      { id: "sabah-2", category: "فطور", name: "ساندويش لبنة وزعتر", description: "خبز طابون طازج", price: "9 شيكل" },
      { id: "sabah-3", category: "مشروبات", name: "شاي نعناع", description: "كوب كبير", price: "4 شيكل" },
    ],
  },
  {
    id: "manaeesh-zaman",
    slug: "manaeesh-zaman",
    name: "مناقيش زمان",
    category: "فطور",
    description: "مخبوزات فرن طازجة مع خيارات جبنة وزعتر ومحمرات.",
    rating: "4.8",
    deliveryTime: "20 - 30 دقيقة",
    deliveryFee: "4 شيكل",
    image: "🫓",
    isOpen: false,
    menuItems: [
      { id: "manaeesh-1", category: "مناقيش", name: "منقوشة جبنة", description: "جبنة بيضاء وخليط أجبان", price: "10 شيكل" },
      { id: "manaeesh-2", category: "مناقيش", name: "منقوشة زعتر", description: "زعتر بلدي وزيت زيتون", price: "7 شيكل" },
      { id: "manaeesh-3", category: "فطور", name: "محمرة وجبنة", description: "نكهة حارة خفيفة", price: "11 شيكل" },
    ],
  },
];

export function getRestaurantById(id: string) {
  return mockRestaurants.find((restaurant) => restaurant.id === id) ?? null;
}

export function getRestaurantBySlug(slug: string) {
  return mockRestaurants.find((restaurant) => restaurant.slug === slug || restaurant.id === slug) ?? null;
}
