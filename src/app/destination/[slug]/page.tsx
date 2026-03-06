"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActivityCard from "@/components/ActivityCard";
import {
  FILTER_CATEGORIES,
  getFilteredActivities,
} from "@/data/activities";
import { useTranslation } from "@/context/LocaleContext";
import { filterKeyToTKey, slugToCityKey } from "@/i18n/translations";

type FilterKey = (typeof FILTER_CATEGORIES)[number]["key"];
const VALID_FILTERS = new Set<FilterKey>(FILTER_CATEGORIES.map((f) => f.key));

export default function DestinationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || "";
  const filterFromUrl = searchParams?.get("filter") ?? "";
  const initialFilter: FilterKey = VALID_FILTERS.has(filterFromUrl as FilterKey) ? (filterFromUrl as FilterKey) : "all";
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>(initialFilter);

  useEffect(() => {
    if (VALID_FILTERS.has(filterFromUrl as FilterKey)) setSelectedFilter(filterFromUrl as FilterKey);
  }, [filterFromUrl]);

  const cityName = useMemo(() => {
    const key = slugToCityKey[slug];
    return key ? t(key) : slug;
  }, [slug, t]);

  const activities = useMemo(
    () => getFilteredActivities(slug, selectedFilter),
    [slug, selectedFilter]
  );

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 w-full min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              {t("explore")} {cityName}
            </h1>
          </div>

          {/* แถบตัวกรอง – ใช้สไตล์เหมือนลิสต์บนหน้าแรก (เลื่อนซ้าย‑ขวาได้ทุกขนาดจอ) */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="-mx-4 px-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scroll-smooth">
                {/* ปุ่มไอคอนตัวกรอง */}
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/90 text-slate-600 shadow-sm shrink-0"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h18M6 8h12M9 12h6M11 16h2"
                    />
                  </svg>
                </button>

                {/* ปุ่มตัวกรองเลื่อนซ้าย‑ขวา */}
                {FILTER_CATEGORIES.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setSelectedFilter(f.key)}
                    className={`shrink-0 min-w-[110px] text-center px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedFilter === f.key
                        ? "bg-primary text-white"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {t(filterKeyToTKey[f.key] ?? "filterAll")}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-500">
              {activities.length}+ {t("resultsCount")}: {cityName}
            </p>
          </div>

          {/* ลิสต์ทริป */}
          {activities.length > 0 ? (
            <>
              {/* มือถือ: การ์ดแนวนอน รูปซ้าย ข้อความขวา */}
              <div className="sm:hidden space-y-3">
                {activities.map((a) => (
                  <Link
                    key={a.id}
                    href={`/activity/${a.id}`}
                    className="flex gap-3 items-stretch rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative w-28 shrink-0 overflow-hidden">
                      <Image
                        src={a.image}
                        alt={a.imageAlt}
                        width={140}
                        height={110}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 py-2 pr-3 min-w-0 flex flex-col justify-between">
                      <div>
                        {a.category && (
                          <p className="text-[11px] text-slate-500 mb-0.5">
                            {a.category}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1 mb-1">
                          {a.title}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {a.duration}
                          {a.features && a.features.length > 0
                            ? ` · ${a.features[0]}`
                            : ""}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-0.5 text-amber-600 text-[11px]">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{a.rating}</span>
                          <span className="text-slate-400">
                            ({a.reviewCount.toLocaleString()})
                          </span>
                        </span>
                        <div className="text-right">
                          {a.priceOriginal &&
                            a.priceOriginal > a.priceFrom && (
                              <span className="block text-[11px] text-slate-400 line-through">
                                ฿{a.priceOriginal.toLocaleString()}
                              </span>
                            )}
                          <span className="text-sm font-semibold text-red-600">
                            ฿{a.priceFrom.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* จอใหญ่: กริดการ์ดปกติ */}
              <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
                {activities.map((a) => (
                  <ActivityCard
                    key={a.id}
                    id={a.id}
                    title={a.title}
                    titleEn={a.titleEn}
                    image={a.image}
                    imageAlt={a.imageAlt}
                    rating={a.rating}
                    reviewCount={a.reviewCount}
                    duration={a.duration}
                    durationEn={a.durationEn}
                    priceFrom={a.priceFrom}
                    priceOriginal={a.priceOriginal}
                    category={a.category}
                    categoryKey={a.categoryKey}
                    badge={a.badge}
                    badgeKey={a.badgeKey}
                    badgeRed={a.badgeRed}
                    features={a.features}
                    featureKeys={a.featureKeys}
                    banner={a.banner}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-500">
              <p>{t("noActivitiesInCategory")}</p>
              <button
                type="button"
                onClick={() => setSelectedFilter("all")}
                className="mt-4 text-primary font-medium hover:underline"
              >
                {t("showAll")}
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
