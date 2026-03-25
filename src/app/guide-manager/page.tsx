"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useTranslation } from "@/context/LocaleContext";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  MapPinned,
  PencilLine,
  Sparkles,
  Trash2,
  PauseCircle,
  PlayCircle,
  Wallet,
} from "lucide-react";
import { FILTER_CATEGORIES } from "@/data/activities";

type ApiTrip = {
  tripId: string;
  tripRef?: string;
  tripTag: string;
  tourTag: string;
  title: string;
  titleEn?: string;
  image: string;
  imageAlt?: string;
  priceFrom: number;
  duration?: string;
  categoryKey: string;
  guideType: "general" | "local";
  badgeKey?: string;
  tripCode?: string;
  features?: string[];
  status: "draft" | "published";
  isOpen: boolean;
  createdAt: string;
  bookings?: Array<{
    date: string;
    tourists?: number;
    status?: "pending" | "confirmed" | "cancelled";
  }>;
};

type BookingStatus = "pending" | "confirmed" | "cancelled";
type BookingFilter = "all" | BookingStatus;

function formatCreatedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}

function categoryLabel(key: string): string {
  const c = FILTER_CATEGORIES.find((x) => x.key === key);
  return c?.label ?? key;
}

function normalizeBookingStatus(value: unknown): BookingStatus {
  if (value === "pending" || value === "confirmed" || value === "cancelled") return value;
  return "confirmed";
}

function formatTripDateForUi(date: string, locale: "th" | "en"): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function GuideManagerPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { status } = useSession();

  type ApiGuide = {
    id: string;
    guideRef?: string;
    name?: string | null;
    guideType: "general" | "local";
    image: string | null;
    licenseNumber: string | null;
    rating: number;
    reviewCount: number;
    tours: number;
    experience: number;
    languages: string[];
    specialties: string[];
    bio: string | null;
    bioEn: string | null;
    verified: boolean;
    status?: "pending" | "approved";
  };

  const [guide, setGuide] = useState<ApiGuide | null>(null);
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingTrip, setBookingTrip] = useState<ApiTrip | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [togglingTripId, setTogglingTripId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
  const [confirmToggleTrip, setConfirmToggleTrip] = useState<ApiTrip | null>(null);
  const [confirmToggleNextOpen, setConfirmToggleNextOpen] = useState<boolean>(true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDeleteTrip, setConfirmDeleteTrip] = useState<ApiTrip | null>(null);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login/guide");
      return;
    }
    if (status !== "authenticated") return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/guides/me", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.registered !== true) {
          setGuide(null);
          return;
        }
        setGuide(data as ApiGuide);
      } finally {
        setLoading(false);
      }
    })();
  }, [status, router]);

  useEffect(() => {
    if (!guide) return;
    (async () => {
      try {
        const res = await fetch("/api/guides/me/trips", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !Array.isArray(data?.trips)) return setTrips([]);
        setTrips(data.trips as ApiTrip[]);
      } catch {
        setTrips([]);
      }
    })();
  }, [guide]);

  const myTrips = useMemo(() => trips ?? [], [trips]);
  const totalIncome = useMemo(
    () => myTrips.filter((x) => x.status === "published").reduce((s, t) => s + (t.priceFrom ?? 0), 0),
    [myTrips]
  );

  const bookingRows = useMemo(() => {
    if (!Array.isArray(bookingTrip?.bookings)) return [];
    return bookingTrip.bookings
      .map((b) => ({
        ...b,
        status: normalizeBookingStatus(b.status),
      }))
      .sort((a, b) => a.date.localeCompare(b.date, "en"));
  }, [bookingTrip]);

  const bookingSummary = useMemo(() => {
    const totalGuests = bookingRows.reduce((sum, r) => sum + (Number.isFinite(r.tourists) ? Number(r.tourists) : 0), 0);
    const confirmedGuests = bookingRows.reduce(
      (sum, r) => sum + (r.status === "confirmed" && Number.isFinite(r.tourists) ? Number(r.tourists) : 0),
      0
    );
    return {
      dates: bookingRows.length,
      totalGuests,
      confirmedGuests,
    };
  }, [bookingRows]);

  const filteredBookingRows = useMemo(() => {
    if (bookingFilter === "all") return bookingRows;
    return bookingRows.filter((r) => r.status === bookingFilter);
  }, [bookingRows, bookingFilter]);

  const openConfirmDeleteTrip = (trip: ApiTrip) => {
    if (deletingTripId) return;
    setActionError(null);
    setConfirmDeleteTrip(trip);
    setConfirmDeleteOpen(true);
  };

  const executeDeleteTrip = async () => {
    if (!confirmDeleteTrip) return;
    const trip = confirmDeleteTrip;
    if (deletingTripId) return;

    setActionError(null);
    setDeletingTripId(trip.tripId);
    try {
      const res = await fetch(`/api/guides/me/trips/${encodeURIComponent(trip.tripId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data?.error === "string"
            ? data.error
            : locale === "en"
              ? "Unable to delete trip."
              : "ไม่สามารถลบทริปได้";
        setActionError(msg);
        return;
      }
      setTrips((prev) => prev.filter((x) => x.tripId !== trip.tripId));
      setConfirmDeleteOpen(false);
    } catch {
      setActionError(locale === "en" ? "Unable to delete trip." : "ไม่สามารถลบทริปได้");
    } finally {
      setDeletingTripId(null);
    }
  };

  const handleToggleTripPause = async (trip: ApiTrip, nextOpen: boolean): Promise<boolean> => {
    if (togglingTripId) return false;
    setActionError(null);
    setTogglingTripId(trip.tripId);
    try {
      const res = await fetch(`/api/guides/me/trips/${encodeURIComponent(trip.tripId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ open: nextOpen }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data?.error === "string"
            ? data.error
            : locale === "en"
              ? "Unable to update trip visibility."
              : "ไม่สามารถเปลี่ยนสถานะทริปได้";
        setActionError(msg);
        return false;
      }
      setTrips((prev) =>
        prev.map((x) =>
          x.tripId === trip.tripId
            ? {
                ...x,
                isOpen: nextOpen,
                status: nextOpen ? "published" : x.status,
              }
            : x
        )
      );
      return true;
    } catch {
      setActionError(locale === "en" ? "Unable to update trip visibility." : "ไม่สามารถเปลี่ยนสถานะทริปได้");
      return false;
    } finally {
      setTogglingTripId(null);
    }
  };

  const openConfirmToggle = (trip: ApiTrip, nextOpen: boolean) => {
    setConfirmToggleTrip(trip);
    setConfirmToggleNextOpen(nextOpen);
    setConfirmToggleOpen(true);
  };


  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-16">
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-2 border-slate-200 border-t-primary" />
          <p className="text-sm text-slate-500">{locale === "en" ? "Loading your dashboard…" : "กำลังโหลดข้อมูลแดชบอร์ด…"}</p>
        </div>
      ) : (
        <>
          {guide ? (
            <>
              <header className="mb-8 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                  <div className="min-w-0 space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/90">
                        {locale === "en" ? "Trip overview" : "ภาพรวมทริป"}
                      </p>
                      <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        {locale === "en" ? "Your trips & bookings" : "ทริปและการจองของคุณ"}
                      </h1>
                      <p className="mt-2 text-sm text-slate-600 max-w-xl leading-relaxed">
                        {locale === "en"
                          ? "Review status, references, and pricing at a glance. Open bookings to see scheduled dates, or edit a trip to update content and availability."
                          : "ดูสถานะทริป รหัสอ้างอิง และราคาในที่เดียว กด «ตรวจการจอง» เพื่อดูวันที่ลูกค้าเลือก หรือ «แก้ไขทริป» เพื่อปรับเนื้อหาและการเปิดรับจอง"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {guide.guideRef ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-mono text-primary">
                          <span className="text-[10px] font-sans font-semibold uppercase tracking-wide text-primary/80">
                            {locale === "en" ? "Guide ref" : "รหัสไกด์"}
                          </span>
                          {guide.guideRef}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          {locale === "en" ? "License" : "เลขใบอนุญาต"}
                        </span>
                        <span className="font-mono">{guide.licenseNumber ?? "—"}</span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          guide.guideType === "local"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-900 border border-amber-200"
                        }`}
                      >
                        <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2} />
                        {guide.guideType === "local" ? t("localGuide") : t("generalGuide")}
                      </span>
                    </div>
                  </div>
                  {guide.image ? (
                    <div className="shrink-0 flex flex-col items-center gap-2">
                      <div className="size-16 sm:size-[4.5rem] rounded-2xl overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-200 bg-slate-100">
                        <Image src={guide.image} alt="" width={72} height={72} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 text-center max-w-[10rem] truncate" title={guide.name ?? ""}>
                        {guide.name?.trim() || (locale === "en" ? "Guide" : "ไกด์")}
                      </p>
                    </div>
                  ) : null}
                </div>
              </header>

              <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-primary/25 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        {locale === "en" ? "Listed price sum (published)" : "รวมราคาเริ่มต้น (ทริปที่เผยแพร่)"}
                      </p>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">฿{totalIncome.toLocaleString()}</p>
                      <p className="mt-1.5 text-[11px] text-slate-400 leading-snug">
                        {locale === "en" ? "Sum of “from” prices for published trips — not net revenue." : "ผลรวมราคาเริ่มต้นของทริปที่เผยแพร่แล้ว ไม่ใช่รายได้สุทธิ"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                      <Wallet className="w-5 h-5" strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-primary/25 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500">{locale === "en" ? "Total trips" : "จำนวนทริปทั้งหมด"}</p>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{myTrips.length}</p>
                      <p className="mt-1.5 text-[11px] text-slate-400 leading-snug">
                        {locale === "en" ? "Includes drafts and published." : "รวมทั้งแบบร่างและที่เผยแพร่แล้ว"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                      <MapPinned className="w-5 h-5" strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-primary/25 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500">{locale === "en" ? "Guide mode" : "โหมดไกด์"}</p>
                      <p className="mt-2 text-lg font-bold text-slate-900 leading-snug">
                        {guide.guideType === "local" ? t("localGuide") : t("generalGuide")}
                      </p>
                      <p className="mt-1.5 text-[11px] text-slate-400 leading-snug">
                        {locale === "en" ? "Shown to travelers on your public profile." : "แสดงต่อนักท่องเที่ยวบนหน้าโปรไฟล์สาธารณะ"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                      <BadgeCheck className="w-5 h-5" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{locale === "en" ? "Your trip list" : "รายการทริปทั้งหมด"}</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {locale === "en"
                        ? "Each card shows internal tags for support. Trip ref is the short code for this listing."
                        : "การ์ดแต่ละใบแสดงแท็กภายในสำหรับทีมงาน — รหัสทริปสั้น (trip ref) ใช้อ้างอิงทริปนี้โดยตรง"}
                    </p>
                  </div>
                </div>
                {actionError ? (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {actionError}
                  </div>
                ) : null}
                {myTrips.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Sparkles className="w-7 h-7" strokeWidth={1.75} />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-900">
                      {locale === "en" ? "No trips yet" : "ยังไม่มีทริปในระบบ"}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      {locale === "en"
                        ? "Create your first listing from the sidebar. You can save as draft, then publish when ready."
                        : "เริ่มสร้างทริปแรกจากเมนูด้านซ้าย บันทึกเป็นแบบร่างได้ก่อน แล้วค่อยเผยแพร่เมื่อพร้อม"}
                    </p>
                    <Link
                      href="/guide-manager/create"
                      className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                    >
                      {locale === "en" ? "Create a trip" : "สร้างทริปใหม่"}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myTrips.map((trip) => {
                      const title = locale === "en" && trip.titleEn ? trip.titleEn : trip.title;
                      const cat = categoryLabel(trip.categoryKey);
                      return (
                        <article
                          key={trip.tripId}
                          className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition duration-200 hover:border-slate-300 hover:shadow-md"
                        >
                          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-stretch md:gap-5 md:p-5">
                            <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 md:h-auto md:w-44 md:min-w-44">
                              <Image
                                src={trip.image}
                                alt={trip.imageAlt ?? title}
                                width={320}
                                height={220}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                    trip.status === "published"
                                      ? "bg-emerald-600 text-white shadow-sm"
                                      : "bg-amber-500 text-white shadow-sm"
                                  }`}
                                >
                                  {trip.status === "published"
                                    ? locale === "en"
                                      ? "Published"
                                      : "เผยแพร่แล้ว"
                                    : locale === "en"
                                      ? "Draft"
                                      : "แบบร่าง"}
                                </span>
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                    trip.isOpen ? "bg-white/95 text-emerald-800 ring-1 ring-emerald-200" : "bg-slate-900/85 text-white"
                                  }`}
                                >
                                  {trip.isOpen
                                    ? locale === "en"
                                      ? "Open"
                                      : "เปิดรับจอง"
                                    : locale === "en"
                                      ? "Closed"
                                      : "ปิดรับจอง"}
                                </span>
                              </div>
                            </div>

                            <div className="min-w-0 flex-1 flex flex-col">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2">{title}</h3>
                              </div>
                              <p className="mt-1 text-xs text-slate-500">
                                <span className="font-medium text-slate-600">{cat}</span>
                                {trip.duration ? <span> · {trip.duration}</span> : null}
                                <span className="text-slate-400"> · {locale === "en" ? "Created" : "สร้างเมื่อ"} {formatCreatedAt(trip.createdAt)}</span>
                              </p>

                              <div className="mt-3 flex flex-wrap gap-1.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 w-full sm:w-auto sm:mr-1">
                                  {locale === "en" ? "Refs" : "รหัสอ้างอิง"}
                                </span>
                                {trip.tripRef ? (
                                  <span className="rounded-md border border-primary/25 bg-primary/5 px-2 py-0.5 font-mono text-[11px] font-medium text-primary">
                                    {trip.tripRef}
                                  </span>
                                ) : null}
                                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-700">
                                  {trip.tripTag}
                                </span>
                                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-700">
                                  {trip.tourTag}
                                </span>
                                {trip.tripCode ? (
                                  <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] text-slate-600">
                                    {trip.tripCode}
                                  </span>
                                ) : null}
                              </div>

                              <div className="mt-auto pt-4 flex flex-wrap items-end justify-between gap-3 border-t border-slate-100">
                                <div>
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                    {locale === "en" ? "From price / person" : "ราคาเริ่มต้นต่อท่าน"}
                                  </p>
                                  <p className="text-lg font-bold tabular-nums text-slate-900">฿{trip.priceFrom.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 pt-3 md:w-48 md:border-0 md:pt-0 md:border-l md:border-slate-100 md:pl-5">
                              <button
                                type="button"
                                onClick={() => setBookingTrip(trip)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
                              >
                                <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={2} />
                                {locale === "en" ? "Bookings" : "ตรวจการจอง"}
                              </button>
                              <button
                                type="button"
                                onClick={() => router.push(`/guide-manager/create?tripId=${encodeURIComponent(trip.tripId)}`)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                              >
                                <PencilLine className="h-4 w-4 shrink-0" strokeWidth={2} />
                                {locale === "en" ? "Edit trip" : "แก้ไขทริป"}
                              </button>
                              {trip.status === "published" ? (
                                <button
                                  type="button"
                                  onClick={() => openConfirmToggle(trip, !trip.isOpen)}
                                  disabled={togglingTripId === trip.tripId}
                                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                    trip.isOpen
                                      ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                      : "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                  }`}
                                >
                                  {trip.isOpen ? (
                                    <PauseCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                                  ) : (
                                    <PlayCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                                  )}
                                  {togglingTripId === trip.tripId
                                    ? locale === "en"
                                      ? "Updating..."
                                      : "กำลังอัปเดต..."
                                    : trip.isOpen
                                      ? locale === "en"
                                        ? "Pause trip"
                                        : "พักทริปชั่วคราว"
                                      : locale === "en"
                                        ? "Resume trip"
                                        : "กลับมาเปิดทริป"}
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => openConfirmDeleteTrip(trip)}
                                disabled={deletingTripId === trip.tripId}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
                                {deletingTripId === trip.tripId
                                  ? locale === "en"
                                    ? "Deleting..."
                                    : "กำลังลบ..."
                                  : locale === "en"
                                    ? "Delete trip"
                                    : "ลบทริป"}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-amber-200">
                  <AlertCircle className="h-5 w-5 text-amber-600" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-amber-950">ยังไม่มีข้อมูลไกด์ในระบบ</h2>
                  <p className="mt-1 text-sm text-amber-900/90 leading-relaxed max-w-xl">
                    ลงทะเบียนไกด์ให้ครบก่อน จึงจะสร้างทริปและดูภาพรวมได้ — ใช้เวลาเพียงไม่กี่นาที
                  </p>
                  <div className="mt-5">
                    <Link
                      href="/register-guide/form"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                    >
                      ไปหน้าลงทะเบียนไกด์
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {bookingTrip ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
        >
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/90 px-5 py-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {locale === "en" ? "Trip bookings" : "การจองของทริปนี้"}
                </p>
                <h3 id="booking-modal-title" className="mt-1 text-lg font-bold text-slate-900">
                  {locale === "en" ? "Scheduled dates" : "รายการวันที่จอง"}
                </h3>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2" title={bookingTrip.title}>
                  {bookingTrip.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingTrip(null)}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                {locale === "en" ? "Close" : "ปิด"}
              </button>
            </div>
            <div className="p-5 sm:p-6">
              {bookingRows.length > 0 ? (
                <>
                  <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {locale === "en" ? "Scheduled dates" : "จำนวนวันที่มีการจอง"}
                      </p>
                      <p className="mt-1 text-base font-bold text-slate-900">{bookingSummary.dates}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {locale === "en" ? "Total guests" : "นักท่องเที่ยวรวม"}
                      </p>
                      <p className="mt-1 text-base font-bold text-slate-900">{bookingSummary.totalGuests}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                        {locale === "en" ? "Confirmed guests" : "นักท่องเที่ยวที่ยืนยันแล้ว"}
                      </p>
                      <p className="mt-1 text-base font-bold text-emerald-900">{bookingSummary.confirmedGuests}</p>
                    </div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {[
                      { key: "all", labelEn: "All", labelTh: "ทั้งหมด" },
                      { key: "confirmed", labelEn: "Confirmed", labelTh: "ยืนยันแล้ว" },
                      { key: "pending", labelEn: "Pending", labelTh: "รอดำเนินการ" },
                      { key: "cancelled", labelEn: "Cancelled", labelTh: "ยกเลิก" },
                    ].map((opt) => {
                      const active = bookingFilter === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setBookingFilter(opt.key as BookingFilter)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            active
                              ? "bg-slate-900 text-white"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {locale === "en" ? opt.labelEn : opt.labelTh}
                        </button>
                      );
                    })}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[320px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">{locale === "en" ? "Travel date" : "วันที่เดินทาง"}</th>
                        <th className="px-4 py-3">{locale === "en" ? "Guests" : "จำนวนนักท่องเที่ยว"}</th>
                        <th className="px-4 py-3">{locale === "en" ? "Status" : "สถานะ"}</th>
                        <th className="px-4 py-3">{locale === "en" ? "Action" : "การดำเนินการ"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookingRows.map((b, i) => (
                        <tr key={`${b.date}-${i}`} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-3 font-medium text-slate-900">{formatTripDateForUi(b.date, locale)}</td>
                          <td className="px-4 py-3 text-slate-700 tabular-nums">{b.tourists ?? "—"}</td>
                          <td className="px-4 py-3 min-w-[170px]">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                b.status === "confirmed"
                                  ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                                  : b.status === "pending"
                                    ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                                    : "bg-rose-50 text-rose-800 ring-1 ring-rose-200"
                              }`}
                            >
                              {b.status === "confirmed"
                                ? locale === "en"
                                  ? "Confirmed"
                                  : "ยืนยันแล้ว"
                                : b.status === "pending"
                                  ? locale === "en"
                                    ? "Pending"
                                    : "รอดำเนินการ"
                                  : locale === "en"
                                    ? "Cancelled"
                                    : "ยกเลิก"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => {
                                router.push(
                                  `/guide-manager/checkin?tripId=${encodeURIComponent(
                                    bookingTrip.tripId
                                  )}&date=${encodeURIComponent(b.date)}`
                                );
                                setBookingTrip(null);
                              }}
                              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              {locale === "en" ? "View guests / Check-in" : "ดูรายชื่อ / เช็กอิน"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredBookingRows.length === 0 ? (
                  <p className="mt-3 text-xs text-slate-500">
                    {locale === "en" ? "No bookings in this status." : "ไม่มีรายการในสถานะนี้"}
                  </p>
                ) : null}
                </>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-600">
                  <p className="font-semibold text-slate-800">
                    {locale === "en" ? "No booking rows for this trip yet." : "ยังไม่มีรายการจองแสดงในตาราง"}
                  </p>
                  <p className="mt-2 text-slate-600">
                    {locale === "en"
                      ? "When your backend sends per-day bookings, they will appear here. You can still edit the trip from the list."
                      : "เมื่อระบบส่งข้อมูลการจองรายวันมา จะแสดงที่นี่โดยอัตโนมัติ คุณยังแก้ไขทริปจากรายการด้านหลังได้ตามปกติ"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {confirmToggleOpen && confirmToggleTrip ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="toggle-trip-confirm-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
              <div className="min-w-0">
                <h3 id="toggle-trip-confirm-title" className="text-base font-bold text-slate-900">
                  {confirmToggleNextOpen
                    ? locale === "en"
                      ? "Resume trip?"
                      : "กลับมาเปิดทริป?"
                    : locale === "en"
                      ? "Pause trip?"
                      : "พักทริปชั่วคราว?"}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {confirmToggleNextOpen
                    ? locale === "en"
                      ? "Visitors will be able to see and book this trip again."
                      : "นักท่องเที่ยวจะกลับมาเห็นและจองทริปนี้ได้อีกครั้ง"
                    : locale === "en"
                      ? "This trip will be hidden from visitors and cannot be booked until you resume it."
                      : "ทริปจะถูกซ่อนจากนักท่องเที่ยวและจองไม่ได้จนกว่าจะกลับมาเปิดอีกครั้ง"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmToggleOpen(false)}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                {locale === "en" ? "Close" : "ปิด"}
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4">
              <button
                type="button"
                onClick={() => setConfirmToggleOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                {locale === "en" ? "Cancel" : "ยกเลิก"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const ok = await handleToggleTripPause(confirmToggleTrip, confirmToggleNextOpen);
                  if (ok) setConfirmToggleOpen(false);
                }}
                disabled={togglingTripId === confirmToggleTrip.tripId}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {togglingTripId === confirmToggleTrip.tripId
                  ? locale === "en"
                    ? "Updating..."
                    : "กำลังอัปเดต..."
                  : confirmToggleNextOpen
                    ? locale === "en"
                      ? "Resume"
                      : "กลับมาเปิด"
                    : locale === "en"
                      ? "Pause"
                      : "พักทริป"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmDeleteOpen && confirmDeleteTrip ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-trip-confirm-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/90 px-5 py-4">
              <div className="min-w-0">
                <h3 id="delete-trip-confirm-title" className="text-base font-bold text-slate-900">
                  {locale === "en" ? "Delete trip?" : "ยืนยันลบทริป?"}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {locale === "en"
                    ? "This will remove the trip from public. This action cannot be undone."
                    : "ทริปจะถูกลบออกจากสาธารณะ การลบนี้ไม่สามารถย้อนกลับได้"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                {locale === "en" ? "Close" : "ปิด"}
              </button>
            </div>

            <div className="px-5 py-4">
              {confirmDeleteTrip.title ? (
                <p className="truncate text-sm font-semibold text-slate-800" title={confirmDeleteTrip.title}>
                  {confirmDeleteTrip.title}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                {locale === "en" ? "Cancel" : "ยกเลิก"}
              </button>
              <button
                type="button"
                onClick={() => void executeDeleteTrip()}
                disabled={deletingTripId === confirmDeleteTrip.tripId}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingTripId === confirmDeleteTrip.tripId
                  ? locale === "en"
                    ? "Deleting..."
                    : "กำลังลบ..."
                  : locale === "en"
                    ? "Delete"
                    : "ลบทริป"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
