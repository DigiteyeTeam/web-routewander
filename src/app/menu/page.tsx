"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useTranslation } from "@/context/LocaleContext";
import { useMockAuth } from "@/context/MockAuthContext";

export default function MenuPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();
  const { data: session, status } = useSession();
  const { user: mockUser, signOut: signOutMock } = useMockAuth();
  const isAuthenticated = status === "authenticated" && session?.user;
  const displayUser = isAuthenticated
    ? { name: session!.user!.name ?? session!.user!.email ?? "", email: session!.user!.email ?? "" }
    : (mockUser ? { name: t("mockUserName"), email: mockUser.email } : null);

  return (
    <main className="min-h-screen bg-white text-slate-800">
      <header className="bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          <span className="text-sm font-semibold">{t("menu")}</span>
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-full border border-slate-500/60"
            aria-label={t("closeMenu")}
            onClick={() => router.back()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* เนื้อหาเมนู */}
      <section className="max-w-7xl mx-auto px-3 py-3 space-y-3 text-sm">
        {/* เมนูหลัก */}
        <div className="space-y-1.5">
          {/* Places to see */}
          <Link
            href="/places"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10.5C19 16 12 21 12 21S5 16 5 10.5a7 7 0 1114 0z" />
                </svg>
              </span>
              <span className="font-medium text-sm">{t("placesToSee")}</span>
            </span>
            <span className="text-slate-400 text-xs">›</span>
          </Link>

          {/* Things to do */}
          <Link
            href="/activities"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l1.5 3.5L10 8l-3.5 1.5L5 13l-1.5-3.5L0 8l3.5-1.5L5 3zM19 9l1 2.5 2.5 1L20 14l-1 2.5L18 14l-2.5-1.5L18 11l1-2zM13 3l1.5 3L18 7.5 14.5 9 13 12l-1.5-3L8 7.5 11.5 6 13 3z" />
                </svg>
              </span>
              <span className="font-medium text-sm">{t("thingsToDo")}</span>
            </span>
            <span className="text-slate-400 text-xs">›</span>
          </Link>

          {/* Guides */}
          <Link
            href="/guides"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
              <span className="font-medium text-sm">{t("navGuides")}</span>
            </span>
            <span className="text-slate-400 text-xs">›</span>
          </Link>

          {/* Trip / Map */}
          <Link
            href="/explore?view=map"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </span>
              <span className="font-medium text-sm">{t("navTripMap")}</span>
            </span>
            <span className="text-slate-400 text-xs">›</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
              </span>
              <span className="font-medium text-sm">{t("wishlist")}</span>
            </span>
            <span className="text-slate-400 text-xs">›</span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l3-6H6.4M7 13L5.4 5M7 13l-2 6h14m-9 0a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </span>
              <span className="font-medium text-sm">{t("cart")}</span>
            </span>
            <span className="text-slate-400 text-xs">›</span>
          </Link>

          {/* Updates */}
          <Link
            href="/updates"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </span>
              <span className="font-medium text-sm">{t("updatesTitle")}</span>
            </span>
            <span className="text-slate-400 text-xs">›</span>
          </Link>

          {/* Appearance */}
          <Link
            href="/appearance"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              <span className="font-medium text-sm">{t("appearance")}</span>
            </span>
            <span className="text-slate-400 text-xs">›</span>
          </Link>

          {/* Help */}
          <Link
            href="/help"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="font-medium text-sm">{t("help")}</span>
            </span>
            <span className="text-slate-400 text-xs">›</span>
          </Link>
        </div>

        {/* ภาษา & Profile */}
        <div className="pt-2 border-t border-slate-200 space-y-1.5">
          {/* Language Toggle */}
          <div className="px-2.5 py-2 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 mb-1.5">{t("languageCurrency")}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLocale("th")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  locale === "th" ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-white/20 text-[10px]">TH</span>
                {t("guideLangThai")}
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  locale === "en" ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-white/20 text-[10px]">EN</span>
                {t("guideLangEnglish")}
              </button>
            </div>
          </div>

          {/* Login/Register or User + Logout */}
          {displayUser ? (
            <>
              <div className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary text-white">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 1116 0" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">{displayUser.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{displayUser.email}</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isAuthenticated) nextAuthSignOut({ callbackUrl: "/" });
                  else signOutMock();
                  router.back();
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-left"
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-slate-200 text-slate-600">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4" />
                    </svg>
                  </span>
                  <span className="font-medium text-sm text-slate-700">{t("logOut")}</span>
                </span>
                <span className="text-slate-400 text-xs">›</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary text-white">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </span>
                <span className="font-medium text-sm">{t("loginOrRegister")}</span>
              </span>
              <span className="text-slate-400 text-xs">›</span>
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
