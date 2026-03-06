export type FeatureKey = "skipTheLine" | "freeCancellation" | "localTasting" | "pickupIncluded" | "guidedTour";

export type ActivityItem = {
  id: string;
  slug: string;
  title: string;
  titleEn?: string;
  image: string;
  imageAlt: string;
  rating: number;
  reviewCount: number;
  duration: string;
  durationEn?: string;
  priceFrom: number;
  priceOriginal?: number;
  category: string;
  categoryKey: string;
  badge?: string;
  badgeKey?: "likelyToSellOut" | "popular";
  badgeRed?: boolean;
  features: string[];
  featureKeys?: FeatureKey[];
  banner?: string;
};

/** ตัวกรอง: สถานที่เที่ยว และร้านอาหาร ไว้ก่อน ตามที่ขอ */
export const FILTER_CATEGORIES = [
  { key: "all", label: "ทั้งหมด" },
  { key: "attraction", label: "สถานที่เที่ยว" },
  { key: "food", label: "ร้านอาหาร" },
  { key: "food-drink", label: "อาหาร & เครื่องดื่ม" },
  { key: "culture", label: "วัฒนธรรม & ประวัติศาสตร์" },
  { key: "cooking", label: "เรียนทำอาหาร" },
  { key: "day-trip", label: "เดย์ทริป" },
  { key: "guided-tour", label: "ทัวร์พร้อมไกด์" },
  { key: "water", label: "กิจกรรมทางน้ำ" },
] as const;

export const DESTINATION_NAMES: Record<string, string> = {
  bangkok: "กรุงเทพ",
  "chiang-mai": "เชียงใหม่",
  pattaya: "พัทยา",
  krabi: "กระบี่",
  phuket: "ภูเก็ต",
  "samut-songkhram": "สมุทรสงคราม",
};

const activities: ActivityItem[] = [
  {
    id: "1",
    slug: "bangkok",
    title: "วัดพระศรีรัตนศาสดาราม และวัดสำคัญในกรุงเทพ",
    titleEn: "Grand Palace & Temple of Emerald Buddha Tour",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80",
    imageAlt: "วัดพระแก้ว",
    rating: 4.9,
    reviewCount: 2341,
    duration: "4 ชั่วโมง",
    durationEn: "4 hours",
    priceFrom: 1290,
    category: "ทัวร์พร้อมไกด์",
    categoryKey: "guided-tour",
    badge: "มีแนวโน้มขายหมด",
    badgeKey: "likelyToSellOut",
    badgeRed: true,
    features: ["ไม่ต้องต่อแถว"],
    featureKeys: ["skipTheLine"],
  },
  {
    id: "2",
    slug: "bangkok",
    title: "ตลาดน้ำอัมพวา และเรือชมวิว",
    titleEn: "Amphawa Floating Market & Boat Tour",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
    imageAlt: "ตลาดน้ำ",
    rating: 4.7,
    reviewCount: 892,
    duration: "6 ชั่วโมง",
    durationEn: "6 hours",
    priceFrom: 1590,
    category: "เดย์ทริป",
    categoryKey: "day-trip",
    features: ["ฟรียกเลิก"],
    featureKeys: ["freeCancellation"],
  },
  {
    id: "3",
    slug: "bangkok",
    title: "ทัวร์ร้านอาหารและของหวานย่านเยาวราช",
    titleEn: "Yaowarat Food & Dessert Tour",
    image: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=600&q=80",
    imageAlt: "อาหารเยาวราช",
    rating: 4.8,
    reviewCount: 445,
    duration: "3 ชั่วโมง",
    durationEn: "3 hours",
    priceFrom: 990,
    category: "อาหาร & เครื่องดื่ม",
    categoryKey: "food-drink",
    features: ["ชิมของท้องถิ่น"],
    featureKeys: ["localTasting"],
  },
  {
    id: "4",
    slug: "bangkok",
    title: "วัดโพธิ์ และวัดพระแก้ว เดย์ทริป",
    titleEn: "Wat Pho & Grand Palace Day Trip",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80",
    imageAlt: "วัดโพธิ์",
    rating: 4.9,
    reviewCount: 1523,
    duration: "5 ชั่วโมง",
    durationEn: "5 hours",
    priceFrom: 1390,
    category: "สถานที่เที่ยว",
    categoryKey: "attraction",
    badge: "ยอดนิยม",
    badgeKey: "popular",
    features: ["ไม่ต้องต่อแถว"],
    featureKeys: ["skipTheLine"],
  },
  {
    id: "5",
    slug: "bangkok",
    title: "คลาสทำอาหารไทย วัดวัตถุและตลาด",
    titleEn: "Thai Cooking Class with Market Visit",
    image: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=600&q=80",
    imageAlt: "คลาสทำอาหาร",
    rating: 4.9,
    reviewCount: 678,
    duration: "4 ชั่วโมง",
    durationEn: "4 hours",
    priceFrom: 1490,
    category: "เรียนทำอาหาร",
    categoryKey: "cooking",
    features: ["ฟรียกเลิก"],
    featureKeys: ["freeCancellation"],
  },
  {
    id: "6",
    slug: "bangkok",
    title: "พระราชวังและวัดสำคัญ กรุงเทพ",
    titleEn: "Grand Palace & Temples of Bangkok",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80",
    imageAlt: "พระราชวัง",
    rating: 4.8,
    reviewCount: 2103,
    duration: "4 ชั่วโมง",
    durationEn: "4 hours",
    priceFrom: 1290,
    priceOriginal: 1590,
    category: "วัฒนธรรม & ประวัติศาสตร์",
    categoryKey: "culture",
    banner: "ได้รับการรับรอง",
    features: ["ไม่ต้องต่อแถว"],
    featureKeys: ["skipTheLine"],
  },
  {
    id: "7",
    slug: "chiang-mai",
    title: "ดอยอินทนนท์ และหมู่บ้านกะเหรี่ยง",
    titleEn: "Doi Inthanon & Karen Village",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    imageAlt: "ดอยอินทนนท์",
    rating: 4.8,
    reviewCount: 1556,
    duration: "8 ชั่วโมง",
    durationEn: "8 hours",
    priceFrom: 1890,
    category: "เดย์ทริป",
    categoryKey: "day-trip",
    features: ["มีบริการไปรับ"],
    featureKeys: ["pickupIncluded"],
  },
  {
    id: "8",
    slug: "chiang-mai",
    title: "วัดและเมืองเก่าเชียงใหม่",
    titleEn: "Chiang Mai Temples & Old City",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80",
    imageAlt: "เชียงใหม่",
    rating: 4.7,
    reviewCount: 892,
    duration: "4 ชั่วโมง",
    durationEn: "4 hours",
    priceFrom: 1190,
    category: "สถานที่เที่ยว",
    categoryKey: "attraction",
    features: ["ทัวร์พร้อมไกด์"],
    featureKeys: ["guidedTour"],
  },
  {
    id: "9",
    slug: "krabi",
    title: "เกาะพีพี สปีดโบ๊ท และดำน้ำดูปะการัง",
    titleEn: "Phi Phi Islands Speedboat & Snorkeling",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80",
    imageAlt: "พีพี",
    rating: 4.6,
    reviewCount: 3102,
    duration: "7 ชั่วโมง",
    durationEn: "7 hours",
    priceFrom: 2190,
    category: "กิจกรรมทางน้ำ",
    categoryKey: "water",
    badge: "ยอดนิยม",
    badgeKey: "popular",
    features: ["ฟรียกเลิก"],
    featureKeys: ["freeCancellation"],
  },
  {
    id: "10",
    slug: "phuket",
    title: "ทัวร์เกาะพีพีจากภูเก็ต",
    titleEn: "Phi Phi Islands Tour from Phuket",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80",
    imageAlt: "พีพี",
    rating: 4.5,
    reviewCount: 1892,
    duration: "8 ชั่วโมง",
    durationEn: "8 hours",
    priceFrom: 2390,
    category: "กิจกรรมทางน้ำ",
    categoryKey: "water",
    features: ["ฟรียกเลิก", "มีบริการไปรับ"],
    featureKeys: ["freeCancellation", "pickupIncluded"],
  },
  {
    id: "11",
    slug: "samut-songkhram",
    title: "ตลาดน้ำอัมพวา และเรือชมวิว",
    titleEn: "Amphawa Floating Market & Boat Tour",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
    imageAlt: "ตลาดน้ำ",
    rating: 4.7,
    reviewCount: 892,
    duration: "6 ชั่วโมง",
    durationEn: "6 hours",
    priceFrom: 1590,
    category: "เดย์ทริป",
    categoryKey: "day-trip",
    features: ["ฟรียกเลิก"],
    featureKeys: ["freeCancellation"],
  },
  {
    id: "12",
    slug: "pattaya",
    title: "เกาะล้าน สปีดโบ๊ท และดำน้ำ",
    titleEn: "Koh Larn Speedboat & Snorkeling",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80",
    imageAlt: "เกาะล้าน",
    rating: 4.6,
    reviewCount: 2103,
    duration: "6 ชั่วโมง",
    durationEn: "6 hours",
    priceFrom: 1990,
    category: "กิจกรรมทางน้ำ",
    categoryKey: "water",
    features: ["ฟรียกเลิก"],
    featureKeys: ["freeCancellation"],
  },
];

export function getActivitiesByDestination(slug: string): ActivityItem[] {
  return activities.filter((a) => a.slug === slug);
}

/** ดึงกิจกรรมจากรายการ id (ใช้หน้า Wishlist) */
export function getActivitiesByIds(ids: string[]): ActivityItem[] {
  return ids
    .map((id) => activities.find((a) => a.id === id))
    .filter((a): a is ActivityItem => a != null);
}

export function getFilteredActivities(slug: string, categoryKey: string): ActivityItem[] {
  const byDest = getActivitiesByDestination(slug);
  if (categoryKey === "all") return byDest;
  if (categoryKey === "food") {
    return byDest.filter((a) => a.categoryKey === "food" || a.categoryKey === "food-drink");
  }
  return byDest.filter((a) => a.categoryKey === categoryKey);
}

/** ค้นหากิจกรรมทั้งหมดตามคำค้น (ใช้หน้า Search) */
export function searchActivities(query: string): ActivityItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return activities;

  return activities.filter((a) => {
    const title = a.title.toLowerCase();
    const titleEn = (a.titleEn || "").toLowerCase();
    const category = a.category.toLowerCase();
    const cityName = (DESTINATION_NAMES[a.slug] || a.slug).toLowerCase();
    const cityNameEn = (CITY_NAME_EN[a.slug] || "").toLowerCase();
    return (
      title.includes(q) ||
      titleEn.includes(q) ||
      category.includes(q) ||
      cityName.includes(q) ||
      cityNameEn.includes(q)
    );
  });
}

/** ขั้นตอนในกำหนดการเดินทาง */
export type ItineraryStep = {
  type: "start_pickup" | "travel" | "activity" | "rest" | "drop_off";
  title: string;
  detail?: string;
  duration?: string;
  isMainStop?: boolean;
};

/** สรุปรีวิวแยกตามหมวด */
export type ReviewSummary = {
  guide: number;
  transportation: number;
  valueForMoney: number;
};

/** รีวิวลูกค้า 1 รายการ */
export type ReviewItem = {
  id: string;
  authorName: string;
  authorCountry: string;
  date: string;
  verified: boolean;
  rating: number;
  text: string;
  photos?: string[];
  helpfulCount?: number;
};

const CITY_NAME_EN: Record<string, string> = {
  bangkok: "Bangkok",
  "chiang-mai": "Chiang Mai",
  pattaya: "Pattaya",
  krabi: "Krabi",
  phuket: "Phuket",
  "samut-songkhram": "Samut Songkhram",
};

export type ActivityDetail = ActivityItem & {
  description?: string;
  descriptionEn?: string;
  about?: { icon: string; title: string; text: string }[];
  included?: string[];
  notIncluded?: string[];
  notSuitableFor?: string[];
  meetingPoint?: string;
  importantInfo?: { title: string; items: string[] }[];
  highlights?: string[];
  options?: { title: string; duration: string; guideLang: string; meeting: string; price: number; pricePerGroup?: boolean }[];
  itinerary?: ItineraryStep[];
  reviewSummary?: ReviewSummary;
  reviews?: ReviewItem[];
};

const defaultAbout = [
  { icon: "cancel", title: "ยกเลิกฟรี", text: "ยกเลิกล่วงหน้าสูงสุด 24 ชั่วโมง เพื่อขอรับเงินคืนเต็มจำนวน" },
  { icon: "pay", title: "จองตอนนี้ & จ่ายทีหลัง", text: "ทำให้แผนการเดินทางของคุณยืดหยุ่น — จองที่แล้วไม่ต้องจ่ายอะไรเลยวันนี้" },
  { icon: "clock", title: "ระยะเวลา", text: "ตรวจสอบวันว่างเพื่อดูเวลาเริ่มต้น" },
  { icon: "guide", title: "ไกด์ทัวร์สด", text: "ภาษาไทย, อังกฤษ" },
];

export function getActivityById(id: string): ActivityDetail | null {
  const a = activities.find((x) => x.id === id);
  if (!a) return null;
  const cityName = DESTINATION_NAMES[a.slug] || a.slug;
  const cityNameEn = CITY_NAME_EN[a.slug] || a.slug;
  return {
    ...a,
    description: `เดินทางไปยัง${cityName}และสัมผัสประสบการณ์ที่หลากหลายในทัวร์พร้อมไกด์ท้องถิ่น ชมสถานที่สำคัญ และทำกิจกรรมที่คุณสนใจ`,
    descriptionEn: `Travel to ${cityNameEn} and experience a variety of tours with local guides. Visit key sights and do activities you enjoy.`,
    about: defaultAbout.map((item, i) => (i === 2 ? { ...item, text: `${a.duration} — ${item.text}` } : item)),
    included: ["ไกด์ท้องถิ่น", "ตั๋วเข้าชม (ตามที่ระบุ)", "ฟรียกเลิกภายใน 24 ชม."],
    notIncluded: ["อาหารและเครื่องดื่มเพิ่มเติม", "เคล็ดลับ"],
    notSuitableFor: ["ผู้ที่มีความบกพร่องด้านการเคลื่อนไหว", "ผู้ใช้รถเข็น"],
    meetingPoint: "พบกันที่จุดนัดพบในเมือง (ส่งรายละเอียดหลังจอง)",
    importantInfo: [
      { title: "สิ่งที่ต้องนำมา", items: ["รองเท้าใส่สบาย", "แว่นกันแดด", "ครีมกันแดด"] },
      { title: "ไม่ได้รับอนุญาต", items: ["กระเป๋าใบใหญ่"] },
    ],
    highlights: ["ไกด์ท้องถิ่นชาวไทย", "ประสบการณ์เล็กกลุ่ม", "เหมาะสำหรับนักท่องเที่ยวต่างชาติ"],
    options: [
      { title: "ทัวร์กลุ่มเล็ก", duration: a.duration, guideLang: "ไทย, อังกฤษ", meeting: "จุดนัดพบในเมือง", price: a.priceFrom },
      { title: "ทัวร์แบบส่วนตัว", duration: a.duration, guideLang: "ไทย, อังกฤษ", meeting: "ไปรับที่โรงแรม", price: a.priceFrom * 2, pricePerGroup: true },
    ],
    itinerary: [
      { type: "start_pickup", title: "สถานที่เริ่มต้น/จุดนัดรับ", detail: "ขึ้นอยู่กับตัวเลือกที่เลือก", isMainStop: true },
      { type: "travel", title: "รถบัส/รถโค้ช", duration: "ประมาณ 1 ชั่วโมง" },
      { type: "rest", title: "จุดพักระหว่างทาง", detail: "เวลาพัก (15 นาที)" },
      { type: "travel", title: "รถบัส/รถโค้ช", duration: "ประมาณ 45 นาที" },
      { type: "activity", title: cityName, detail: "ไกด์ทัวร์", duration: "2 - 3 ชั่วโมง", isMainStop: true },
      { type: "activity", title: cityName, detail: "เวลาว่าง", duration: "30 นาที", isMainStop: true },
      { type: "travel", title: "รถบัส/รถโค้ช", duration: "ประมาณ 1 ชั่วโมง" },
      { type: "drop_off", title: "จุดส่ง", detail: "ส่งที่จุดนัดพบ", isMainStop: true },
    ],
    reviewSummary: { guide: 4.8, transportation: 4.6, valueForMoney: 4.5 },
    reviews: [
      { id: "r1", authorName: "Emily", authorCountry: "ประเทศอังกฤษ", date: "4 มีนาคม 2026", verified: true, rating: 5, text: "The trip was incredible. Our guide was very knowledgeable and made sure we were comfortable the whole time. All the suggestions were spot on. We managed to see a lot in just one day.", photos: [a.image], helpfulCount: 12 },
      { id: "r2", authorName: "Darina P", authorCountry: "สหรัฐ", date: "2 มีนาคม 2026", verified: true, rating: 5, text: "Amazing experience from start to finish. The guide spoke great English and shared lots of local stories. The pace was perfect and we had enough free time to explore. Highly recommend for first-time visitors to Thailand.", photos: [a.image, a.image], helpfulCount: 8 },
      { id: "r3", authorName: "James", authorCountry: "ออสเตรเลีย", date: "1 มีนาคม 2026", verified: true, rating: 4, text: "Very good tour. Only minor issue was the pickup was a few minutes late but everything else was excellent. Great value for money.", helpfulCount: 5 },
      { id: "r4", authorName: "Sophie", authorCountry: "ฝรั่งเศส", date: "28 กุมภาพันธ์ 2026", verified: true, rating: 5, text: "Parfait ! Le guide était sympathique et les lieux visités étaient magnifiques. Je recommande vivement.", photos: [a.image], helpfulCount: 3 },
    ],
  };
}
