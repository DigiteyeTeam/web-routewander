"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import logo from "@/images/apple-touch-icon.png";
import { useTranslation } from "@/context/LocaleContext";
import { useMockAuth } from "@/context/MockAuthContext";
import type { TranslationKey } from "@/i18n/translations";

const placesCategories: { labelKey: TranslationKey; href: string; active: boolean }[] = [
  { labelKey: "navPlacesTop", href: "/places", active: true },
  { labelKey: "navPlacesBangkokCentral", href: "/destination/bangkok", active: false },
  { labelKey: "navPlacesNorth", href: "/destination/chiang-mai", active: false },
  { labelKey: "navPlacesSouth", href: "/destination/phuket", active: false },
  { labelKey: "navPlacesIslands", href: "/destination/krabi", active: false },
];

const placesList: { nameKey: TranslationKey; locationKey: TranslationKey; href: string; image: string }[] = [
  { nameKey: "navPlaceGrandPalace", locationKey: "cityBangkok", href: "/destination/bangkok", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=100&q=80" },
  { nameKey: "navPlaceWatArun", locationKey: "cityBangkok", href: "/destination/bangkok", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=100&q=80" },
  { nameKey: "navPlaceDoiInthanon", locationKey: "cityChiangMai", href: "/destination/chiang-mai", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&q=80" },
  { nameKey: "navPlacePhiPhiIslands", locationKey: "cityKrabi", href: "/destination/krabi", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=100&q=80" },
  { nameKey: "navPlaceWatPho", locationKey: "cityBangkok", href: "/destination/bangkok", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=100&q=80" },
  { nameKey: "navPlaceFloatingMarkets", locationKey: "citySamutSongkhram", href: "/destination/samut-songkhram", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=100&q=80" },
  { nameKey: "navPlaceKhaoYai", locationKey: "cityNakhonRatchasima", href: "/destination/bangkok", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&q=80" },
  { nameKey: "navPlaceChiangMaiOldCity", locationKey: "cityChiangMai", href: "/destination/chiang-mai", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=100&q=80" },
  { nameKey: "navPlaceJamesBondIsland", locationKey: "cityPhangNga", href: "/destination/phuket", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=100&q=80" },
];

const thingsCategories: { labelKey: TranslationKey; href: string; active: boolean }[] = [
  { labelKey: "navThingsTop", href: "/", active: true },
  { labelKey: "navThingsCulture", href: "/destination/bangkok?filter=culture", active: false },
  { labelKey: "navThingsFood", href: "/destination/bangkok?filter=food-drink", active: false },
  { labelKey: "navThingsNature", href: "/destination/chiang-mai?filter=attraction", active: false },
  { labelKey: "navThingsDayTrips", href: "/destination/bangkok?filter=day-trip", active: false },
  { labelKey: "navThingsTours", href: "/destination/bangkok?filter=guided-tour", active: false },
];

const thingsList: { nameKey: TranslationKey; href: string; image: string }[] = [
  { nameKey: "navThingBangkokTemples", href: "/activity/1", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=100&q=80" },
  { nameKey: "navThingFloatingMarket", href: "/activity/2", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=100&q=80" },
  { nameKey: "navThingChiangMaiDoiInthanon", href: "/activity/3", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&q=80" },
  { nameKey: "navThingPhiPhiSnorkeling", href: "/activity/4", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=100&q=80" },
  { nameKey: "navThingKhaoYaiSafari", href: "/activity/5", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&q=80" },
  { nameKey: "navThingThaiCooking", href: "/activity/6", image: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=100&q=80" },
  { nameKey: "navThingBangkokStreetFood", href: "/activity/7", image: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=100&q=80" },
  { nameKey: "navThingAyutthayaTemples", href: "/activity/8", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=100&q=80" },
  { nameKey: "navThingElephantSanctuary", href: "/activity/9", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&q=80" },
];

export default function Header() {
  const [placesOpen, setPlacesOpen] = useState(false);
  const [thingsOpen, setThingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();
  const { user: mockUser, signOut } = useMockAuth();
  const closeDropdowns = () => {
    setPlacesOpen(false);
    setThingsOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent text-white md:bg-white md:bg-none md:text-slate-800 md:border-b md:border-slate-200">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-5 md:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="flex items-center shrink-0" aria-label="Route Wander">
            <span
              className="block h-[84px] sm:h-[133px] w-auto shrink-0"
              style={{
                aspectRatio: `${logo.width} / ${logo.height}`,
                backgroundColor: "#0066FF",
                WebkitMaskImage: `url(${logo.src})`,
                maskImage: `url(${logo.src})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-slate-100 md:text-slate-700">
          <div
            className="relative"
            onMouseEnter={() => { setPlacesOpen(true); setThingsOpen(false); }}
            onMouseLeave={() => setPlacesOpen(false)}
          >
            <button
              type="button"
              onClick={() => setPlacesOpen((v) => !v)}
              className={`flex items-center gap-1 font-medium text-sm transition-colors ${placesOpen ? "text-primary border-b-2 border-primary pb-0.5 -mb-px" : "text-slate-700 hover:text-primary"}`}
              aria-expanded={placesOpen}
              aria-haspopup="true"
            >
              {t("placesToSee")}
              <svg
                className={`w-4 h-4 transition-transform ${placesOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {placesOpen && (
              <div className="absolute left-0 top-full pt-1 z-50">
                <div className="w-[720px] max-w-[min(720px,calc(100vw-2rem))] bg-white rounded-b-lg shadow-xl border border-t-0 border-slate-200 overflow-hidden">
                  <div className="flex">
                    <div className="w-52 shrink-0 py-4 pl-4 pr-2 border-r border-slate-100">
                      {placesCategories.map((cat) => (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          onClick={closeDropdowns}
                          className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm transition-colors ${
                            cat.active
                              ? "text-primary font-semibold bg-primary-light"
                              : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                          }`}
                        >
                          {cat.active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                          {!cat.active && <span className="w-1.5 shrink-0" />}
                          {t(cat.labelKey)}
                        </Link>
                      ))}
                    </div>
                    <div className="flex-1 py-4 px-4 grid grid-cols-3 gap-x-4 gap-y-3">
                      {placesList.map((place) => (
                        <Link
                          key={place.nameKey}
                          href={place.href}
                          onClick={closeDropdowns}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-200">
                            <Image
                              src={place.image}
                              alt=""
                              width={48}
                              height={48}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-primary transition-colors">
                              {t(place.nameKey)}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {t("attractionIn")} {t(place.locationKey)}, {t("thailand")}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div
            className="relative"
            onMouseEnter={() => { setThingsOpen(true); setPlacesOpen(false); }}
            onMouseLeave={() => setThingsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setThingsOpen((v) => !v)}
              className={`flex items-center gap-1 font-medium text-sm transition-colors ${
                thingsOpen ? "text-primary border-b-2 border-primary pb-0.5 -mb-px" : "text-slate-700 hover:text-primary"
              }`}
              aria-expanded={thingsOpen}
              aria-haspopup="true"
            >
              {t("thingsToDo")}
              <svg
                className={`w-4 h-4 transition-transform ${thingsOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {thingsOpen && (
              <div className="absolute left-0 top-full pt-1 z-50">
                <div className="w-[720px] max-w-[min(720px,calc(100vw-2rem))] bg-white rounded-b-lg shadow-xl border border-t-0 border-slate-200 overflow-hidden">
                  <div className="flex">
                    <div className="w-52 shrink-0 py-4 pl-4 pr-2 border-r border-slate-100">
                      {thingsCategories.map((cat) => (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          onClick={closeDropdowns}
                          className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm transition-colors ${
                            cat.active
                              ? "text-primary font-semibold bg-primary-light"
                              : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                          }`}
                        >
                          {cat.active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                          {!cat.active && <span className="w-1.5 shrink-0" />}
                          {t(cat.labelKey)}
                        </Link>
                      ))}
                    </div>
                    <div className="flex-1 py-4 px-4 grid grid-cols-3 gap-x-4 gap-y-3">
                      {thingsList.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeDropdowns}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-200">
                            <Image
                              src={item.image}
                              alt=""
                              width={48}
                              height={48}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-primary transition-colors">
                              {t(item.nameKey)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 text-slate-100 md:text-slate-600">
          <Link
            href="/wishlist"
            className="flex flex-col items-center gap-0.5 text-slate-100 md:text-slate-600 hover:text-primary transition-colors min-w-[32px] text-xs md:text-[11px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="hidden md:block text-[11px]">{t("wishlist")}</span>
          </Link>
          <Link
            href="/cart"
            className="flex flex-col items-center gap-0.5 text-slate-100 md:text-slate-600 hover:text-primary transition-colors min-w-[32px] text-xs md:text-[11px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l3-6H6.4M7 13L5.4 5M7 13l-2 6h14m-9 0a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <span className="hidden md:block text-[11px]">{t("cart")}</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLocale("th")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${locale === "th" ? "bg-primary text-white" : "text-slate-500 hover:text-slate-700"}`}
              aria-label="ไทย"
            >
              TH
            </button>
            <span className="text-slate-400 text-[11px]">|</span>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${locale === "en" ? "bg-primary text-white" : "text-slate-500 hover:text-slate-700"}`}
              aria-label="English"
            >
              EN
            </button>
          </div>
          <div
            className="hidden sm:block relative"
            onMouseEnter={() => {
              setProfileOpen(true);
              setPlacesOpen(false);
              setThingsOpen(false);
            }}
            onMouseLeave={() => setProfileOpen(false)}
          >
            <button
              type="button"
              className="flex flex-col items-center gap-0.5 text-slate-100 md:text-slate-600 hover:text-primary transition-colors min-w-[40px] text-xs"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 1116 0" />
              </svg>
              <span className="text-[11px]">{t("profile")}</span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full pt-1 z-50 min-w-[220px]">
                <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden py-2">
                  <p className="px-4 py-2 text-sm font-bold text-slate-800 border-b border-slate-100">
                    {t("profile")}
                  </p>
                  {mockUser ? (
                    <>
                      <div className="px-4 py-2.5 text-sm text-slate-600 border-b border-slate-100">
                        <p className="font-medium text-slate-800">{t("mockUserName")}</p>
                        <p className="text-xs text-slate-500 truncate">{mockUser.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          signOut();
                          closeDropdowns();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                      >
                        <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4" />
                        </svg>
                        {t("logOut")}
                      </button>
                      <div className="border-t border-slate-100" />
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={closeDropdowns}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        {t("loginOrRegister")}
                      </Link>
                      <div className="border-t border-slate-100" />
                    </>
                  )}
                  <Link
                    href="/updates"
                    onClick={closeDropdowns}
                    className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {t("updates")}
                    </span>
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/appearance"
                    onClick={closeDropdowns}
                    className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {t("appearance")}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 text-xs">
                      {t("appearanceAlwaysBright")}
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                  <div className="border-t border-slate-100" />
                  <Link
                    href="/help"
                    onClick={closeDropdowns}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t("help")}
                  </Link>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-7 h-7 rounded-full border border-slate-100/60 bg-slate-900/40 hover:bg-slate-900/70"
            aria-label={t("menu")}
            onClick={() => router.push("/menu")}
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
