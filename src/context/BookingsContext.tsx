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
};

type BookingsContextValue = {
  bookings: Booking[];
  addBookings: (bookings: Omit<Booking, "id" | "ticketCode" | "paidAt">[]) => void;
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
    setBookings(loadBookings());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveBookings(bookings);
  }, [bookings, hydrated]);

  const addBookings = useCallback(
    (items: Omit<Booking, "id" | "ticketCode" | "paidAt">[]) => {
      const now = new Date().toISOString();
      const newBookings: Booking[] = items.map((item) => ({
        ...item,
        id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        ticketCode: generateTicketCode(),
        paidAt: now,
      }));
      setBookings((prev) => [...newBookings, ...prev]);
    },
    []
  );

  const value = useMemo(() => ({ bookings, addBookings }), [bookings, addBookings]);

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error("useBookings must be used within BookingsProvider");
  return ctx;
}
