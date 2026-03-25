"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DESTINATION_NAMES } from "@/data/activities";
import { useTranslation } from "@/context/LocaleContext";
import { slugToCityKey } from "@/i18n/translations";
import { usePublicActivities } from "@/hooks/usePublicActivities";

export default function Hero() {
  const router = useRouter();
  const { t } = useTranslation();
  const { activities } = usePublicActivities();
  const [q, setQ] = useState("");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  const suggestions = useMemo(() => {
    const source = activities ?? [];
    const query = q.trim().toLowerCase();
    const filtered = !query
      ? source
      : source.filter((a) => {
          const haystack = [
            a.title,
            a.titleEn,
            a.category,
            a.guideDisplayName,
            ...(a.placeTags?.map((p) => `${p.name} ${p.nameEn ?? ""} ${p.province}`) ?? []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(query);
        });
    return filtered.slice(0, 8);
  }, [activities, q]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (isMobile) {
      // บนมือถือให้เปิด overlay แทนการไปหน้าใหม่ทันที
      setOverlayOpen(true);
      return;
    }
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/search?${params.toString()}`);
    setDropdownOpen(false);
  };

  return (
    <section className="relative min-h-[480px] flex items-start md:items-center justify-center pt-24 pb-16 px-4 sm:px-5 md:px-6 lg:px-8">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1920&q=80"
          alt="Thailand - Beautiful Beach"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/55" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mt-4 md:mt-0 text-left md:text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-4 sm:mb-6 leading-tight">
          {t("heroTitle1")}
          <br className="hidden sm:block" />
          {t("heroTitle2")}
        </h1>

        {/* กล่องค้นหาหลัก */}
        <div className="relative max-w-xl w-full mx-auto md:mx-auto">
          <form
            onSubmit={handleSearch}
            className="flex bg-white rounded-full shadow-xl w-full overflow-hidden border border-slate-200/80 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-shadow"
          >
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                if (!isMobile) setDropdownOpen(true);
              }}
              onFocus={() => {
                if (isMobile) {
                  setOverlayOpen(true);
                } else {
                  setDropdownOpen(true);
                }
              }}
              placeholder={t("searchPlaceholder")}
              className="flex-1 min-w-0 px-5 py-3.5 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-500 text-sm sm:text-base"
            aria-label="Search"
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-sm sm:text-base transition-colors shrink-0"
              >
                {t("search")}
          </button>
          </form>

          {/* เดสก์ท็อป: แสดง dropdown แนะนำเมื่อมี focus */}
          {!isMobile && dropdownOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 max-h-80 overflow-y-auto z-20">
              <div className="px-4 pt-3 pb-2 text-xs font-medium text-slate-500">
                {t("suggestions")}
              </div>
              <ul className="px-2 pb-2">
                {suggestions.map((a) => {
                  const cityKey = slugToCityKey[a.slug];
                  const cityName = cityKey ? t(cityKey) : (DESTINATION_NAMES[a.slug] || a.slug);
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        className="w-full flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 text-left"
                        onClick={() => {
                          router.push(`/activity/${a.id}`);
                          setDropdownOpen(false);
                        }}
                      >
                        <span className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shrink-0">
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
                              d="M12 11.5a3 3 0 100-6 3 3 0 000 6z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19.5 10.5c0 7-7.5 10-7.5 10S4.5 17.5 4.5 10.5a7.5 7.5 0 1115 0z"
                            />
                          </svg>
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {a.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {t("cityInThailand")} {cityName}, {t("thailand")}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* มือถือ: แสดง overlay ค้นหาเต็มจอ */}
      {overlayOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="flex items-center px-4 pt-4 pb-3 border-b border-slate-200 gap-2">
            <button
              type="button"
              onClick={() => setOverlayOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
              aria-label={t("closeMenu")}
            >
              <svg
                className="w-5 h-5 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex-1">
              <div className="flex items-center bg-slate-50 rounded-full px-2 py-1 border border-slate-200 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  autoFocus
                  placeholder={t("searchPlaceholder")}
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-500 px-2"
                />
                <button
                  type="button"
                  disabled={!q.trim()}
                  onClick={() => {
                    const term = q.trim();
                    if (!term) return;
                    setOverlayOpen(false);
                    const params = new URLSearchParams();
                    params.set("q", term);
                    router.push(`/search?${params.toString()}`);
                  }}
                  className="ml-1 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t("search")}
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 pt-3 pb-6 overflow-y-auto">
            <p className="text-xs font-medium text-slate-500 mb-3">
              {t("suggestions")}
            </p>
            <ul className="space-y-2">
              {suggestions.map((a) => {
                const cityName = DESTINATION_NAMES[a.slug] || a.slug;
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-left"
                      onClick={() => {
                        setOverlayOpen(false);
                        router.push(`/activity/${a.id}`);
                      }}
                    >
                      <span className="mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white text-primary border border-slate-200 shrink-0">
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
                            d="M12 11.5a3 3 0 100-6 3 3 0 000 6z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19.5 10.5c0 7-7.5 10-7.5 10S4.5 17.5 4.5 10.5a7.5 7.5 0 1115 0z"
                          />
                        </svg>
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {a.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          เมืองใน {cityName}, ประเทศไทย
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
