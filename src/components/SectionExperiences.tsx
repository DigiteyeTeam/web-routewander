"use client";

import ActivityCard from "./ActivityCard";
import { useTranslation } from "@/context/LocaleContext";
import type { FeatureKey } from "@/data/activities";

const experiences = [
  {
    id: "1",
    title: "กรุงเทพ: ทัวร์วัดพระแก้ว และวัดสำคัญ",
    titleEn: "Bangkok: Grand Palace & Temple of Emerald Buddha Tour",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80",
    imageAlt: "วัดพระแก้ว",
    rating: 5.0,
    reviewCount: 4944,
    duration: "4 ชั่วโมง",
    durationEn: "4 hours",
    priceFrom: 1290,
    priceOriginal: 1590,
    category: "ทัวร์พร้อมไกด์",
    categoryKey: "guided-tour" as const,
    bannerKey: "certifiedByRouteWander" as const,
    features: ["ไม่ต้องต่อแถว"],
    featureKeys: ["skipTheLine"] as FeatureKey[],
  },
  {
    id: "2",
    title: "ตลาดน้ำอัมพวา เดย์ทริป",
    titleEn: "Amphawa Floating Market Day Trip",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
    imageAlt: "ตลาดน้ำ",
    rating: 4.9,
    reviewCount: 892,
    duration: "6 ชั่วโมง",
    durationEn: "6 hours",
    priceFrom: 1590,
    category: "เดย์ทริป",
    categoryKey: "day-trip" as const,
    bannerKey: "originalsByRouteWander" as const,
    features: ["ฟรียกเลิก"],
    featureKeys: ["freeCancellation"] as FeatureKey[],
  },
  {
    id: "3",
    title: "เชียงใหม่: ดอยอินทนนท์ และหมู่บ้านกะเหรี่ยง",
    titleEn: "Chiang Mai: Doi Inthanon & Karen Village",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    imageAlt: "ดอยอินทนนท์",
    rating: 4.8,
    reviewCount: 1556,
    duration: "8 ชั่วโมง",
    durationEn: "8 hours",
    priceFrom: 1890,
    category: "การผจญภัย",
    categoryKey: "adventure" as const,
    features: ["มีบริการไปรับ"],
    featureKeys: ["pickupIncluded"] as FeatureKey[],
  },
  {
    id: "4",
    title: "พีพี Islands สปีดโบ๊ท และดำน้ำ",
    titleEn: "Phi Phi Islands Speedboat & Snorkeling",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80",
    imageAlt: "พีพี",
    rating: 4.6,
    reviewCount: 3102,
    duration: "7 ชั่วโมง",
    durationEn: "7 hours",
    priceFrom: 2190,
    priceOriginal: 2690,
    category: "กิจกรรมทางน้ำ",
    categoryKey: "water" as const,
    features: ["ฟรียกเลิก"],
    featureKeys: ["freeCancellation"] as FeatureKey[],
  },
  {
    id: "5",
    title: "เขาใหญ่ ซาฟารีและธรรมชาติ",
    titleEn: "Khao Yai Safari & Nature",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    imageAlt: "เขาใหญ่",
    rating: 4.9,
    reviewCount: 445,
    duration: "10 ชั่วโมง",
    durationEn: "10 hours",
    priceFrom: 2490,
    category: "เดย์ทริป",
    categoryKey: "day-trip" as const,
    features: ["ฟรียกเลิก"],
    featureKeys: ["freeCancellation"] as FeatureKey[],
  },
  {
    id: "6",
    title: "คลาสทำอาหารไทย กรุงเทพ",
    titleEn: "Thai Cooking Class Bangkok",
    image: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=600&q=80",
    imageAlt: "ทำอาหาร",
    rating: 4.9,
    reviewCount: 678,
    duration: "3 ชั่วโมง",
    durationEn: "3 hours",
    priceFrom: 1490,
    category: "ทัวร์พร้อมไกด์",
    categoryKey: "guided-tour" as const,
    bannerKey: "certifiedByRouteWander" as const,
    features: ["ฟรียกเลิก"],
    featureKeys: ["freeCancellation"] as FeatureKey[],
  },
  {
    id: "7",
    title: "อยุธยา วัดและโบราณสถาน",
    titleEn: "Ayutthaya Temples & Historic Sites",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80",
    imageAlt: "อยุธยา",
    rating: 4.8,
    reviewCount: 1203,
    duration: "8 ชั่วโมง",
    durationEn: "8 hours",
    priceFrom: 1790,
    category: "เดย์ทริป",
    categoryKey: "day-trip" as const,
    features: ["ไม่ต้องต่อแถว"],
    featureKeys: ["skipTheLine"] as FeatureKey[],
  },
  {
    id: "8",
    title: "พักผ่อนที่ sanctuary ช้าง เชียงใหม่",
    titleEn: "Elephant Sanctuary Chiang Mai",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    imageAlt: "ช้าง",
    rating: 4.9,
    reviewCount: 556,
    duration: "6 ชั่วโมง",
    durationEn: "6 hours",
    priceFrom: 2190,
    category: "การผจญภัย",
    categoryKey: "adventure" as const,
    features: ["มีบริการไปรับ"],
    featureKeys: ["pickupIncluded"] as FeatureKey[],
  },
];

export default function SectionExperiences() {
  const { t } = useTranslation();
  return (
    <section className="py-14 px-4 sm:px-5 md:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-8">
          {t("memorableExperiences")}
        </h2>

        {/* มือถือ: เลื่อนซ้ายขวา */}
        <div className="sm:hidden -mx-4 px-4">
          <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth">
            {experiences.map((a) => (
              <div key={a.id} className="shrink-0 w-[260px]">
                <ActivityCard {...a} />
              </div>
            ))}
          </div>
        </div>

        {/* จอใหญ่: แสดงเป็นกริด */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6 min-w-0">
          {experiences.map((a) => (
            <ActivityCard key={a.id} {...a} />
          ))}
        </div>
      </div>
    </section>
  );
}
