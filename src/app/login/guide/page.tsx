"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "@/context/LocaleContext";

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

function GuideLoginForm() {
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState<"guide" | null>(null);
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/register-guide";
  const oauthError = searchParams?.get("error") === "OAuthSignin";

  const handleGoogleSignInGuide = () => {
    setLoading("guide");
    signIn("google", { callbackUrl });
  };

  return (
    <main className="pt-24 pb-16 min-h-[calc(100vh-6rem)] bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-5xl px-4">
        <div className="flex flex-col md:flex-row bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Left: Guide form */}
          <section className="w-full md:w-[50%] lg:w-[45%] p-8 md:p-10 lg:p-12 flex flex-col">
            <header className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 text-sm font-semibold">GW</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 tracking-tight">
                    RouteWander Guides
                  </span>
                  <span className="text-[11px] text-slate-400">Local Experts Network</span>
                </div>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-[12px] text-slate-500 hover:text-slate-700 transition-colors"
              >
                <span>
                  {locale === "en" ? "Traveler login" : "เข้าสู่ระบบสำหรับนักท่องเที่ยว"}
                </span>
              </Link>
            </header>

            <div className="mt-4 mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                {locale === "en" ? "Sign in as a Guide" : "เข้าสู่ระบบสำหรับไกด์"}
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                {locale === "en"
                  ? "Use your Google account to access RouteWander guide tools and manage your profile."
                  : "ใช้บัญชี Google ของคุณเพื่อเข้าถึงเครื่องมือสำหรับไกด์และจัดการโปรไฟล์ของคุณ"}
              </p>
            </div>

            {oauthError && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                <p className="font-semibold mb-1">
                  {locale === "en" ? "Google sign-in failed" : "เข้าสู่ระบบด้วย Google ไม่สำเร็จ"}
                </p>
                <p className="text-amber-800">
                  {locale === "en"
                    ? "Please check your Google OAuth client configuration and try again."
                    : "กรุณาตรวจสอบการตั้งค่า Google OAuth แล้วลองใหม่อีกครั้ง"}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignInGuide}
                disabled={loading !== null}
                className="group w-full rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50 px-4 py-4 text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center shadow-sm">
                      <GoogleIcon />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-full bg-emerald-600 text-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                        Guide
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        {locale === "en" ? "For RouteWander guides" : "สำหรับไกด์ RouteWander"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-emerald-950">
                      {loading === "guide" ? "..." : t("signInGoogleAsGuide")}
                    </p>
                    <p className="mt-1 text-xs text-emerald-800">
                      {t("signInGoogleAsGuideDesc")}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <p className="mt-8 text-[11px] text-slate-400">
              {locale === "en"
                ? "By continuing, you agree to our Terms and Privacy Policy."
                : "การดำเนินการต่อถือว่าคุณยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัวของเรา"}
            </p>

            <p className="mt-4 text-xs text-slate-500 md:hidden">
              <Link href="/" className="text-primary hover:underline">
                {t("backToHome")}
              </Link>
            </p>
          </section>

          {/* Right: reuse visual panel from main login */}
          <section className="hidden md:flex flex-1 p-6 lg:p-8">
            <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-sky-100 via-indigo-50 to-amber-50 shadow-sm">
              <div className="absolute inset-0 opacity-70">
                <div className="absolute w-64 h-64 md:w-72 md:h-72 bg-gradient-to-br from-sky-200 via-indigo-300 to-fuchsia-300 rounded-full blur-2xl -top-10 -left-10" />
                <div className="absolute w-40 h-40 bg-gradient-to-br from-amber-200 via-yellow-200 to-orange-200 rounded-full blur-xl bottom-10 right-4" />
              </div>
              <div className="absolute inset-x-8 inset-y-10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="px-3 py-1 rounded-full bg-white/70 border border-white/80 backdrop-blur text-[11px] font-medium text-slate-700">
                    {locale === "en"
                      ? "Dedicated space for guides"
                      : "พื้นที่เฉพาะสำหรับไกด์ RouteWander"}
                  </span>
                  <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/5 text-[11px] text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {locale === "en" ? "Secure by Google Sign-In" : "ปลอดภัยด้วย Google Sign-In"}
                  </span>
                </div>
                <div className="space-y-4 text-slate-800">
                  <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                    {locale === "en"
                      ? "Share your local expertise with travelers."
                      : "แบ่งปันความเชี่ยวชาญท้องถิ่นของคุณกับนักท่องเที่ยว"}
                  </h2>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>
                        {locale === "en"
                          ? "Manage your guide profile, availability and bookings in one place."
                          : "จัดการโปรไฟล์ไกด์ ตารางว่าง และการจองของคุณได้ในที่เดียว"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-sky-500" />
                      <span>
                        {locale === "en"
                          ? "Connect with travelers who love authentic local experiences."
                          : "เชื่อมต่อกับนักท่องเที่ยวที่มองหาประสบการณ์ท้องถิ่นแท้ ๆ"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>
                        {locale === "en"
                          ? "Built for professional and part-time guides across Thailand."
                          : "ออกแบบมาสำหรับทั้งไกด์มืออาชีพและไกด์พาร์ทไทม์ทั่วไทย"}
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>© 2024 RouteWander</span>
                  <span>
                    {locale === "en" ? "Guide Network" : "เครือข่ายไกด์ RouteWander"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function GuideLoginPageInner() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="pt-24 pb-16 min-h-screen bg-slate-50 flex items-center justify-center">
            <span className="text-slate-500">...</span>
          </div>
        }
      >
        <GuideLoginForm />
      </Suspense>
      <Footer />
    </>
  );
}

export default function GuideLoginPage() {
  return <GuideLoginPageInner />;
}

