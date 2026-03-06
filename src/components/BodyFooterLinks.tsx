"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/context/LocaleContext";
import { slugToCityKey } from "@/i18n/translations";

const attractions = [
  { name: "วัดโพธิ์", nameEn: "Wat Pho", count: 176 },
  { name: "วัดพระแก้ว", nameEn: "Grand Palace", count: 89 },
  { name: "ตลาดน้ำอัมพวา", nameEn: "Amphawa Floating Market", count: 42 },
  { name: "ดอยอินทนนท์", nameEn: "Doi Inthanon", count: 34 },
  { name: "เกาะพีพี", nameEn: "Phi Phi Islands", count: 128 },
  { name: "เขาใหญ่", nameEn: "Khao Yai", count: 28 },
];

const destinationSlugs = [
  { slug: "bangkok", count: 312 },
  { slug: "chiang-mai", count: 156 },
  { slug: "pattaya", count: 98 },
  { slug: "phuket", count: 187 },
  { slug: "krabi", count: 134 },
  { slug: "samut-songkhram", count: 45 },
];

const categories = [
  { name: "ทัวร์พร้อมไกด์", nameEn: "Guided tours", count: 420 },
  { name: "เดย์ทริป", nameEn: "Day trips", count: 198 },
  { name: "ตั๋วเข้าชม", nameEn: "Admission tickets", count: 276 },
  { name: "กิจกรรมทางน้ำ", nameEn: "Water activities", count: 89 },
  { name: "คลาสและเวิร์กช็อป", nameEn: "Classes & workshops", count: 56 },
];

const PANEL_KEYS = [
  { key: "attractions" as const, titleKey: "footerPanelAttractions" as const },
  { key: "destinations" as const, titleKey: "footerPanelDestinations" as const },
  { key: "countries" as const, titleKey: "footerPanelCountries" as const },
  { key: "categories" as const, titleKey: "footerPanelCategories" as const },
];

export default function BodyFooterLinks() {
  const { t, locale } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const activePanel = PANEL_KEYS[activeIndex];
  const panelTitle = t(activePanel.titleKey);

  return (
    <section className="py-14 px-4 sm:px-5 md:px-6 lg:px-8 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto w-full min-w-0">
        {/* มือถือ: แสดงทีละช่วง พร้อมลูกศรซ้ายขวา */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm">
              {panelTitle}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                className={`w-8 h-8 rounded-full border text-sm flex items-center justify-center ${
                  activeIndex === 0
                    ? "border-slate-200 text-slate-300"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
                aria-label={t("prev")}
              >
                ‹
              </button>
              <button
                type="button"
                disabled={activeIndex === PANEL_KEYS.length - 1}
                onClick={() =>
                  setActiveIndex((i) => Math.min(PANEL_KEYS.length - 1, i + 1))
                }
                className={`w-8 h-8 rounded-full border text-sm flex items-center justify-center ${
                  activeIndex === PANEL_KEYS.length - 1
                    ? "border-slate-200 text-slate-300"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
                aria-label={t("next")}
              >
                ›
              </button>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl p-4">
            {activePanel.key === "attractions" && (
              <ul className="space-y-2">
                {attractions.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={`/places?q=${encodeURIComponent(item.name)}`}
                      className="text-slate-600 hover:text-primary text-sm"
                    >
                      {locale === "en" ? item.nameEn : item.name}
                    </Link>
                    <span className="text-slate-400 text-sm ml-1">
                      · {item.count} {t("toursAndActivities")}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {activePanel.key === "destinations" && (
              <ul className="space-y-2">
                {destinationSlugs.map((item) => {
                  const name = slugToCityKey[item.slug] ? t(slugToCityKey[item.slug]) : item.slug;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/destination/${item.slug}`}
                        className="text-slate-600 hover:text-primary text-sm"
                      >
                        {name}
                      </Link>
                      <span className="text-slate-400 text-sm ml-1">
                        · {item.count} {t("toursAndActivities")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {activePanel.key === "countries" && (
              <p className="text-slate-600 text-sm">
                <Link href="/" className="hover:text-primary">
                  {t("thailandCountry")}
                </Link>
                <span className="text-slate-400 ml-1">
                  · {t("toursAndActivitiesInThailand")}
                </span>
              </p>
            )}

            {activePanel.key === "categories" && (
              <ul className="space-y-2">
                {categories.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={`/things-to-do?category=${encodeURIComponent(
                        item.name,
                      )}`}
                      className="text-slate-600 hover:text-primary text-sm"
                    >
                      {locale === "en" ? item.nameEn : item.name}
                    </Link>
                    <span className="text-slate-400 text-sm ml-1">
                      · {item.count} {t("toursAndActivities")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* จอใหญ่: กริด 4 คอลัมน์เหมือนเดิม */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="font-bold text-slate-800 mb-4 text-sm">
              {t("footerPanelAttractions")}
            </h3>
            <ul className="space-y-2">
              {attractions.map((item) => (
                <li key={item.name}>
                  <Link
                    href={`/places?q=${encodeURIComponent(item.name)}`}
                    className="text-slate-600 hover:text-primary text-sm"
                  >
                    {locale === "en" ? item.nameEn : item.name}
                  </Link>
                  <span className="text-slate-400 text-sm ml-1">
                    · {item.count} {t("toursAndActivities")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-4 text-sm">
              {t("footerPanelDestinations")}
            </h3>
            <ul className="space-y-2">
              {destinationSlugs.map((item) => {
                const name = slugToCityKey[item.slug] ? t(slugToCityKey[item.slug]) : item.slug;
                return (
                  <li key={item.slug}>
                    <Link
                      href={`/destination/${item.slug}`}
                      className="text-slate-600 hover:text-primary text-sm"
                    >
                      {name}
                    </Link>
                    <span className="text-slate-400 text-sm ml-1">
                      · {item.count} {t("toursAndActivities")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-4 text-sm">
              {t("footerPanelCountries")}
            </h3>
            <p className="text-slate-600 text-sm">
              <Link href="/" className="hover:text-primary">
                {t("thailandCountry")}
              </Link>
              <span className="text-slate-400 ml-1">
                · {t("toursAndActivitiesInThailand")}
              </span>
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-4 text-sm">
              {t("footerPanelCategories")}
            </h3>
            <ul className="space-y-2">
              {categories.map((item) => (
                <li key={item.name}>
                  <Link
                    href={`/things-to-do?category=${encodeURIComponent(
                      item.name,
                    )}`}
                    className="text-slate-600 hover:text-primary text-sm"
                  >
                    {locale === "en" ? item.nameEn : item.name}
                  </Link>
                  <span className="text-slate-400 text-sm ml-1">
                    · {item.count} {t("toursAndActivities")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
