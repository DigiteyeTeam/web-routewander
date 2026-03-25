"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getActivityById, DESTINATION_NAMES } from "@/data/activities";
import { getGuideById } from "@/data/guides";
import { usePublicActivities } from "@/hooks/usePublicActivities";
import { publicTripToActivityDetail, type PublicTrip } from "@/lib/public-catalog";
import ActivityCard from "@/components/ActivityCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useTranslation } from "@/context/LocaleContext";
import { slugToCityKey } from "@/i18n/translations";
import { Calendar } from "lucide-react";

function formatIsoDateDdMmYyyy(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function AboutIcon({ type }: { type: string }) {
  if (type === "cancel") {
    return (
      <svg className="w-5 h-5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (type === "pay") {
    return (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  if (type === "clock") {
    return (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (type === "guide") {
    return (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    );
  }
  return null;
}

export default function ActivityPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const [apiTrip, setApiTrip] = useState<PublicTrip | null>(null);
  const [catalogResolved, setCatalogResolved] = useState(false);
  const { activities: catalog } = usePublicActivities();

  useEffect(() => {
    if (!id) {
      setApiTrip(null);
      setCatalogResolved(true);
      return;
    }
    let cancelled = false;
    setCatalogResolved(false);
    (async () => {
      try {
        const res = await fetch(`/api/public/trips/${encodeURIComponent(id)}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (!cancelled && data.trip) setApiTrip(data.trip as PublicTrip);
          else if (!cancelled) setApiTrip(null);
        } else if (!cancelled) setApiTrip(null);
      } catch {
        if (!cancelled) setApiTrip(null);
      } finally {
        if (!cancelled) setCatalogResolved(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const mockActivity = useMemo(() => getActivityById(id), [id]);
  const activity = useMemo(() => {
    if (apiTrip) return publicTripToActivityDetail(apiTrip);
    return mockActivity;
  }, [apiTrip, mockActivity]);

  const guide = useMemo(() => {
    if (apiTrip || !activity?.guideId) return null;
    return getGuideById(activity.guideId);
  }, [activity, apiTrip]);

  const apiGuide = apiTrip
    ? {
        linkId: apiTrip.guideId,
        name: apiTrip.guideName,
        image: apiTrip.guideImage || apiTrip.image,
        guideType: apiTrip.guideType,
        licenseNumber: "" as string,
      }
    : null;

  const related = useMemo(() => {
    if (!activity) return [];
    return catalog.filter((a) => a.slug === activity.slug && a.id !== id).slice(0, 4);
  }, [activity, id, catalog]);

  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [travelers, setTravelers] = useState(1);
  const [date, setDate] = useState("");
  const [language, setLanguage] = useState("ไทย / อังกฤษ");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const galleryImages = useMemo(() => {
    const raw = [activity?.image, ...(activity?.imageGallery ?? [])];
    const out: string[] = [];
    const seen = new Set<string>();
    for (const url of raw) {
      const u = typeof url === "string" ? url.trim() : "";
      if (!u || seen.has(u)) continue;
      seen.add(u);
      out.push(u);
    }
    return out.slice(0, 5);
  }, [activity?.image, activity?.imageGallery]);
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [activity?.id, galleryImages.length]);

  if (!catalogResolved) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </main>
        <Footer />
      </>
    );
  }

  if (!activity) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 mb-4">{t("notFoundActivity")}</p>
            <Link href="/" className="text-primary font-medium hover:underline">{t("backToHome")}</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const hasOptions = activity.options && activity.options.length > 0;
  const selectedOption = hasOptions ? activity.options?.[selectedOptionIndex] : null;
  const displayPrice = selectedOption
    ? selectedOption.pricePerGroup
      ? selectedOption.price
      : selectedOption.price * travelers
    : activity.priceFrom * travelers;
  const priceLabel = selectedOption?.pricePerGroup ? t("perGroup") : t("perPerson");
  const canGoToCart = date.trim() !== "";
  const optionTitleForCart = selectedOption?.title ?? activity.title;
  const cityKey = slugToCityKey[activity.slug];
  const cityName = cityKey ? t(cityKey) : (DESTINATION_NAMES[activity.slug] || activity.slug);
  const inWishlist = isInWishlist(activity.id);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 w-full min-w-0">
          {/* Breadcrumb – ซ่อนบนมือถือให้คล้ายตัวอย่าง */}
          <nav className="hidden sm:block py-3 text-sm text-slate-500">
            <Link href="/" className="hover:text-primary">{t("home")}</Link>
            <span className="mx-2">/</span>
            <Link href={`/destination/${activity.slug}`} className="hover:text-primary">{t("explore")} {cityName}</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-800 truncate max-w-[200px] inline-block align-bottom">{locale === "en" && activity.titleEn ? activity.titleEn : activity.title}</span>
          </nav>

          {/* การ์ดหลักของกิจกรรม – บนมือถือเอาพื้นหลังขาวออก เหลือเฉพาะเดสก์ท็อป */}
          <div className="rounded-3xl p-0 sm:bg-white sm:shadow-md sm:p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* คอลัมน์ซ้าย */}
              <div className="flex-1 min-w-0">
                {/* แกลเลอรี่ – อยู่บนสุดสำหรับมือถือ */}
                <div className="flex gap-2 mb-5 sm:mb-8">
                  <div className="relative flex-1 aspect-[16/10] rounded-xl overflow-hidden bg-slate-200">
                    <Image
                      src={galleryImages[selectedImageIndex] || galleryImages[0] || activity.image}
                      alt={activity.imageAlt}
                      fill
                      className="object-cover"
                      priority
                    />
                    <button
                      type="button"
                      className={`absolute top-3 right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                        inWishlist ? "bg-red-500/90 text-white hover:bg-red-500" : "bg-white/90 text-slate-600 hover:bg-white hover:text-red-500"
                      }`}
                      aria-label={t("addToWishlist")}
                      onClick={() => toggleWishlist(activity.id)}
                    >
                      <svg className="w-5 h-5" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded bg-black/50 text-white text-xs sm:text-sm"
                    >
                      {t("share")}
                    </button>
                    {/* จุดบอกจำนวนรูป */}
                    {galleryImages.length > 1 ? (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {galleryImages.map((_, i) => (
                          <button
                            type="button"
                            key={`dot-${i}`}
                            onClick={() => setSelectedImageIndex(i)}
                            aria-label={`view image ${i + 1}`}
                            className={`h-2 w-2 rounded-full transition ${
                              i === selectedImageIndex ? "bg-white scale-110" : "bg-white/60 hover:bg-white/80"
                            }`}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {galleryImages.length > 1 ? (
                    <div className="hidden sm:flex flex-col gap-2 w-24 shrink-0">
                      {galleryImages.slice(1, 3).map((img, idx) => {
                        const actualIndex = idx + 1;
                        return (
                        <button
                          type="button"
                          key={`thumb-${idx}`}
                          onClick={() => setSelectedImageIndex(actualIndex)}
                          className={`aspect-square rounded-lg overflow-hidden bg-slate-200 relative text-left border-2 ${
                            selectedImageIndex === actualIndex ? "border-primary" : "border-transparent hover:border-white/70"
                          }`}
                          aria-label={`view image ${actualIndex + 1}`}
                        >
                          <Image src={img} alt="" width={96} height={96} className="object-cover w-full h-full" />
                          {idx === 1 && galleryImages.length > 3 ? (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm">
                              +{galleryImages.length - 3}
                            </span>
                          ) : null}
                        </button>
                      )})}
                    </div>
                  ) : null}
                </div>

                {/* ข้อมูลชื่อ / คะแนน / ผู้ให้บริการ – อยู่ใต้รูป และตัวอักษรเล็กลงบนมือถือ */}
                <div className="mb-4">
                  {activity.banner && (
                    <span className="inline-block px-3 py-1 rounded bg-slate-800 text-white text-[11px] sm:text-xs font-medium mb-2">
                      {activity.banner}
                    </span>
                  )}
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                    {locale === "en" && activity.titleEn ? activity.titleEn : activity.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{activity.rating}</span>
                    </span>
                    <span className="text-slate-600">
                      ({activity.reviewCount.toLocaleString()} {t("reviews")})
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-600">{t("provider")}: Route Wander</span>
                    {activity.tripCode && (
                      <>
                        <span className="text-slate-500">·</span>
                        <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{activity.tripCode}</span>
                      </>
                    )}
                  </div>
                  {(apiGuide || guide) && (
                    <div className="flex items-center gap-3 mt-3 p-3 bg-slate-50 rounded-xl">
                      <Link
                        href={`/guides/${encodeURIComponent(apiGuide ? apiGuide.linkId : guide!.id)}`}
                        className="shrink-0"
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                          <Image
                            src={apiGuide ? apiGuide.image : guide!.image}
                            alt=""
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                              (apiGuide ?? guide)!.guideType === "local" ? "bg-green-500" : "bg-orange-500"
                            }`}
                          />
                        </div>
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/guides/${encodeURIComponent(apiGuide ? apiGuide.linkId : guide!.id)}`}
                          className="font-semibold text-slate-800 hover:text-primary transition-colors"
                        >
                          {apiGuide ? apiGuide.name : t(guide!.nameKey)}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              (apiGuide ?? guide)!.guideType === "local" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                            }`}
                          >
                            {(apiGuide ?? guide)!.guideType === "local" ? t("localGuide") : t("generalGuide")}
                          </span>
                          {(apiGuide?.licenseNumber || guide?.licenseNumber) ? (
                            <span className="font-mono">{apiGuide?.licenseNumber || guide?.licenseNumber}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              {(activity.description || activity.descriptionEn) && (
                <p className="text-sm sm:text-base text-slate-700 mb-8">
                  {locale === "en" && activity.descriptionEn ? activity.descriptionEn : activity.description}
                </p>
              )}

              {/* About this activity - labels from t() so they follow locale */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-slate-800 mb-4">{t("aboutThisActivity")}</h2>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <AboutIcon type="cancel" />
                    <div>
                      <p className="font-medium text-slate-800">{t("freeCancellation")}</p>
                      <p className="text-sm text-slate-600">{t("cancelFree24h")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <AboutIcon type="pay" />
                    <div>
                      <p className="font-medium text-slate-800">{t("aboutBookNowTitle")}</p>
                      <p className="text-sm text-slate-600">{t("aboutBookNowText")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <AboutIcon type="clock" />
                    <div>
                      <p className="font-medium text-slate-800">{t("aboutDurationTitle")}</p>
                      <p className="text-sm text-slate-600">{(locale === "en" && activity.durationEn ? activity.durationEn : activity.duration)} — {t("aboutDurationText")}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <AboutIcon type="guide" />
                    <div>
                      <p className="font-medium text-slate-800">{t("aboutGuideTitle")}</p>
                      <p className="text-sm text-slate-600">{t("aboutGuideText")}</p>
                      {activity.guideType && (
                        <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${activity.guideType === "local" ? "bg-green-500 text-white" : "bg-orange-500 text-white"}`}>
                          {activity.guideType === "local" ? t("localGuide") : t("generalGuide")}
                        </span>
                      )}
                    </div>
                  </li>
                </ul>
              </section>

              {/* ไฮไลท์ */}
              {activity.highlights && activity.highlights.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-slate-800 mb-4">{t("highlights")}</h2>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    {activity.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* รวม / ไม่รวม */}
              <section className="mb-8 grid sm:grid-cols-2 gap-6">
                {activity.included && activity.included.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-3">{t("included")}</h2>
                    <ul className="space-y-2">
                      {activity.included.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-700">
                          <span className="text-green-600">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {activity.notIncluded && activity.notIncluded.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-3">{t("notIncluded")}</h2>
                    <ul className="space-y-2">
                      {activity.notIncluded.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-700">
                          <span className="text-red-500">✗</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* ไม่เหมาะสำหรับ */}
              {activity.notSuitableFor && activity.notSuitableFor.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-slate-800 mb-3">{t("notSuitableFor")}</h2>
                  <p className="text-slate-600">{activity.notSuitableFor.join(", ")}</p>
                </section>
              )}

              {/* จุดนัดพบ */}
              {activity.meetingPoint && (
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-slate-800 mb-3">{t("meetingPoint")}</h2>
                  <p className="text-slate-700 mb-2">{activity.meetingPoint}</p>
                  {activity.meetingPointMapUrl?.trim() ? (
                    <a
                      href={activity.meetingPointMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary font-medium text-sm hover:underline"
                    >
                      {t("openInMaps")} →
                    </a>
                  ) : null}
                </section>
              )}

              {/* ข้อมูลสำคัญ */}
              {activity.importantInfo && activity.importantInfo.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-slate-800 mb-4">{t("importantInfo")}</h2>
                  <div className="space-y-4">
                    {activity.importantInfo.map((block, i) => (
                      <div key={i}>
                        <h3 className="font-medium text-slate-800 mb-2">{block.title}</h3>
                        <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
                          {block.items.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* กำหนดการเดินทาง */}
              {activity.itinerary && activity.itinerary.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-slate-800 mb-4">{t("itinerary")}</h2>
                  <ol className="space-y-3 border-l-2 border-primary/30 pl-4">
                    {activity.itinerary.map((step, i) => (
                      <li key={i} className="relative">
                        <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                        <p className="font-semibold text-slate-800">
                          {locale === "en" ? step.titleEn?.trim() || step.title : step.title}
                        </p>
                        {(locale === "en" ? step.detailEn?.trim() || step.detail : step.detail) ? (
                          <p className="text-sm text-slate-600">
                            {locale === "en" ? step.detailEn?.trim() || step.detail : step.detail}
                          </p>
                        ) : null}
                        {step.duration ? <p className="text-xs text-slate-500">{step.duration}</p> : null}
                        {step.mapUrl?.trim() ? (
                          <a
                            href={step.mapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                          >
                            {t("openInMaps")}
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* คุณอาจจะชอบ */}
              {related.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-slate-800 mb-4">
                    คุณอาจจะชอบ...
                  </h2>

                  {/* มือถือ: การ์ดเล็ก แถวเดียว เลื่อนซ้าย-ขวา */}
                  <div className="sm:hidden -mx-4 px-4">
                    <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth">
                      {related.map((a) => (
                        <div key={a.id} className="w-[240px] shrink-0">
                          <ActivityCard {...a} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* จอใหญ่: กริดปกติ */}
                  <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {related.map((a) => (
                      <ActivityCard key={a.id} {...a} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* คอลัมน์ขวา - การจอง */}
            <aside className="lg:w-96 shrink-0 mt-4 lg:mt-0">
              <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200 bg-slate-50 lg:bg-white p-5 lg:p-6 shadow-sm">
                {activity.badgeRed && (
                  <p className="text-red-600 font-medium text-sm mb-3">{activity.badgeKey ? t(activity.badgeKey) : activity.badge}</p>
                )}
                <p className="text-2xl font-bold text-slate-800 mb-6">
                  {t("from")} <strong>{displayPrice.toLocaleString()} THB</strong>{" "}
                  <span className="text-base font-normal text-slate-500">{priceLabel}</span>
                </p>
                <div className="space-y-3 mb-6">
                  <label className="block">
                    <span className="text-xs text-slate-500">{t("travelersLabel")}</span>
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(Number(e.target.value))}
                      className="w-full mt-1 py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n} x {t("travelerUnit")}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs text-slate-500">{t("dateLabel")}</span>
                    <div className="relative mt-1">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 10)}
                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                        aria-label={t("dateLabel")}
                      />
                      <div className="pointer-events-none flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-slate-800">
                        <span className={date ? "text-slate-800" : "text-slate-400"}>
                          {date ? formatIsoDateDdMmYyyy(date) : "DD / MM / YYYY"}
                        </span>
                        <Calendar className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      </div>
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-xs text-slate-500">{t("languageLabel")}</span>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full mt-1 py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 bg-white"
                    >
                      <option value="ไทย / อังกฤษ">{t("guideLangThaiAndEnglish")}</option>
                      <option value="ไทย">{t("guideLangThai")}</option>
                      <option value="อังกฤษ">{t("guideLangEnglish")}</option>
                    </select>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!canGoToCart) return;
                    const opt = activity.options?.[selectedOptionIndex];
                    addItem({
                      activityId: activity.id,
                      activityTitle: activity.title,
                      activityImage: activity.image,
                      optionIndex: hasOptions ? selectedOptionIndex : 0,
                      optionTitle: optionTitleForCart,
                      travelers,
                      date,
                      language,
                      price: opt?.pricePerGroup ? opt.price : (opt?.price ?? activity.priceFrom) * travelers,
                      pricePerGroup: opt?.pricePerGroup,
                    });
                    router.push("/cart");
                  }}
                  disabled={!canGoToCart}
                  className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold"
                >
                  {t("goToCart")}
                </button>
                {!canGoToCart && (
                  <p className="text-xs text-slate-500 mt-2 text-center">{t("pleaseSelectDate")}</p>
                )}
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex gap-2">
                    <span className="text-green-600 shrink-0">✓</span>
                    <p className="text-slate-600">{t("cancelFree24h")}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-600 shrink-0">✓</span>
                    <p className="text-slate-600">{t("bookNowPayLater")}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* รีวิวลูกค้า — ปิดท้ายด้วยคอมเม้นให้คะแนน */}
          <section className="mt-10 pt-8 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{t("customerReviews")}</h2>
            <div className="flex flex-col lg:flex-row gap-8">
              <aside className="lg:w-56 shrink-0">
                <p className="text-sm font-medium text-slate-500 mb-2">{t("overallRating")}</p>
                <p className="text-3xl font-bold text-slate-800">{activity.rating}/5</p>
                <div className="flex items-center gap-1 text-amber-500 my-2">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className="w-6 h-6" fill={s <= Math.round(activity.rating) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-slate-500">{t("basedOnReviews")} {activity.reviewCount.toLocaleString()} {t("reviews")}</p>
                {activity.reviewSummary && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-slate-700 mb-3">{t("reviewSummary")}</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">ไกด์</span>
                          <span className="font-medium text-slate-800">{activity.reviewSummary.guide}/5</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(activity.reviewSummary.guide / 5) * 100}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{t("transportation")}</span>
                          <span className="font-medium text-slate-800">{activity.reviewSummary.transportation}/5</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(activity.reviewSummary.transportation / 5) * 100}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{t("valueForMoney")}</span>
                          <span className="font-medium text-slate-800">{activity.reviewSummary.valueForMoney}/5</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(activity.reviewSummary.valueForMoney / 5) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </aside>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-6">
                  <input type="search" placeholder={t("searchReviewsPlaceholder")} className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400" />
                  <select className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 bg-white text-sm">
                    <option>เรียงตาม: ที่แนะนำ</option>
                  </select>
                  <button type="button" className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">
                    กรอง
                  </button>
                </div>
                <ul className="space-y-6">
                  {(activity.reviews || []).map((r) => (
                    <li key={r.id} className="pb-6 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-10 h-10 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center text-sm">
                          {r.authorName.charAt(0)}
                        </span>
                        <div>
                          <p className="font-medium text-slate-800">{r.authorName} — {r.authorCountry}</p>
                          <p className="text-xs text-slate-500">{r.date}{r.verified ? " · จองจริง" : ""}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 text-amber-500 mb-2">
                        {[1,2,3,4,5].map((s) => (
                          <svg key={s} className="w-4 h-4" fill={s <= r.rating ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      {r.photos && r.photos.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {r.photos.slice(0, 4).map((url, i) => (
                            <div key={i} className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                              <Image src={url} alt="" width={80} height={80} className="object-cover w-full h-full" />
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-slate-700 text-sm leading-relaxed">{r.text}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                        <span className="text-slate-500">{t("wasThisHelpful")}</span>
                        <button type="button" className="text-slate-600 hover:text-primary flex items-center gap-1" aria-label={t("helpful")}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .014-.002.028-.002.043V7m0 5v5a2 2 0 01-2 2h-2c-1.066 0-1.99.8-2.114 1.878A2.003 2.003 0 017 18v-4" /></svg>
                          {r.helpfulCount ?? 0}
                        </button>
                        <button type="button" className="text-primary font-medium hover:underline">{t("translate")}</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
