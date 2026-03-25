"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useBookings } from "@/context/BookingsContext";
import { useTranslation } from "@/context/LocaleContext";
import { useSession } from "next-auth/react";

type PaymentMethod = "card" | "cash";

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const { addBookings } = useBookings();
  const { t } = useTranslation();
  const { status } = useSession();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [touristEmail, setTouristEmail] = useState("");

  const total = items.reduce((sum, i) => sum + i.price, 0);

  const handleConfirm = async () => {
    if (!paymentMethod) return;
    if (status === "unauthenticated") {
      const e = touristEmail.trim();
      if (!e || !e.includes("@")) {
        setConfirmError("กรุณากรอกอีเมลเพื่อรับข้อมูลการจอง");
        return;
      }
    }
    setConfirmError(null);
    try {
      await addBookings(
        items.map((item) => ({
          activityId: item.activityId,
          activityTitle: item.activityTitle,
          activityImage: item.activityImage,
          optionTitle: item.optionTitle,
          travelers: item.travelers,
          tripStartDate: item.date,
          language: item.language,
          price: item.price,
          paymentMethod,
          meetingPlace: t("meetingPlaceDefault"),
          touristEmail: status === "unauthenticated" ? touristEmail.trim() : undefined,
        }))
      );
      setConfirmed(true);
      clearCart();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to confirm booking";
      setConfirmError(msg);
    }
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 w-full min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 mb-8">{t("cartTitle")}</h1>

          {items.length === 0 && !confirmed ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-slate-600 mb-4">{t("cartEmpty")}</p>
              <Link href="/" className="text-primary font-medium hover:underline">
                {t("backToHome")}
              </Link>
            </div>
          ) : confirmed ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-green-600 font-semibold mb-2">{t("bookingConfirmed")}</p>
              <p className="text-slate-600 text-sm mb-6">
                {paymentMethod === "card" ? t("payByCardNote") : t("payOnSiteNote")}
              </p>
              <Link
                href="/updates"
                className="inline-block px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
              >
                {t("viewMyBookings")}
              </Link>
            </div>
          ) : (
            <>
              <ul className="space-y-4 mb-8">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-white"
                  >
                    {item.activityImage && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                        <Image
                          src={item.activityImage}
                          alt=""
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-slate-800">{item.activityTitle}</h2>
                      <p className="text-sm text-slate-600">{item.optionTitle}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {item.date} · {item.travelers} {t("travelers")} · {item.language}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-slate-800">
                        {item.price.toLocaleString()} THB
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-slate-500 hover:text-red-600 mt-1"
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
                {status === "unauthenticated" && (
                  <div className="space-y-2 mb-6">
                    <h2 className="text-lg font-bold text-slate-800">{t("email")}</h2>
                    <label className="block text-sm text-slate-600">
                      อีเมลสำหรับส่งข้อมูลการจอง (สำหรับทดสอบกรอกอะไรก็ได้ที่เป็นรูปแบบอีเมล)
                    </label>
                    <input
                      type="email"
                      value={touristEmail}
                      onChange={(e) => setTouristEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full mt-1 py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 bg-white"
                    />
                  </div>
                )}
                <h2 className="text-lg font-bold text-slate-800 mb-4">{t("paymentMethod")}</h2>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 border-slate-200 hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="mt-1 w-4 h-4 text-primary"
                    />
                    <div>
                      <p className="font-medium text-slate-800">1. {t("payByCard")}</p>
                      <p className="text-sm text-slate-600">{t("creditDebitCard")}</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 border-slate-200 hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                      className="mt-1 w-4 h-4 text-primary"
                    />
                    <div>
                      <p className="font-medium text-slate-800">2. {t("payOnSite")}</p>
                      <p className="text-sm text-slate-600">{t("payOnSiteWarNote")}</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <p className="text-xl font-bold text-slate-800">
                  {t("total")} {total.toLocaleString()} THB
                </p>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!paymentMethod}
                  className="px-8 py-3 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold"
                >
                  {t("confirmBooking")}
                </button>
              </div>

              {confirmError && <p className="text-sm text-red-600 mt-4">{confirmError}</p>}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
