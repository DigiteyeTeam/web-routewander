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

const WISHLIST_STORAGE_KEY = "route-wander-wishlist";

type WishlistContextValue = {
  activityIds: string[];
  addToWishlist: (activityId: string) => void;
  removeFromWishlist: (activityId: string) => void;
  toggleWishlist: (activityId: string) => void;
  isInWishlist: (activityId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function loadWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWishlist(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [activityIds, setActivityIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setActivityIds(loadWishlist());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveWishlist(activityIds);
  }, [activityIds, hydrated]);

  const addToWishlist = useCallback((activityId: string) => {
    setActivityIds((prev) => (prev.includes(activityId) ? prev : [...prev, activityId]));
  }, []);

  const removeFromWishlist = useCallback((activityId: string) => {
    setActivityIds((prev) => prev.filter((id) => id !== activityId));
  }, []);

  const toggleWishlist = useCallback((activityId: string) => {
    setActivityIds((prev) =>
      prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId]
    );
  }, []);

  const isInWishlist = useCallback(
    (activityId: string) => activityIds.includes(activityId),
    [activityIds]
  );

  const value = useMemo(
    () => ({
      activityIds,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
    }),
    [activityIds, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
