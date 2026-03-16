/**
 * โปรไฟล์ไกด์ตามสเปก API (GuideResponse)
 * ใช้ UID จาก session (Google sub) เป็น id ของ guide
 */
export type GuideProfile = {
  id: string;
  userId: string;
  name: string;
  guideType: "general" | "local";
  location: string;
  locationSlug: string;
  image: string | null;
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
  status: "pending" | "approved";
  phone?: string;
  nationalId?: string;
  idCardImageUrl?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  bankBookImageUrl?: string;
  createdAt: string;
};

const LOCATION_SLUGS = ["bangkok", "chiang-mai", "phuket", "krabi", "pattaya", "samut-songkhram"] as const;
const LOCATION_LABELS: Record<string, string> = {
  bangkok: "กรุงเทพ",
  "chiang-mai": "เชียงใหม่",
  phuket: "ภูเก็ต",
  krabi: "กระบี่",
  pattaya: "พัทยา",
  "samut-songkhram": "สมุทรสงคราม",
};

/** เก็บตาม userId (UID จาก Google) — เปลี่ยนเป็น DB (Prisma) ในภายหลัง */
const store = new Map<string, GuideProfile>();

export function getGuideByUserId(userId: string): GuideProfile | undefined {
  return store.get(userId);
}

export function getGuideById(id: string): GuideProfile | undefined {
  return Array.from(store.values()).find((g) => g.id === id);
}

export function getAllGuides(): GuideProfile[] {
  return Array.from(store.values());
}

export function createGuide(
  userId: string,
  input: {
    name: string;
    guideType: "general" | "local";
    locationSlug: string;
    image?: string | null;
    phone?: string;
    nationalId?: string;
    idCardImageUrl?: string;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    bankBookImageUrl?: string;
  }
): GuideProfile {
  const existing = store.get(userId);
  if (existing) throw new Error("ALREADY_REGISTERED");

  if (!LOCATION_SLUGS.includes(input.locationSlug as (typeof LOCATION_SLUGS)[number])) {
    throw new Error("INVALID_LOCATION");
  }

  const id = userId;
  const location = LOCATION_LABELS[input.locationSlug] ?? input.locationSlug;
  const guide: GuideProfile = {
    id,
    userId,
    name: input.name.trim() || "ไกด์",
    guideType: input.guideType,
    location,
    locationSlug: input.locationSlug,
    image: input.image ?? null,
    rating: 0,
    reviewCount: 0,
    tours: 0,
    experience: 0,
    languages: [],
    specialties: [],
    bio: null,
    bioEn: null,
    verified: false,
    licenseNumber: null,
    status: "pending",
    phone: input.phone,
    nationalId: input.nationalId,
    idCardImageUrl: input.idCardImageUrl,
    bankName: input.bankName,
    accountNumber: input.accountNumber,
    accountHolder: input.accountHolder,
    bankBookImageUrl: input.bankBookImageUrl,
    createdAt: new Date().toISOString(),
  };
  store.set(userId, guide);
  return guide;
}

export function updateGuide(userId: string, updates: Partial<Omit<GuideProfile, "id" | "userId" | "createdAt">>): GuideProfile | undefined {
  const guide = store.get(userId);
  if (!guide) return undefined;
  const updated = { ...guide, ...updates };
  if (updates.locationSlug) updated.location = LOCATION_LABELS[updates.locationSlug] ?? updates.locationSlug;
  store.set(userId, updated);
  return updated;
}

export { LOCATION_SLUGS, LOCATION_LABELS };
