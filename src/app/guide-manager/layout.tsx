"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { LayoutDashboard, PlusCircle, ArrowLeft, User, Compass } from "lucide-react";
import logo from "@/images/apple-touch-icon.png";
import { useTranslation } from "@/context/LocaleContext";

type GuideMeSidebar = {
  registered: boolean;
  name: string | null;
  image: string | null;
  licenseNumber: string | null;
  guideRef: string | null;
};

export default function GuideManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { locale } = useTranslation();
  const { data: session, status } = useSession();
  const [guideMe, setGuideMe] = useState<GuideMeSidebar | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setGuideMe(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/guides/me", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (data?.registered === true) {
          setGuideMe({
            registered: true,
            name: typeof data.name === "string" ? data.name : null,
            image: typeof data.image === "string" ? data.image : null,
            licenseNumber: data.licenseNumber != null ? String(data.licenseNumber) : null,
            guideRef: typeof data.guideRef === "string" ? data.guideRef : null,
          });
        } else {
          setGuideMe({
            registered: false,
            name: null,
            image: null,
            licenseNumber: null,
            guideRef: null,
          });
        }
      } catch {
        if (!cancelled) {
          setGuideMe({
            registered: false,
            name: null,
            image: null,
            licenseNumber: null,
            guideRef: null,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const isGuideProfileLoading = status === "authenticated" && guideMe === null;

  const displayName =
    status === "unauthenticated"
      ? locale === "en"
        ? "Sign in"
        : "เข้าสู่ระบบ"
      : status === "loading" || isGuideProfileLoading
        ? locale === "en"
          ? "Loading…"
          : "กำลังโหลด…"
        : (guideMe?.registered && guideMe.name?.trim()) ||
          session?.user?.name?.trim() ||
          (locale === "en" ? "Guide" : "ไกด์");

  const displayImage =
    (guideMe?.registered && guideMe.image) || session?.user?.image || null;

  const subline =
    status === "unauthenticated"
      ? locale === "en"
        ? "Sign in to manage your trips"
        : "ล็อกอินเพื่อจัดการทริป"
      : isGuideProfileLoading
        ? locale === "en"
          ? "Loading profile…"
          : "กำลังโหลดข้อมูลไกด์…"
        : guideMe?.registered && guideMe.licenseNumber
          ? `${locale === "en" ? "License" : "เลขใบอนุญาต"} · ${guideMe.licenseNumber}`
          : guideMe && !guideMe.registered
            ? locale === "en"
              ? "Complete registration to unlock trips"
              : "ลงทะเบียนไกด์เพื่อใช้งานเต็มรูปแบบ"
            : locale === "en"
              ? "Guide portal"
              : "พอร์ทัลไกด์";
  const isCreate = pathname === "/guide-manager/create";
  const isProfileView = pathname === "/guide-manager/profile-view";
  const isOverview = pathname === "/guide-manager";

  const pageTitle =
    isCreate
      ? locale === "en"
        ? "Create trip"
        : "สร้างทริปใหม่"
      : isProfileView
        ? locale === "en"
          ? "Guide profile"
          : "โปรไฟล์ไกด์"
        : locale === "en"
          ? "Trip overview"
          : "ทริปของฉัน";

  const pageSubtitle =
    locale === "en"
      ? "Guide Manager"
      : "ศูนย์จัดการไกด์";

  return (
    <div className="flex min-h-screen bg-slate-100/80">
      <aside className="hidden md:flex w-[17rem] bg-white border-r border-slate-200/90 flex-col shrink-0 shadow-sm">
        <div className="p-5 flex items-center gap-3 border-b border-slate-100">
          <div className="size-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
            <Image src={logo} alt="" width={28} height={28} className="rounded-lg" />
          </div>
          <div>
            <h2 className="text-slate-900 text-base font-bold leading-tight tracking-tight">Route Wander</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400 mt-1">Guide Manager</p>
          </div>
        </div>
        <div className="px-4 pt-4 pb-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">เมนูหลัก</p>
        </div>
        <nav className="flex-1 px-3 pb-4 space-y-0.5">
          <Link
            href="/guide-manager"
            className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all border ${
              isOverview
                ? "bg-primary/10 text-primary border-primary/15 shadow-sm"
                : "text-slate-600 border-transparent hover:bg-slate-50 hover:border-slate-200"
            }`}
          >
            <LayoutDashboard className="w-[18px] h-[18px] shrink-0 opacity-90" strokeWidth={2} />
            <span className="leading-snug">ภาพรวมและทริป</span>
          </Link>
          <Link
            href="/guide-manager/profile-view"
            className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all border ${
              isProfileView
                ? "bg-primary/10 text-primary border-primary/15 shadow-sm"
                : "text-slate-600 border-transparent hover:bg-slate-50 hover:border-slate-200"
            }`}
          >
            <User className="w-[18px] h-[18px] shrink-0 opacity-90" strokeWidth={2} />
            โปรไฟล์ไกด์
          </Link>
          <Link
            href="/guide-manager/create"
            className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all border ${
              isCreate
                ? "bg-primary/10 text-primary border-primary/15 shadow-sm"
                : "text-slate-600 border-transparent hover:bg-slate-50 hover:border-slate-200"
            }`}
          >
            <PlusCircle className="w-[18px] h-[18px] shrink-0 opacity-90" strokeWidth={2} />
            สร้างทริปใหม่
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm">
            <div className="size-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm">
              {displayImage ? (
                <Image src={displayImage} alt="" width={40} height={40} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-slate-400" strokeWidth={2} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate" title={displayName}>
                {displayName}
              </p>
              {guideMe?.registered && guideMe.guideRef ? (
                <p className="text-[11px] font-mono text-primary/90 truncate mt-0.5" title={guideMe.guideRef}>
                  {guideMe.guideRef}
                </p>
              ) : null}
              <p className="text-[11px] text-slate-500 truncate mt-0.5" title={subline}>
                {subline}
              </p>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-3 sm:px-4 md:px-8 py-3.5 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 min-w-0 text-slate-700">
            <Compass className="w-4 h-4 shrink-0 text-primary" strokeWidth={2} />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 leading-none">{pageSubtitle}</p>
              <p className="text-sm font-bold text-slate-900 truncate">{pageTitle}</p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary transition-colors shrink-0 px-2.5 sm:px-3 py-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            <span className="hidden sm:inline">{locale === "en" ? "Back to site" : "กลับเว็บหลัก"}</span>
          </Link>
        </div>
        <div className="md:hidden border-b border-slate-200 bg-white px-3 py-2">
          <nav className="flex items-center gap-2 overflow-x-auto pb-1">
            <Link
              href="/guide-manager"
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                isOverview ? "bg-primary/10 text-primary border-primary/20" : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              {locale === "en" ? "Overview" : "ภาพรวม"}
            </Link>
            <Link
              href="/guide-manager/profile-view"
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                isProfileView ? "bg-primary/10 text-primary border-primary/20" : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              {locale === "en" ? "Profile" : "โปรไฟล์"}
            </Link>
            <Link
              href="/guide-manager/create"
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                isCreate ? "bg-primary/10 text-primary border-primary/20" : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              {locale === "en" ? "Create trip" : "สร้างทริป"}
            </Link>
          </nav>
        </div>
        {children}
      </main>
    </div>
  );
}
