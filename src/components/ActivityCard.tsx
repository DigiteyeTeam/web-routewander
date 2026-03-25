"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/context/LocaleContext";
import { useWishlist } from "@/context/WishlistContext";
import { filterKeyToTKey, featureKeyToTKey } from "@/i18n/translations";
import type { FeatureKey, GuideType } from "@/data/activities";
import { getGuideById } from "@/data/guides";

export type ActivityCardProps = {
  id: string;
  title: string;
  titleEn?: string;
  image: string;
  imageAlt: string;
  rating: number;
  reviewCount: number;
  duration: string;
  durationEn?: string;
  priceFrom: number;
  category?: string;
  categoryKey?: string;
  badge?: string;
  badgeKey?: "likelyToSellOut" | "popular";
  badgeRed?: boolean;
  features?: string[];
  featureKeys?: FeatureKey[];
  priceOriginal?: number;
  banner?: string;
  bannerKey?: "certifiedByRouteWander" | "originalsByRouteWander";
  guideType?: GuideType;
  guideId?: string;
  guideDisplayName?: string;
  tripCode?: string;
  className?: string;
};

export default function ActivityCard({
  id,
  title,
  titleEn,
  image,
  imageAlt,
  rating,
  reviewCount,
  duration,
  durationEn,
  priceFrom,
  category,
  categoryKey,
  badge,
  badgeKey,
  badgeRed,
  features = [],
  featureKeys,
  priceOriginal,
  banner,
  bannerKey,
  guideType,
  guideId,
  guideDisplayName,
  tripCode,
  className = "",
}: ActivityCardProps) {
  const { t, locale } = useTranslation();
  const guideLabel = guideType === "local" ? t("localGuide") : guideType === "general" ? t("generalGuide") : null;
  const guideColorClass = guideType === "local" ? "bg-green-500 text-white" : guideType === "general" ? "bg-orange-500 text-white" : "";
  const guide = !guideDisplayName && guideId ? getGuideById(guideId) : null;
  const guideName = guideDisplayName ?? (guide ? t(guide.nameKey) : null);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(id);
  const displayBanner = bannerKey ? t(bannerKey) : banner;
  const displayCategory = (categoryKey && filterKeyToTKey[categoryKey] ? t(filterKeyToTKey[categoryKey]) : category) ?? "";
  const displayTitle = locale === "en" && titleEn ? titleEn : title;
  const displayDuration = locale === "en" && durationEn ? durationEn : duration;
  const displayFeatures = (locale === "en" && featureKeys?.length
    ? featureKeys.map((k) => (featureKeyToTKey[k] ? t(featureKeyToTKey[k]) : k))
    : features) as string[];
  const featuresText = displayFeatures.length > 0 ? ` · ${displayFeatures.join(" · ")}` : "";
  return (
    <article className={`group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200 min-w-0 max-w-full ${className}`}>
      <Link href={`/activity/${id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={imageAlt}
            width={400}
            height={300}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {displayBanner && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/60 text-white text-xs font-medium">
              {displayBanner}
            </span>
          )}
          {(badge || badgeKey) && !displayBanner && (
            <span
              className={`absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-semibold ${
                badgeRed ? "bg-red-500 text-white" : "bg-primary text-white"
              }`}
            >
              {badgeKey ? t(badgeKey) : badge}
            </span>
          )}
          <button
            type="button"
            className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
              inWishlist ? "bg-red-500/90 text-white hover:bg-red-500" : "bg-white/90 hover:bg-white text-slate-600 hover:text-red-500"
            }`}
            aria-label={t("addToWishlist")}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(id);
            }}
          >
            <svg className="w-5 h-5" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            {guideLabel && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${guideColorClass}`}>
                {guideLabel}
              </span>
            )}
            {tripCode && (
              <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                {tripCode}
              </span>
            )}
          </div>
        </div>
        <div className="p-3">
          {displayCategory && (
            <p className="text-xs text-slate-500 mb-1">{displayCategory}</p>
          )}
          <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {displayTitle}
          </h3>
          {guideName && (
            <p className="text-xs text-primary truncate mb-1 inline-flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {guideName}
            </p>
          )}
          <p className="text-xs text-slate-500 mb-2">{displayDuration}{featuresText}</p>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-amber-600 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {rating} <span className="text-slate-500 font-normal">({reviewCount.toLocaleString()})</span>
            </span>
            <div className="text-right shrink-0">
              {priceOriginal != null && priceOriginal > priceFrom && (
                <span className="text-xs text-slate-400 line-through block">฿{priceOriginal.toLocaleString()}</span>
              )}
              <p className="text-sm">
                <span className="text-slate-500">{t("from")} </span>
                <strong className={priceOriginal != null && priceOriginal > priceFrom ? "text-red-600" : "text-slate-800"}>
                  ฿{priceFrom.toLocaleString()}
                </strong>
              </p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
