"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useBookings } from "@/context/BookingsContext";
import { useWishlist } from "@/context/WishlistContext";
import { useTranslation } from "@/context/LocaleContext";
import MockBarcode from "@/components/MockBarcode";

function SectionShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-7">
      <header className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { bookings } = useBookings();
  const { activityIds } = useWishlist();
  const { locale } = useTranslation();

  const userName = session?.user?.name ?? (locale === "en" ? "Traveler" : "นักท่องเที่ยว");
  const userEmail = session?.user?.email ?? "unknown@example.com";
  const userImage = session?.user?.image ?? null;

  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.tripStartDate) >= now);
  const past = bookings.filter((b) => new Date(b.tripStartDate) < now);

  const notifications = upcoming
    .map((b) => {
      const start = new Date(b.tripStartDate);
      const diffDays = Math.round((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0 || diffDays > 7) return null;
      return {
        id: b.id,
        days: diffDays,
        title: b.activityTitle,
        when: start.toLocaleString(locale === "en" ? "en-US" : "th-TH", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
        meetingPlace: b.meetingPlace,
      };
    })
    .filter(Boolean) as {
    id: string;
    days: number;
    title: string;
    when: string;
    meetingPlace: string;
  }[];

  return (
    <main className="pt-24 pb-16 min-h-[calc(100vh-6rem)] bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6 md:space-y-8">
        {/* Header: account overview */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-600 text-lg font-semibold">
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImage} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500 font-semibold">
                {locale === "en" ? "Traveler profile" : "โปรไฟล์นักท่องเที่ยว"}
              </p>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {userName}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-[12px] text-slate-700"
            >
              <span>{locale === "en" ? "Back to home" : "กลับหน้าแรก"}</span>
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-[12px] text-slate-700"
            >
              <span>{locale === "en" ? "Sign out" : "ออกจากระบบ"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-7">
          {/* Left column: notifications + upcoming */}
          <div className="space-y-6 lg:col-span-2">
            <SectionShell
              title={locale === "en" ? "Upcoming reminders" : "เตือนทริปที่กำลังจะมาถึง"}
              subtitle={
                locale === "en"
                  ? "We’ll remind you about trips starting in the next 7 days."
                  : "แจ้งเตือนทริปที่กำลังจะเริ่มภายใน 7 วันข้างหน้า"
              }
            >
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500">
                  {locale === "en"
                    ? "No upcoming trips in the next few days."
                    : "ตอนนี้ยังไม่มีทริปที่กำลังจะเริ่มในเร็ว ๆ นี้"}
                </p>
              ) : (
                <ul className="space-y-3">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 px-3 py-3"
                    >
                      <div className="mt-0.5">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                          !
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900">
                          {locale === "en"
                            ? n.days === 0
                              ? "Your trip starts today"
                              : `Your trip starts in ${n.days} day${n.days > 1 ? "s" : ""}`
                            : n.days === 0
                              ? "ทริปของคุณเริ่มวันนี้"
                              : `ทริปของคุณจะเริ่มในอีก ${n.days} วัน`}
                          :{" "}
                          <span className="font-semibold">{n.title}</span>
                        </p>
                        <p className="mt-1 text-[11px] text-slate-600">
                          {locale === "en"
                            ? `Meeting time: ${n.when} · Meeting point: ${n.meetingPlace}`
                            : `เวลาเริ่ม: ${n.when} · จุดนัดพบ: ${n.meetingPlace}`}
                        </p>
                      </div>
                      <Link
                        href="#"
                        className="text-[11px] font-medium text-primary hover:underline whitespace-nowrap"
                      >
                        {locale === "en" ? "View trip" : "ดูรายละเอียด"}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionShell>

            <SectionShell
              title={locale === "en" ? "My bookings" : "การจองของฉัน"}
              subtitle={
                locale === "en"
                  ? "Trips you’ve booked with RouteWander."
                  : "ทริปที่คุณจองผ่าน RouteWander"
              }
            >
              {bookings.length === 0 ? (
                <div className="py-4 text-xs text-slate-500">
                  <p>
                    {locale === "en"
                      ? "You haven’t booked any trips yet."
                      : "ตอนนี้คุณยังไม่ได้จองทริปใด ๆ"}
                  </p>
                  <Link
                    href="/"
                    className="mt-2 inline-flex text-primary hover:underline text-xs font-medium"
                  >
                    {locale === "en"
                      ? "Discover tours and activities"
                      : "ไปเลือกทริปเที่ยวในหน้าหลัก"}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b) => {
                    const start = new Date(b.tripStartDate);
                    const isUpcoming = start >= now;
                    const statusLabel = isUpcoming
                      ? locale === "en"
                        ? "Upcoming"
                        : "กำลังจะมาถึง"
                      : locale === "en"
                        ? "Completed"
                        : "จบทริปแล้ว";

                    return (
                      <article
                        key={b.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-3.5"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1.5">
                            <span className="inline-flex items-center rounded-full bg-slate-900 text-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
                              {statusLabel}
                            </span>
                            <span className="text-slate-400">
                              {start.toLocaleDateString(
                                locale === "en" ? "en-US" : "th-TH",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                            {b.activityTitle}
                          </h3>
                          <p className="mt-1 text-[11px] text-slate-600">
                            {b.optionTitle} · {b.travelers}{" "}
                            {locale === "en" ? "traveler(s)" : "คน"} · {b.language}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-600">
                            {locale === "en" ? "Meeting point" : "จุดนัดพบ"}: {b.meetingPlace}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-2">
                          <div className="hidden md:block">
                            <MockBarcode code={b.ticketCode} />
                          </div>
                          <div className="text-right md:text-left">
                            <p className="text-xs font-semibold text-slate-900">
                              {b.price.toLocaleString(locale === "en" ? "en-US" : "th-TH", {
                                style: "currency",
                                currency: "THB",
                                maximumFractionDigits: 0,
                              })}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {locale === "en" ? "Paid" : "ชำระแล้ว"} ·{" "}
                              {new Date(b.paidAt).toLocaleDateString(
                                locale === "en" ? "en-US" : "th-TH",
                                { day: "2-digit", month: "short" }
                              )}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </SectionShell>
          </div>

          {/* Right column: wishlist + history summary */}
          <div className="space-y-6">
            <SectionShell
              title={locale === "en" ? "Wishlist" : "ทริปที่คุณสนใจ"}
              subtitle={
                locale === "en"
                  ? "Trips you’ve saved to come back to later."
                  : "ทริปที่คุณกดถูกใจไว้เพื่อกลับมาดูภายหลัง"
              }
            >
              {activityIds.length === 0 ? (
                <p className="text-xs text-slate-500">
                  {locale === "en"
                    ? "You haven’t added any trips to your wishlist yet."
                    : "คุณยังไม่ได้เพิ่มทริปใด ๆ ในรายการที่ถูกใจ"}
                </p>
              ) : (
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {activityIds.slice(0, 5).map((id) => (
                    <li key={id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-rose-500 text-xs">
                          ♥
                        </span>
                        <span className="truncate">
                          {locale === "en" ? `Saved activity ${id}` : `ทริปที่ถูกใจรหัส ${id}`}
                        </span>
                      </div>
                      <Link
                        href="#"
                        className="text-[11px] font-medium text-primary hover:underline whitespace-nowrap"
                      >
                        {locale === "en" ? "View" : "ดูรายละเอียด"}
                      </Link>
                    </li>
                  ))}
                  {activityIds.length > 5 && (
                    <li className="text-[11px] text-slate-500">
                      {locale === "en"
                        ? `+${activityIds.length - 5} more saved trips`
                        : `และทริปอื่น ๆ อีก ${activityIds.length - 5} รายการ`}
                    </li>
                  )}
                </ul>
              )}
            </SectionShell>

            <SectionShell
              title={locale === "en" ? "Trip history (mock)" : "ประวัติทริป (ตัวอย่างข้อมูล)"}
              subtitle={
                locale === "en"
                  ? "When we add a real database, your past trips and reviews will appear here."
                  : "เมื่อเชื่อมต่อฐานข้อมูลจริง ประวัติการเดินทางและรีวิวของคุณจะแสดงในส่วนนี้"
              }
            >
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li>
                  •{" "}
                  {locale === "en"
                    ? "Number of trips (mock): "
                    : "จำนวนทริปทั้งหมด (ตัวอย่าง): "}
                  <span className="font-semibold">{bookings.length}</span>
                </li>
                <li>
                  •{" "}
                  {locale === "en"
                    ? "Wishlisted activities (local storage): "
                    : "ทริปที่กดถูกใจ (เก็บใน local storage): "}
                  <span className="font-semibold">{activityIds.length}</span>
                </li>
                <li className="mt-1">
                  {locale === "en"
                    ? "This profile page is currently using mock data for trips. Only your Google account information is real."
                    : "หน้าโปรไฟล์นี้ใช้ข้อมูลทริปแบบจำลอง (mock) อยู่ ข้อมูลจริงมีเฉพาะบัญชี Google ของคุณเท่านั้น"}
                </li>
              </ul>
            </SectionShell>
          </div>
        </div>
      </div>
    </main>
  );
}

