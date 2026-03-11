export type FeatureKey = 
  | "skipTheLine" 
  | "freeCancellation" 
  | "localTasting" 
  | "pickupIncluded" 
  | "guidedTour" 
  | "sunsetView" 
  | "proPhoto" 
  | "lessCrowded" 
  | "boatRide"
  | "privateTour"
  | "drinkIncluded"
  | "trekking"
  | "scenicView"
  | "snorkeling"
  | "sunriseView"
  | "waterSports"
  | "dinnerIncluded"
  | "fireflyViewing";

export type GuideType = "general" | "local";

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
  guideType?: GuideType;
  guideId?: string;
  tripCode?: string;
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
    guideType: "local",
    guideId: "1",
    tripCode: "BK01",
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
    guideType: "general",
    guideId: "2",
    tripCode: "BK02",
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
    guideType: "local",
    guideId: "2",
    tripCode: "BK03",
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
    guideType: "general",
    guideId: "1",
    tripCode: "BK04",
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
    guideType: "local",
    guideId: "2",
    tripCode: "BK05",
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
    guideType: "general",
    guideId: "1",
    tripCode: "BK06",
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
    guideType: "local",
    guideId: "3",
    tripCode: "CM01",
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
    guideType: "general",
    guideId: "6",
    tripCode: "CM02",
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
    guideType: "local",
    guideId: "5",
    tripCode: "KB01",
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
    guideType: "general",
    guideId: "4",
    tripCode: "PK01",
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
    guideType: "local",
    guideId: "1",
    tripCode: "SS01",
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
    guideType: "general",
    guideId: "4",
    tripCode: "PT01",
  },
  {
    id: "13",
    slug: "bangkok",
    title: "วัดอรุณ ยามพระอาทิตย์ตก",
    titleEn: "Wat Arun Sunset Tour",
    image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80",
    imageAlt: "วัดอรุณ",
    rating: 4.9,
    reviewCount: 1245,
    duration: "3 ชั่วโมง",
    durationEn: "3 hours",
    priceFrom: 890,
    category: "สถานที่เที่ยว",
    categoryKey: "attraction",
    badge: "ยอดนิยม",
    badgeKey: "popular",
    features: ["ชมพระอาทิตย์ตก"],
    featureKeys: ["sunsetView"],
    guideType: "local",
    guideId: "1",
    tripCode: "BK07",
  },
  {
    id: "14",
    slug: "bangkok",
    title: "วัดอรุณ ทัวร์ถ่ายรูปสุดพิเศษ",
    titleEn: "Wat Arun Photography Tour",
    image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80",
    imageAlt: "วัดอรุณ",
    rating: 4.8,
    reviewCount: 567,
    duration: "4 ชั่วโมง",
    durationEn: "4 hours",
    priceFrom: 1290,
    category: "ทัวร์พร้อมไกด์",
    categoryKey: "guided-tour",
    features: ["ถ่ายรูปมืออาชีพ"],
    featureKeys: ["proPhoto"],
    guideType: "general",
    guideId: "2",
    tripCode: "BK08",
  },
  {
    id: "15",
    slug: "bangkok",
    title: "วัดอรุณ ทริปเช้าตรู่",
    titleEn: "Wat Arun Early Morning Tour",
    image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80",
    imageAlt: "วัดอรุณ",
    rating: 4.7,
    reviewCount: 389,
    duration: "2 ชั่วโมง",
    durationEn: "2 hours",
    priceFrom: 690,
    category: "วัฒนธรรม & ประวัติศาสตร์",
    categoryKey: "culture",
    features: ["ไม่แออัด", "ไม่ต้องต่อแถว"],
    featureKeys: ["lessCrowded", "skipTheLine"],
    guideType: "local",
    guideId: "8",
    tripCode: "BK09",
  },
  {
    id: "16",
    slug: "bangkok",
    title: "วัดโพธิ์ และวัดอรุณ เดินข้ามแม่น้ำ",
    titleEn: "Wat Pho & Wat Arun River Crossing",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80",
    imageAlt: "วัดโพธิ์และวัดอรุณ",
    rating: 4.9,
    reviewCount: 2156,
    duration: "5 ชั่วโมง",
    durationEn: "5 hours",
    priceFrom: 1490,
    category: "เดย์ทริป",
    categoryKey: "day-trip",
    badge: "มีแนวโน้มขายหมด",
    badgeKey: "likelyToSellOut",
    badgeRed: true,
    features: ["ล่องเรือ", "ไม่ต้องต่อแถว"],
    featureKeys: ["boatRide", "skipTheLine"],
    guideType: "general",
    guideId: "1",
    tripCode: "BK10",
  },
  // ========== ตลาดน้ำดำเนินสะดวก - 3 ไกด์ ==========
  {
    id: "17",
    slug: "bangkok",
    title: "ตลาดน้ำดำเนินสะดวก ทริปเช้า",
    titleEn: "Damnoen Saduak Morning Tour",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
    imageAlt: "ตลาดน้ำ",
    rating: 4.8,
    reviewCount: 1876,
    duration: "6 ชั่วโมง",
    durationEn: "6 hours",
    priceFrom: 1290,
    category: "เดย์ทริป",
    categoryKey: "day-trip",
    badge: "ยอดนิยม",
    badgeKey: "popular",
    features: ["มีบริการไปรับ", "ล่องเรือ"],
    featureKeys: ["pickupIncluded", "boatRide"],
    guideType: "local",
    guideId: "1",
    tripCode: "BK11",
  },
  {
    id: "18",
    slug: "bangkok",
    title: "ตลาดน้ำดำเนินสะดวก + ตลาดร่มหุบ",
    titleEn: "Damnoen Saduak & Railway Market",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
    imageAlt: "ตลาดน้ำ",
    rating: 4.9,
    reviewCount: 2341,
    duration: "8 ชั่วโมง",
    durationEn: "8 hours",
    priceFrom: 1690,
    category: "เดย์ทริป",
    categoryKey: "day-trip",
    badge: "มีแนวโน้มขายหมด",
    badgeKey: "likelyToSellOut",
    badgeRed: true,
    features: ["มีบริการไปรับ", "ล่องเรือ"],
    featureKeys: ["pickupIncluded", "boatRide"],
    guideType: "general",
    guideId: "2",
    tripCode: "BK12",
  },
  {
    id: "19",
    slug: "bangkok",
    title: "ตลาดน้ำดำเนินสะดวก ทริปส่วนตัว",
    titleEn: "Damnoen Saduak Private Tour",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
    imageAlt: "ตลาดน้ำ",
    rating: 5.0,
    reviewCount: 456,
    duration: "5 ชั่วโมง",
    durationEn: "5 hours",
    priceFrom: 2490,
    category: "ทัวร์พร้อมไกด์",
    categoryKey: "guided-tour",
    features: ["ทริปส่วนตัว", "ฟรียกเลิก"],
    featureKeys: ["privateTour", "freeCancellation"],
    guideType: "local",
    guideId: "8",
    tripCode: "BK13",
  },
  // ========== ถนนข้าวสาร - 2 ไกด์ ==========
  {
    id: "20",
    slug: "bangkok",
    title: "ถนนข้าวสาร Street Food Night Tour",
    titleEn: "Khao San Road Street Food Night Tour",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80",
    imageAlt: "ถนนข้าวสาร",
    rating: 4.7,
    reviewCount: 1234,
    duration: "3 ชั่วโมง",
    durationEn: "3 hours",
    priceFrom: 790,
    category: "อาหาร & เครื่องดื่ม",
    categoryKey: "food-drink",
    features: ["ชิมของท้องถิ่น"],
    featureKeys: ["localTasting"],
    guideType: "local",
    guideId: "2",
    tripCode: "BK14",
  },
  {
    id: "21",
    slug: "bangkok",
    title: "ถนนข้าวสาร Bar Hopping Tour",
    titleEn: "Khao San Road Bar Hopping",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80",
    imageAlt: "ถนนข้าวสาร",
    rating: 4.6,
    reviewCount: 678,
    duration: "4 ชั่วโมง",
    durationEn: "4 hours",
    priceFrom: 990,
    category: "อาหาร & เครื่องดื่ม",
    categoryKey: "food-drink",
    features: ["เครื่องดื่ม 3 แก้ว"],
    featureKeys: ["drinkIncluded"],
    guideType: "general",
    guideId: "8",
    tripCode: "BK15",
  },
  // ========== จตุจักร - 2 ไกด์ ==========
  {
    id: "22",
    slug: "bangkok",
    title: "ตลาดนัดจตุจักร ทัวร์ช้อปปิ้ง",
    titleEn: "Chatuchak Weekend Market Shopping Tour",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80",
    imageAlt: "จตุจักร",
    rating: 4.8,
    reviewCount: 2103,
    duration: "4 ชั่วโมง",
    durationEn: "4 hours",
    priceFrom: 590,
    category: "สถานที่เที่ยว",
    categoryKey: "attraction",
    features: ["ทัวร์พร้อมไกด์"],
    featureKeys: ["guidedTour"],
    guideType: "local",
    guideId: "1",
    tripCode: "BK16",
  },
  {
    id: "23",
    slug: "bangkok",
    title: "จตุจักร ตามหาของวินเทจ",
    titleEn: "Chatuchak Vintage Hunting Tour",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80",
    imageAlt: "จตุจักร",
    rating: 4.9,
    reviewCount: 567,
    duration: "5 ชั่วโมง",
    durationEn: "5 hours",
    priceFrom: 890,
    category: "สถานที่เที่ยว",
    categoryKey: "attraction",
    features: ["ทัวร์พร้อมไกด์"],
    featureKeys: ["guidedTour"],
    guideType: "general",
    guideId: "8",
    tripCode: "BK17",
  },
  // ========== เชียงใหม่ - เพิ่มทริปซ้ำสถานที่ ==========
  {
    id: "24",
    slug: "chiang-mai",
    title: "ดอยอินทนนท์ ชมพระอาทิตย์ขึ้น",
    titleEn: "Doi Inthanon Sunrise Tour",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80",
    imageAlt: "ดอยอินทนนท์",
    rating: 4.9,
    reviewCount: 1892,
    duration: "10 ชั่วโมง",
    durationEn: "10 hours",
    priceFrom: 2290,
    category: "เดย์ทริป",
    categoryKey: "day-trip",
    badge: "ยอดนิยม",
    badgeKey: "popular",
    features: ["มีบริการไปรับ", "ชมพระอาทิตย์ขึ้น"],
    featureKeys: ["pickupIncluded", "sunriseView"],
    guideType: "local",
    guideId: "3",
    tripCode: "CM03",
  },
  {
    id: "25",
    slug: "chiang-mai",
    title: "ดอยอินทนนท์ เดินป่าน้ำตก",
    titleEn: "Doi Inthanon Waterfall Trekking",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80",
    imageAlt: "ดอยอินทนนท์",
    rating: 4.8,
    reviewCount: 743,
    duration: "9 ชั่วโมง",
    durationEn: "9 hours",
    priceFrom: 1990,
    category: "เดย์ทริป",
    categoryKey: "day-trip",
    features: ["มีบริการไปรับ", "เดินป่า"],
    featureKeys: ["pickupIncluded", "trekking"],
    guideType: "general",
    guideId: "6",
    tripCode: "CM04",
  },
  {
    id: "26",
    slug: "chiang-mai",
    title: "วัดพระธาตุดอยสุเทพ ครึ่งวัน",
    titleEn: "Doi Suthep Temple Half Day",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80",
    imageAlt: "ดอยสุเทพ",
    rating: 4.9,
    reviewCount: 3456,
    duration: "4 ชั่วโมง",
    durationEn: "4 hours",
    priceFrom: 790,
    category: "วัฒนธรรม & ประวัติศาสตร์",
    categoryKey: "culture",
    badge: "ยอดนิยม",
    badgeKey: "popular",
    features: ["มีบริการไปรับ"],
    featureKeys: ["pickupIncluded"],
    guideType: "local",
    guideId: "3",
    tripCode: "CM05",
  },
  {
    id: "27",
    slug: "chiang-mai",
    title: "วัดพระธาตุดอยสุเทพ + ชมวิวเมือง",
    titleEn: "Doi Suthep & City View Tour",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80",
    imageAlt: "ดอยสุเทพ",
    rating: 4.8,
    reviewCount: 1234,
    duration: "5 ชั่วโมง",
    durationEn: "5 hours",
    priceFrom: 990,
    category: "วัฒนธรรม & ประวัติศาสตร์",
    categoryKey: "culture",
    features: ["มีบริการไปรับ", "ชมวิว"],
    featureKeys: ["pickupIncluded", "scenicView"],
    guideType: "general",
    guideId: "6",
    tripCode: "CM06",
  },
  {
    id: "28",
    slug: "chiang-mai",
    title: "คลาสทำอาหารเหนือ แบบดั้งเดิม",
    titleEn: "Traditional Northern Thai Cooking Class",
    image: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=600&q=80",
    imageAlt: "คลาสทำอาหาร",
    rating: 5.0,
    reviewCount: 876,
    duration: "5 ชั่วโมง",
    durationEn: "5 hours",
    priceFrom: 1490,
    category: "เรียนทำอาหาร",
    categoryKey: "cooking",
    features: ["มีบริการไปรับ", "ชิมของท้องถิ่น"],
    featureKeys: ["pickupIncluded", "localTasting"],
    guideType: "local",
    guideId: "6",
    tripCode: "CM07",
  },
  {
    id: "29",
    slug: "chiang-mai",
    title: "คลาสทำอาหาร + ตลาดสด",
    titleEn: "Cooking Class with Market Tour",
    image: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=600&q=80",
    imageAlt: "คลาสทำอาหาร",
    rating: 4.9,
    reviewCount: 567,
    duration: "6 ชั่วโมง",
    durationEn: "6 hours",
    priceFrom: 1690,
    category: "เรียนทำอาหาร",
    categoryKey: "cooking",
    features: ["มีบริการไปรับ"],
    featureKeys: ["pickupIncluded"],
    guideType: "general",
    guideId: "3",
    tripCode: "CM08",
  },
  // ========== กระบี่/ภูเก็ต - เพิ่มทริปซ้ำเกาะพีพี ==========
  {
    id: "30",
    slug: "krabi",
    title: "เกาะพีพี ดำน้ำจุดลับ",
    titleEn: "Phi Phi Secret Snorkeling Spots",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80",
    imageAlt: "เกาะพีพี",
    rating: 4.9,
    reviewCount: 1567,
    duration: "8 ชั่วโมง",
    durationEn: "8 hours",
    priceFrom: 2490,
    category: "กิจกรรมทางน้ำ",
    categoryKey: "water",
    badge: "ยอดนิยม",
    badgeKey: "popular",
    features: ["ล่องเรือ", "ดำน้ำ"],
    featureKeys: ["boatRide", "snorkeling"],
    guideType: "local",
    guideId: "5",
    tripCode: "KB02",
  },
  {
    id: "31",
    slug: "krabi",
    title: "เกาะพีพี Sunrise Tour",
    titleEn: "Phi Phi Sunrise Experience",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80",
    imageAlt: "เกาะพีพี",
    rating: 4.8,
    reviewCount: 892,
    duration: "10 ชั่วโมง",
    durationEn: "10 hours",
    priceFrom: 2890,
    category: "กิจกรรมทางน้ำ",
    categoryKey: "water",
    features: ["ชมพระอาทิตย์ขึ้น", "ล่องเรือ"],
    featureKeys: ["sunriseView", "boatRide"],
    guideType: "general",
    guideId: "4",
    tripCode: "KB03",
  },
  {
    id: "32",
    slug: "phuket",
    title: "เกาะพีพี สปีดโบ๊ทส่วนตัว",
    titleEn: "Phi Phi Private Speedboat",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80",
    imageAlt: "เกาะพีพี",
    rating: 5.0,
    reviewCount: 234,
    duration: "7 ชั่วโมง",
    durationEn: "7 hours",
    priceFrom: 4990,
    category: "กิจกรรมทางน้ำ",
    categoryKey: "water",
    features: ["ทริปส่วนตัว", "ล่องเรือ"],
    featureKeys: ["privateTour", "boatRide"],
    guideType: "local",
    guideId: "9",
    tripCode: "PK02",
  },
  {
    id: "33",
    slug: "phuket",
    title: "เกาะพีพี + เกาะไม้ไผ่",
    titleEn: "Phi Phi & Bamboo Island",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80",
    imageAlt: "เกาะพีพี",
    rating: 4.7,
    reviewCount: 1456,
    duration: "9 ชั่วโมง",
    durationEn: "9 hours",
    priceFrom: 2690,
    category: "กิจกรรมทางน้ำ",
    categoryKey: "water",
    features: ["มีบริการไปรับ", "ล่องเรือ"],
    featureKeys: ["pickupIncluded", "boatRide"],
    guideType: "general",
    guideId: "4",
    tripCode: "PK03",
  },
  // ========== พัทยา - เพิ่มทริปซ้ำเกาะล้าน ==========
  {
    id: "34",
    slug: "pattaya",
    title: "เกาะล้าน ดำน้ำดูปะการัง",
    titleEn: "Koh Larn Coral Snorkeling",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    imageAlt: "เกาะล้าน",
    rating: 4.7,
    reviewCount: 1234,
    duration: "5 ชั่วโมง",
    durationEn: "5 hours",
    priceFrom: 1490,
    category: "กิจกรรมทางน้ำ",
    categoryKey: "water",
    features: ["ล่องเรือ", "ดำน้ำ"],
    featureKeys: ["boatRide", "snorkeling"],
    guideType: "local",
    guideId: "7",
    tripCode: "PT02",
  },
  {
    id: "35",
    slug: "pattaya",
    title: "เกาะล้าน เช่าเจ็ทสกี + พาราเซล",
    titleEn: "Koh Larn Water Sports Package",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    imageAlt: "เกาะล้าน",
    rating: 4.8,
    reviewCount: 876,
    duration: "6 ชั่วโมง",
    durationEn: "6 hours",
    priceFrom: 2290,
    category: "กิจกรรมทางน้ำ",
    categoryKey: "water",
    features: ["กีฬาทางน้ำ", "ล่องเรือ"],
    featureKeys: ["waterSports", "boatRide"],
    guideType: "general",
    guideId: "4",
    tripCode: "PT03",
  },
  {
    id: "36",
    slug: "pattaya",
    title: "เกาะล้าน Sunset Dinner Cruise",
    titleEn: "Koh Larn Sunset Dinner",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    imageAlt: "เกาะล้าน",
    rating: 4.9,
    reviewCount: 456,
    duration: "4 ชั่วโมง",
    durationEn: "4 hours",
    priceFrom: 1890,
    category: "อาหาร & เครื่องดื่ม",
    categoryKey: "food-drink",
    features: ["ชมพระอาทิตย์ตก", "อาหารเย็น"],
    featureKeys: ["sunsetView", "dinnerIncluded"],
    guideType: "local",
    guideId: "7",
    tripCode: "PT04",
  },
  // ========== สมุทรสงคราม - เพิ่มทริปตลาดน้ำ ==========
  {
    id: "37",
    slug: "samut-songkhram",
    title: "ตลาดน้ำอัมพวา ล่องเรือหิ่งห้อย",
    titleEn: "Amphawa Firefly Boat Tour",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
    imageAlt: "หิ่งห้อย",
    rating: 4.9,
    reviewCount: 2341,
    duration: "4 ชั่วโมง",
    durationEn: "4 hours",
    priceFrom: 890,
    category: "สถานที่เที่ยว",
    categoryKey: "attraction",
    badge: "ยอดนิยม",
    badgeKey: "popular",
    features: ["ล่องเรือ", "ชมหิ่งห้อย"],
    featureKeys: ["boatRide", "fireflyViewing"],
    guideType: "local",
    guideId: "10",
    tripCode: "SS02",
  },
  {
    id: "38",
    slug: "samut-songkhram",
    title: "ตลาดร่มหุบ (ตลาดรถไฟ)",
    titleEn: "Maeklong Railway Market",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
    imageAlt: "ตลาดร่มหุบ",
    rating: 4.8,
    reviewCount: 1567,
    duration: "3 ชั่วโมง",
    durationEn: "3 hours",
    priceFrom: 690,
    category: "สถานที่เที่ยว",
    categoryKey: "attraction",
    features: ["ทัวร์พร้อมไกด์"],
    featureKeys: ["guidedTour"],
    guideType: "general",
    guideId: "10",
    tripCode: "SS03",
  },
  {
    id: "39",
    slug: "samut-songkhram",
    title: "ตลาดน้ำอัมพวา + ตลาดร่มหุบ Combo",
    titleEn: "Amphawa & Railway Market Combo",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
    imageAlt: "ตลาดน้ำ",
    rating: 4.9,
    reviewCount: 3456,
    duration: "7 ชั่วโมง",
    durationEn: "7 hours",
    priceFrom: 1290,
    category: "เดย์ทริป",
    categoryKey: "day-trip",
    badge: "มีแนวโน้มขายหมด",
    badgeKey: "likelyToSellOut",
    badgeRed: true,
    features: ["มีบริการไปรับ", "ล่องเรือ"],
    featureKeys: ["pickupIncluded", "boatRide"],
    guideType: "local",
    guideId: "1",
    tripCode: "SS04",
  },
  // ========== เพิ่มทริปอีกสถานที่ ==========
  {
    id: "40",
    slug: "bangkok",
    title: "ไอคอนสยาม & ล่องเรือเจ้าพระยา",
    titleEn: "ICONSIAM & Chao Phraya Cruise",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80",
    imageAlt: "ไอคอนสยาม",
    rating: 4.7,
    reviewCount: 987,
    duration: "5 ชั่วโมง",
    durationEn: "5 hours",
    priceFrom: 1190,
    category: "สถานที่เที่ยว",
    categoryKey: "attraction",
    features: ["ล่องเรือ"],
    featureKeys: ["boatRide"],
    guideType: "general",
    guideId: "8",
    tripCode: "BK18",
  },
];

export function getAllActivities(): ActivityItem[] {
  return activities;
}

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
