"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "@/context/LocaleContext";
import { slugToCityKey } from "@/i18n/translations";
import { DESTINATION_COORDINATES, THAILAND_CENTER, THAILAND_ZOOM } from "@/data/locations";

const MapComponent = dynamic(() => import("@/components/PlacesMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center">
      <span className="text-slate-500">Loading map...</span>
    </div>
  ),
});

type ViewMode = "list" | "map";

const destinationSlugs = [
  { slug: "bangkok", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&q=80" },
  { slug: "chiang-mai", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=80" },
  { slug: "pattaya", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80" },
  { slug: "krabi", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80" },
  { slug: "phuket", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&q=80" },
  { slug: "samut-songkhram", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80" },
];

export default function PlacesPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string>("all");

  const handleDestinationChange = (slug: string) => {
    if (slug === "all") {
      setSelectedDestination("all");
    } else {
      router.push(`/destination/${slug}`);
    }
  };

  const destinations = useMemo(() => {
    return destinationSlugs.map((d) => {
      const coord = DESTINATION_COORDINATES.find((c) => c.slug === d.slug);
      return {
        ...d,
        name: slugToCityKey[d.slug] ? t(slugToCityKey[d.slug]) : d.slug,
        nameEn: coord?.nameEn || d.slug,
        coordinates: coord?.coordinates,
      };
    });
  }, [t]);

  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen bg-slate-50">
        {/* Sticky Filter Bar */}
        <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            {/* Row 1: Title + View Toggle */}
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                {t("navPlacesTop")}
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

            {/* Row 2: Destination Dropdown */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-xs text-slate-500">{locale === "en" ? "Go to:" : "ไปที่:"}</span>
              <select
                value={selectedDestination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">{locale === "en" ? "Select Destination" : "เลือกจังหวัด"}</option>
                {DESTINATION_COORDINATES.map((dest) => (
                  <option key={dest.slug} value={dest.slug}>
                    {locale === "en" ? dest.nameEn : dest.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 text-xs text-slate-500 text-center">
              {destinations.length} {locale === "en" ? "destinations" : "จุดหมาย"}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === "map" ? (
          /* Map View */
          <div className="flex flex-col md:flex-row h-[calc(100vh-10rem)]">
            {/* Side Panel - Places List (Left) */}
            <div className="w-full md:w-[350px] lg:w-[400px] h-[40vh] md:h-full bg-white border-r border-slate-200 overflow-y-auto order-2 md:order-1">
              <div className="p-4">
                <h2 className="text-base font-bold text-slate-800 mb-3">
                  {locale === "en" ? "Destinations" : "จุดหมาย"}
                </h2>
                <div className="space-y-2">
                  {destinations.map((d) => (
                    <Link
                      key={d.slug}
                      href={`/destination/${d.slug}`}
                      onMouseEnter={() => setSelectedPlace(d.slug)}
                      onMouseLeave={() => setSelectedPlace(null)}
                      className={`flex gap-3 p-2 rounded-lg border transition-all hover:shadow-md ${
                        selectedPlace === d.slug ? "border-primary ring-2 ring-primary/20" : "border-slate-200"
                      }`}
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={d.image}
                          alt={d.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <h3 className="font-semibold text-slate-800 text-sm">
                          {locale === "en" ? d.nameEn : d.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {locale === "en" ? "Thailand" : "ประเทศไทย"}
                        </p>
                        <p className="text-xs text-primary mt-1 font-medium">
                          {locale === "en" ? "View trips →" : "ดูทริป →"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Map Container (Right) */}
            <div className="flex-1 h-[60vh] md:h-full relative order-1 md:order-2">
              <MapComponent
                destinations={destinations}
                center={THAILAND_CENTER}
                zoom={THAILAND_ZOOM}
                selectedPlace={selectedPlace}
                onMarkerClick={(slug) => setSelectedPlace(slug)}
                locale={locale}
              />
            </div>
          </div>
        ) : (
          /* List View */
          <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
              {destinations.map((d) => (
                <Link
                  key={d.slug}
                  href={`/destination/${d.slug}`}
                  className="group block rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-200">
                    <Image
                      src={d.image}
                      alt={d.name}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="p-4 text-base font-semibold text-slate-800 group-hover:text-primary transition-colors">
                    {locale === "en" ? d.nameEn : d.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      {viewMode === "list" && <Footer />}
    </>
  );
}
