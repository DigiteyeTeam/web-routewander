"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LocationGroup } from "@/app/destination/[slug]/page";
import type { Coordinates } from "@/data/locations";

type LocationMapProps = {
  locations: LocationGroup[];
  center: Coordinates;
  zoom: number;
  onLocationClick: (location: LocationGroup) => void;
  selectedLocation: LocationGroup | null;
  locale: string;
};

const createLocationIcon = (tripCount: number, isSelected: boolean) => {
  const size = isSelected ? 48 : 40;
  const hasMultiple = tripCount > 1;
  
  return L.divIcon({
    className: "location-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${isSelected ? '#6366f1' : '#3b82f6'};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        cursor: pointer;
        ${isSelected ? 'transform: scale(1.1);' : ''}
      ">
        ${hasMultiple ? `
          <span style="color: white; font-size: ${isSelected ? '14px' : '12px'}; font-weight: 700;">${tripCount}</span>
        ` : `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        `}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

export default function LocationMap({
  locations,
  center,
  zoom,
  onLocationClick,
  selectedLocation,
  locale,
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
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
    markersRef.current.clear();

    locations.forEach((location) => {
      const isSelected = selectedLocation?.locationKey === location.locationKey;
      const icon = createLocationIcon(location.tripCount, isSelected);

      const marker = L.marker([location.coordinates.lat, location.coordinates.lng], { icon })
        .addTo(mapInstanceRef.current!);

      const locationName = locale === "en" ? location.locationNameEn : location.locationName;
      const tripsText = locale === "en" 
        ? `${location.tripCount} trip${location.tripCount > 1 ? 's' : ''} available`
        : `มี ${location.tripCount} ทริป`;

      const popupContent = `
        <div style="padding: 8px; min-width: 160px;">
          <h3 style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">
            ${locationName}
          </h3>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0;">
            ${tripsText}
          </p>
          <button 
            onclick="window.dispatchEvent(new CustomEvent('selectLocation', { detail: '${location.locationKey}' }))"
            style="
              width: 100%;
              background: #6366f1;
              color: white;
              padding: 6px 12px;
              border-radius: 6px;
              border: none;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
            "
          >
            ${locale === "en" ? "View Trips" : "ดูทริป"}
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 200,
        className: "location-popup",
      });

      marker.on("click", () => {
        onLocationClick(location);
        // Close popup on mobile to show bottom sheet
        if (window.innerWidth < 768) {
          setTimeout(() => marker.closePopup(), 100);
        }
      });

      markersRef.current.set(location.locationKey, marker);
    });

    const handleSelectLocation = (event: CustomEvent<string>) => {
      const location = locations.find(l => l.locationKey === event.detail);
      if (location) {
        onLocationClick(location);
      }
    };

    window.addEventListener("selectLocation", handleSelectLocation as EventListener);
    return () => {
      window.removeEventListener("selectLocation", handleSelectLocation as EventListener);
    };
  }, [locations, selectedLocation, isMapReady, locale, onLocationClick]);

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    
    const marker = markersRef.current.get(selectedLocation.locationKey);
    if (marker) {
      marker.openPopup();
      mapInstanceRef.current.setView(
        [selectedLocation.coordinates.lat, selectedLocation.coordinates.lng],
        Math.max(mapInstanceRef.current.getZoom(), 13),
        { animate: true }
      );
    }
  }, [selectedLocation]);

  return (
    <>
      <style jsx global>{`
        .location-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
        }
        .location-popup .leaflet-popup-content {
          margin: 0;
        }
        .location-popup .leaflet-popup-tip {
          background: white;
        }
        .location-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-pane,
        .leaflet-control,
        .leaflet-top,
        .leaflet-bottom {
          z-index: 1 !important;
        }
        .leaflet-popup-pane {
          z-index: 2 !important;
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full" />
    </>
  );
}
