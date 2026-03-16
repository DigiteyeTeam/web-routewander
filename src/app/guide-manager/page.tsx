"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, ExternalLink, AlertCircle } from "lucide-react";
import { getAllActivities } from "@/data/activities";

const MOCK_GUIDE_ID = "1";
const MAX_OPEN_TRIPS = 3;
const STORAGE_KEY = "guide-manager-closed-ids";

function loadClosedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveClosedIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

export default function GuideManagerPage() {
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setClosedIds(loadClosedIds());
    setHydrated(true);
  }, []);

  const myTrips = useMemo(() => {
    return getAllActivities().filter((a) => a.guideId === MOCK_GUIDE_ID);
  }, []);

  const openCount = myTrips.length - closedIds.size;
  const closedCount = closedIds.size;
  const canOpenMore = openCount < MAX_OPEN_TRIPS;
  const canCreateNew = openCount < MAX_OPEN_TRIPS;

  const toggleOpen = (id: string) => {
    const isClosed = closedIds.has(id);
    if (isClosed && !canOpenMore) return; // เปิดได้ไม่เกิน 3
    setClosedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveClosedIds(next);
      return next;
    });
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 px-6 md:px-10 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ทริปของฉัน</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              จัดการทริปที่คุณสร้าง เปิดได้สูงสุด {MAX_OPEN_TRIPS} ทริป
            </p>
          </div>
          {canCreateNew ? (
            <Link
              href="/guide-manager/create"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <PlusCircle className="w-5 h-5" strokeWidth={2} />
              สร้างทริปใหม่
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
              เปิดครบ {MAX_OPEN_TRIPS} ทริปแล้ว ปิดอย่างน้อย 1 ทริปก่อนสร้างใหม่
            </div>
          )}
        </div>
      </header>

      <div className="p-6 md:p-10 max-w-5xl">
        {!canCreateNew && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">เปิดได้ไม่เกิน {MAX_OPEN_TRIPS} ทริป</p>
              <p className="text-amber-700 mt-0.5">ต้องการสร้างทริปใหม่ ให้ปิดรับจองบางทริปให้เหลือไม่เกิน 2 ทริปที่เปิดอยู่ก่อน</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">เปิดรับจอง</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{hydrated ? openCount : "–"}</p>
            <p className="text-xs text-slate-500 mt-0.5">สูงสุด {MAX_OPEN_TRIPS} ทริป</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ปิดรับจอง</p>
            <p className="text-2xl font-bold text-slate-500 mt-1">{hydrated ? closedCount : "–"}</p>
            <p className="text-xs text-slate-500 mt-0.5">ทริป</p>
          </div>
        </div>

        <div className="space-y-4">
          {myTrips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500 mb-4">ยังไม่มีทริป</p>
              <Link
                href="/guide-manager/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-primary border border-primary rounded-xl hover:bg-primary/5"
              >
                <PlusCircle className="w-4 h-4" strokeWidth={2} />
                สร้างทริปแรก
              </Link>
            </div>
          ) : (
            myTrips.map((trip) => {
              const isClosed = hydrated && closedIds.has(trip.id);
              const wouldExceed = !isClosed && !canOpenMore;
              const canToggleToOpen = isClosed && canOpenMore;
              return (
                <div
                  key={trip.id}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                    isClosed ? "border-slate-200 opacity-90" : "border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-40 h-32 sm:h-28 shrink-0">
                      <Image
                        src={trip.image}
                        alt={trip.imageAlt}
                        fill
                        className="object-cover"
                      />
                      <span
                        className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          isClosed ? "bg-slate-500 text-white" : "bg-emerald-500 text-white"
                        }`}
                      >
                        {isClosed ? "ปิด" : "เปิด"}
                      </span>
                    </div>
                    <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-medium">{trip.tripCode}</p>
                        <h3 className="font-bold text-slate-800 truncate">{trip.title}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          ฿{trip.priceFrom.toLocaleString()} · {trip.duration}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/activity/${trip.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                        >
                          ดูหน้าทริป
                          <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleOpen(trip.id)}
                          disabled={isClosed && !canOpenMore}
                          title={
                            isClosed && !canOpenMore
                              ? `เปิดได้สูงสุด ${MAX_OPEN_TRIPS} ทริป กรุณาปิดทริปอื่นก่อน`
                              : isClosed
                                ? "เปิดรับจอง"
                                : "ปิดรับจอง"
                          }
                          className={`relative w-12 h-7 rounded-full transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isClosed ? "bg-slate-300" : "bg-primary"
                          }`}
                          aria-label={isClosed ? "เปิดรับจอง" : "ปิดรับจอง"}
                        >
                          <span
                            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                              isClosed ? "left-1" : "left-6"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
