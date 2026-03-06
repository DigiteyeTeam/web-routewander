"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBookings } from "@/context/BookingsContext";
import { useTranslation } from "@/context/LocaleContext";

export default function UpdatesPage() {
  const { bookings } = useBookings();
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 w-full min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            {t("updatesTitle")}
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            {t("updates")}
          </p>

          {bookings.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-slate-600 mb-4">{t("updatesEmpty")}</p>
              <Link href="/" className="text-primary font-medium hover:underline">
                {t("backToHome")}
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {bookings.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/updates/${b.id}`}
                    className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    {b.activityImage ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                        <Image
                          src={b.activityImage}
                          alt=""
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-slate-200 shrink-0 flex items-center justify-center">
                        <span className="text-slate-400 text-2xl">🎫</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {b.activityTitle}
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {b.tripStartDate} · {b.travelers} {t("travelers")}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        {b.ticketCode}
                      </p>
                    </div>
                    <span className="text-slate-400 shrink-0 self-center">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
