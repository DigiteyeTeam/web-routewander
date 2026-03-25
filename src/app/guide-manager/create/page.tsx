"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  PenLine,
  Settings,
  ImagePlus,
  AlertCircle,
  ArrowLeft,
  Tag,
  Eye,
  X,
  CheckCircle2,
  FileText,
  Clock,
  UserCircle,
  Route,
} from "lucide-react";
import { getAllActivities } from "@/data/activities";
import ItineraryPlaceSearch from "@/components/guide-manager/ItineraryPlaceSearch";
import {
  FILTER_CATEGORIES,
  type FeatureKey,
  type ActivityItem,
  type ActivityDetail,
  type GuideType,
  type ItineraryStep,
} from "@/data/activities";
import {
  THAILAND_PROVINCES,
  getProvinceBySlug,
  provinceInputToSlug,
  provinceSlugToNameTh,
  buildProvinceSlugToEn,
} from "@/data/thailand-provinces";
import { useTranslation } from "@/context/LocaleContext";
import { featureKeyToTKey, slugToCityKey, type TranslationKey } from "@/i18n/translations";

const MOCK_GUIDE_ID = "1";
const MAX_OPEN_TRIPS = 3;
const STORAGE_KEY = "guide-manager-closed-ids";
// ปิด mock เพื่อให้ใช้ข้อมูลจริงจาก DynamoDB/S3
// แต่ยังคงโค้ดเดิมไว้ เผื่อเอาไว้เทสภายหลัง
const USE_MOCK_TRIPS = false;

/** หมวดหมู่ที่เลือกได้ (ไม่รวม "all") */
const CATEGORY_OPTIONS = FILTER_CATEGORIES.filter((c) => c.key !== "all");

/** Province slug -> English name (77 + legacy); __CITY__ token */
const DESTINATION_SLUG_TO_EN = buildProvinceSlugToEn();
const PLACE_TAG_LIMIT = 10;
const ALLOWED_GOOGLE_MAP_HOSTS = new Set(["google.com", "www.google.com", "maps.google.com", "maps.app.goo.gl"]);

const FEATURE_KEYS: FeatureKey[] = [
  "skipTheLine",
  "freeCancellation",
  "localTasting",
  "pickupIncluded",
  "guidedTour",
  "sunsetView",
  "proPhoto",
  "lessCrowded",
  "boatRide",
  "privateTour",
  "drinkIncluded",
  "trekking",
  "scenicView",
  "snorkeling",
  "sunriseView",
  "waterSports",
  "dinnerIncluded",
  "fireflyViewing",
];

function loadClosedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function TripPreviewHeroImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const isData = src.startsWith("data:");
  if (isData) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className ?? "absolute inset-0 h-full w-full object-cover"}
      />
    );
  }
  return (
    <Image src={src} alt={alt} fill className={className ?? "object-cover"} sizes="(max-width: 1024px) 100vw, 800px" />
  );
}

function GuideTripPreview({
  activity,
  locale,
  t,
  onViewFull,
}: {
  activity: Omit<ActivityDetail, "id">;
  locale: string;
  t: (key: TranslationKey) => string;
  onViewFull: () => void;
}) {
  const price = activity.priceFrom ?? 0;
  const displayTitle =
    locale === "en" && activity.titleEn?.trim() ? activity.titleEn : activity.title || (locale === "en" ? "Trip title" : "ชื่อทริปจะแสดงที่นี่");
  const displayDesc =
    locale === "en" && activity.descriptionEn?.trim()
      ? activity.descriptionEn
      : activity.description;
  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {activity.image ? (
        <div className="relative h-40 w-full overflow-hidden bg-slate-200">
          <TripPreviewHeroImage
            src={activity.image}
            alt={activity.imageAlt || displayTitle}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div className="space-y-3 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {locale === "en" ? "Live preview" : "ตัวอย่างการ์ดทริป"}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-bold text-slate-900">{displayTitle}</h3>
          {displayDesc ? (
            <p className="mt-1 line-clamp-3 text-xs text-slate-600">{displayDesc}</p>
          ) : null}
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-500">{t("from")}</span>
          <span className="text-base font-bold text-slate-900">{price ? `฿${price.toLocaleString()}` : "฿0"}</span>
        </div>
        {activity.highlights && activity.highlights.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <p className="mb-1 text-xs font-semibold text-slate-800">{t("highlights")}</p>
            <ul className="space-y-1 text-xs text-slate-600">
              {activity.highlights.slice(0, 3).map((h, i) => (
                <li key={i}>• {h}</li>
              ))}
            </ul>
          </div>
        )}
        {activity.included && activity.included.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <p className="mb-1 text-xs font-semibold text-slate-800">{t("included")}</p>
            <ul className="space-y-1 text-[11px] text-slate-600">
              {activity.included.slice(0, 3).map((inc, i) => (
                <li key={i}>✓ {inc}</li>
              ))}
            </ul>
          </div>
        )}
        <button
          type="button"
          onClick={onViewFull}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary/5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <Eye className="h-4 w-4 shrink-0" strokeWidth={2} />
          {locale === "en" ? "Full page preview" : "ดูตัวอย่างเต็มหน้า"}
        </button>
      </div>
    </aside>
  );
}

function FullPreviewOverlay({
  activity,
  onClose,
  locale,
  t,
}: {
  activity: Omit<ActivityDetail, "id">;
  onClose: () => void;
  locale: string;
  t: (key: TranslationKey) => string;
}) {
  const price = activity.priceFrom ?? 0;
  const orig = activity.priceOriginal;
  const displayTitle =
    locale === "en" && activity.titleEn?.trim() ? activity.titleEn : activity.title || (locale === "en" ? "Trip" : "ทริป");
  const displayDesc =
    locale === "en" && activity.descriptionEn?.trim()
      ? activity.descriptionEn
      : activity.description;
  const displayDuration =
    locale === "en" && activity.durationEn?.trim() ? activity.durationEn : activity.duration;
  const cityKey = slugToCityKey[activity.slug];
  const cityName = cityKey ? t(cityKey) : getProvinceBySlug(activity.slug)?.nameTh || activity.slug;
  const itinerary = activity.itinerary ?? [];

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trip-preview-dialog-title"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-slate-900/90 px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
            Preview
          </span>
          <p className="truncate text-sm">
            {locale === "en"
              ? "How this trip may look to visitors (includes unsaved form edits)."
              : "ตัวอย่างหน้าทริปที่นักท่องเที่ยวอาจเห็น (รวมข้อมูลในฟอร์มที่ยังไม่บันทึก)"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
        >
          <X className="h-4 w-4" strokeWidth={2} />
          {locale === "en" ? "Close" : "ปิด"}
        </button>
      </div>

      <div className="min-h-[calc(100vh-3.25rem)] bg-slate-50 py-6 sm:py-8">
        <div className="mx-auto w-full max-w-7xl min-w-0 px-4 sm:px-5 md:px-6 lg:px-8">
          <nav className="hidden py-3 text-sm text-slate-500 sm:block">
            <span className="text-slate-400">{t("home")}</span>
            <span className="mx-2">/</span>
            <span className="text-slate-400">
              {t("explore")} {cityName}
            </span>
            <span className="mx-2">/</span>
            <span id="trip-preview-dialog-title" className="inline-block max-w-[240px] truncate align-bottom text-slate-800">
              {displayTitle}
            </span>
          </nav>

          <div className="rounded-3xl p-0 sm:bg-white sm:p-6 sm:shadow-md">
            <div className="flex flex-col gap-8 lg:flex-row">
              <div className="min-w-0 flex-1">
                <div className="mb-5 flex gap-2 sm:mb-8">
                  <div className="relative aspect-[16/10] w-full flex-1 overflow-hidden rounded-xl bg-slate-200">
                    {activity.image ? (
                      <TripPreviewHeroImage src={activity.image} alt={activity.imageAlt || displayTitle} />
                    ) : null}
                  </div>
                </div>

                <div className="mb-4">
                  {activity.banner ? (
                    <span className="mb-2 inline-block rounded bg-slate-800 px-3 py-1 text-[11px] font-medium text-white sm:text-xs">
                      {activity.banner}
                    </span>
                  ) : null}
                  <h1 className="mb-2 text-xl font-bold text-slate-800 sm:text-2xl lg:text-3xl">{displayTitle}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 sm:text-sm">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">{activity.category}</span>
                    {displayDuration ? (
                      <>
                        <span className="text-slate-400">·</span>
                        <span>{displayDuration}</span>
                      </>
                    ) : null}
                    <span className="text-slate-400">·</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        activity.guideType === "local" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                      }`}
                    >
                      {activity.guideType === "local" ? t("localGuide") : t("generalGuide")}
                    </span>
                  </div>
                  {activity.features && activity.features.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {activity.features.map((f, i) => (
                        <span key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700">
                          {f}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {displayDesc ? (
                  <p className="mb-8 whitespace-pre-wrap text-sm text-slate-700 sm:text-base">{displayDesc}</p>
                ) : null}

                <section className="mb-8">
                  <h2 className="mb-4 text-lg font-bold text-slate-800">{t("aboutThisActivity")}</h2>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" strokeWidth={2} />
                      <div>
                        <p className="font-medium text-slate-800">{t("freeCancellation")}</p>
                        <p className="text-sm text-slate-600">{t("cancelFree24h")}</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" strokeWidth={2} />
                      <div>
                        <p className="font-medium text-slate-800">{t("aboutBookNowTitle")}</p>
                        <p className="text-sm text-slate-600">{t("aboutBookNowText")}</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <Clock className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" strokeWidth={2} />
                      <div>
                        <p className="font-medium text-slate-800">{t("aboutDurationTitle")}</p>
                        <p className="text-sm text-slate-600">
                          {displayDuration || "—"} — {t("aboutDurationText")}
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <UserCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" strokeWidth={2} />
                      <div>
                        <p className="font-medium text-slate-800">{t("aboutGuideTitle")}</p>
                        <p className="text-sm text-slate-600">{t("aboutGuideText")}</p>
                      </div>
                    </li>
                  </ul>
                </section>

                {activity.highlights && activity.highlights.length > 0 && (
                  <section className="mb-8">
                    <h2 className="mb-4 text-lg font-bold text-slate-800">{t("highlights")}</h2>
                    <ul className="list-inside list-disc space-y-1 text-slate-700">
                      {activity.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="mb-8 grid gap-6 sm:grid-cols-2">
                  {activity.included && activity.included.length > 0 && (
                    <div>
                      <h2 className="mb-3 text-lg font-bold text-slate-800">{t("included")}</h2>
                      <ul className="space-y-2">
                        {activity.included.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-slate-700">
                            <span className="text-green-600">✓</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {activity.notIncluded && activity.notIncluded.length > 0 && (
                    <div>
                      <h2 className="mb-3 text-lg font-bold text-slate-800">{t("notIncluded")}</h2>
                      <ul className="space-y-2">
                        {activity.notIncluded.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-slate-700">
                            <span className="text-red-500">✗</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>

                {activity.notSuitableFor && activity.notSuitableFor.length > 0 && (
                  <section className="mb-8">
                    <h2 className="mb-3 text-lg font-bold text-slate-800">{t("notSuitableFor")}</h2>
                    <p className="text-slate-600">{activity.notSuitableFor.join(", ")}</p>
                  </section>
                )}

                {activity.meetingPoint ? (
                  <section className="mb-8">
                    <h2 className="mb-3 text-lg font-bold text-slate-800">{t("meetingPoint")}</h2>
                    <p className="whitespace-pre-wrap text-slate-700">{activity.meetingPoint}</p>
                    {activity.meetingPointMapUrl?.trim() ? (
                      <a
                        href={activity.meetingPointMapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                      >
                        {t("openInMaps")}
                      </a>
                    ) : null}
                  </section>
                ) : null}

                {activity.importantInfo && activity.importantInfo.length > 0 && (
                  <section className="mb-8">
                    <h2 className="mb-4 text-lg font-bold text-slate-800">{t("importantInfo")}</h2>
                    <div className="space-y-4">
                      {activity.importantInfo.map((block, i) => (
                        <div key={i}>
                          <h3 className="mb-2 font-medium text-slate-800">{block.title}</h3>
                          <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                            {block.items.map((item, j) => (
                              <li key={j}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {itinerary.length > 0 && (
                  <section className="mb-4">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                      <Route className="h-5 w-5 text-primary" strokeWidth={2} />
                      {t("itinerary")}
                    </h2>
                    <p className="mb-3 text-xs text-slate-500">
                      {locale === "en"
                        ? "Sample route outline from destination — adjust copy on the live page after publish."
                        : "เส้นทางตัวอย่างตามจังหวัดที่เลือก — ปรับรายละเอียดจริงได้หลังเผยแพร่"}
                    </p>
                    <ol className="space-y-3 border-l-2 border-primary/30 pl-4">
                      {itinerary.map((step, i) => (
                        <li key={i} className="relative">
                          <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                          <p className="font-semibold text-slate-800">
                            {step.titleEn?.trim() || step.title}
                          </p>
                          {(step.detailEn?.trim() || step.detail?.trim()) ? (
                            <p className="text-sm text-slate-600">
                              {step.detailEn?.trim() || step.detail}
                            </p>
                          ) : null}
                          {step.duration ? <p className="text-xs text-slate-500">{step.duration}</p> : null}
                          {step.mapUrl?.trim() ? (
                            <a
                              href={step.mapUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                            >
                              {t("openInMaps")}
                            </a>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  </section>
                )}
              </div>

              <aside className="mt-2 shrink-0 lg:mt-0 lg:w-96">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm lg:bg-white lg:p-6">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                    {locale === "en" ? "Booking preview" : "ตัวอย่างกล่องจอง"}
                  </p>
                  <div className="mb-6 text-2xl font-bold text-slate-800">
                    {t("from")}{" "}
                    {orig && orig > price ? (
                      <>
                        <span className="text-lg font-normal text-slate-400 line-through">฿{orig.toLocaleString()}</span>{" "}
                      </>
                    ) : null}
                    <strong>฿{price.toLocaleString()} THB</strong>{" "}
                    <span className="text-base font-normal text-slate-500">{t("perPerson")}</span>
                  </div>
                  <p className="mb-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
                    {locale === "en"
                      ? "On the live site, guests pick date & party size here."
                      : "ในหน้าจริง ลูกค้าจะเลือกวันที่และจำนวนผู้เดินทางในช่องนี้"}
                  </p>
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-lg bg-slate-200 py-3 text-sm font-semibold text-slate-500"
                  >
                    {locale === "en" ? "Preview only" : "โหมดตัวอย่างเท่านั้น"}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ตัวอย่างรายละเอียดทริป — กรอกเป็นภาษาอังกฤษเท่านั้น (ตรงกับที่แสดงใน /activity/[id]) */
const EXAMPLE_DESCRIPTION_EN =
  "Travel to the destination and experience a variety of tours with local guides. Visit key sights and do activities you enjoy.";
const EXAMPLE_INCLUDED = "Licensed local guide\nAdmission tickets (as listed)\nFree cancellation up to 24h";
const EXAMPLE_NOT_INCLUDED = "Meals and extra drinks\nTips / gratuities";
const EXAMPLE_NOT_SUITABLE = "Guests with severe mobility limitations, wheelchair users (unless arranged)";
const EXAMPLE_MEETING_POINT = "Main meeting point in the city centre (exact details sent after booking)";
const EXAMPLE_IMPORTANT_1_TITLE = "What to bring";
const EXAMPLE_IMPORTANT_1_ITEMS = "Comfortable shoes\nSunglasses\nSunscreen";
const EXAMPLE_IMPORTANT_2_TITLE = "Not allowed";
const EXAMPLE_IMPORTANT_2_ITEMS = "Large suitcases";
const EXAMPLE_HIGHLIGHTS = "Local Thai guide\nSmall-group experience\nIdeal for international visitors";

/** กำหนดการตัวอย่าง — เนื้อหาขั้นตอนเป็นภาษาอังกฤษ (__CITY__ แทนที่เป็นชื่อเมืองอังกฤษตามจังหวัดหลักใน buildTripPayload) */
const EXAMPLE_ITINERARY: ItineraryStep[] = [
  {
    type: "start_pickup",
    title: "",
    titleEn: "Start / pickup location",
    detail: "",
    detailEn: "Depends on the selected option",
    isMainStop: false,
    province: "",
    district: "",
  },
  { type: "travel", title: "", titleEn: "Bus / coach", detail: "", detailEn: "", duration: "About 1 hour", province: "", district: "" },
  {
    type: "rest",
    title: "",
    titleEn: "Rest stop",
    detail: "",
    detailEn: "Break (~15 minutes)",
    isMainStop: false,
    province: "",
    district: "",
  },
  { type: "travel", title: "", titleEn: "Bus / coach", detail: "", detailEn: "", duration: "About 45 minutes", province: "", district: "" },
  {
    type: "activity",
    title: "",
    titleEn: "__CITY__",
    detail: "",
    detailEn: "Guided tour",
    duration: "2 - 3 hours",
    isMainStop: false,
    province: "",
    district: "",
  },
  {
    type: "activity",
    title: "",
    titleEn: "__CITY__",
    detail: "",
    detailEn: "Free time",
    duration: "30 minutes",
    isMainStop: false,
    province: "",
    district: "",
  },
  { type: "travel", title: "", titleEn: "Bus / coach", detail: "", detailEn: "", duration: "About 1 hour", province: "", district: "" },
  {
    type: "drop_off",
    title: "",
    titleEn: "Drop-off",
    detail: "",
    detailEn: "Return to meeting point",
    isMainStop: false,
    province: "",
    district: "",
  },
];

function parseLines(s: string): string[] {
  return s
    .split(/\n|,/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeGalleryImages(images: string[], mainImage: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (url?: string | null) => {
    if (!url) return;
    const u = url.trim();
    if (!u || seen.has(u)) return;
    seen.add(u);
    out.push(u);
  };
  push(mainImage);
  for (const url of images) push(url);
  return out.slice(0, 5);
}

function extractLatLngFromMapUrl(urlRaw: string): { lat: number; lng: number } | null {
  const url = urlRaw.trim();
  if (!url) return null;
  const tryLatLng = (latStr?: string | null, lngStr?: string | null) => {
    if (!latStr || !lngStr) return null;
    const lat = Number(latStr);
    const lng = Number(lngStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
    return { lat, lng };
  };

  try {
    const parsed = new URL(url);
    const q = parsed.searchParams.get("q");
    if (q) {
      const parts = q.split(",");
      if (parts.length >= 2) {
        const point = tryLatLng(parts[0], parts[1]);
        if (point) return point;
      }
    }
    const ll = parsed.searchParams.get("ll");
    if (ll) {
      const parts = ll.split(",");
      if (parts.length >= 2) {
        const point = tryLatLng(parts[0], parts[1]);
        if (point) return point;
      }
    }

    const atMatch = parsed.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (atMatch) {
      const point = tryLatLng(atMatch[1], atMatch[2]);
      if (point) return point;
    }
  } catch {
    // ignore URL parsing error and fallback to regex
  }

  const regexMatch = url.match(/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (regexMatch) return tryLatLng(regexMatch[1], regexMatch[2]);
  return null;
}

function isAllowedGoogleMapsUrl(urlRaw: string): boolean {
  const url = urlRaw.trim();
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ALLOWED_GOOGLE_MAP_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

/** โหลดทริปเก่า: ถ้า itinerary ยังไม่มี province แต่มี placeTags แยก — ผสานเข้าขั้นตอน isMainStop */
function enrichItineraryWithLegacyPlaceTags(
  steps: ItineraryStep[],
  legacyTags: Array<{ name?: string; province?: string; district?: string; googleMapsUrl?: string; slug?: string }>
): ItineraryStep[] {
  const pool = [...legacyTags];
  const takeNameMatch = (title: string) => {
    const idx = pool.findIndex(
      (tag) => typeof tag.name === "string" && tag.name.trim().toLowerCase() === title.trim().toLowerCase()
    );
    if (idx < 0) return undefined;
    const [tag] = pool.splice(idx, 1);
    return tag;
  };
  const takeNext = () => {
    const [tag] = pool.splice(0, 1);
    return tag;
  };

  return steps.map((step) => {
    if (!step.isMainStop || step.province?.trim()) return step;
    const tag = takeNameMatch(step.title) ?? takeNameMatch(step.titleEn ?? "") ?? takeNext();
    if (!tag) return step;
    const province =
      (typeof tag.province === "string" && tag.province.trim()) ||
      (typeof tag.slug === "string" ? provinceSlugToNameTh(tag.slug) : "") ||
      "";
    return {
      ...step,
      province,
      district: typeof tag.district === "string" ? tag.district : step.district || "",
      mapUrl: step.mapUrl?.trim() ? step.mapUrl : typeof tag.googleMapsUrl === "string" ? tag.googleMapsUrl : "",
    };
  });
}

function validateMainMapStops(
  steps: ItineraryStep[],
  tripSlug: string,
  locale: string
): string | null {
  const cityNameEn = tripSlug ? DESTINATION_SLUG_TO_EN[tripSlug] || tripSlug : "";
  for (const step of steps) {
    if (!step.isMainStop) continue;
    const titleInput = (step.titleEn?.trim() || step.title?.trim() || "");
    const titleResolved = (titleInput === "__CITY__" ? cityNameEn : titleInput).trim();
    if (!titleResolved) {
      return locale === "en"
        ? "Each main tour/activity stop on the map needs a title."
        : "กรุณากรอกชื่อรายการสำหรับขั้นตอนที่เป็นจุดหลักบนแผนที่";
    }
    if (!step.province?.trim()) {
      return locale === "en"
        ? "For each main stop shown on the map, select a province."
        : "กรุณาเลือกจังหวัดสำหรับขั้นตอนที่เป็นสถานที่เที่ยว/กิจกรรมหลักบนแผนที่";
    }
  }
  return null;
}

/** สร้าง object ทริปตามโครงสร้าง ActivityDetail ให้ตรงกับ /activity/[id] ทุกฟิลด์ */
function buildTripPayload(
  form: {
    titleEn: string;
    categoryKey: string;
    slug: string;
    durationHours: string;
    priceFrom: string;
    priceOriginal: string;
    featureKeys: FeatureKey[];
    guideType: GuideType;
    image: string;
    imageGallery?: string[];
    imageAlt: string;
    banner: string;
    descriptionEn: string;
    includedText: string;
    notIncludedText: string;
    notSuitableForText: string;
    meetingPoint: string;
    meetingPointMapUrl?: string;
    importantInfo1Title: string;
    importantInfo1Items: string;
    importantInfo2Title: string;
    importantInfo2Items: string;
    highlightsText: string;
    itinerarySteps: ItineraryStep[];
  },
  t: (key: TranslationKey) => string
): Omit<ActivityDetail, "id"> {
  const hours = form.durationHours ? parseInt(form.durationHours, 10) : 0;
  const duration = hours ? `${hours} ชั่วโมง` : "";
  const durationEn = hours ? `${hours} hours` : "";
  const category = CATEGORY_OPTIONS.find((c) => c.key === form.categoryKey)?.label ?? form.categoryKey;
  const features = form.featureKeys
    .map((k) => (featureKeyToTKey[k] ? t(featureKeyToTKey[k]) : ""))
    .filter(Boolean);
  const priceFromNum = form.priceFrom ? parseInt(form.priceFrom, 10) : 0;
  const tripTitle = form.titleEn.trim();
  const cityNameEn = form.slug ? DESTINATION_SLUG_TO_EN[form.slug] || form.slug : "Province";

  const base: Omit<ActivityItem, "id"> = {
    title: tripTitle,
    titleEn: tripTitle || undefined,
    slug: form.slug || "bangkok",
    duration,
    durationEn,
    priceFrom: priceFromNum,
    priceOriginal: form.priceOriginal ? parseInt(form.priceOriginal, 10) : undefined,
    category,
    categoryKey: form.categoryKey || "guided-tour",
    image: form.image || "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80",
    imageGallery:
      form.imageGallery && form.imageGallery.length > 0
        ? normalizeGalleryImages(form.imageGallery, form.image)
        : undefined,
    imageAlt: form.imageAlt || tripTitle,
    rating: 0,
    reviewCount: 0,
    features,
    featureKeys: form.featureKeys.length ? form.featureKeys : undefined,
    guideType: form.guideType || "general",
    guideId: MOCK_GUIDE_ID,
    banner: form.banner || undefined,
  };

  const included = parseLines(form.includedText);
  const notIncluded = parseLines(form.notIncludedText);
  const notSuitableFor = parseLines(form.notSuitableForText);
  const highlights = parseLines(form.highlightsText);
  const importantInfo = [
    { title: form.importantInfo1Title.trim(), items: parseLines(form.importantInfo1Items) },
    { title: form.importantInfo2Title.trim(), items: parseLines(form.importantInfo2Items) },
  ].filter((b) => b.title.length > 0 && b.items.length > 0);

  const itinerary: ItineraryStep[] = form.itinerarySteps.map((step) => {
    const titleInput = (step.titleEn?.trim() || step.title?.trim() || "");
    const resolvedTitle = titleInput === "__CITY__" ? cityNameEn : titleInput;
    const detailInput = (step.detailEn?.trim() || step.detail?.trim() || "");
    return {
      ...step,
      title: resolvedTitle,
      titleEn: resolvedTitle || undefined,
      detail: detailInput || undefined,
      detailEn: detailInput || undefined,
      duration: step.duration?.trim() ? step.duration : undefined,
      mapUrl: step.mapUrl?.trim() ? step.mapUrl : undefined,
      province: step.province?.trim() ? step.province.trim() : undefined,
      district: step.district?.trim() ? step.district.trim() : undefined,
    };
  });

  const placeTagDedupe = new Set<string>();
  const placeTagsFromItinerary = itinerary
    .filter((step) => step.isMainStop)
    .map((step) => {
      const name = step.title.trim() || step.titleEn?.trim() || "";
      const nameEn = step.titleEn?.trim() || undefined;
      const rawProv = step.province?.trim() || "";
      const provMeta =
        getProvinceBySlug(rawProv) ??
        (provinceInputToSlug(rawProv) ? getProvinceBySlug(provinceInputToSlug(rawProv)!) : undefined);
      const provinceLabelTh = provMeta?.nameTh ?? rawProv;
      const provinceSlugResolved = provMeta?.slug ?? provinceInputToSlug(rawProv) ?? form.slug ?? "";
      if (!name || !provinceLabelTh) return null;
      const district = step.district?.trim() || undefined;
      const googleMapsUrl = step.mapUrl?.trim() || undefined;
      const dedupeKey = `${name.toLowerCase()}|${provinceSlugResolved.toLowerCase()}|${(district || "").toLowerCase()}`;
      if (placeTagDedupe.has(dedupeKey)) return null;
      placeTagDedupe.add(dedupeKey);
      const point =
        googleMapsUrl && isAllowedGoogleMapsUrl(googleMapsUrl)
          ? extractLatLngFromMapUrl(googleMapsUrl)
          : null;
      return {
        name,
        nameEn,
        province: provinceLabelTh,
        district,
        googleMapsUrl,
        lat: point?.lat,
        lng: point?.lng,
        slug: provinceSlugResolved || undefined,
      };
    })
    .filter(Boolean)
    .slice(0, PLACE_TAG_LIMIT);

  const tripDescription = form.descriptionEn.trim();
  return {
    ...base,
    /* เก็บข้อความเดียวกันทั้งสองฟิลด์ เพื่อให้หน้า activity ภาษาไทย/อังกฤษยังแสดงคำอธิบายได้ */
    description: tripDescription || undefined,
    descriptionEn: tripDescription || undefined,
    included: included.length ? included : undefined,
    notIncluded: notIncluded.length ? notIncluded : undefined,
    notSuitableFor: notSuitableFor.length ? notSuitableFor : undefined,
    meetingPoint: form.meetingPoint.trim() || undefined,
    meetingPointMapUrl: form.meetingPointMapUrl?.trim() || undefined,
    placeTags:
      placeTagsFromItinerary.length > 0
        ? (placeTagsFromItinerary as Omit<ActivityDetail, "id">["placeTags"])
        : undefined,
    importantInfo: importantInfo.length ? importantInfo : undefined,
    highlights: highlights.length ? highlights : undefined,
    options: undefined,
    itinerary,
  };
}

export default function CreateTripPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [editTripId, setEditTripId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [categoryKey, setCategoryKey] = useState("");
  const [slug, setSlug] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [featureKeys, setFeatureKeys] = useState<FeatureKey[]>([]);
  const [guideType, setGuideType] = useState<GuideType>("general");
  const [image, setImage] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [saveTripError, setSaveTripError] = useState<string | null>(null);
  const [loadTripError, setLoadTripError] = useState<string | null>(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(false);
  const [tripImages, setTripImages] = useState<Array<{ dataUrl: string; fileName: string; s3Key?: string }>>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const mainImageIndexRef = useRef(mainImageIndex);
  const [priceOriginal, setPriceOriginal] = useState("");
  const [banner, setBanner] = useState("");
  const [descriptionEn, setDescriptionEn] = useState(EXAMPLE_DESCRIPTION_EN);
  const [includedText, setIncludedText] = useState(EXAMPLE_INCLUDED);
  const [notIncludedText, setNotIncludedText] = useState(EXAMPLE_NOT_INCLUDED);
  const [notSuitableForText, setNotSuitableForText] = useState(EXAMPLE_NOT_SUITABLE);
  const [meetingPoint, setMeetingPoint] = useState(EXAMPLE_MEETING_POINT);
  const [meetingPointMapUrl, setMeetingPointMapUrl] = useState("");
  const [importantInfo1Title, setImportantInfo1Title] = useState(EXAMPLE_IMPORTANT_1_TITLE);
  const [importantInfo1Items, setImportantInfo1Items] = useState(EXAMPLE_IMPORTANT_1_ITEMS);
  const [importantInfo2Title, setImportantInfo2Title] = useState(EXAMPLE_IMPORTANT_2_TITLE);
  const [importantInfo2Items, setImportantInfo2Items] = useState(EXAMPLE_IMPORTANT_2_ITEMS);
  const [highlightsText, setHighlightsText] = useState(EXAMPLE_HIGHLIGHTS);
  const [itinerarySteps, setItinerarySteps] = useState<ItineraryStep[]>(EXAMPLE_ITINERARY);
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());
  const [serverTrips, setServerTrips] = useState<
    Array<{
      tripId: string;
      isOpen: boolean;
      status: "draft" | "published";
    }>
  >([]);
  const [tripsLoading, setTripsLoading] = useState(!USE_MOCK_TRIPS);
  const [showFullPreview, setShowFullPreview] = useState(false);

  /** 77 จังหวัด + ค่า slug ปัจจุบันที่อาจเป็น legacy (เช่น pattaya) */
  const provinceSelectOptions = useMemo(() => {
    const cur = slug.trim();
    const list = [...THAILAND_PROVINCES];
    if (cur && !list.some((p) => p.slug === cur)) {
      const extra = getProvinceBySlug(cur);
      if (extra) return [extra, ...list.filter((p) => p.slug !== extra.slug)];
      return [{ slug: cur, nameTh: cur, nameEn: cur }, ...list];
    }
    return list;
  }, [slug]);

  useEffect(() => {
    mainImageIndexRef.current = mainImageIndex;
  }, [mainImageIndex]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const tripIdFromQuery = url.searchParams.get("tripId")?.trim() || "";
    setEditTripId(tripIdFromQuery);
  }, []);

  useEffect(() => {
    if (!editTripId) return;

    (async () => {
      try {
        setIsLoadingTrip(true);
        setLoadTripError(null);
        const res = await fetch("/api/guides/me/trips", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !Array.isArray(data?.trips)) {
          setLoadTripError(locale === "en" ? "Failed to load trip data for editing." : "ไม่สามารถโหลดข้อมูลทริปเพื่อแก้ไขได้");
          return;
        }

        const trip = data.trips.find((x: { tripId?: string }) => x?.tripId === editTripId);
        if (!trip) {
          setLoadTripError(locale === "en" ? "Trip not found for editing." : "ไม่พบทริปที่ต้องการแก้ไข");
          return;
        }

        {
          const tEn = typeof trip.titleEn === "string" ? trip.titleEn.trim() : "";
          const tTh = typeof trip.title === "string" ? trip.title.trim() : "";
          setTitleEn(tEn || tTh || "");
        }
        setCategoryKey(typeof trip.categoryKey === "string" ? trip.categoryKey : "");
        setSlug(typeof trip.slug === "string" ? trip.slug : "");
        setDurationHours(typeof trip.duration === "string" ? String(parseInt(trip.duration, 10) || "") : "");
        setPriceFrom(typeof trip.priceFrom === "number" ? String(trip.priceFrom) : "");
        setPriceOriginal(typeof trip.priceOriginal === "number" ? String(trip.priceOriginal) : "");
        setFeatureKeys(Array.isArray(trip.featureKeys) ? trip.featureKeys : []);
        setGuideType(trip.guideType === "local" ? "local" : "general");
        setImage(typeof trip.image === "string" ? trip.image : "");
        setImageAlt(typeof trip.imageAlt === "string" ? trip.imageAlt : "");
        setBanner(typeof trip.banner === "string" ? trip.banner : "");
        {
          const dEn = typeof trip.descriptionEn === "string" ? trip.descriptionEn.trim() : "";
          const dTh = typeof trip.description === "string" ? trip.description.trim() : "";
          setDescriptionEn(dEn || dTh || "");
        }
        setIncludedText(Array.isArray(trip.included) ? trip.included.join("\n") : "");
        setNotIncludedText(Array.isArray(trip.notIncluded) ? trip.notIncluded.join("\n") : "");
        setNotSuitableForText(Array.isArray(trip.notSuitableFor) ? trip.notSuitableFor.join(", ") : "");
        setMeetingPoint(typeof trip.meetingPoint === "string" ? trip.meetingPoint : "");
        setMeetingPointMapUrl(typeof trip.meetingPointMapUrl === "string" ? trip.meetingPointMapUrl : "");
        setHighlightsText(Array.isArray(trip.highlights) ? trip.highlights.join("\n") : "");

        const info1 = Array.isArray(trip.importantInfo) ? trip.importantInfo[0] : null;
        const info2 = Array.isArray(trip.importantInfo) ? trip.importantInfo[1] : null;
        setImportantInfo1Title(typeof info1?.title === "string" ? info1.title : "");
        setImportantInfo1Items(Array.isArray(info1?.items) ? info1.items.join("\n") : "");
        setImportantInfo2Title(typeof info2?.title === "string" ? info2.title : "");
        setImportantInfo2Items(Array.isArray(info2?.items) ? info2.items.join("\n") : "");

        const incomingImages =
          Array.isArray(trip.imageGallery) && trip.imageGallery.length > 0
            ? trip.imageGallery
            : (typeof trip.image === "string" && trip.image ? [trip.image] : []);
        const uniqueImages = Array.from(
          new Set(
            incomingImages.filter((u: unknown): u is string => typeof u === "string" && u.trim().length > 0)
          )
        );
        const mappedImages = uniqueImages.slice(0, 5).map((url, idx) => ({
          dataUrl: String(url),
          fileName: `trip-image-${idx + 1}`,
        }));
        setTripImages(mappedImages);
        setMainImageIndex(0);
        if (mappedImages[0]?.dataUrl) setImage(mappedImages[0].dataUrl);

        if (Array.isArray(trip.itinerary) && trip.itinerary.length > 0) {
          const rawSteps = trip.itinerary
            .map((step: Partial<ItineraryStep>) => ({
              type:
                step.type === "start_pickup" || step.type === "travel" || step.type === "activity" || step.type === "rest" || step.type === "drop_off"
                  ? step.type
                  : "travel",
              title: "",
              titleEn: (() => {
                const a = typeof step.titleEn === "string" ? step.titleEn.trim() : "";
                const b = typeof step.title === "string" ? step.title.trim() : "";
                return a || b;
              })(),
              detail: "",
              detailEn: (() => {
                const a = typeof step.detailEn === "string" ? step.detailEn.trim() : "";
                const b = typeof step.detail === "string" ? step.detail.trim() : "";
                return a || b;
              })(),
              duration: typeof step.duration === "string" ? step.duration : "",
              isMainStop: Boolean(step.isMainStop),
              mapUrl: typeof step.mapUrl === "string" ? step.mapUrl : "",
              province: (() => {
                const p = typeof step.province === "string" ? step.province.trim() : "";
                if (!p) return "";
                if (getProvinceBySlug(p)) return p;
                return provinceInputToSlug(p) ?? "";
              })(),
              district: typeof step.district === "string" ? step.district : "",
            }))
            .slice(0, 10);
          const legacyTags = Array.isArray(trip.placeTags) ? trip.placeTags : [];
          setItinerarySteps(enrichItineraryWithLegacyPlaceTags(rawSteps, legacyTags));
        }
      } catch {
        setLoadTripError(locale === "en" ? "Failed to load trip data for editing." : "ไม่สามารถโหลดข้อมูลทริปเพื่อแก้ไขได้");
      } finally {
        setIsLoadingTrip(false);
      }
    })();
  }, [editTripId, locale]);

  useEffect(() => {
    if (USE_MOCK_TRIPS) {
      setClosedIds(loadClosedIds());
      return;
    }

    (async () => {
      try {
        setTripsLoading(true);
        const res = await fetch("/api/guides/me/trips", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(data?.trips)) {
          setServerTrips(data.trips);
        } else {
          setServerTrips([]);
        }
      } catch {
        setServerTrips([]);
      } finally {
        setTripsLoading(false);
      }
    })();
  }, []);

  const mockTrips = useMemo(() => getAllActivities().filter((a) => a.guideId === MOCK_GUIDE_ID), []);
  const openCount = USE_MOCK_TRIPS
    ? mockTrips.length - closedIds.size
    : serverTrips.filter((t) => Boolean(t.isOpen)).length;
  const canPublish = !tripsLoading && openCount < MAX_OPEN_TRIPS;

  const previewActivity = useMemo(
    () =>
      buildTripPayload(
        {
          titleEn,
          categoryKey,
          slug,
          durationHours,
          priceFrom,
          priceOriginal,
          featureKeys,
          guideType,
          image,
          imageGallery: tripImages.map((x) => x.dataUrl).filter(Boolean),
          imageAlt: imageAlt || titleEn,
          banner,
          descriptionEn,
          includedText,
          notIncludedText,
          notSuitableForText,
          meetingPoint,
          meetingPointMapUrl,
          importantInfo1Title,
          importantInfo1Items,
          importantInfo2Title,
          importantInfo2Items,
          highlightsText,
          itinerarySteps,
        },
        t
      ),
    [
      titleEn,
      categoryKey,
      slug,
      durationHours,
      priceFrom,
      priceOriginal,
      featureKeys,
      guideType,
      image,
      tripImages,
      imageAlt,
      banner,
      descriptionEn,
      includedText,
      notIncludedText,
      notSuitableForText,
      meetingPoint,
      meetingPointMapUrl,
      importantInfo1Title,
      importantInfo1Items,
      importantInfo2Title,
      importantInfo2Items,
      highlightsText,
      itinerarySteps,
      t,
    ]
  );

  const toggleFeature = (key: FeatureKey) => {
    setFeatureKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const ITINERARY_TYPE_OPTIONS: Array<{
    value: ItineraryStep["type"];
    th: string;
    en: string;
  }> = [
    { value: "start_pickup", th: "จุดรับ / เริ่มต้น", en: "Start / pickup" },
    { value: "travel", th: "การเดินทาง", en: "Travel" },
    { value: "activity", th: "กิจกรรม", en: "Activity" },
    { value: "rest", th: "พักระหว่างทาง", en: "Rest stop" },
    { value: "drop_off", th: "จุดส่ง / ปิดทริป", en: "Drop-off" },
  ];

  const updateItineraryStep = (idx: number, patch: Partial<ItineraryStep>) => {
    setItinerarySteps((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    );
  };

  const addItineraryStep = () => {
    setItinerarySteps((prev) => {
      if (prev.length >= 10) return prev;
      return [
        ...prev,
        {
          type: "travel",
          title: "",
          titleEn: "",
          detail: "",
          detailEn: "",
          duration: "",
          isMainStop: false,
          mapUrl: "",
          province: "",
          district: "",
        },
      ];
    });
  };

  const removeItineraryStep = (idx: number) => {
    setItinerarySteps((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  };

  const MAX_TRIP_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
  async function handleTripImagesFilesChange(files: FileList | null) {
    setImageUploadError(null);
    if (!files || files.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    const incoming: File[] = Array.from(files);

    // Validate all files first (fail fast)
    for (const f of incoming) {
      if (!allowedTypes.includes(f.type)) {
        setImageUploadError("รองรับเฉพาะไฟล์ JPEG หรือ PNG เท่านั้น");
        return;
      }
      if (f.size > MAX_TRIP_IMAGE_BYTES) {
        setImageUploadError("ขนาดไฟล์สูงสุด 5MB");
        return;
      }
    }

    const slotsLeft = Math.max(0, 5 - tripImages.length);
    const sliced = slotsLeft > 0 ? incoming.slice(0, slotsLeft) : [];

    if (incoming.length > slotsLeft) {
      setImageUploadError("อัปโหลดได้สูงสุด 5 รูป");
    }
    if (sliced.length === 0) return;

    const readAsDataUrl = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

    const newItems = await Promise.all(
      sliced.map(async (f) => ({
        dataUrl: await readAsDataUrl(f),
        fileName: f.name,
      }))
    );

    const existing = tripImages;
    const existingLen = existing.length;
    const next = [...existing, ...newItems];
    const nextMainIndex = existingLen; // auto-select first newly uploaded

    setTripImages(next);
    setMainImageIndex(nextMainIndex);
    setImage(next[nextMainIndex]?.dataUrl ?? "");

    if (!imageAlt.trim()) {
      const fileName = next[nextMainIndex]?.fileName ?? "";
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
      if (nameWithoutExt) setImageAlt(nameWithoutExt);
    }

    // Upload to S3 via Next.js proxy (preview จะเปลี่ยนเป็น URL เมื่ออัปโหลดสำเร็จ)
    // Note: แม้ preview ตอนแรกจะเป็น dataUrl แต่ถ้าอัปโหลดสำเร็จ เราจะสลับเป็น URL ทันที
    void (async () => {
      try {
        const fd = new FormData();
        sliced.forEach((f) => fd.append("files", f, f.name));

        const res = await fetch("/api/trips/upload", {
          method: "POST",
          body: fd,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = typeof data?.error === "string" ? data.error : "อัปโหลดรูปทริปไม่สำเร็จ";
          setImageUploadError(msg);
          return;
        }

        const images = Array.isArray(data?.images) ? data.images : [];
        if (images.length === 0) return;

        // Ensure we can map by index (0..n-1)
        const imageByIndex = new Map<number, { url: string; key: string }>();
        for (const it of images) {
          const idx = typeof it?.index === "number" ? it.index : undefined;
          if (idx == null) continue;
          const url = typeof it?.url === "string" ? it.url : "";
          const key = typeof it?.key === "string" ? it.key : "";
          if (!url) continue;
          imageByIndex.set(idx, { url, key });
        }

        const newLen = sliced.length;
        setTripImages((prev) =>
          prev.map((img, idx) => {
            if (idx < existingLen || idx >= existingLen + newLen) return img;
            const byLocalIndex = idx - existingLen;
            const uploaded = imageByIndex.get(byLocalIndex);
            if (!uploaded) return img;
            return {
              ...img,
              dataUrl: uploaded.url,
              s3Key: uploaded.key || img.s3Key,
            };
          })
        );

        const currentMain = mainImageIndexRef.current;
        if (currentMain >= existingLen && currentMain < existingLen + sliced.length) {
          const byLocalIndex = currentMain - existingLen;
          const uploaded = imageByIndex.get(byLocalIndex);
          if (uploaded?.url) setImage(uploaded.url);
        }
      } catch {
        // keep local preview (dataUrl) if upload failed
        setImageUploadError("เกิดข้อผิดพลาดในการอัปโหลดรูปทริป");
      }
    })();
  }

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveTripError(null);
    const payload = buildTripPayload(
      {
        titleEn,
        categoryKey,
        slug,
        durationHours,
        priceFrom,
        priceOriginal,
        featureKeys,
        guideType,
        image,
        imageGallery: tripImages.map((x) => x.dataUrl).filter(Boolean),
        imageAlt: imageAlt || titleEn,
        banner,
        descriptionEn,
        includedText,
        notIncludedText,
        notSuitableForText,
        meetingPoint,
        meetingPointMapUrl,
        importantInfo1Title,
        importantInfo1Items,
        importantInfo2Title,
        importantInfo2Items,
        highlightsText,
        itinerarySteps,
      },
      t
    );

    if (USE_MOCK_TRIPS) {
      console.log("Draft trip (mock):", payload);
      router.push("/guide-manager");
      return;
    }

    (async () => {
      try {
        const endpoint = editTripId ? `/api/guides/me/trips/${encodeURIComponent(editTripId)}` : "/api/guides/me/trips";
        const method = editTripId ? "PUT" : "POST";
        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "draft", trip: payload }),
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = typeof data?.error === "string" ? data.error : "บันทึกร่างไม่สำเร็จ";
          setSaveTripError(msg);
          return;
        }
        router.push("/guide-manager");
      } catch {
        setSaveTripError("เกิดข้อผิดพลาดในการบันทึกร่าง");
      }
    })();
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) return;
    setSaveTripError(null);
    const mainStopErr = validateMainMapStops(itinerarySteps, slug, locale);
    if (mainStopErr) {
      setSaveTripError(mainStopErr);
      return;
    }
    const payload = buildTripPayload(
      {
        titleEn,
        categoryKey,
        slug,
        durationHours,
        priceFrom,
        priceOriginal,
        featureKeys,
        guideType,
        image,
        imageGallery: tripImages.map((x) => x.dataUrl).filter(Boolean),
        imageAlt: imageAlt || titleEn,
        banner,
        descriptionEn,
        includedText,
        notIncludedText,
        notSuitableForText,
        meetingPoint,
        meetingPointMapUrl,
        importantInfo1Title,
        importantInfo1Items,
        importantInfo2Title,
        importantInfo2Items,
        highlightsText,
        itinerarySteps,
      },
      t
    );

    if (USE_MOCK_TRIPS) {
      console.log("Publish trip (mock):", payload);
      router.push("/guide-manager");
      return;
    }

    (async () => {
      try {
        const endpoint = editTripId ? `/api/guides/me/trips/${encodeURIComponent(editTripId)}` : "/api/guides/me/trips";
        const method = editTripId ? "PUT" : "POST";
        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "published", trip: payload }),
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = typeof data?.error === "string" ? data.error : "เผยแพร่ทริปไม่สำเร็จ";
          setSaveTripError(msg);
          return;
        }
        router.push("/guide-manager");
      } catch {
        setSaveTripError("เกิดข้อผิดพลาดในการเผยแพร่ทริป");
      }
    })();
  };

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200/90 bg-white/95 px-4 py-5 shadow-sm backdrop-blur-md md:px-10">
        <div className="mx-auto max-w-6xl min-w-0 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/90">
            {editTripId ? "แก้ไขรายการทริป" : "สร้างรายการทริป"}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {editTripId ? "แก้ไขทริป" : "สร้างหรือแก้ไขทริป"}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            กรอกข้อมูลให้ครบถ้วนเพื่อให้หน้าแสดงผลสวยและค้นหาเจอ — ทริปที่เปิดรับจองพร้อมกันได้สูงสุด{" "}
            <span className="font-semibold text-slate-800">{MAX_OPEN_TRIPS}</span> รายการ
          </p>
          <p className="pt-2 text-xs text-slate-500">
            {locale === "en"
              ? "Use Preview at the bottom or in the side panel before saving."
              : "ใช้ปุ่ม «ดูตัวอย่าง» ด้านล่างหรือในแผงด้านข้างก่อนบันทึก"}
          </p>
        </div>
      </header>

      <div className="p-6 md:p-10 max-w-6xl mx-auto">
        {saveTripError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-sm text-red-800">{saveTripError}</div>
          </div>
        )}
        {isLoadingTrip && (
          <div className="mb-6 p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-sm text-sky-800">{locale === "en" ? "Loading trip data for editing..." : "กำลังโหลดข้อมูลทริปสำหรับการแก้ไข..."}</div>
          </div>
        )}
        {loadTripError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-sm text-red-800">{loadTripError}</div>
          </div>
        )}
        {!tripsLoading && !canPublish && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">เปิดทริปครบ {MAX_OPEN_TRIPS} ทริปแล้ว</p>
              <p className="text-amber-700 mt-0.5">
                กรุณาปิดรับจองอย่างน้อย 1 ทริปในหน้า{" "}
                <Link href="/guide-manager" className="underline font-semibold">ทริปของฉัน</Link> ก่อนจึงจะเผยแพร่ทริปใหม่ได้
              </p>
            </div>
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50/90 p-4 text-sm text-sky-950 md:p-5">
          <p className="font-semibold text-sky-900">ภาษาสำหรับนักท่องเที่ยวต่างชาติ</p>
          <p className="mt-1.5 leading-relaxed text-sky-900/90">
            ทุกอย่างที่ลูกค้าเห็นบนหน้าทริป (ชื่อทริป คำอธิบาย ไฮไลท์ รายการรวม/ไม่รวม จุดนัดพบ และทุกขั้นตอนในกำหนดการ)
            กรุณาเขียนเป็นภาษาอังกฤษเท่านั้น — ส่วนหัวเมนูและคำอธิบายฟอร์มด้านล่างยังเป็นภาษาไทยเพื่อให้ไกด์ใช้งานง่าย
          </p>
        </div>

        <div className="lg:flex lg:items-start lg:gap-8">
          <form className="space-y-8 lg:flex-1 lg:min-w-0">
          <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
              <span className="size-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <PenLine className="w-4 h-4" strokeWidth={2} />
              </span>
              รายละเอียดทริป
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">ชื่อทริป (ภาษาอังกฤษเท่านั้น) *</label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Grand Palace & Temple Tour"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="mt-1 text-xs text-slate-500">ชื่อนี้แสดงต่อนักท่องเที่ยวบนเว็บ — เขียนเป็นภาษาอังกฤษทั้งหมด</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">หมวดหมู่ *</label>
                <select
                  value={categoryKey}
                  onChange={(e) => setCategoryKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">ใช้จัดกลุ่มในหน้าค้นหาและแคตตาล็อก — เลือกให้ตรงกับธีมทริป</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
              <span className="size-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4" strokeWidth={2} />
              </span>
              ตั้งค่าทริป
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">ราคาต่อคน (บาท) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">฿</span>
                  <input
                    type="number"
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">ราคาที่ลูกค้าเห็นเป็นจุดเริ่มต้น (ต่อท่าน)</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">ราคาเดิม (บาท) ไม่บังคับ</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">฿</span>
                  <input
                    type="number"
                    value={priceOriginal}
                    onChange={(e) => setPriceOriginal(e.target.value)}
                    placeholder="Optional"
                    min={0}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">ถ้ามี ระบบจะแสดงเป็นราคาเดิมแบบขีดฆ่าคู่กับโปรโมชัน</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">ระยะเวลา (ชั่วโมง) *</label>
                <input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  placeholder="เช่น 4"
                  min={1}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-slate-400 mt-1">จะแสดงเป็น &quot;X ชั่วโมง&quot; / &quot;X hours&quot;</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Main province of this trip (all 77 provinces) *
                </label>
                <select
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="">Select province</option>
                  {provinceSelectOptions.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.nameTh} ({r.nameEn})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Used for grouping, map fallback, and replacing <code className="rounded bg-slate-100 px-1">__CITY__</code> in
                  the itinerary with the English province name.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold mb-2 text-slate-700">ประเภทไกด์</label>
                <select
                  value={guideType}
                  onChange={(e) => setGuideType(e.target.value as GuideType)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="general">ไกด์ทั่วไป (General)</option>
                  <option value="local">ไกด์ท้องถิ่น (Local)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">แบนเนอร์ (banner)</label>
                <input
                  type="text"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  placeholder="Optional banner text (English)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span className="size-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <Tag className="w-4 h-4" strokeWidth={2} />
              </span>
              จุดเด่นทริป (featureKeys)
            </h3>
            <p className="text-sm text-slate-500 mb-4">เลือกได้หลายข้อ ตรงกับ featureKeys ในระบบ</p>
            <div className="flex flex-wrap gap-2">
              {FEATURE_KEYS.map((key) => {
                const tKey = featureKeyToTKey[key];
                const label = tKey ? t(tKey) : key;
                const checked = featureKeys.includes(key);
                return (
                  <label
                    key={key}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      checked
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-slate-200 text-slate-600 hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFeature(key)}
                      className="sr-only"
                    />
                    {label}
                  </label>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span className="size-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <ImagePlus className="w-4 h-4" strokeWidth={2} />
              </span>
              รูปภาพทริป
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">อัปโหลดรูปหลัก (JPEG/PNG)</label>
                <div className="p-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={(e) => {
                      void handleTripImagesFilesChange(e.currentTarget.files);
                      // allow re-selecting the same file
                      e.currentTarget.value = "";
                    }}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/15"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    รองรับเฉพาะ `jpeg/png` ขนาดไม่เกิน 5MB ต่อไฟล์ และอัปโหลดได้สูงสุด 5 รูป
                  </p>
                  {imageUploadError && <p className="text-xs text-red-600 mt-2">{imageUploadError}</p>}

                  {tripImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-slate-600 mb-2">เลือก “รูปหลัก” จาก thumbnail</p>
                      <div className="grid grid-cols-5 gap-2">
                        {tripImages.map((img, idx) => {
                          const isMain = idx === mainImageIndex;
                          return (
                            <button
                              key={`${img.fileName}-${idx}`}
                              type="button"
                              onClick={() => {
                                setMainImageIndex(idx);
                                setImage(img.dataUrl);
                                if (!imageAlt.trim()) {
                                  const nameWithoutExt = img.fileName.replace(/\.[^/.]+$/, "");
                                  if (nameWithoutExt) setImageAlt(nameWithoutExt);
                                }
                              }}
                              className={`relative rounded-xl overflow-hidden border transition-colors ${
                                isMain ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/40"
                              }`}
                              aria-label={`เลือกภาพหลัก ${idx + 1}`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.dataUrl} alt="" className="w-full h-20 object-cover" />
                              {isMain && (
                                <span className="absolute top-2 left-2 text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                                  หลัก
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">คำอธิบายรูป (imageAlt — ภาษาอังกฤษ)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="e.g. Grand Palace facade"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </section>

          {/* Public trip copy — English only */}
          <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-slate-800">
              <span className="size-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                <PenLine className="w-4 h-4" strokeWidth={2} />
              </span>
              Extra details (English only)
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              All fields in this section appear on the public trip page — write everything in English for international guests.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Trip description (English only)</label>
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder={EXAMPLE_DESCRIPTION_EN}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Same text is used for both site languages; keep it clear and in English.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700">What&apos;s included (one line per item)</label>
                  <textarea
                    value={includedText}
                    onChange={(e) => setIncludedText(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700">What&apos;s not included</label>
                  <textarea
                    value={notIncludedText}
                    onChange={(e) => setNotIncludedText(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">
                  Not suitable for (comma or newline separated)
                </label>
                <input
                  type="text"
                  value={notSuitableForText}
                  onChange={(e) => setNotSuitableForText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Meeting point (English)</label>
                <input
                  type="text"
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Google Maps URL for meeting point (optional)</label>
                <input
                  type="text"
                  value={meetingPointMapUrl}
                  onChange={(e) => setMeetingPointMapUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://www.google.com/maps?q=..."
                />
                {meetingPointMapUrl.trim() ? (
                  <a
                    href={meetingPointMapUrl.trim()}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    {t("openInMaps")}
                  </a>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Highlights (one line per bullet)</label>
                <textarea
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-bold text-slate-700 mb-3">Important information (two blocks, English only)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      value={importantInfo1Title}
                      onChange={(e) => setImportantInfo1Title(e.target.value)}
                      placeholder="e.g. What to bring"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-2"
                    />
                    <textarea
                      value={importantInfo1Items}
                      onChange={(e) => setImportantInfo1Items(e.target.value)}
                      rows={3}
                      placeholder="One line per item"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={importantInfo2Title}
                      onChange={(e) => setImportantInfo2Title(e.target.value)}
                      placeholder="e.g. Not allowed"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-2"
                    />
                    <textarea
                      value={importantInfo2Items}
                      onChange={(e) => setImportantInfo2Items(e.target.value)}
                      rows={3}
                      placeholder="One line per item"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* กำหนดการเดินทาง */}
          <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-slate-800">
              <span className="size-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <Route className="w-4 h-4" strokeWidth={2} />
              </span>
              Itinerary
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Add steps in order. Turn on &quot;Main tour / activity on map&quot; for stops that should appear as pins on the
              Explore map (max {PLACE_TAG_LIMIT}). Use English for every field. Place search is English-only (OpenStreetMap).
            </p>

            <div className="space-y-4">
              {itinerarySteps.map((step, idx) => {
                const mainMapCount = itinerarySteps.filter((s) => s.isMainStop).length;
                return (
                  <div
                    key={`${step.type}-${idx}`}
                    className={`rounded-2xl border p-4 shadow-sm transition-colors ${
                      step.isMainStop
                        ? "border-amber-300/90 bg-gradient-to-br from-amber-50 via-amber-50/90 to-amber-100/25 ring-1 ring-amber-200/70"
                        : "border-slate-200 bg-slate-50/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        {step.isMainStop ? (
                          <span className="inline-flex max-w-full items-center rounded-full border border-amber-400/50 bg-amber-300/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                            Main tour / activity (shown on map)
                          </span>
                        ) : null}
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
                          {ITINERARY_TYPE_OPTIONS.find((o) => o.value === step.type)?.en}
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {step.titleEn?.trim() || step.title?.trim()
                            ? step.titleEn?.trim() || step.title
                            : "Untitled step"}
                        </p>
                      </div>
                      {itinerarySteps.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeItineraryStep(idx)}
                          className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-700">Step type</label>
                        <select
                          value={step.type}
                          onChange={(e) =>
                            updateItineraryStep(idx, { type: e.target.value as ItineraryStep["type"] })
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          {ITINERARY_TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.en}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(step.isMainStop)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const fallbackProvSlug = slug?.trim() || "";
                              updateItineraryStep(idx, {
                                isMainStop: checked,
                                ...(checked && !step.province?.trim() && fallbackProvSlug
                                  ? { province: fallbackProvSlug }
                                  : {}),
                              });
                            }}
                          />
                          Main tour / activity on map
                        </label>
                      </div>
                    </div>
                    {step.isMainStop ? (
                      <p className="mt-2 text-[11px] text-amber-900/80">
                        Map pins from itinerary: {mainMapCount} / {PLACE_TAG_LIMIT}
                      </p>
                    ) : null}

                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-700">Step title (English only)</label>
                        <input
                          type="text"
                          value={step.titleEn ?? ""}
                          onChange={(e) => updateItineraryStep(idx, { title: "", titleEn: e.target.value })}
                          placeholder="e.g. Grand Palace"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <p className="mt-1 text-[11px] text-slate-500">
                          Use <code className="rounded bg-slate-100 px-1">__CITY__</code> to insert the English province name of
                          the trip&apos;s main province.
                        </p>
                      </div>

                      {step.isMainStop ? (
                        <>
                          <ItineraryPlaceSearch
                            onApply={(p) => {
                              const fallbackProvSlug = slug?.trim() || "";
                              const provFromSearch = provinceInputToSlug(p.province?.trim() ?? "") ?? "";
                              updateItineraryStep(idx, {
                                isMainStop: true,
                                title: "",
                                titleEn: p.title,
                                mapUrl: p.mapUrl ?? step.mapUrl,
                                province: provFromSearch || step.province?.trim() || fallbackProvSlug,
                                district: (p.district && p.district.trim()) || step.district,
                              });
                            }}
                          />
                          <p className="text-[11px] text-slate-500">
                            If the picked label is not clear in English, edit the step title above before saving.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold mb-2 text-slate-700">Province (77) *</label>
                              <select
                                value={step.province ?? ""}
                                onChange={(e) => updateItineraryStep(idx, { province: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              >
                                <option value="">Select province</option>
                                {THAILAND_PROVINCES.map((r) => (
                                  <option key={`it-prov-${r.slug}`} value={r.slug}>
                                    {r.nameTh} ({r.nameEn})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold mb-2 text-slate-700">District (optional)</label>
                              <input
                                type="text"
                                value={step.district ?? ""}
                                onChange={(e) => updateItineraryStep(idx, { district: e.target.value })}
                                placeholder="e.g. Phra Nakhon"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              />
                            </div>
                          </div>
                        </>
                      ) : null}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold mb-2 text-slate-700">Duration (optional)</label>
                          <input
                            type="text"
                            value={step.duration ?? ""}
                            onChange={(e) => updateItineraryStep(idx, { duration: e.target.value })}
                            placeholder="e.g. 2 hours"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-2 text-slate-700">
                            Map link (optional — Google Maps URL)
                          </label>
                          <input
                            type="text"
                            value={step.mapUrl ?? ""}
                            onChange={(e) => updateItineraryStep(idx, { mapUrl: e.target.value })}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-2 text-slate-700">Step details (English only)</label>
                        <textarea
                          value={step.detailEn ?? ""}
                          onChange={(e) => updateItineraryStep(idx, { detail: "", detailEn: e.target.value })}
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="One or two sentences for this step."
                        />
                        {step.mapUrl?.trim() ? (
                          <a
                            href={step.mapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                          >
                            Open map link
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addItineraryStep}
                disabled={itinerarySteps.length >= 10}
                className="w-full rounded-2xl border border-dashed border-slate-300 bg-white py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Add itinerary step
              </button>
            </div>
          </section>

          <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/guide-manager"
              className="inline-flex items-center gap-2 font-semibold text-slate-500 transition-colors hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              กลับไปทริปของฉัน
            </Link>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowFullPreview(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm hover:border-primary/40 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                {locale === "en" ? "Preview" : "ดูตัวอย่าง"}
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                บันทึกแบบร่าง
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={!canPublish}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                เผยแพร่ทริป
              </button>
            </div>
          </div>
        </form>

        </div>
      </div>
      {showFullPreview && (
        <FullPreviewOverlay
          activity={previewActivity}
          locale={locale}
          t={t}
          onClose={() => setShowFullPreview(false)}
        />
      )}
    </>
  );
}
