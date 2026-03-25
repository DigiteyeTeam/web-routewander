"use client";

import { useEffect, useMemo, useState } from "react";
import { THAILAND_PROVINCES } from "@/data/thailand-provinces";
import type { PublicGuide, PublicTrip } from "@/lib/public-catalog";

export type NavPlaceItem = {
  slug: string;
  name: string;
  href: string;
  image: string;
  trips: number;
};

export type NavThingItem = {
  id: string;
  title: string;
  href: string;
  image: string;
};

export type NavGuideItem = {
  id: string;
  name: string;
  href: string;
  image: string;
  guideType: "general" | "local";
  location: string;
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1528181304800-259b08848526?w=100&q=80";

function toTitleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function locationNameFromSlug(slug: string, locale: "th" | "en"): string {
  const found = THAILAND_PROVINCES.find((p) => p.slug === slug);
  if (found) return locale === "en" ? found.nameEn : found.nameTh;
  return toTitleCaseFromSlug(slug);
}

export function useNavCatalog(locale: "th" | "en") {
  const [trips, setTrips] = useState<PublicTrip[]>([]);
  const [guides, setGuides] = useState<PublicGuide[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [tripsRes, guidesRes] = await Promise.all([
          fetch("/api/public/trips", { cache: "no-store" }),
          fetch("/api/public/guides", { cache: "no-store" }),
        ]);
        const tripsData = await tripsRes.json().catch(() => ({}));
        const guidesData = await guidesRes.json().catch(() => ({}));
        if (cancelled) return;
        setTrips(Array.isArray(tripsData?.trips) ? (tripsData.trips as PublicTrip[]) : []);
        setGuides(Array.isArray(guidesData?.guides) ? (guidesData.guides as PublicGuide[]) : []);
      } catch {
        if (!cancelled) {
          setTrips([]);
          setGuides([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const places = useMemo<NavPlaceItem[]>(() => {
    const grouped = new Map<string, { count: number; image?: string }>();
    for (const trip of trips) {
      const slug = (trip.guideLocationSlug || trip.slug || "").trim();
      if (!slug) continue;
      const prev = grouped.get(slug) ?? { count: 0, image: undefined };
      grouped.set(slug, { count: prev.count + 1, image: prev.image ?? trip.image ?? FALLBACK_IMG });
    }
    return Array.from(grouped.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 9)
      .map(([slug, v]) => ({
        slug,
        name: locationNameFromSlug(slug, locale),
        href: `/destination/${encodeURIComponent(slug)}`,
        image: v.image ?? FALLBACK_IMG,
        trips: v.count,
      }));
  }, [trips, locale]);

  const things = useMemo<NavThingItem[]>(() => {
    return [...trips]
      .sort((a, b) => (b.guideReviewCount ?? 0) - (a.guideReviewCount ?? 0))
      .slice(0, 9)
      .map((trip) => ({
        id: trip.tripId,
        title: locale === "en" && trip.titleEn ? trip.titleEn : trip.title,
        href: `/activity/${encodeURIComponent(trip.tripId)}`,
        image: trip.image || FALLBACK_IMG,
      }));
  }, [trips, locale]);

  const topGuides = useMemo<NavGuideItem[]>(() => {
    return [...guides]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 6)
      .map((guide) => ({
        id: guide.publicProfileId,
        name: guide.nameEn?.trim() || guide.name,
        href: `/guides/${encodeURIComponent(guide.publicProfileId)}`,
        image: guide.image || FALLBACK_IMG,
        guideType: guide.guideType,
        location: guide.location || locationNameFromSlug(guide.locationSlug, locale),
      }));
  }, [guides, locale]);

  return { places, things, topGuides };
}

