import type { TranslationKey } from "@/i18n/translations";

export type GuideType = "general" | "local";

export type Guide = {
  id: string;
  nameKey: TranslationKey;
  guideType: GuideType;
  locationKey: TranslationKey;
  image: string;
  rating: number;
  reviewCount: number;
  tours: number;
  experience: number;
  languages: string[];
  specialties: TranslationKey[];
  bio: string;
  bioEn: string;
  verified: boolean;
  licenseNumber: string;
};

export const guides: Guide[] = [
  {
    id: "1",
    nameKey: "navGuide1",
    guideType: "local",
    locationKey: "cityBangkok",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    rating: 4.9,
    reviewCount: 128,
    tours: 45,
    experience: 8,
    languages: ["ไทย", "English", "中文"],
    specialties: ["navThingBangkokTemples", "navThingFloatingMarket"],
    bio: "สวัสดีครับ ผมชื่อสมชาย เป็นไกด์ท้องถิ่นที่เกิดและโตในกรุงเทพ มีประสบการณ์นำทัวร์มากกว่า 8 ปี ผมรักการแบ่งปันเรื่องราวประวัติศาสตร์และวัฒนธรรมไทยให้นักท่องเที่ยวได้สัมผัส ผมจะพาคุณไปสถานที่ที่คนท้องถิ่นชอบไป ไม่ใช่แค่สถานที่ท่องเที่ยวทั่วไป",
    bioEn: "Hello! I'm Somchai, a local guide born and raised in Bangkok with over 8 years of experience. I love sharing Thai history and culture with travelers. I'll take you to places locals love, not just typical tourist spots.",
    verified: true,
    licenseNumber: "SC01",
  },
  {
    id: "2",
    nameKey: "navGuide2",
    guideType: "general",
    locationKey: "cityBangkok",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
    rating: 4.8,
    reviewCount: 95,
    tours: 32,
    experience: 5,
    languages: ["ไทย", "English"],
    specialties: ["navThingThaiCooking", "navThingBangkokStreetFood"],
    bio: "สวัสดีค่ะ ดิฉันชื่อสุภาพร เป็นไกด์ที่รักการทำอาหารและอาหารริมทาง ดิฉันจะพาคุณสัมผัสรสชาติแท้ๆ ของอาหารไทยที่คุณไม่มีทางลืม มาเรียนทำอาหารไทยกับดิฉันได้เลยค่ะ",
    bioEn: "Hi! I'm Supaporn, a guide passionate about cooking and street food. I'll introduce you to authentic Thai flavors you'll never forget. Join me for a Thai cooking experience!",
    verified: true,
    licenseNumber: "SP02",
  },
  {
    id: "3",
    nameKey: "navGuide3",
    guideType: "local",
    locationKey: "cityChiangMai",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80",
    rating: 4.9,
    reviewCount: 156,
    tours: 67,
    experience: 12,
    languages: ["ไทย", "English", "日本語"],
    specialties: ["navThingChiangMaiDoiInthanon", "navThingElephantSanctuary"],
    bio: "สวัสดีครับ ผมชื่อวิชัย เป็นคนเชียงใหม่โดยกำเนิด ผมรู้จักทุกเส้นทางในดอยและป่าเขาแถวนี้ ผมจะพาคุณไปสัมผัสธรรมชาติและวิถีชีวิตชาวเขาที่แท้จริง พร้อมเรียนรู้การดูแลช้างอย่างถูกวิธี",
    bioEn: "Hello! I'm Wichai, a Chiang Mai native. I know every trail in the mountains here. I'll take you to experience real nature and hill tribe life, plus learn ethical elephant care.",
    verified: true,
    licenseNumber: "WC03",
  },
  {
    id: "4",
    nameKey: "navGuide4",
    guideType: "general",
    locationKey: "cityPhuket",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80",
    rating: 4.7,
    reviewCount: 78,
    tours: 28,
    experience: 4,
    languages: ["ไทย", "English", "Русский"],
    specialties: ["navThingPhiPhiSnorkeling"],
    bio: "สวัสดีค่ะ ดิฉันชื่อนารี เป็นไกด์ที่รักทะเลและกิจกรรมทางน้ำ ดิฉันจะพาคุณไปดำน้ำดูปะการังและสัตว์ทะเลที่สวยที่สุดในอันดามัน",
    bioEn: "Hi! I'm Naree, a guide who loves the sea and water activities. I'll take you snorkeling to see the most beautiful corals and marine life in the Andaman.",
    verified: true,
    licenseNumber: "NR04",
  },
  {
    id: "5",
    nameKey: "navGuide5",
    guideType: "local",
    locationKey: "cityKrabi",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
    rating: 4.8,
    reviewCount: 112,
    tours: 52,
    experience: 10,
    languages: ["ไทย", "English"],
    specialties: ["navThingPhiPhiSnorkeling"],
    bio: "สวัสดีครับ ผมชื่ออภิชัย เป็นคนกระบี่แท้ๆ รู้จักทุกเกาะและจุดดำน้ำที่สวยที่สุด ผมจะพาคุณไปเกาะลับๆ ที่นักท่องเที่ยวไม่ค่อยรู้จัก",
    bioEn: "Hello! I'm Apichai, a true Krabi local. I know every island and the best snorkeling spots. I'll take you to secret islands tourists rarely know about.",
    verified: true,
    licenseNumber: "AC05",
  },
  {
    id: "6",
    nameKey: "navGuide6",
    guideType: "general",
    locationKey: "cityChiangMai",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    rating: 4.9,
    reviewCount: 89,
    tours: 38,
    experience: 6,
    languages: ["ไทย", "English", "한국어"],
    specialties: ["navThingChiangMaiDoiInthanon", "navThingThaiCooking"],
    bio: "สวัสดีค่ะ ดิฉันชื่อมาลี เป็นไกด์ที่รักธรรมชาติและการทำอาหารเหนือ ดิฉันจะพาคุณไปเที่ยวดอยและเรียนทำอาหารเหนือแท้ๆ",
    bioEn: "Hi! I'm Malee, a guide who loves nature and Northern Thai cuisine. I'll take you to explore the mountains and learn authentic Northern Thai cooking.",
    verified: true,
    licenseNumber: "ML06",
  },
  {
    id: "7",
    nameKey: "navGuide7",
    guideType: "local",
    locationKey: "cityPattaya",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80",
    rating: 4.7,
    reviewCount: 64,
    tours: 24,
    experience: 5,
    languages: ["ไทย", "English", "Deutsch"],
    specialties: ["navThingPhiPhiSnorkeling"],
    bio: "สวัสดีครับ ผมชื่อธนากร เป็นคนพัทยาที่รักทะเลและกีฬาทางน้ำ ผมจะพาคุณไปดำน้ำ ตกปลา และสัมผัสวิถีชีวิตชาวประมง",
    bioEn: "Hello! I'm Thanakorn, a Pattaya local who loves the sea and water sports. I'll take you diving, fishing, and experience the fishermen's lifestyle.",
    verified: true,
    licenseNumber: "TK07",
  },
  {
    id: "8",
    nameKey: "navGuide8",
    guideType: "general",
    locationKey: "cityBangkok",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80",
    rating: 4.8,
    reviewCount: 102,
    tours: 41,
    experience: 7,
    languages: ["ไทย", "English", "Français"],
    specialties: ["navThingBangkokTemples", "navThingBangkokStreetFood"],
    bio: "สวัสดีค่ะ ดิฉันชื่อพิมพ์ เป็นไกด์ที่รักประวัติศาสตร์และศิลปะไทย ดิฉันจะพาคุณไปชมวัดและพิพิธภัณฑ์ที่น่าสนใจในกรุงเทพ",
    bioEn: "Hi! I'm Pim, a guide passionate about Thai history and art. I'll take you to visit fascinating temples and museums in Bangkok.",
    verified: true,
    licenseNumber: "PM08",
  },
  {
    id: "9",
    nameKey: "navGuide9",
    guideType: "local",
    locationKey: "cityPhuket",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
    rating: 4.9,
    reviewCount: 134,
    tours: 56,
    experience: 9,
    languages: ["ไทย", "English", "中文"],
    specialties: ["navThingPhiPhiSnorkeling"],
    bio: "สวัสดีครับ ผมชื่อภูมิ เป็นชาวภูเก็ตแท้ๆ รู้จักทุกหาดและจุดดำน้ำลับๆ ผมจะพาคุณไปสัมผัสความสวยงามของทะเลอันดามัน",
    bioEn: "Hello! I'm Poom, a true Phuket local. I know every beach and secret diving spot. I'll take you to experience the beauty of the Andaman Sea.",
    verified: true,
    licenseNumber: "PO09",
  },
  {
    id: "10",
    nameKey: "navGuide10",
    guideType: "general",
    locationKey: "citySamutSongkhram",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80",
    rating: 4.6,
    reviewCount: 48,
    tours: 19,
    experience: 3,
    languages: ["ไทย", "English"],
    specialties: ["navThingFloatingMarket"],
    bio: "สวัสดีค่ะ ดิฉันชื่อแพรวา เป็นไกด์ที่รักวิถีชีวิตริมน้ำ ดิฉันจะพาคุณไปสัมผัสตลาดน้ำและวิถีชีวิตดั้งเดิมของชาวสมุทรสงคราม",
    bioEn: "Hi! I'm Praewa, a guide who loves the riverside lifestyle. I'll take you to experience floating markets and traditional life in Samut Songkhram.",
    verified: true,
    licenseNumber: "PW10",
  },
];

export function getGuideById(id: string): Guide | undefined {
  return guides.find((g) => g.id === id);
}

export function getGuidesByType(type: GuideType): Guide[] {
  return guides.filter((g) => g.guideType === type);
}
