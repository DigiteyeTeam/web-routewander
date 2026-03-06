"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActivityCard from "@/components/ActivityCard";
import { useWishlist } from "@/context/WishlistContext";
import { useTranslation } from "@/context/LocaleContext";
import { getActivitiesByIds } from "@/data/activities";
import { useMemo } from "react";

export default function WishlistPage() {
  const { activityIds } = useWishlist();
  const { t } = useTranslation();
  const activities = useMemo(() => getActivitiesByIds(activityIds), [activityIds]);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 w-full min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8">
            {t("wishlist")}
          </h1>

          {activities.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-slate-600 mb-4">{t("wishlistEmpty")}</p>
              <Link href="/" className="text-primary font-medium hover:underline">
                {t("backToHome")}
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-6">
                {activities.length} {t("activities")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
                {activities.map((a) => (
                  <ActivityCard
                    key={a.id}
                    id={a.id}
                    title={a.title}
                    titleEn={a.titleEn}
                    image={a.image}
                    imageAlt={a.imageAlt}
                    rating={a.rating}
                    reviewCount={a.reviewCount}
                    duration={a.duration}
                    durationEn={a.durationEn}
                    priceFrom={a.priceFrom}
                    priceOriginal={a.priceOriginal}
                    category={a.category}
                    categoryKey={a.categoryKey}
                    badge={a.badge}
                    badgeKey={a.badgeKey}
                    badgeRed={a.badgeRed}
                    features={a.features}
                    featureKeys={a.featureKeys}
                    banner={a.banner}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
