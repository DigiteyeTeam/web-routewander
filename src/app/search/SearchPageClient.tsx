"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActivityCard from "@/components/ActivityCard";
import { FILTER_CATEGORIES, searchActivities, getAllActivities, type ActivityItem } from "@/data/activities";
import { getGuideById } from "@/data/guides";
import { ACTIVITY_LOCATIONS, DESTINATION_COORDINATES, THAILAND_CENTER, THAILAND_ZOOM, type Coordinates } from "@/data/locations";
import { useMemo, useState } from "react";
import { useTranslation } from "@/context/LocaleContext";
import { filterKeyToTKey } from "@/i18n/translations";

const LocationMapComponent = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center">
      <span className="text-slate-500">Loading map...</span>
    </div>
  ),
});

type ViewMode = "list" | "map";

type LocationGroup = {
  locationKey: string;
  locationName: string;
  locationNameEn: string;
  coordinates: Coordinates;
  trips: (ActivityItem & { locationName?: string })[];
  tripCount: number;
};

type SearchPageClientProps = {
  initialQuery: string;
  initialGuideType?: string;
};

export default function SearchPageClient({ initialQuery, initialGuideType }: SearchPageClientProps) {
  const q = initialQuery;
  const { t, locale } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [guideTypeFilter, setGuideTypeFilter] = useState(initialGuideType || "all");
  const [selectedLocation, setSelectedLocation] = useState<LocationGroup | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string>("all");

  const allResults = useMemo(() => {
    if (q) {
      return searchActivities(q);
    }
    return getAllActivities();
  }, [q]);

  const results = useMemo(() => {
    let filtered = allResults;
    
    if (guideTypeFilter !== "all") {
      filtered = filtered.filter((a) => a.guideType === guideTypeFilter);
    }

    if (selectedDestination !== "all") {
      filtered = filtered.filter((a) => a.slug === selectedDestination);
    }
    
    if (selectedFilter === "all") return filtered;
    if (selectedFilter === "food") {
      return filtered.filter((a) => a.categoryKey === "food" || a.categoryKey === "food-drink");
    }
    return filtered.filter((a) => a.categoryKey === selectedFilter);
  }, [allResults, selectedFilter, guideTypeFilter, selectedDestination]);

  const activitiesWithLocations = useMemo(() => {
    return results.map((activity) => {
      const location = ACTIVITY_LOCATIONS.find((loc) => loc.id === activity.id);
      return {
        ...activity,
        coordinates: location?.coordinates,
        locationName: locale === "en" ? location?.locationNameEn : location?.locationName,
        locationKey: location?.locationName || "",
      };
    }).filter((a) => a.coordinates);
  }, [results, locale]);

  const locationGroups = useMemo(() => {
    const groups = new Map<string, LocationGroup>();
    
    activitiesWithLocations.forEach((activity) => {
      const location = ACTIVITY_LOCATIONS.find((loc) => loc.id === activity.id);
      if (!location) return;
      
      const key = location.locationName;
      
      if (!groups.has(key)) {
        groups.set(key, {
          locationKey: key,
          locationName: location.locationName,
          locationNameEn: location.locationNameEn,
          coordinates: location.coordinates,
          trips: [],
          tripCount: 0,
        });
      }
      
      const group = groups.get(key)!;
      group.trips.push(activity);
      group.tripCount = group.trips.length;
    });
    
    return Array.from(groups.values());
  }, [activitiesWithLocations]);

  const mapCenter = useMemo(() => {
    if (selectedDestination !== "all") {
      const dest = DESTINATION_COORDINATES.find((d) => d.slug === selectedDestination);
      return dest ? dest.coordinates : THAILAND_CENTER;
    }
    return THAILAND_CENTER;
  }, [selectedDestination]);

  const mapZoom = useMemo(() => {
    if (selectedDestination !== "all") {
      const dest = DESTINATION_COORDINATES.find((d) => d.slug === selectedDestination);
      return dest ? dest.zoom : THAILAND_ZOOM;
    }
    return THAILAND_ZOOM;
  }, [selectedDestination]);

  const handleLocationClick = (location: LocationGroup) => {
    setSelectedLocation(location);
  };

  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen bg-slate-50">
        {/* Sticky Filter Bar */}
        <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            {/* Row 1: Title + View Toggle (centered) */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                {guideTypeFilter === "general" 
                  ? (locale === "en" ? "General Guide Trips" : "ทริปไกด์ทั่วไป")
                  : guideTypeFilter === "local"
                  ? (locale === "en" ? "Local Guide Trips" : "ทริปไกด์ท้องถิ่น")
                  : q 
                  ? `${t("searchResults")} "${q}"`
                  : (locale === "en" ? "All Trips" : "ทริปทั้งหมด")}
              </h1>
              <div className="flex bg-slate-100 rounded-lg p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === "list"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="hidden sm:inline">{locale === "en" ? "List" : "รายการ"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === "map"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="hidden sm:inline">{locale === "en" ? "Map" : "แผนที่"}</span>
                </button>
              </div>
            </div>

            {/* Row 2: Guide Type Filter + Destination Dropdown */}
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
              <span className="text-xs text-slate-500 shrink-0">{locale === "en" ? "Guide:" : "ไกด์:"}</span>
              <button
                type="button"
                onClick={() => setGuideTypeFilter("all")}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  guideTypeFilter === "all"
                    ? "bg-slate-800 text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-400"
                }`}
              >
                {locale === "en" ? "All" : "ทั้งหมด"}
              </button>
              <button
                type="button"
                onClick={() => setGuideTypeFilter("general")}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  guideTypeFilter === "general"
                    ? "bg-orange-500 text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-orange-400"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${guideTypeFilter === "general" ? "bg-white" : "bg-orange-500"}`} />
                {t("generalGuide")}
              </button>
              <button
                type="button"
                onClick={() => setGuideTypeFilter("local")}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  guideTypeFilter === "local"
                    ? "bg-green-500 text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-green-400"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${guideTypeFilter === "local" ? "bg-white" : "bg-green-500"}`} />
                {t("localGuide")}
              </button>
              
              {/* Destination Dropdown */}
              <span className="text-slate-300 mx-1">|</span>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="shrink-0 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">{locale === "en" ? "All Destinations" : "ทุกจังหวัด"}</option>
                {DESTINATION_COORDINATES.map((dest) => (
                  <option key={dest.slug} value={dest.slug}>
                    {locale === "en" ? dest.nameEn : dest.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 3: Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-slate-500 shrink-0">{locale === "en" ? "Category:" : "หมวด:"}</span>
              {FILTER_CATEGORIES.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setSelectedFilter(f.key)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedFilter === f.key
                      ? "bg-primary text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-primary hover:text-primary"
                  }`}
                >
                  {t(filterKeyToTKey[f.key] ?? "filterAll")}
                </button>
              ))}
            </div>

            {/* Results Count */}
            <div className="mt-2 text-xs text-slate-500">
              {results.length} {locale === "en" ? "trips found" : "ทริป"}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === "map" ? (
          /* Map View */
          <div className="flex flex-col md:flex-row h-[calc(100vh-14rem)]">
            {/* Side Panel - Trips at Selected Location (Left) */}
            <div className="w-full md:w-[380px] lg:w-[420px] h-[40vh] md:h-full bg-white border-r border-slate-200 overflow-y-auto order-2 md:order-1">
              <div className="p-4">
                {selectedLocation ? (
                  <>
                    {/* Location Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setSelectedLocation(null)}
                        className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                      >
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div>
                        <h2 className="text-base font-bold text-slate-800">
                          {locale === "en" ? selectedLocation.locationNameEn : selectedLocation.locationName}
                        </h2>
                        <p className="text-xs text-slate-500">
                          {selectedLocation.tripCount} {locale === "en" ? "trips available" : "ทริปที่มี"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Trips List */}
                    <div className="space-y-2">
                      {selectedLocation.trips.map((activity) => (
                        <MapActivityCard
                          key={activity.id}
                          activity={activity}
                          locale={locale}
                          t={t}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  /* No Location Selected */
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 mb-2">
                      {locale === "en" ? "Select a Location" : "เลือกสถานที่"}
                    </h3>
                    <p className="text-sm text-slate-500 max-w-[200px]">
                      {locale === "en" 
                        ? "Click on a marker on the map to see available trips at that location"
                        : "คลิกที่มุดบนแผนที่เพื่อดูทริปที่มีในสถานที่นั้น"}
                    </p>
                    
                    {/* Location Summary */}
                    <div className="mt-6 w-full">
                      <p className="text-xs text-slate-400 mb-2">
                        {locale === "en" ? `${locationGroups.length} locations available` : `มี ${locationGroups.length} สถานที่`}
                      </p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {locationGroups.slice(0, 6).map((loc) => (
                          <span 
                            key={loc.locationKey}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                          >
                            {locale === "en" ? loc.locationNameEn : loc.locationName} ({loc.tripCount})
                          </span>
                        ))}
                        {locationGroups.length > 6 && (
                          <span className="text-[10px] text-slate-400">
                            +{locationGroups.length - 6} {locale === "en" ? "more" : "อื่นๆ"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map Container (Right) */}
            <div className="flex-1 h-[60vh] md:h-full relative order-1 md:order-2">
              <LocationMapComponent
                locations={locationGroups}
                center={mapCenter}
                zoom={mapZoom}
                onLocationClick={handleLocationClick}
                selectedLocation={selectedLocation}
                locale={locale}
              />
            </div>
          </div>
        ) : (
          /* List View */
          <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-6">
            {results.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-600">{t("noSearchResults")}</p>
                <button
                  onClick={() => {
                    setSelectedFilter("all");
                    setGuideTypeFilter("all");
                  }}
                  className="mt-4 text-primary hover:underline"
                >
                  {locale === "en" ? "Clear filters" : "ล้างตัวกรอง"}
                </button>
              </div>
            ) : (
              <>
                {/* Mobile: Horizontal cards */}
                <div className="sm:hidden space-y-3">
                  {results.map((a) => {
                    const guide = a.guideId ? getGuideById(a.guideId) : null;
                    const guideName = guide ? t(guide.nameKey) : null;
                    return (
                      <Link
                        key={a.id}
                        href={`/activity/${a.id}`}
                        className="flex gap-3 items-stretch rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="relative w-28 shrink-0 overflow-hidden">
                          <Image
                            src={a.image}
                            alt={a.imageAlt}
                            width={140}
                            height={110}
                            className="object-cover w-full h-full"
                          />
                          {a.guideType && (
                            <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-semibold ${
                              a.guideType === "local" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                            }`}>
                              {a.guideType === "local" ? "Local" : "General"}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 py-2 pr-3 min-w-0 flex flex-col justify-between">
                          <div>
                            <p className="text-[11px] text-slate-500 mb-0.5">{a.category}</p>
                            <p className="text-sm font-semibold text-slate-800 line-clamp-1 mb-0.5">
                              {locale === "en" ? a.titleEn || a.title : a.title}
                            </p>
                            {guideName && (
                              <p className="text-[10px] text-primary truncate mb-0.5 inline-flex items-center gap-0.5">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {guideName}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-500">
                              {locale === "en" ? a.durationEn || a.duration : a.duration}
                            </p>
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-0.5 text-amber-600 text-[11px]">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {a.rating} ({a.reviewCount.toLocaleString()})
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              ฿{a.priceFrom.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Desktop: Grid cards */}
                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {results.map((a) => (
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
                      guideType={a.guideType}
                      guideId={a.guideId}
                      tripCode={a.tripCode}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
      {viewMode === "list" && <Footer />}
    </>
  );
}

function MapActivityCard({
  activity,
  locale,
  t,
}: {
  activity: ActivityItem & { locationName?: string };
  locale: string;
  t: (key: string) => string;
}) {
  const guide = activity.guideId ? getGuideById(activity.guideId) : null;
  const guideName = guide ? t(guide.nameKey) : null;

  return (
    <Link
      href={`/activity/${activity.id}`}
      className="block rounded-lg border border-slate-200 overflow-hidden transition-all hover:shadow-md hover:border-primary/50"
    >
      <div className="flex gap-2">
        <div className="relative w-20 h-20 shrink-0">
          <Image
            src={activity.image}
            alt={activity.imageAlt}
            fill
            className="object-cover"
          />
          {activity.guideType && (
            <span className={`absolute top-1 left-1 px-1 py-0.5 rounded text-[8px] font-semibold ${
              activity.guideType === "local" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
            }`}>
              {activity.guideType === "local" 
                ? (locale === "en" ? "L" : "ถิ่น")
                : (locale === "en" ? "G" : "ทั่ว")}
            </span>
          )}
          {activity.tripCode && (
            <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded text-[8px] font-mono bg-slate-800 text-white">
              {activity.tripCode}
            </span>
          )}
        </div>
        <div className="flex-1 py-1.5 pr-2 min-w-0">
          <h3 className="text-xs font-semibold text-slate-800 line-clamp-2 mb-0.5">
            {locale === "en" ? activity.titleEn || activity.title : activity.title}
          </h3>
          {guideName && (
            <p className="text-[10px] text-primary truncate mb-0.5">
              <span className="inline-flex items-center gap-0.5">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {guideName}
              </span>
            </p>
          )}
          <div className="flex items-center gap-1 text-[10px]">
            <span className="inline-flex items-center gap-0.5 text-amber-500">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {activity.rating}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{locale === "en" ? activity.durationEn || activity.duration : activity.duration}</span>
          </div>
          <p className="text-xs font-bold text-primary mt-0.5">
            ฿{activity.priceFrom.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
