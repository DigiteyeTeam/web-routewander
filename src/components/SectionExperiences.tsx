"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import ActivityCard from "./ActivityCard";
import { useTranslation } from "@/context/LocaleContext";
import { getAllActivities } from "@/data/activities";
import { guides } from "@/data/guides";

const REVIEWS = [
  {
    id: 1,
    name: "Sarah Johnson",
    nameKey: "reviewerSarah",
    country: "United States",
    countryKey: "countryUSA",
    avatar: "/images/reviewers/reviewer1.jpg",
    rating: 5,
    date: "2024-02-15",
    tripName: "วัดพระแก้วและวัดสำคัญ กรุงเทพ",
    tripNameKey: "tripGrandPalace",
    guideName: "คุณสมชาย ใจดี",
    guideNameKey: "guideSomchai",
    review: "Amazing experience! Our guide was incredibly knowledgeable about Thai history and culture. The temples were breathtaking and the tour was perfectly paced.",
    reviewKey: "reviewSarah",
  },
  {
    id: 2,
    name: "田中 太郎",
    nameKey: "reviewerTanaka",
    country: "Japan",
    countryKey: "countryJapan",
    avatar: "/images/reviewers/reviewer2.jpg",
    rating: 5,
    date: "2024-02-10",
    tripName: "ตลาดน้ำอัมพวา",
    tripNameKey: "tripAmphawa",
    guideName: "คุณสุภาพร รักเที่ยว",
    guideNameKey: "guideSupaporn",
    review: "素晴らしいツアーでした！ガイドさんがとても親切で、地元の美味しい料理も紹介してくれました。ホタルも見れて最高の思い出になりました。",
    reviewKey: "reviewTanaka",
  },
  {
    id: 3,
    name: "Emma Wilson",
    nameKey: "reviewerEmma",
    country: "Australia",
    countryKey: "countryAustralia",
    avatar: "/images/reviewers/reviewer3.jpg",
    rating: 5,
    date: "2024-02-08",
    tripName: "ดอยอินทนนท์ เดย์ทริป",
    tripNameKey: "tripDoiInthanon",
    guideName: "คุณวิชัย ภูเขา",
    guideNameKey: "guideWichai",
    review: "What a fantastic day trip! The scenery was absolutely stunning and our guide shared so much fascinating information about the local hill tribes. Highly recommended!",
    reviewKey: "reviewEmma",
  },
  {
    id: 4,
    name: "มานี สุขใจ",
    nameKey: "reviewerManee",
    country: "ไทย",
    countryKey: "countryThailand",
    avatar: "/images/reviewers/reviewer4.jpg",
    rating: 5,
    date: "2024-02-05",
    tripName: "คลาสทำอาหารไทย",
    tripNameKey: "tripThaiCooking",
    guideName: "คุณสุภาพร รักเที่ยว",
    guideNameKey: "guideSupaporn",
    review: "ได้เรียนรู้เทคนิคการทำอาหารไทยแท้ๆ ไกด์อธิบายละเอียดมาก บรรยากาศเป็นกันเอง แนะนำมากค่ะ!",
    reviewKey: "reviewManee",
  },
  {
    id: 5,
    name: "Michael Chen",
    nameKey: "reviewerMichael",
    country: "Singapore",
    countryKey: "countrySingapore",
    avatar: "/images/reviewers/reviewer5.jpg",
    rating: 5,
    date: "2024-01-28",
    tripName: "เกาะพีพี ดำน้ำ",
    tripNameKey: "tripPhiPhi",
    guideName: "คุณนารี ทะเล",
    guideNameKey: "guideNaree",
    review: "Crystal clear water and amazing marine life! The guide knew all the best spots for snorkeling. Professional and safety-conscious. Will definitely book again!",
    reviewKey: "reviewMichael",
  },
  {
    id: 6,
    name: "Sophie Martin",
    nameKey: "reviewerSophie",
    country: "France",
    countryKey: "countryFrance",
    avatar: "/images/reviewers/reviewer6.jpg",
    rating: 5,
    date: "2024-01-25",
    tripName: "ทัวร์ร้านอาหารย่านเยาวราช",
    tripNameKey: "tripYaowarat",
    guideName: "คุณสุภาพร รักเที่ยว",
    guideNameKey: "guideSupaporn",
    review: "Une expérience culinaire incroyable! Notre guide connaissait tous les meilleurs restaurants locaux. La nourriture était délicieuse et authentique. Parfait!",
    reviewKey: "reviewSophie",
  },
];

export default function SectionExperiences() {
  const { t, locale } = useTranslation();

  const allActivities = useMemo(() => getAllActivities(), []);

  const generalGuideTrips = useMemo(() => {
    return allActivities.filter((a) => a.guideType === "general").slice(0, 4);
  }, [allActivities]);

  const localGuideTrips = useMemo(() => {
    return allActivities.filter((a) => a.guideType === "local").slice(0, 4);
  }, [allActivities]);

  const allGuides = useMemo(() => {
    return [...guides].slice(0, 8);
  }, []);

  return (
    <>
      {/* ทริปของไกด์ทั่วไป */}
      <section className="py-8 px-4 sm:px-5 md:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
                {t("generalGuideTripsTitle")}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  {t("generalGuide")}
                </span>
              </div>
            </div>
            <Link
              href="/search?guideType=general"
              className="text-sm text-primary font-medium hover:underline"
            >
              {locale === "en" ? "View all" : "ดูทั้งหมด"} →
            </Link>
          </div>

          {/* มือถือ: เลื่อนซ้ายขวา */}
          <div className="sm:hidden -mx-4 px-4">
            <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth">
              {generalGuideTrips.map((a) => (
                <div key={a.id} className="shrink-0 w-[260px]">
                  <ActivityCard {...a} />
                </div>
              ))}
            </div>
          </div>

          {/* จอใหญ่: แสดงเป็นกริด */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6 min-w-0">
            {generalGuideTrips.map((a) => (
              <ActivityCard key={a.id} {...a} />
            ))}
          </div>
        </div>
      </section>

      {/* ทริปของไกด์ท้องถิ่น */}
      <section className="py-8 px-4 sm:px-5 md:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
                {t("memorableExperiences")}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {t("localGuide")}
                </span>
              </div>
            </div>
            <Link
              href="/search?guideType=local"
              className="text-sm text-primary font-medium hover:underline"
            >
              {locale === "en" ? "View all" : "ดูทั้งหมด"} →
            </Link>
          </div>

          {/* มือถือ: เลื่อนซ้ายขวา */}
          <div className="sm:hidden -mx-4 px-4">
            <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth">
              {localGuideTrips.map((a) => (
                <div key={a.id} className="shrink-0 w-[260px]">
                  <ActivityCard {...a} />
                </div>
              ))}
            </div>
          </div>

          {/* จอใหญ่: แสดงเป็นกริด */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6 min-w-0">
            {localGuideTrips.map((a) => (
              <ActivityCard key={a.id} {...a} />
            ))}
          </div>
        </div>
      </section>

      {/* สุ่มแสดงไกด์ */}
      <section className="py-8 px-4 sm:px-5 md:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                {locale === "en" ? "Meet our guides" : "พบกับไกด์ของเรา"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {locale === "en" ? "Experienced local and professional guides" : "ไกด์ท้องถิ่นและไกด์ทั่วไปที่มีประสบการณ์"}
              </p>
            </div>
            <Link
              href="/guides"
              className="text-sm text-primary font-medium hover:underline"
            >
              {locale === "en" ? "View all guides" : "ดูไกด์ทั้งหมด"} →
            </Link>
          </div>

          {/* มือถือ: เลื่อนซ้ายขวา */}
          <div className="sm:hidden -mx-4 px-4">
            <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth">
              {allGuides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.id}`}
                  className="shrink-0 w-[260px] bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="relative aspect-[4/3] bg-slate-200">
                    <Image
                      src={guide.image}
                      alt=""
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      guide.guideType === "local" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                    }`}>
                      {guide.guideType === "local" ? t("localGuide") : t("generalGuide")}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 text-base mb-1 group-hover:text-primary transition-colors">
                      {t(guide.nameKey)}
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">{t(guide.locationKey)}, {t("thailand")}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {guide.rating}
                        <span className="text-slate-500">({guide.reviewCount})</span>
                      </span>
                      <span className="text-slate-400 font-mono text-xs">{guide.licenseNumber}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* จอใหญ่: แสดงเป็นกริด */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6 min-w-0">
            {allGuides.slice(0, 4).map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.id}`}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all group"
              >
                <div className="relative aspect-[4/3] bg-slate-200">
                  <Image
                    src={guide.image}
                    alt=""
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    guide.guideType === "local" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                  }`}>
                    {guide.guideType === "local" ? t("localGuide") : t("generalGuide")}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-primary transition-colors">
                    {t(guide.nameKey)}
                  </h3>
                  <p className="text-sm text-slate-500 mb-2">{t(guide.locationKey)}, {t("thailand")}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {guide.rating}
                      <span className="text-slate-500">({guide.reviewCount})</span>
                    </span>
                    <span className="text-slate-400 font-mono text-xs">{guide.licenseNumber}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* รีวิวจากนักท่องเที่ยว */}
      <section className="py-10 px-4 sm:px-5 md:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
              {locale === "en" ? "What Travelers Say" : "รีวิวจากนักท่องเที่ยว"}
            </h2>
            <p className="text-sm text-slate-500">
              {locale === "en" 
                ? "Real experiences from our happy customers" 
                : "ประสบการณ์จริงจากลูกค้าที่มีความสุข"}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-slate-600 font-semibold">4.9</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 text-sm">
                {locale === "en" ? "2,500+ reviews" : "2,500+ รีวิว"}
              </span>
            </div>
          </div>

          {/* Horizontal Scroll Carousel */}
          <div className="-mx-4 px-4 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
            <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide">
              {REVIEWS.map((review) => (
                <div
                  key={review.id}
                  className="shrink-0 w-[300px] sm:w-[340px] lg:w-[380px] snap-start bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {review.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate">{review.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {review.country}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-4 mb-3">
                    &ldquo;{review.review}&rdquo;
                  </p>
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      <span className="text-primary font-medium">{review.tripName}</span>
                      <span className="mx-1.5">·</span>
                      <span>{review.guideName}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
