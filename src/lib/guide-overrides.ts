import type { Guide, GuideReview } from "@/data/guides";

const OVERRIDES_KEY = "route-wander-guide-overrides-v1";

type GuideOverrides = Record<string, Partial<Guide>>;

function safeReadOverrides(): GuideOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as GuideOverrides;
  } catch {
    return {};
  }
}

export function loadGuideOverride(guideId: string): Partial<Guide> | null {
  const overrides = safeReadOverrides();
  return overrides[guideId] ?? null;
}

export function saveGuideOverride(guideId: string, override: Partial<Guide>): void {
  if (typeof window === "undefined") return;
  const overrides = safeReadOverrides();
  const next = { ...overrides, [guideId]: override };
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next));
}

export function mergeGuideWithOverride(base: Guide, override: Partial<Guide>): Guide {
  // Deep merge for array fields commonly edited.
  const next: Guide = {
    ...base,
    ...override,
  };

  if (Array.isArray((override as any).languages)) next.languages = (override as any).languages;
  if (Array.isArray((override as any).specialties)) next.specialties = (override as any).specialties;
  if (Array.isArray((override as any).reviews)) next.reviews = (override as any).reviews as GuideReview[];

  return next;
}

