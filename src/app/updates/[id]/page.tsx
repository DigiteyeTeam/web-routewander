"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MockBarcode from "@/components/MockBarcode";
import { useBookings } from "@/context/BookingsContext";
import { useTranslation } from "@/context/LocaleContext";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { bookings } = useBookings();
  const { t } = useTranslation();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const booking = id ? bookings.find((b) => b.id === id) : null;

  if (!id || !booking) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-slate-600 mb-4">{t("updatesEmpty")}</p>
            <Link href="/updates" className="text-primary font-medium hover:underline">
              {t("backToHome")}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const paidAtFormatted = (() => {
    const paidDate = new Date(booking.paidAt);
    if (Number.isNaN(paidDate.getTime())) return "-";
    try {
      return paidDate.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return paidDate.toISOString();
    }
  })();

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-slate-50">
        <div className="max-w-lg mx-auto px-4 sm:px-5">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1"
            >
              ← {t("updatesTitle")}
            </button>
          </div>

          {/* เอกสารยืนยันการจอง — แสดงให้ไกด์หน้างานดู */}
          <section className="rounded-2xl border-2 border-slate-200 bg-white shadow-lg overflow-hidden">
            <div className="bg-primary text-white px-5 py-4">
              <h1 className="text-lg font-bold">{t("yourBookingConfirmation")}</h1>
              <p className="text-primary-100 text-sm mt-0.5">{t("showToGuide")}</p>
            </div>

            <div className="p-5 space-y-5">
              {booking.activityImage && (
                <div className="rounded-xl overflow-hidden bg-slate-100 aspect-video">
                  <Image
                    src={booking.activityImage}
                    alt=""
                    width={400}
                    height={225}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div>
                <h2 className="font-bold text-slate-800 text-lg">{booking.activityTitle}</h2>
                <p className="text-slate-600 text-sm mt-1">{booking.optionTitle}</p>
              </div>

              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-slate-500">{t("tripStartDate")}</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{booking.tripStartDate}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("meetingPoint")}</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{booking.meetingPlace}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("paidAt")}</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{paidAtFormatted}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("travelers")}</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{booking.travelers}</dd>
                </div>
              </dl>

              {/* บาร์โค้ดจำลอง — ไกด์สแกนเพื่อยืนยันว่าผู้ใช้คนนี้ซื้อทริปนี้แล้ว */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">{t("ticketCode")}</p>
                <div className="bg-white border border-slate-200 rounded-lg p-4 flex justify-center">
                  <MockBarcode code={booking.ticketCode} className="max-w-full h-16" />
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  {t("showToGuide")}
                </p>
              </div>
            </div>
          </section>

          <div className="mt-8 text-center">
            <Link
              href="/updates"
              className="inline-block px-6 py-3 rounded-lg bg-slate-200 text-slate-800 font-medium hover:bg-slate-300"
            >
              ← {t("updatesTitle")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
