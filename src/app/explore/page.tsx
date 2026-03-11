"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "@/context/LocaleContext";
import { getAllActivities, type ActivityItem, FILTER_CATEGORIES } from "@/data/activities";
import { DESTINATION_COORDINATES, ACTIVITY_LOCATIONS, THAILAND_CENTER, THAILAND_ZOOM, type Coordinates } from "@/data/locations";
import { getGuideById } from "@/data/guides";
import { filterKeyToTKey } from "@/i18n/translations";

const LocationMapComponent = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center">
      <span className="text-slate-500">Loading map...</span>
    </div>
  ),
});

type ViewMode = "map" | "list";

type LocationGroup = {
  locationKey: string;
  locationName: string;
  locationNameEn: string;
  coordinates: Coordinates;
  trips: (ActivityItem & { locationName?: string })[];
  tripCount: number;
};

export default function ExplorePage() {
  const { t, locale } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selectedDestination, setSelectedDestination] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<LocationGroup | null>(null);

  const allActivities = useMemo(() => getAllActivities(), []);

  const filteredActivities = useMemo(() => {
    let filtered = allActivities;

    if (selectedDestination !== "all") {
      filtered = filtered.filter((a) => a.slug === selectedDestination);
    }

    if (selectedCategory !== "all") {
      if (selectedCategory === "food") {
        filtered = filtered.filter((a) => a.categoryKey === "food" || a.categoryKey === "food-drink");
      } else {
        filtered = filtered.filter((a) => a.categoryKey === selectedCategory);
      }
    }

    return filtered;
  }, [allActivities, selectedDestination, selectedCategory]);

  const activitiesWithLocations = useMemo(() => {
    return filteredActivities.map((activity) => {
      const location = ACTIVITY_LOCATIONS.find((loc) => loc.id === activity.id);
      return {
        ...activity,
        coordinates: location?.coordinates,
        locationName: locale === "en" ? location?.locationNameEn : location?.locationName,
        locationKey: location?.locationName || "",
      };
    }).filter((a) => a.coordinates);
  }, [filteredActivities, locale]);

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

  const handleLocationClick = (location: LocationGroup) => {
    setSelectedLocation(location);
  };

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

  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen bg-slate-100">
        {/* Top Controls Bar */}
        <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-[1920px] mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1 shrink-0">
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === "map"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {locale === "en" ? "Map View" : "แผนที่"}
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === "list"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  {locale === "en" ? "List View" : "รายการ"}
                </button>
              </div>

              {/* Destination Filter */}
              <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="shrink-0 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">{locale === "en" ? "All Destinations" : "ทุกจุดหมาย"}</option>
                  {DESTINATION_COORDINATES.map((dest) => (
                    <option key={dest.slug} value={dest.slug}>
                      {locale === "en" ? dest.nameEn : dest.name}
                    </option>
                  ))}
                </select>

                {/* Category Pills */}
                <div className="flex gap-2">
                  {FILTER_CATEGORIES.slice(0, 5).map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === cat.key
                          ? "bg-primary text-white"
                          : "bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {t(filterKeyToTKey[cat.key] ?? "filterAll")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-slate-500 shrink-0">
                {filteredActivities.length} {locale === "en" ? "trips found" : "ทริป"}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1920px] mx-auto">
          {viewMode === "map" ? (
            /* Map View - Split Layout */
            <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)]">
              {/* Side Panel - Trips at Selected Location (Left) */}
              <div className="w-full md:w-[400px] lg:w-[450px] h-[50vh] md:h-full bg-white border-r border-slate-200 overflow-y-auto order-2 md:order-1">
                <div className="p-4">
                  {selectedLocation ? (
                    <>
                      {/* Location Header */}
                      <div className="flex items-center gap-2 mb-4">
                        <button
                          type="button"
                          onClick={() => setSelectedLocation(null)}
                          className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                        >
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div>
                          <h2 className="text-lg font-bold text-slate-800">
                            {locale === "en" ? selectedLocation.locationNameEn : selectedLocation.locationName}
                          </h2>
                          <p className="text-sm text-slate-500">
                            {selectedLocation.tripCount} {locale === "en" ? "trips available" : "ทริปที่มี"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Trips List */}
                      <div className="space-y-3">
                        {selectedLocation.trips.map((activity) => (
                          <ActivityCard
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
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        {locale === "en" ? "Select a Location" : "เลือกสถานที่"}
                      </h3>
                      <p className="text-sm text-slate-500 max-w-[240px]">
                        {locale === "en" 
                          ? "Click on a marker on the map to see available trips at that location"
                          : "คลิกที่มุดบนแผนที่เพื่อดูทริปที่มีในสถานที่นั้น"}
                      </p>
                      
                      {/* Location Summary */}
                      <div className="mt-6 w-full">
                        <p className="text-xs text-slate-400 mb-2">
                          {locale === "en" ? `${locationGroups.length} locations available` : `มี ${locationGroups.length} สถานที่`}
                        </p>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {locationGroups.slice(0, 8).map((loc) => (
                            <span 
                              key={loc.locationKey}
                              className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
                            >
                              {locale === "en" ? loc.locationNameEn : loc.locationName} ({loc.tripCount})
                            </span>
                          ))}
                          {locationGroups.length > 8 && (
                            <span className="text-xs text-slate-400">
                              +{locationGroups.length - 8} {locale === "en" ? "more" : "อื่นๆ"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map Container (Right) */}
              <div className="flex-1 h-[50vh] md:h-full relative order-1 md:order-2">
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
            /* List View - Full Width Grid */
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredActivities.map((activity) => (
                  <ActivityCardLarge key={activity.id} activity={activity} locale={locale} t={t} />
                ))}
              </div>
              
              {filteredActivities.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-slate-500">
                    {locale === "en" ? "No trips found with selected filters" : "ไม่พบทริปตามเงื่อนไขที่เลือก"}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedDestination("all");
                      setSelectedCategory("all");
                    }}
                    className="mt-4 text-primary hover:underline"
                  >
                    {locale === "en" ? "Clear filters" : "ล้างตัวกรอง"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      {viewMode === "list" && <Footer />}
    </>
  );
}

function ActivityCard({
  activity,
  locale,
  t,
}: {
  activity: ActivityItem & { locationName?: string };
  locale: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: any) => string;
}) {
  const guide = activity.guideId ? getGuideById(activity.guideId) : null;
  const guideName = guide ? t(guide.nameKey) : null;

  return (
    <Link
      href={`/activity/${activity.id}`}
      className="block rounded-xl border border-slate-200 overflow-hidden transition-all hover:shadow-md hover:border-primary/50"
    >
      <div className="flex gap-3">
        <div className="relative w-24 h-24 shrink-0">
          <Image
            src={activity.image}
            alt={activity.imageAlt}
            fill
            className="object-cover"
          />
          {activity.guideType && (
            <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-semibold ${
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
        <div className="flex-1 py-2 pr-3 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1">
            {locale === "en" ? activity.titleEn || activity.title : activity.title}
          </h3>
          {guideName && (
            <p className="text-xs text-primary truncate mb-1">
              <span className="inline-flex items-center gap-0.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {guideName}
              </span>
            </p>
          )}
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-0.5 text-amber-500">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {activity.rating}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{locale === "en" ? activity.durationEn || activity.duration : activity.duration}</span>
          </div>
          <p className="text-sm font-bold text-primary mt-1">
            ฿{activity.priceFrom.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActivityCardLarge({ activity, locale, t }: { activity: ActivityItem; locale: string; t: (key: any) => string }) {
  const location = ACTIVITY_LOCATIONS.find((loc) => loc.id === activity.id);
  const locationName = locale === "en" ? location?.locationNameEn : location?.locationName;
  const guide = activity.guideId ? getGuideById(activity.guideId) : null;
  const guideName = guide ? t(guide.nameKey) : null;

  return (
    <Link
      href={`/activity/${activity.id}`}
      className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={activity.image}
          alt={activity.imageAlt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {activity.guideType && (
          <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${
            activity.guideType === "local" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
          }`}>
            {activity.guideType === "local" 
              ? (locale === "en" ? "Local Guide" : "ไกด์ท้องถิ่น")
              : (locale === "en" ? "General Guide" : "ไกด์ทั่วไป")}
          </span>
        )}
        {activity.tripCode && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-black/60 text-white text-xs font-mono rounded">
            {activity.tripCode}
          </span>
        )}
      </div>
      <div className="p-4">
        {locationName && (
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {locationName}
          </p>
        )}
        <h3 className="font-semibold text-slate-800 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {locale === "en" ? activity.titleEn || activity.title : activity.title}
        </h3>
        {guideName && (
          <p className="text-xs text-primary truncate mb-2 inline-flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {guideName}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <span className="inline-flex items-center gap-1 text-amber-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {activity.rating}
          </span>
          <span className="text-slate-300">·</span>
          <span>{locale === "en" ? activity.durationEn || activity.duration : activity.duration}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {activity.priceOriginal && activity.priceOriginal > activity.priceFrom && (
              <span className="text-sm text-slate-400 line-through mr-2">
                ฿{activity.priceOriginal.toLocaleString()}
              </span>
            )}
            <span className="text-lg font-bold text-primary">
              ฿{activity.priceFrom.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
