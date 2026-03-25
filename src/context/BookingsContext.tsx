"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const BOOKINGS_STORAGE_KEY = "route-wander-bookings";

export type Booking = {
  id: string;
  ticketCode: string;
  activityId: string;
  activityTitle: string;
  activityImage?: string;
  optionTitle: string;
  travelers: number;
  tripStartDate: string;
  language: string;
  price: number;
  paymentMethod: "card" | "cash";
  paidAt: string;
  meetingPlace: string;
  touristEmail?: string;
};

type BookingsContextValue = {
  bookings: Booking[];
  addBookings: (bookings: Omit<Booking, "id" | "ticketCode" | "paidAt">[]) => Promise<void>;
};

const BookingsContext = createContext<BookingsContextValue | null>(null);

function loadBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBookings(bookings: Booking[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch {}
}

function generateTicketCode(): string {
  const time = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RWV-${time}-${rand}`;
}

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Prefer server bookings when the external guide API is enabled.
      try {
        const res = await fetch("/api/tourists/me/bookings", { credentials: "include", cache: "no-store" });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const serverBookings = Array.isArray(data?.bookings) ? data.bookings : [];
          const mapped: Booking[] = serverBookings
            .filter((b: any) => b && typeof b === "object")
            .map((b: any) => ({
              id: String(b.bookingId ?? b.id ?? ""),
              ticketCode: String(b.ticketCode ?? ""),
              activityId: String(b.activityId ?? ""),
              activityTitle: String(b.activityTitle ?? ""),
              activityImage: b.activityImage ? String(b.activityImage) : undefined,
              optionTitle: String(b.optionTitle ?? ""),
              travelers: Number(b.travelers ?? 0),
              tripStartDate: String(b.tripStartDate ?? ""),
              language: String(b.language ?? ""),
              price: Number(b.price ?? 0),
              paymentMethod: (b.paymentMethod === "card" ? "card" : "cash") as Booking["paymentMethod"],
              paidAt: String(b.paidAt ?? new Date().toISOString()),
              meetingPlace: String(b.meetingPlace ?? ""),
            }))
            .filter((b) => b.id && b.ticketCode && b.activityId);

          if (!cancelled) setBookings(mapped);
          if (!cancelled) setHydrated(true);
          return;
        }
      } catch {
        // ignore and fallback to local storage
      }

      if (!cancelled) setBookings(loadBookings());
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) saveBookings(bookings);
  }, [bookings, hydrated]);

  const addBookings = useCallback(async (items: Omit<Booking, "id" | "ticketCode" | "paidAt">[]) => {
    // External mode (server-side) flow: create real bookings and use server ticketCode.
    try {
      const created: Booking[] = [];
      for (const item of items) {
        const isGuest = Boolean((item as any).touristEmail);
        const endpoint = isGuest ? "/api/guests/bookings" : "/api/tourists/me/bookings";
        const res = await fetch(endpoint, {
          method: "POST",
          // credentials only needed for authenticated mode
          credentials: isGuest ? "omit" : "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (res.status === 501) break; // local fallback
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = typeof data?.error === "string" ? data.error : "Failed to create booking";
          throw new Error(msg);
        }
        const b = data?.booking;
        if (b) {
          created.push({
            id: String(b.bookingId ?? ""),
            ticketCode: String(b.ticketCode ?? ""),
            activityId: String(b.activityId ?? ""),
            activityTitle: String(b.activityTitle ?? ""),
            activityImage: b.activityImage ? String(b.activityImage) : undefined,
            optionTitle: String(b.optionTitle ?? ""),
            travelers: Number(b.travelers ?? 0),
            tripStartDate: String(b.tripStartDate ?? ""),
            language: String(b.language ?? ""),
            price: Number(b.price ?? 0),
            paymentMethod: (b.paymentMethod === "card" ? "card" : "cash") as Booking["paymentMethod"],
            paidAt: String(b.paidAt ?? new Date().toISOString()),
            meetingPlace: String(b.meetingPlace ?? ""),
            touristEmail: b.touristEmail ? String(b.touristEmail) : (item as any).touristEmail ? String((item as any).touristEmail) : undefined,
          });
        }
      }

      // If we created at least one server booking, update state with those.
      if (created.length > 0) {
        setBookings((prev) => [...created, ...prev]);
        return;
      }
    } catch (err) {
      // If server booking failed, propagate error to UI so user knows.
      throw err instanceof Error ? err : new Error("Failed to create booking");
    }

    // Local fallback: simulate payment and generate mock ticket codes.
    const now = new Date().toISOString();
    const newBookings: Booking[] = items.map((item) => ({
      ...item,
      id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      ticketCode: generateTicketCode(),
      paidAt: now,
    }));
    setBookings((prev) => [...newBookings, ...prev]);
  }, []);

  const value = useMemo(() => ({ bookings, addBookings }), [bookings, addBookings]);

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error("useBookings must be used within BookingsProvider");
  return ctx;
}
