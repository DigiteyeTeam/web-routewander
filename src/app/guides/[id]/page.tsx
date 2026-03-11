"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActivityCard from "@/components/ActivityCard";
import { useTranslation } from "@/context/LocaleContext";
import { getGuideById } from "@/data/guides";
import { getActivitiesByDestination, type ActivityItem } from "@/data/activities";
import { slugToCityKey } from "@/i18n/translations";
import { useMemo } from "react";

const mockReviews = [
  { id: 1, author: "Sarah M.", rating: 5, date: "2026-02-15", text: "Amazing tour! Somchai knew all the best spots and hidden gems.", textTh: "ทัวร์ดีมาก! ไกด์รู้จักสถานที่ดีๆ และที่ซ่อนเร้นทั้งหมด" },
  { id: 2, author: "John D.", rating: 5, date: "2026-02-10", text: "Very knowledgeable and friendly. Highly recommended!", textTh: "มีความรู้มากและเป็นมิตร แนะนำอย่างยิ่ง!" },
  { id: 3, author: "Emily W.", rating: 4, date: "2026-01-28", text: "Great experience, learned so much about Thai culture.", textTh: "ประสบการณ์ดีเยี่ยม ได้เรียนรู้เกี่ยวกับวัฒนธรรมไทยมากมาย" },
];

export default function GuideProfilePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0] || "";
  const guide = getGuideById(id);
  const { t, locale } = useTranslation();

  const guideTours = useMemo(() => {
    if (!guide) return [];
    const citySlug = Object.entries(slugToCityKey).find(
      ([, key]) => key === guide.locationKey
    )?.[0];
    if (!citySlug) return [];
    return getActivitiesByDestination(citySlug)
      .filter((a) => a.guideType === guide.guideType)
      .slice(0, 4);
  }, [guide]);

  if (!guide) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 mb-4">{t("notFoundActivity")}</p>
            <Link href="/guides" className="text-primary font-medium hover:underline">
              {t("navGuidesAll")}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const displayBio = locale === "en" ? guide.bioEn : guide.bio;

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="py-3 text-sm text-slate-500">
            <Link href="/" className="hover:text-primary">{t("home")}</Link>
            <span className="mx-2">/</span>
            <Link href="/guides" className="hover:text-primary">{t("navGuides")}</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-800">{t(guide.nameKey)}</span>
          </nav>

          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
            <div className="relative h-32 sm:h-48 bg-gradient-to-r from-primary to-primary-hover">
              <div className="absolute -bottom-16 left-6 sm:left-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-slate-200 shadow-lg">
                    <Image
                      src={guide.image}
                      alt={t(guide.nameKey)}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${guide.guideType === "local" ? "bg-green-500" : "bg-orange-500"}`} />
                </div>
              </div>
            </div>

            <div className="pt-20 pb-6 px-6 sm:px-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                      {t(guide.nameKey)}
                    </h1>
                    {guide.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {locale === "en" ? "Verified" : "ยืนยันแล้ว"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${guide.guideType === "local" ? "bg-green-500 text-white" : "bg-orange-500 text-white"}`}>
                      {guide.guideType === "local" ? t("localGuide") : t("generalGuide")}
                    </span>
                    <span className="text-slate-600">
                      {t(guide.locationKey)}, {t("thailand")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <span className="text-slate-500">{t("guideLicenseNumber")}:</span>
                    <span className="font-mono font-medium text-slate-700">{guide.licenseNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-amber-500 text-lg font-bold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {guide.rating}
                  </span>
                  <span className="text-slate-500">({guide.reviewCount} {t("reviews")})</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{guide.tours}</p>
                  <p className="text-sm text-slate-500">{locale === "en" ? "Tours" : "ทัวร์"}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{guide.experience}</p>
                  <p className="text-sm text-slate-500">{locale === "en" ? "Years Exp." : "ปีประสบการณ์"}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{guide.reviewCount}</p>
                  <p className="text-sm text-slate-500">{t("reviews")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  {locale === "en" ? "About" : "เกี่ยวกับ"}
                </h2>
                <p className="text-slate-700 leading-relaxed">{displayBio}</p>
              </section>

              {/* Languages */}
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  {locale === "en" ? "Languages" : "ภาษา"}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {guide.languages.map((lang) => (
                    <span key={lang} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </section>

              {/* Specialties */}
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  {locale === "en" ? "Specialties" : "ความชำนาญ"}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {guide.specialties.map((spec) => (
                    <span key={spec} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {t(spec)}
                    </span>
                  ))}
                </div>
              </section>

              {/* Reviews */}
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  {t("customerReviews")}
                </h2>
                <div className="space-y-4">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-sm">
                            {review.author[0]}
                          </div>
                          <span className="font-medium text-slate-800">{review.author}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(review.rating)].map((_, i) => (
                            <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm">
                        {locale === "en" ? review.text : review.textTh}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">{review.date}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact card */}
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                <h3 className="font-bold text-slate-800 mb-4">
                  {locale === "en" ? "Book with this guide" : "จองกับไกด์คนนี้"}
                </h3>
                <Link
                  href={`/destination/${Object.entries(slugToCityKey).find(([, k]) => k === guide.locationKey)?.[0] || "bangkok"}?guideType=${guide.guideType}`}
                  className="block w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-center transition-colors"
                >
                  {locale === "en" ? "View Tours" : "ดูทัวร์"}
                </Link>
                <p className="text-xs text-slate-500 text-center mt-3">
                  {locale === "en" ? "Response time: within 24 hours" : "เวลาตอบกลับ: ภายใน 24 ชั่วโมง"}
                </p>
              </div>
            </div>
          </div>

          {/* Tours by this guide */}
          {guideTours.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                {locale === "en" ? `Tours by ${t(guide.nameKey)}` : `ทัวร์โดย ${t(guide.nameKey)}`}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {guideTours.map((tour) => (
                  <ActivityCard key={tour.id} {...tour} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
