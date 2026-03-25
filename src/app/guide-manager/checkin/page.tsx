"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/context/LocaleContext";

type CheckinRow = {
  bookingId: string;
  ticketCode: string;
  travelers: number;
  language: string;
  paidAt: string;
  status?: "paid" | "cancelled";
  checkInStatus?: "not_checked" | "checked_in";
  checkedInAt?: string | null;
};

type BulkResult = {
  ok: string[];
  fail: Array<{ ticketCode: string; reason: string }>;
};

type ToastState = {
  kind: "success" | "error" | "info";
  message: string;
} | null;

function GuideTripCheckinPageInner() {
  const { locale } = useTranslation();
  const sp = useSearchParams();
  const tripId = sp.get("tripId") ?? "";
  const date = sp.get("date") ?? "";

  const [rows, setRows] = useState<CheckinRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingCode, setCheckingCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [beepEnabled, setBeepEnabled] = useState(true);
  const [quickTicket, setQuickTicket] = useState("");

  useEffect(() => {
    if (!tripId || !date) {
      setLoading(false);
      setError(locale === "en" ? "Missing tripId/date" : "ไม่พบ tripId/date");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/guides/me/trips/${encodeURIComponent(tripId)}/checkin?date=${encodeURIComponent(date)}`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof data?.error === "string" ? data.error : locale === "en" ? "Unable to load check-in list" : "โหลดรายการเช็กอินไม่สำเร็จ");
          return;
        }
        if (!cancelled) {
          setRows(Array.isArray(data?.bookings) ? (data.bookings as CheckinRow[]) : []);
        }
      } catch {
        setError(locale === "en" ? "Unable to load check-in list" : "โหลดรายการเช็กอินไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tripId, date, locale]);

  useEffect(() => {
    try {
      const savedSearch = window.localStorage.getItem("guideCheckin.search");
      const savedBeep = window.localStorage.getItem("guideCheckin.beepEnabled");
      if (savedSearch) setSearch(savedSearch);
      if (savedBeep === "0") setBeepEnabled(false);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("guideCheckin.search", search);
      window.localStorage.setItem("guideCheckin.beepEnabled", beepEnabled ? "1" : "0");
    } catch {
      // ignore storage errors
    }
  }, [search, beepEnabled]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const playSuccessBeep = () => {
    if (!beepEnabled) return;
    try {
      const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 1046; // C6
      gain.gain.value = 0.001;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      oscillator.start(now);
      oscillator.stop(now + 0.12);
      oscillator.onended = () => void ctx.close();
    } catch {
      // no-op: audio can fail on some browsers/policies.
    }
  };

  const totalGuests = useMemo(() => rows.reduce((sum, r) => sum + (r.travelers ?? 0), 0), [rows]);
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const ticket = (r.ticketCode ?? "").toLowerCase();
      const booking = (r.bookingId ?? "").toLowerCase();
      const lang = (r.language ?? "").toLowerCase();
      return ticket.includes(q) || booking.includes(q) || lang.includes(q);
    });
  }, [rows, search]);
  const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes]);
  const selectableRows = useMemo(() => filteredRows.filter((r) => r.status !== "cancelled" && r.checkInStatus !== "checked_in"), [filteredRows]);

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "/") {
        const target = ev.target as HTMLElement | null;
        const isTyping =
          target &&
          (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
        if (!isTyping) {
          ev.preventDefault();
          const input = document.getElementById("checkin-search-input") as HTMLInputElement | null;
          input?.focus();
          input?.select();
        }
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "a") {
        const target = ev.target as HTMLElement | null;
        const isTyping =
          target &&
          (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
        if (!isTyping) {
          ev.preventDefault();
          toggleSelectAllFiltered(true);
        }
      }
      if (ev.key === "Escape") {
        setSearch("");
        setSelectedCodes([]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectableRows]);

  const doCheckin = async (ticketCode: string) => {
    const result = await doCheckinWithResult(ticketCode);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setToast({
      kind: "success",
      message: locale === "en" ? `Checked in ${ticketCode}` : `เช็กอิน ${ticketCode} สำเร็จ`,
    });
  };

  const doCheckinWithResult = async (ticketCode: string): Promise<{ ok: true } | { ok: false; reason: string }> => {
    if (checkingCode) return { ok: false, reason: locale === "en" ? "Another check-in in progress" : "กำลังเช็กอินรายการอื่นอยู่" };
    setCheckingCode(ticketCode);
    try {
      const res = await fetch(`/api/guides/me/trips/${encodeURIComponent(tripId)}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ticketCode, date }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          ok: false,
          reason: typeof data?.error === "string" ? data.error : locale === "en" ? "Check-in failed" : "เช็กอินไม่สำเร็จ",
        };
      }
      setRows((prev) =>
        prev.map((r) =>
          r.ticketCode === ticketCode
            ? {
                ...r,
                checkInStatus: "checked_in",
                checkedInAt: typeof data?.checkedInAt === "string" ? data.checkedInAt : new Date().toISOString(),
              }
            : r
        )
      );
      playSuccessBeep();
      return { ok: true };
    } catch {
      return { ok: false, reason: locale === "en" ? "Network error" : "เครือข่ายมีปัญหา" };
    } finally {
      setCheckingCode(null);
    }
  };

  const toggleSelectCode = (ticketCode: string, checked: boolean) => {
    setSelectedCodes((prev) => {
      if (checked) return prev.includes(ticketCode) ? prev : [...prev, ticketCode];
      return prev.filter((x) => x !== ticketCode);
    });
  };

  const toggleSelectAllFiltered = (checked: boolean) => {
    if (!checked) {
      setSelectedCodes((prev) => prev.filter((x) => !selectableRows.some((r) => r.ticketCode === x)));
      return;
    }
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      for (const r of selectableRows) next.add(r.ticketCode);
      return Array.from(next);
    });
  };

  const bulkCheckin = async () => {
    const targets = filteredRows.filter(
      (r) => selectedSet.has(r.ticketCode) && r.status !== "cancelled" && r.checkInStatus !== "checked_in"
    );
    if (targets.length === 0) return;
    const ok: string[] = [];
    const fail: Array<{ ticketCode: string; reason: string }> = [];
    for (const r of targets) {
      // Sequential requests to keep UX/state updates deterministic.
      // eslint-disable-next-line no-await-in-loop
      const result = await doCheckinWithResult(r.ticketCode);
      if (result.ok) ok.push(r.ticketCode);
      else fail.push({ ticketCode: r.ticketCode, reason: result.reason });
    }
    setSelectedCodes((prev) => prev.filter((x) => !targets.some((t) => t.ticketCode === x)));
    setBulkResult({ ok, fail });
    if (fail.length === 0) {
      if (ok.length > 0) playSuccessBeep();
      setToast({
        kind: "success",
        message:
          locale === "en"
            ? `Bulk check-in successful (${ok.length})`
            : `เช็กอินหลายรายการสำเร็จ (${ok.length})`,
      });
    } else {
      if (ok.length > 0) playSuccessBeep();
      setToast({
        kind: "error",
        message:
          locale === "en"
            ? `Bulk check-in done: ${ok.length} success, ${fail.length} failed`
            : `เช็กอินเสร็จ: สำเร็จ ${ok.length}, ไม่สำเร็จ ${fail.length}`,
      });
    }
  };

  const exportCsv = () => {
    const headers = ["ticketCode", "bookingId", "travelers", "language", "status", "checkInStatus", "checkedInAt", "paidAt"];
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [
      headers.join(","),
      ...filteredRows.map((r) =>
        [
          escape(r.ticketCode),
          escape(r.bookingId),
          escape(r.travelers),
          escape(r.language),
          escape(r.status ?? ""),
          escape(r.checkInStatus ?? ""),
          escape(r.checkedInAt ?? ""),
          escape(r.paidAt ?? ""),
        ].join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkin-${tripId || "trip"}-${date || "date"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copyTicketCode = async (ticketCode: string) => {
    try {
      await navigator.clipboard.writeText(ticketCode);
      setCopiedCode(ticketCode);
      setTimeout(() => setCopiedCode((prev) => (prev === ticketCode ? null : prev)), 1500);
      setToast({
        kind: "info",
        message: locale === "en" ? `Copied ${ticketCode}` : `คัดลอก ${ticketCode} แล้ว`,
      });
    } catch {
      setError(locale === "en" ? "Cannot copy ticket code" : "ไม่สามารถคัดลอกรหัสตั๋วได้");
    }
  };

  const exportFailedCsv = () => {
    if (!bulkResult || bulkResult.fail.length === 0) return;
    const headers = ["ticketCode", "reason"];
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [
      headers.join(","),
      ...bulkResult.fail.map((r) => [escape(r.ticketCode), escape(r.reason)].join(",")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkin-failed-${tripId || "trip"}-${date || "date"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(locale === "en" ? "en-GB" : "th-TH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const quickCheckin = async () => {
    const code = quickTicket.trim();
    if (!code) return;
    const result = await doCheckinWithResult(code);
    if (!result.ok) {
      setToast({ kind: "error", message: result.reason });
      return;
    }
    setQuickTicket("");
    setToast({
      kind: "success",
      message: locale === "en" ? `Checked in ${code}` : `เช็กอิน ${code} สำเร็จ`,
    });
    const input = document.getElementById("quick-ticket-input") as HTMLInputElement | null;
    input?.focus();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{locale === "en" ? "Guest list & check-in" : "รายชื่อผู้จองและเช็กอิน"}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {locale === "en" ? "Trip date" : "วันที่เดินทาง"}: <span className="font-semibold text-slate-900">{date || "—"}</span>
          </p>
        </div>
        <Link
          href="/guide-manager"
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {locale === "en" ? "Back to manager" : "กลับไปหน้า manager"}
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {locale === "en" ? "Total guests" : "นักท่องเที่ยวรวม"}: <span className="font-bold text-slate-900">{totalGuests}</span>
        </div>
        <input
          id="checkin-search-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={locale === "en" ? "Search ticket / booking / language" : "ค้นหา ticket / booking / ภาษา"}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-primary/20 placeholder:text-slate-400 focus:ring-2"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setBeepEnabled((v) => !v)}
            className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold ${
              beepEnabled
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {beepEnabled ? (locale === "en" ? "Beep: On" : "เสียง: เปิด") : locale === "en" ? "Beep: Off" : "เสียง: ปิด"}
          </button>
          <button
            type="button"
            onClick={() => void bulkCheckin()}
            disabled={selectedCodes.length === 0 || checkingCode !== null}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {locale === "en" ? `Check in selected (${selectedCodes.length})` : `เช็กอินที่เลือก (${selectedCodes.length})`}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {locale === "en" ? "Export CSV" : "ส่งออก CSV"}
          </button>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {locale === "en" ? "Rapid scan mode" : "โหมดสแกนเร็ว"}
        </p>
        <input
          id="quick-ticket-input"
          type="text"
          value={quickTicket}
          onChange={(e) => setQuickTicket(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void quickCheckin();
            }
          }}
          placeholder={locale === "en" ? "Type/scan ticket code then Enter" : "พิมพ์/สแกนรหัสตั๋วแล้วกด Enter"}
          className="min-w-[240px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-primary/20 placeholder:text-slate-400 focus:ring-2"
        />
        <button
          type="button"
          onClick={() => void quickCheckin()}
          className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {locale === "en" ? "Check in code" : "เช็กอินตามรหัส"}
        </button>
      </div>

      {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}
      {bulkResult ? (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <p className="font-semibold text-slate-900">
            {locale === "en" ? "Bulk check-in result" : "ผลการเช็กอินหลายรายการ"}:{" "}
            <span className="text-emerald-700">{bulkResult.ok.length} {locale === "en" ? "success" : "สำเร็จ"}</span>
            {" · "}
            <span className="text-rose-700">{bulkResult.fail.length} {locale === "en" ? "failed" : "ไม่สำเร็จ"}</span>
          </p>
          {bulkResult.fail.length > 0 ? (
            <>
              <div className="mt-2 space-y-1 text-xs text-rose-700">
                {bulkResult.fail.map((f) => (
                  <p key={f.ticketCode}>
                    {f.ticketCode}: {f.reason}
                  </p>
                ))}
              </div>
              <button
                type="button"
                onClick={exportFailedCsv}
                className="mt-3 inline-flex items-center rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                {locale === "en" ? "Download failed only (CSV)" : "ดาวน์โหลดเฉพาะที่ไม่สำเร็จ (CSV)"}
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
          {locale === "en" ? "Loading..." : "กำลังโหลด..."}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
          {locale === "en" ? "No bookings found for this date." : "ไม่พบรายการจองในวันนี้"}
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[940px] text-sm">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectableRows.length > 0 && selectableRows.every((r) => selectedSet.has(r.ticketCode))}
                    onChange={(e) => toggleSelectAllFiltered(e.target.checked)}
                    aria-label="Select all"
                  />
                </th>
                <th className="px-4 py-3">{locale === "en" ? "Ticket" : "รหัสตั๋ว"}</th>
                <th className="px-4 py-3">{locale === "en" ? "Guests" : "จำนวนคน"}</th>
                <th className="px-4 py-3">{locale === "en" ? "Language" : "ภาษา"}</th>
                <th className="px-4 py-3">{locale === "en" ? "Status" : "สถานะ"}</th>
                <th className="px-4 py-3">{locale === "en" ? "Check-in" : "เช็กอิน"}</th>
                <th className="px-4 py-3">{locale === "en" ? "Checked at" : "เวลาเช็กอิน"}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => {
                const checked = r.checkInStatus === "checked_in";
                const selectable = r.status !== "cancelled" && !checked;
                return (
                  <tr key={r.bookingId} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        disabled={!selectable}
                        checked={selectedSet.has(r.ticketCode)}
                        onChange={(e) => toggleSelectCode(r.ticketCode, e.target.checked)}
                        aria-label={`Select ${r.ticketCode}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-800">{r.ticketCode}</span>
                        <button
                          type="button"
                          onClick={() => void copyTicketCode(r.ticketCode)}
                          className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          {copiedCode === r.ticketCode ? (locale === "en" ? "Copied" : "คัดลอกแล้ว") : locale === "en" ? "Copy" : "คัดลอก"}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{r.travelers}</td>
                    <td className="px-4 py-3 text-slate-700">{r.language || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          r.status === "cancelled" ? "bg-rose-50 text-rose-800 ring-1 ring-rose-200" : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                        }`}
                      >
                        {r.status === "cancelled" ? (locale === "en" ? "Cancelled" : "ยกเลิก") : locale === "en" ? "Paid" : "ชำระแล้ว"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {checked ? (
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-200">
                          {locale === "en" ? "Checked in" : "เช็กอินแล้ว"}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void doCheckin(r.ticketCode)}
                          disabled={checkingCode === r.ticketCode || r.status === "cancelled"}
                          className="inline-flex items-center rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {checkingCode === r.ticketCode
                            ? locale === "en"
                              ? "Checking..."
                              : "กำลังเช็ก..."
                            : locale === "en"
                              ? "Check in"
                              : "เช็กอิน"}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{formatDateTime(r.checkedInAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {toast ? (
        <div
          className={`fixed bottom-4 right-4 z-[120] rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg ${
            toast.kind === "success"
              ? "bg-emerald-600 text-white"
              : toast.kind === "error"
                ? "bg-rose-600 text-white"
                : "bg-slate-900 text-white"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}

export default function GuideTripCheckinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" aria-hidden />
        </div>
      }
    >
      <GuideTripCheckinPageInner />
    </Suspense>
  );
}
