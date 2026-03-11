"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "@/context/LocaleContext";
import { useSearchParams } from "next/navigation";
import { guides } from "@/data/guides";

type GuideTypeFilter = "all" | "general" | "local";

export default function GuidesPage() {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const [typeFilter, setTypeFilter] = useState<GuideTypeFilter>(
    typeParam === "general" || typeParam === "local" ? typeParam : "all"
  );
  const [langFilter, setLangFilter] = useState<string>("all");

  const allLanguages = useMemo(() => {
    const langSet = new Set<string>();
    guides.forEach((g) => g.languages.forEach((l) => langSet.add(l)));
    return Array.from(langSet).sort();
  }, []);

  const filteredGuides = useMemo(() => {
    return guides.filter((g) => {
      const typeMatch = typeFilter === "all" || g.guideType === typeFilter;
      const langMatch = langFilter === "all" || g.languages.includes(langFilter);
      return typeMatch && langMatch;
    });
  }, [typeFilter, langFilter]);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 w-full min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            {t("navGuides")}
          </h1>
          <p className="text-slate-600 mb-6">{t("navGuidesAll")}</p>

          {/* Filter tabs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* ประเภทไกด์ */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  typeFilter === "all"
                    ? "bg-primary text-white"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                {t("navGuidesAll")}
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("general")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  typeFilter === "general"
                    ? "bg-orange-500 text-white"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${typeFilter === "general" ? "bg-white" : "bg-orange-500"}`} />
                {t("generalGuide")}
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("local")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  typeFilter === "local"
                    ? "bg-green-500 text-white"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${typeFilter === "local" ? "bg-white" : "bg-green-500"}`} />
                {t("localGuide")}
              </button>
            </div>

            {/* ภาษา */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">
                {locale === "en" ? "Language:" : "ภาษา:"}
              </span>
              <select
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">{locale === "en" ? "All languages" : "ทุกภาษา"}</option>
                {allLanguages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Guides grid */}
          {filteredGuides.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-500 mb-4">
                {locale === "en" ? "No guides found with selected filters" : "ไม่พบไกด์ตามเงื่อนไขที่เลือก"}
              </p>
              <button
                type="button"
                onClick={() => { setTypeFilter("all"); setLangFilter("all"); }}
                className="text-primary font-medium hover:underline"
              >
                {locale === "en" ? "Clear filters" : "ล้างตัวกรอง"}
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.id}`}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all group"
              >
                <div className="relative aspect-[4/3] bg-slate-200">
                  <Image
                    src={guide.image}
                    alt=""
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    guide.guideType === "local" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                  }`}>
                    {guide.guideType === "local" ? t("localGuide") : t("generalGuide")}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-primary transition-colors">
                    {t(guide.nameKey)}
                  </h3>
                  <p className="text-sm text-slate-600 mb-1">
                    {t(guide.locationKey)}, {t("thailand")}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-slate-400 font-mono">{guide.licenseNumber}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">{guide.languages.join(", ")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {guide.rating}
                      <span className="text-slate-500">({guide.reviewCount})</span>
                    </span>
                    <span className="text-slate-500">{guide.tours} {t("toursAndActivities")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
