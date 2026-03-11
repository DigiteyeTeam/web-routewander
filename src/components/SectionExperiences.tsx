"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import ActivityCard from "./ActivityCard";
import { useTranslation } from "@/context/LocaleContext";
import { getAllActivities } from "@/data/activities";
import { guides } from "@/data/guides";

export default function SectionExperiences() {
  const { t, locale } = useTranslation();

  const allActivities = useMemo(() => getAllActivities(), []);

  const generalGuideTrips = useMemo(() => {
    return allActivities.filter((a) => a.guideType === "general").slice(0, 4);
  }, [allActivities]);

  const localGuideTrips = useMemo(() => {
    return allActivities.filter((a) => a.guideType === "local").slice(0, 4);
  }, [allActivities]);

  const allGuides = useMemo(() => {
    return [...guides].slice(0, 8);
  }, []);

  return (
    <>
      {/* ทริปของไกด์ทั่วไป */}
      <section className="py-8 px-4 sm:px-5 md:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
                {locale === "en" ? "General Guide Trips" : "ทริปไกด์ทั่วไป"}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  {t("generalGuide")}
                </span>
              </div>
            </div>
            <Link
              href="/search?guideType=general"
              className="text-sm text-primary font-medium hover:underline"
            >
              {locale === "en" ? "View all" : "ดูทั้งหมด"} →
            </Link>
          </div>

          {/* มือถือ: เลื่อนซ้ายขวา */}
          <div className="sm:hidden -mx-4 px-4">
            <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth">
              {generalGuideTrips.map((a) => (
                <div key={a.id} className="shrink-0 w-[260px]">
                  <ActivityCard {...a} />
                </div>
              ))}
            </div>
          </div>

          {/* จอใหญ่: แสดงเป็นกริด */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6 min-w-0">
            {generalGuideTrips.map((a) => (
              <ActivityCard key={a.id} {...a} />
            ))}
          </div>
        </div>
      </section>

      {/* ทริปของไกด์ท้องถิ่น */}
      <section className="py-8 px-4 sm:px-5 md:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
                {t("memorableExperiences")}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {t("localGuide")}
                </span>
              </div>
            </div>
            <Link
              href="/search?guideType=local"
              className="text-sm text-primary font-medium hover:underline"
            >
              {locale === "en" ? "View all" : "ดูทั้งหมด"} →
            </Link>
          </div>

          {/* มือถือ: เลื่อนซ้ายขวา */}
          <div className="sm:hidden -mx-4 px-4">
            <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth">
              {localGuideTrips.map((a) => (
                <div key={a.id} className="shrink-0 w-[260px]">
                  <ActivityCard {...a} />
                </div>
              ))}
            </div>
          </div>

          {/* จอใหญ่: แสดงเป็นกริด */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6 min-w-0">
            {localGuideTrips.map((a) => (
              <ActivityCard key={a.id} {...a} />
            ))}
          </div>
        </div>
      </section>

      {/* สุ่มแสดงไกด์ */}
      <section className="py-8 px-4 sm:px-5 md:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                {locale === "en" ? "Meet our guides" : "พบกับไกด์ของเรา"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {locale === "en" ? "Experienced local and professional guides" : "ไกด์ท้องถิ่นและไกด์ทั่วไปที่มีประสบการณ์"}
              </p>
            </div>
            <Link
              href="/guides"
              className="text-sm text-primary font-medium hover:underline"
            >
              {locale === "en" ? "View all guides" : "ดูไกด์ทั้งหมด"} →
            </Link>
          </div>

          {/* มือถือ: เลื่อนซ้ายขวา */}
          <div className="sm:hidden -mx-4 px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth">
              {allGuides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.id}`}
                  className="shrink-0 w-[120px] bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-all group"
                >
                  <div className="relative aspect-square bg-slate-200">
                    <Image
                      src={guide.image}
                      alt=""
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-full text-[8px] font-semibold ${
                      guide.guideType === "local" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                    }`}>
                      {guide.guideType === "local" ? t("localGuide") : t("generalGuide")}
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="font-medium text-slate-800 text-xs truncate group-hover:text-primary transition-colors">
                      {t(guide.nameKey)}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{t(guide.locationKey)}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px]">
                      <span className="inline-flex items-center gap-0.5 text-amber-500">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {guide.rating}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 font-mono">{guide.licenseNumber}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* จอใหญ่: แสดงเป็นกริด */}
          <div className="hidden sm:grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 min-w-0">
            {allGuides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.id}`}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className="relative aspect-square bg-slate-200">
                  <Image
                    src={guide.image}
                    alt=""
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                    guide.guideType === "local" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                  }`}>
                    {guide.guideType === "local" ? t("localGuide") : t("generalGuide")}
                  </span>
                </div>
                <div className="p-2">
                  <h3 className="font-semibold text-slate-800 text-xs mb-0.5 truncate group-hover:text-primary transition-colors">
                    {t(guide.nameKey)}
                  </h3>
                  <p className="text-[10px] text-slate-500 truncate">{t(guide.locationKey)}</p>
                  <div className="flex items-center gap-1 mt-1 text-[10px]">
                    <span className="inline-flex items-center gap-0.5 text-amber-500">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {guide.rating}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 font-mono">{guide.licenseNumber}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
