/**
 * รูปแบบข้อมูลจาก GET /api/public/trips (s-rwn2) และ mapper ไป ActivityItem / ActivityDetail
 */
import type { ActivityDetail, ActivityItem } from "@/data/activities";

export type PublicGuideReview = {
  id: number;
  author: string;
  rating: number;
  date: string;
  text: string;
  textTh: string;
};

export type PublicGuide = {
  /** Opaque public slug — use in /guides/:publicProfileId (not OAuth subject) */
  publicProfileId: string;
  guideRef?: string;
  /** จาก API — pending = ยังไม่ขึ้นแคตตาล็อกจนกว่าจะ approved (ยกเว้นเปิด PUBLIC_SHOW_PENDING_GUIDES) */
  status?: "pending" | "approved";
  name: string;
  nameEn?: string | null;
  guideType: "general" | "local";
  locationSlug: string;
  location: string;
  image: string | null;
  headerImageUrl?: string | null;
  rating: number;
  reviewCount: number;
  tours: number;
  experience: number;
  languages: string[];
  specialties: string[];
  bio: string | null;
  bioEn: string | null;
  verified: boolean;
  licenseNumber: string | null;
};

export type PublicTrip = {
  tripId: string;
  tripRef?: string;
  slug: string;
  title: string;
  titleEn?: string;
  image: string;
  imageGallery?: string[];
  imageAlt?: string;
  categoryKey: string;
  category?: string;
  guideType: "general" | "local";
  priceFrom: number;
  priceOriginal?: number;
  duration?: string;
  durationEn?: string;
  tripCode?: string;
  badgeKey?: string;
  badge?: string;
  banner?: string;
  features?: string[];
  description?: string;
  descriptionEn?: string;
  included?: string[];
  notIncluded?: string[];
  notSuitableFor?: string[];
  meetingPoint?: string;
  meetingPointMapUrl?: string;
  placeTags?: {
    name: string;
    nameEn?: string;
    province: string;
    district?: string;
    googleMapsUrl?: string;
    lat?: number;
    lng?: number;
    slug?: string;
  }[];
  importantInfo?: { title: string; items: string[] }[];
  highlights?: string[];
  options?: { title: string; duration: string; guideLang: string; meeting: string; price: number; pricePerGroup?: boolean }[];
  itinerary?: {
    type: "start_pickup" | "travel" | "activity" | "rest" | "drop_off";
    title: string;
    titleEn?: string;
    detail?: string;
    detailEn?: string;
    duration?: string;
    isMainStop?: boolean;
    mapUrl?: string;
    province?: string;
    district?: string;
  }[];
  reviewSummary?: { guide: number; transportation: number; valueForMoney: number };
  reviews?: {
    id: string;
    authorName: string;
    authorCountry: string;
    date: string;
    verified: boolean;
    rating: number;
    text: string;
    photos?: string[];
    helpfulCount?: number;
  }[];
  guideId: string;
  guideRef?: string;
  guideName: string;
  guideRating: number;
  guideReviewCount: number;
  guideLocationSlug: string;
  guideImage: string | null;
};

export function publicTripToActivityItem(t: PublicTrip): ActivityItem {
  const slug = t.guideLocationSlug || t.slug || "bangkok";
  return {
    id: t.tripId,
    slug,
    title: t.title,
    titleEn: t.titleEn,
    image: t.image,
    imageGallery: t.imageGallery,
    imageAlt: t.imageAlt ?? t.title,
    rating: t.guideRating,
    reviewCount: t.guideReviewCount,
    duration: t.duration ?? "",
    durationEn: t.durationEn,
    priceFrom: t.priceFrom,
    priceOriginal: t.priceOriginal,
    category: t.category ?? "",
    categoryKey: t.categoryKey,
    badge: t.badge,
    badgeKey: t.badgeKey as ActivityItem["badgeKey"],
    features: t.features ?? [],
    banner: t.banner,
    guideType: t.guideType,
    guideId: t.guideId,
    guideDisplayName: t.guideName,
    tripCode: t.tripCode,
    placeTags: t.placeTags,
  };
}

export function publicTripToActivityDetail(t: PublicTrip): ActivityDetail {
  const base = publicTripToActivityItem(t);
  return {
    ...base,
    description: t.description ?? t.title,
    descriptionEn: t.descriptionEn ?? t.titleEn ?? t.title,
    included: t.included,
    notIncluded: t.notIncluded,
    notSuitableFor: t.notSuitableFor,
    meetingPoint: t.meetingPoint,
    meetingPointMapUrl: t.meetingPointMapUrl,
    placeTags: t.placeTags,
    importantInfo: t.importantInfo,
    highlights: t.highlights && t.highlights.length > 0 ? t.highlights : (t.features && t.features.length > 0 ? t.features : undefined),
    options: t.options,
    itinerary: t.itinerary,
    reviewSummary: t.reviewSummary,
    reviews: t.reviews,
  };
}
