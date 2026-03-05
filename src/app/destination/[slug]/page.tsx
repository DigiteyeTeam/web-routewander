"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActivityCard from "@/components/ActivityCard";
import {
  DESTINATION_NAMES,
  FILTER_CATEGORIES,
  getFilteredActivities,
} from "@/data/activities";

export default function DestinationPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const [selectedFilter, setSelectedFilter] = useState("all");

  const cityName = useMemo(
    () => DESTINATION_NAMES[slug] || slug,
    [slug]
  );

  const activities = useMemo(
    () => getFilteredActivities(slug, selectedFilter),
    [slug, selectedFilter]
  );

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 w-full min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              สำรวจ {cityName}
            </h1>
          </div>

          {/* แถบตัวกรอง */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-slate-600">ตัวกรอง:</span>
              <div className="flex flex-wrap gap-2">
                {FILTER_CATEGORIES.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setSelectedFilter(f.key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFilter === f.key
                        ? "bg-primary text-white"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-500">
              {activities.length}+ ผลลัพธ์: {cityName}
            </p>
          </div>

          {/* กริดทริป */}
          {activities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
              {activities.map((a) => (
                <ActivityCard
                  key={a.id}
                  id={a.id}
                  title={a.title}
                  image={a.image}
                  imageAlt={a.imageAlt}
                  rating={a.rating}
                  reviewCount={a.reviewCount}
                  duration={a.duration}
                  priceFrom={a.priceFrom}
                  priceOriginal={a.priceOriginal}
                  category={a.category}
                  badge={a.badge}
                  badgeRed={a.badgeRed}
                  features={a.features}
                  banner={a.banner}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500">
              <p>ไม่พบกิจกรรมในหมวดนี้</p>
              <button
                type="button"
                onClick={() => setSelectedFilter("all")}
                className="mt-4 text-primary font-medium hover:underline"
              >
                แสดงทั้งหมด
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
