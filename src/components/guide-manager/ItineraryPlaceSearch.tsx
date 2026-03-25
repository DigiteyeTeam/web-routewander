"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PlaceSearchApply = {
  title: string;
  mapUrl?: string;
  province?: string;
  district?: string;
};

type SearchHit = {
  name: string;
  displayName: string;
  lat: number | null;
  lng: number | null;
  suggestedProvince: string | null;
  suggestedDistrict?: string;
};

type Props = {
  /** Kept for callers; UI is English-only for map search. */
  locale?: string;
  onApply: (p: PlaceSearchApply) => void;
};

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function ItineraryPlaceSearch({ onApply }: Props) {
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 450);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (debounced.trim().length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(debounced.trim())}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        const list = Array.isArray(data?.results) ? (data.results as SearchHit[]) : [];
        setHits(list);
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const pick = useCallback(
    (h: SearchHit) => {
      const mapUrl =
        h.lat != null && h.lng != null
          ? `https://www.google.com/maps?q=${encodeURIComponent(`${h.lat},${h.lng}`)}`
          : undefined;
      onApply({
        title: h.name,
        mapUrl,
        province: h.suggestedProvince ?? undefined,
        district: h.suggestedDistrict,
      });
      setQuery("");
      setHits([]);
      setOpen(false);
    },
    [onApply]
  );

  return (
    <div ref={rootRef} className="relative">
      <label className="block text-xs font-bold mb-2 text-slate-700">
        Search place (type in English — OpenStreetMap / Nominatim)
      </label>
      <p className="text-[11px] text-slate-500 mb-2">
        Use English keywords only (e.g. district, landmark, district + province). Results are biased to English labels.
      </p>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="e.g. Wang Lang Market, Bang Rak, Damnoen Saduak…"
        autoComplete="off"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
      {open && (query.trim().length >= 2 || loading) ? (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg">
          {loading ? (
            <div className="px-3 py-2 text-xs text-slate-500">Searching…</div>
          ) : hits.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500">No results. Try another English keyword.</div>
          ) : (
            hits.map((h, i) => (
              <button
                key={`${h.displayName}-${i}`}
                type="button"
                onClick={() => pick(h)}
                className="w-full px-3 py-2 text-left text-xs hover:bg-amber-50/90"
              >
                <span className="font-semibold text-slate-900">{h.name}</span>
                <span className="block text-[11px] text-slate-500 line-clamp-2">{h.displayName}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
      <p className="mt-1 text-[10px] text-slate-400">Data © OpenStreetMap contributors (Nominatim).</p>
    </div>
  );
}
