"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ActivityItem } from "@/data/activities";
import type { Coordinates } from "@/data/locations";

type ActivityWithLocation = ActivityItem & {
  coordinates?: Coordinates;
  locationName?: string;
};

type ExploreMapProps = {
  activities: ActivityWithLocation[];
  center: Coordinates;
  zoom: number;
  onMarkerClick: (activity: ActivityItem) => void;
  selectedActivity: ActivityWithLocation | null;
  locale: string;
};

const LOCAL_COLOR = "#22c55e";
const GENERAL_COLOR = "#f97316";
const DEFAULT_COLOR = "#6366f1";

/** สีมาร์กเกอร์ตามกติกา: มีแต่ไกด์ทั่วไป→ส้ม, มีแต่ท้องถิ่น→เขียว, มีทั้งคู่→ใช้สีของรายการแรกในกลุ่ม */
function getMarkerColorForGroup(activities: ActivityWithLocation[]): string {
  if (activities.length === 0) return DEFAULT_COLOR;
  const types = new Set(activities.map((a) => a.guideType).filter(Boolean));
  if (types.size === 0) return DEFAULT_COLOR;
  if (types.size === 2) return activities[0].guideType === "local" ? LOCAL_COLOR : GENERAL_COLOR;
  return types.has("local") ? LOCAL_COLOR : GENERAL_COLOR;
}

const createCustomIcon = (color: string, isSelected: boolean) => {
  const size = isSelected ? 40 : 32;
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        ${isSelected ? "transform: scale(1.2);" : ""}
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

export default function ExploreMap({
  activities,
  center,
  zoom,
  onMarkerClick,
  selectedActivity,
  locale,
}: ExploreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const withCoords = activities.filter((a): a is ActivityWithLocation => Boolean(a.coordinates));
    const key = (lat: number, lng: number) => `${Math.round(lat * 1e5)}_${Math.round(lng * 1e5)}`;
    const groups = new Map<string, ActivityWithLocation[]>();
    withCoords.forEach((a) => {
      const k = key(a.coordinates!.lat, a.coordinates!.lng);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(a);
    });

    groups.forEach((groupActivities, coordKey) => {
      const first = groupActivities[0];
      const [lat, lng] = [first.coordinates!.lat, first.coordinates!.lng];
      const markerColor = getMarkerColorForGroup(groupActivities);
      const isSelected = groupActivities.some((a) => selectedActivity?.id === a.id);
      const icon = createCustomIcon(markerColor, isSelected);

      const marker = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current!);

      const activity = first;
      const title = locale === "en" ? activity.titleEn || activity.title : activity.title;
      const duration = locale === "en" ? activity.durationEn || activity.duration : activity.duration;
      const guideLabel =
        activity.guideType === "local"
          ? locale === "en"
            ? "Local Guide"
            : "ไกด์ท้องถิ่น"
          : locale === "en"
            ? "General Guide"
            : "ไกด์ทั่วไป";
      const guideColor = activity.guideType === "local" ? LOCAL_COLOR : GENERAL_COLOR;

      const popupContent = `
        <div style="width: 220px; padding: 4px;">
          <img src="${activity.image}" alt="" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
            <span style="background: ${guideColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">${guideLabel}</span>
            ${activity.tripCode ? `<span style="background: #1e293b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-family: monospace;">${activity.tripCode}</span>` : ""}
          </div>
          <h3 style="font-size: 14px; font-weight: 600; color: #1e293b; margin: 0 0 4px 0; line-height: 1.3;">${title}</h3>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b; margin-bottom: 8px;">
            <span style="display: flex; align-items: center; gap: 2px;">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="#f59e0b"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              ${activity.rating}
            </span>
            <span>${duration}</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 16px; font-weight: 700; color: #6366f1;">฿${activity.priceFrom.toLocaleString()}</span>
            <a href="/activity/${activity.id}" style="background: #6366f1; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">
              ${locale === "en" ? "View" : "ดู"}
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 250, className: "custom-popup" });
      marker.on("click", () => onMarkerClick(activity));
      markersRef.current.push(marker);
    });
  }, [activities, selectedActivity, isMapReady, locale, onMarkerClick]);

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedActivity?.coordinates) return;
    
    const marker = markersRef.current.find((m) => {
      const latlng = m.getLatLng();
      return (
        latlng.lat === selectedActivity.coordinates?.lat &&
        latlng.lng === selectedActivity.coordinates?.lng
      );
    });

    if (marker) {
      marker.openPopup();
      mapInstanceRef.current.setView(
        [selectedActivity.coordinates.lat, selectedActivity.coordinates.lng],
        Math.max(mapInstanceRef.current.getZoom(), 13),
        { animate: true }
      );
    }
  }, [selectedActivity]);

  return (
    <>
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
        }
        .custom-popup .leaflet-popup-content {
          margin: 8px;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full" />
    </>
  );
}
