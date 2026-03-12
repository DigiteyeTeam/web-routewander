"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Coordinates } from "@/data/locations";

type Destination = {
  slug: string;
  name: string;
  nameEn: string;
  image: string;
  coordinates?: Coordinates;
};

interface PlacesMapProps {
  destinations: Destination[];
  center: Coordinates;
  zoom: number;
  selectedPlace: string | null;
  onMarkerClick: (slug: string) => void;
  locale: string;
}

const createDestinationIcon = (isSelected: boolean) => {
  return L.divIcon({
    html: `
      <div class="places-marker ${isSelected ? "selected" : ""}">
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="${isSelected ? "#f97316" : "#0ea5e9"}"/>
          <circle cx="16" cy="16" r="8" fill="white"/>
        </svg>
      </div>
    `,
    className: "places-marker-container",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

export default function PlacesMap({
  destinations,
  center,
  zoom,
  selectedPlace,
  onMarkerClick,
  locale,
}: PlacesMapProps) {
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

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([center.lat, center.lng], zoom);
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    const map = mapInstanceRef.current;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    destinations.forEach((dest) => {
      if (!dest.coordinates) return;

      const isSelected = selectedPlace === dest.slug;
      const marker = L.marker([dest.coordinates.lat, dest.coordinates.lng], {
        icon: createDestinationIcon(isSelected),
      });

      const popupContent = `
        <div class="destination-popup">
          <img src="${dest.image}" alt="${dest.name}" class="popup-image" />
          <div class="popup-content">
            <h3 class="popup-title">${locale === "en" ? dest.nameEn : dest.name}</h3>
            <p class="popup-subtitle">${locale === "en" ? "Thailand" : "ประเทศไทย"}</p>
            <a href="/destination/${dest.slug}" class="popup-link">
              ${locale === "en" ? "View trips" : "ดูทริป"} →
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        minWidth: 200,
        className: "destination-popup-container",
      });

      marker.on("click", () => {
        onMarkerClick(dest.slug);
        if (window.innerWidth < 768) {
          setTimeout(() => marker.closePopup(), 100);
        }
      });

      marker.addTo(map);
      markersRef.current.set(dest.slug, marker);
    });
  }, [destinations, selectedPlace, isMapReady, locale, onMarkerClick]);

  useEffect(() => {
    if (!selectedPlace || !mapInstanceRef.current) return;

    const marker = markersRef.current.get(selectedPlace);
    if (marker) {
      marker.openPopup();
      const latlng = marker.getLatLng();
      mapInstanceRef.current.panTo(latlng);
    }
  }, [selectedPlace]);

  return (
    <>
      <style jsx global>{`
        .places-marker-container {
          background: transparent !important;
          border: none !important;
        }
        .places-marker {
          transition: transform 0.2s;
        }
        .places-marker.selected {
          transform: scale(1.2);
          z-index: 1000 !important;
        }
        .destination-popup-container .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .destination-popup-container .leaflet-popup-content {
          margin: 0;
          width: 100% !important;
        }
        .destination-popup-container .leaflet-popup-tip {
          background: white;
        }
        .destination-popup {
          width: 100%;
        }
        .destination-popup .popup-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }
        .destination-popup .popup-content {
          padding: 12px;
        }
        .destination-popup .popup-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 4px 0;
        }
        .destination-popup .popup-subtitle {
          font-size: 12px;
          color: #64748b;
          margin: 0 0 8px 0;
        }
        .destination-popup .popup-link {
          display: inline-block;
          font-size: 13px;
          font-weight: 600;
          color: #0ea5e9;
          text-decoration: none;
        }
        .destination-popup .popup-link:hover {
          text-decoration: underline;
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
