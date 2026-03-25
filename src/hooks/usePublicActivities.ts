"use client";

import { useEffect, useState } from "react";
import { publicTripToActivityItem, type PublicTrip } from "@/lib/public-catalog";
import type { ActivityItem } from "@/data/activities";

/** ดึงทริปที่เผยแพร่จาก API (ไม่ใช้ mock) */
export function usePublicActivities() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/public/trips", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(typeof data.error === "string" ? data.error : "โหลดทริปไม่สำเร็จ");
        }
        const trips = (data.trips ?? []) as PublicTrip[];
        const mapped = trips.map(publicTripToActivityItem);
        if (!cancelled) {
          setActivities(mapped);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setActivities([]);
          setError(e instanceof Error ? e.message : "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { activities, loading, error };
}
