"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Eye, Save, X } from "lucide-react";
import { useTranslation } from "@/context/LocaleContext";
import { guides } from "@/data/guides";
import {
  validateEnglishOnlyField,
  validateLanguagesEnglishOnly,
} from "@/lib/englishOnlyProfile";

const MAX_HEADER_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_HEADER_TYPES = ["image/jpeg", "image/png"];
const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

const FALLBACK_AVATAR = guides[0]?.image ?? "";

export default function GuideManagerProfileViewPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { status, data: session } = useSession();

  // Require guide to be logged in (to upload header to server later)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login/guide");
    }
  }, [status, router]);

  type ApiGuide = {
    id: string;
    publicProfileId?: string | null;
    guideRef?: string;
    name?: string | null;
    location?: string | null;
    locationSlug?: string | null;
    guideType: "general" | "local";
    image: string | null;
    headerImageUrl?: string | null;
    licenseNumber: string | null;
    rating: number;
    reviewCount: number;
    tours: number;
    experience: number;
    languages: string[];
    specialties: string[];
    bio: string | null;
    bioEn: string | null;
    verified: boolean;
    status?: "pending" | "approved";
  };

  const [guide, setGuide] = useState<ApiGuide | null>(null);
  const [registered, setRegistered] = useState<boolean | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        const res = await fetch("/api/guides/me", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setRegistered(false);
          return;
        }
        const isRegistered = Boolean(data?.registered);
        setRegistered(isRegistered);
        if (isRegistered && data) setGuide(data as ApiGuide);
      } catch {
        setRegistered(false);
      }
    })();
  }, [status]);

  const specialtyOptions = useMemo(() => {
    const set = new Set<string>();
    for (const g of guides) {
      for (const s of g.specialties) set.add(s);
    }
    return Array.from(set);
  }, []);

  const [headerUploadError, setHeaderUploadError] = useState<string | null>(null);
  const [pendingHeaderImageUrl, setPendingHeaderImageUrl] = useState<string | null>(guide?.headerImageUrl ?? null);
  const [profileUploadError, setProfileUploadError] = useState<string | null>(null);
  const [pendingProfileImageUrl, setPendingProfileImageUrl] = useState<string>(guide?.image ?? "");

  /** Single tourist-facing bio; saved to both bio and bioEn as English. */
  const [profileBio, setProfileBio] = useState<string>(
    (guide?.bioEn ?? "").trim() || (guide?.bio ?? "").trim() || ""
  );
  const [guideType, setGuideType] = useState<"general" | "local">(guide?.guideType ?? "local");
  const [languagesText, setLanguagesText] = useState<string>((guide?.languages ?? []).join(", "));
  const [specialties, setSpecialties] = useState<string[]>(guide?.specialties ?? []);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ bio?: string; languages?: string }>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!guide) return;
    setPendingHeaderImageUrl(guide.headerImageUrl ?? null);
    setPendingProfileImageUrl(guide.image ?? "");
    setProfileBio((guide.bioEn ?? "").trim() || (guide.bio ?? "").trim() || "");
    setGuideType(guide.guideType ?? "local");
    setLanguagesText((guide.languages ?? []).join(", "));
    setSpecialties(guide.specialties ?? []);
  }, [guide]);

  if (registered === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <p className="text-slate-700 font-semibold mb-2">ยังไม่มีข้อมูลไกด์ในระบบ</p>
          <p className="text-slate-500 text-sm mb-4">กรุณาลงทะเบียนไกด์ก่อน แล้วค่อยอัปเดตโปรไฟล์</p>
          <button
            type="button"
            onClick={() => router.push("/register-guide/form")}
            className="px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover"
          >
            ไปลงทะเบียน
          </button>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const headerBadgeColor = guideType === "local" ? "bg-green-500 text-white" : "bg-orange-500 text-white";

  const toggleSpecialty = (spec: string) => {
    setSpecialties((prev) => (prev.includes(spec) ? prev.filter((x) => x !== spec) : [...prev, spec]));
  };

  const parseLinesToArray = (s: string): string[] =>
    s
      .split(/\n|,/)
      .map((x) => x.trim())
      .filter(Boolean);

  const handleUploadHeader = async (file: File | null) => {
    setHeaderUploadError(null);
    if (!file) return;

    if (!ALLOWED_HEADER_TYPES.includes(file.type)) {
      setHeaderUploadError("รองรับเฉพาะ JPEG/PNG เท่านั้น");
      return;
    }
    if (file.size > MAX_HEADER_IMAGE_BYTES) {
      setHeaderUploadError("ขนาดไฟล์สูงสุด 5MB");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("files", file, file.name);

      const res = await fetch("/api/trips/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setHeaderUploadError(typeof data?.error === "string" ? data.error : "อัปโหลดไม่สำเร็จ");
        return;
      }

      const url = Array.isArray(data?.images) && data.images[0]?.url ? String(data.images[0].url) : null;
      if (!url) {
        setHeaderUploadError("เซิร์ฟเวอร์ไม่คืนค่า URL ของรูป");
        return;
      }

      setPendingHeaderImageUrl(url);
    } catch {
      setHeaderUploadError("เกิดข้อผิดพลาดในการอัปโหลดรูป");
    }
  };

  const handleUploadProfile = async (file: File | null) => {
    setProfileUploadError(null);
    if (!file) return;

    if (!ALLOWED_HEADER_TYPES.includes(file.type)) {
      setProfileUploadError("รองรับเฉพาะ JPEG/PNG เท่านั้น");
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setProfileUploadError("ขนาดไฟล์สูงสุด 5MB");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("files", file, file.name);

      const res = await fetch("/api/trips/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProfileUploadError(typeof data?.error === "string" ? data.error : "อัปโหลดรูปโปรไฟล์ไม่สำเร็จ");
        return;
      }

      const url = Array.isArray(data?.images) && data.images[0]?.url ? String(data.images[0].url) : null;
      if (!url) {
        setProfileUploadError("เซิร์ฟเวอร์ไม่คืนค่า URL ของรูป");
        return;
      }

      setPendingProfileImageUrl(url);
    } catch {
      setProfileUploadError("เกิดข้อผิดพลาดในการอัปโหลดรูปโปรไฟล์");
    }
  };

  const validateProfileForm = (): boolean => {
    setFieldErrors({});
    const trimmedBio = profileBio.trim();
    const bioErr = validateEnglishOnlyField(trimmedBio, true);
    const nextLanguages = parseLinesToArray(languagesText);
    const langErr = validateLanguagesEnglishOnly(nextLanguages);
    if (bioErr || langErr) {
      setFieldErrors({
        ...(bioErr ? { bio: bioErr } : {}),
        ...(langErr ? { languages: langErr } : {}),
      });
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    setSaveError(null);
    setSaveSuccess(null);
    if (!validateProfileForm()) {
      return;
    }
    setSaving(true);
    try {
      const nextLanguages = parseLinesToArray(languagesText);
      const trimmed = profileBio.trim();

      const payload = {
        guideType,
        image: pendingProfileImageUrl || null,
        headerImageUrl: pendingHeaderImageUrl || null,
        bio: trimmed,
        bioEn: trimmed,
        languages: nextLanguages,
        specialties,
      };

      const res = await fetch("/api/guides/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data?.error === "string" ? data.error : "บันทึกโปรไฟล์ไม่สำเร็จ";
        setSaveError(msg);
        return;
      }

      // Refetch เพื่อให้ state ตรงกับ server จริง
      const refreshRes = await fetch("/api/guides/me", { credentials: "include" });
      const refreshData = await refreshRes.json().catch(() => ({}));
      if (refreshRes.ok && refreshData) setGuide(refreshData as ApiGuide);

      setSaveSuccess("Saved successfully");
    } catch {
      setSaveError("เกิดข้อผิดพลาดในการบันทึกโปรไฟล์");
    } finally {
      setSaving(false);
    }
  };

  const handleClickSave = () => {
    if (saving) return;
    setSaveError(null);
    setSaveSuccess(null);
    if (!validateProfileForm()) return;
    setConfirmOpen(true);
  };

  const previewDisplayName =
    (session?.user?.name && String(session.user.name).trim()) ||
    (guide.name && String(guide.name).trim()) ||
    (locale === "en" ? "Guide" : "ไกด์");

  const previewLanguages = parseLinesToArray(languagesText);

  const previewBio = profileBio.trim();

  return (
    <div className="min-h-screen bg-slate-50/90">
      <header className="sticky top-0 z-10 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 md:px-8 md:py-7 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/90">โปรไฟล์สาธารณะ</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">จัดการโปรไฟล์ไกด์</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
              อัปเดตรูปปก รูปโปรไฟล์ คำแนะนำตัว ภาษาที่ใช้ และจุดเด่น — สิ่งที่นักท่องเที่ยวเห็นบนเว็บไซต์
              <span className="text-slate-500"> (คะแนนรีวิวมาจากนักท่องเที่ยวเท่านั้น แก้ไขเองไม่ได้)</span>
            </p>
            {guide.guideRef ? (
              <p className="text-xs text-slate-500">
                รหัสอ้างอิงไกด์: <span className="font-mono font-semibold text-primary">{guide.guideRef}</span>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-start justify-start gap-3 sm:justify-end">
            <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${headerBadgeColor}`}>
              {guideType === "local" ? t("localGuide") : t("generalGuide")}
            </span>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right shadow-sm">
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{t("guideLicenseNumber")}</div>
              <div className="font-mono text-sm text-slate-900">{guide.licenseNumber}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-7">
            <div className="mb-5 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">รูปปกและรูปโปรไฟล์</h2>
              <p className="mt-1 text-sm text-slate-500">ภาพที่แสดงบนหน้าโปรไฟล์และการ์ดไกด์ — แนะนำภาพชัด อัตราส่วนกว้าง</p>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-r from-primary to-primary-hover">
              {pendingHeaderImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pendingHeaderImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              )}
              <div className="relative p-5 h-32 sm:h-40">
                <div className="absolute bottom-3 left-5 w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-slate-200">
                  <Image
                    src={pendingProfileImageUrl || guide.image || FALLBACK_AVATAR}
                    alt={guide.id}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">อัปโหลดรูปปก (1 รูป) — JPEG หรือ PNG</label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary"
                onChange={(e) => void handleUploadHeader(e.currentTarget.files?.[0] ?? null)}
              />
              {headerUploadError && <p className="mt-2 text-xs text-red-600">{headerUploadError}</p>}
              <p className="text-xs text-slate-400 mt-1">จำกัด 5MB ต่อไฟล์</p>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">อัปโหลดรูปโปรไฟล์ (1 รูป) — JPEG หรือ PNG</label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary"
                onChange={(e) => void handleUploadProfile(e.currentTarget.files?.[0] ?? null)}
              />
              {profileUploadError && <p className="mt-2 text-xs text-red-600">{profileUploadError}</p>}
              <p className="text-xs text-slate-400 mt-1">จำกัด 5MB ต่อไฟล์</p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">ประเภทการให้บริการ</label>
              <p className="mb-2 text-xs text-slate-500">เลือกให้ตรงกับใบอนุญาตและสไตล์การนำเที่ยวของคุณ</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setGuideType("general")}
                  className={`flex-1 py-2.5 rounded-xl border transition-colors ${
                    guideType === "general" ? "border-primary bg-primary/5 text-primary" : "border-slate-200 bg-white text-slate-700 hover:border-primary/40"
                  }`}
                >
                  {t("generalGuide")}
                </button>
                <button
                  type="button"
                  onClick={() => setGuideType("local")}
                  className={`flex-1 py-2.5 rounded-xl border transition-colors ${
                    guideType === "local" ? "border-primary bg-primary/5 text-primary" : "border-slate-200 bg-white text-slate-700 hover:border-primary/40"
                  }`}
                >
                  {t("localGuide")}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-7">
            <div className="mb-5 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">About you & languages</h2>
              <p className="mt-1 text-sm text-slate-500">
                Write in <strong>English only</strong> — this is what international visitors see. Thai, Chinese, Japanese, Korean, Arabic, Hebrew (and similar scripts) are not accepted.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Introduction (English only)</label>
              <textarea
                value={profileBio}
                onChange={(e) => {
                  setProfileBio(e.target.value);
                  setFieldErrors((f) => {
                    if (!f.bio) return f;
                    const next = { ...f };
                    delete next.bio;
                    return next;
                  });
                }}
                rows={6}
                lang="en"
                spellCheck
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  fieldErrors.bio ? "border-red-300 bg-red-50/50" : "border-slate-200"
                }`}
              />
              {fieldErrors.bio && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.bio}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Languages you speak (English labels only)</label>
              <textarea
                value={languagesText}
                onChange={(e) => {
                  setLanguagesText(e.target.value);
                  setFieldErrors((f) => {
                    if (!f.languages) return f;
                    const next = { ...f };
                    delete next.languages;
                    return next;
                  });
                }}
                rows={3}
                lang="en"
                spellCheck
                placeholder="e.g. Thai, English, Japanese — comma or new line"
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  fieldErrors.languages ? "border-red-300 bg-red-50/50" : "border-slate-200"
                }`}
              />
              {fieldErrors.languages && (
                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.languages}</p>
              )}
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-1">ความถนัดและธีมทัวร์</h2>
            <p className="text-xs text-slate-500 mb-3">เลือกได้หลายข้อ เพื่อให้ลูกค้าค้นหาไกด์ที่ตรงกับทริปได้ง่ายขึ้น</p>
            <div className="flex flex-wrap gap-2">
              {specialtyOptions.map((spec) => {
                const active = specialties.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialty(spec)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                      active ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-slate-700 hover:border-primary/40"
                    }`}
                  >
                    {t(spec as any)}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" strokeWidth={2} />
            <p className="text-sm leading-relaxed text-amber-900">
              {locale === "en"
                ? "Saving writes to the server. Use Preview to see how visitors may view your profile before you confirm."
                : "เมื่อกดบันทึก ระบบจะอัปเดตข้อมูลจริง — แนะนำกด «ดูตัวอย่าง» ก่อนเพื่อตรวจภาพรวม"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/guide-manager"
            className="inline-flex items-center gap-2 font-semibold text-slate-500 transition-colors hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {locale === "en" ? "Back to trip overview" : "กลับไปทริปของฉัน"}
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition-colors hover:border-primary/40 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Eye className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
              {locale === "en" ? "Preview" : "ดูตัวอย่าง"}
            </button>
            <button
              type="button"
              onClick={handleClickSave}
              disabled={saving}
              className="inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4 shrink-0" strokeWidth={2} />
              {saving ? "กำลังบันทึก..." : locale === "en" ? "Save profile" : "บันทึกโปรไฟล์"}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-800">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800">
            {saveSuccess}
          </div>
        )}
      </main>

      {previewOpen && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={locale === "en" ? "Public profile preview" : "ตัวอย่างหน้าโปรไฟล์สาธารณะ"}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-slate-900/90 px-4 py-3 text-white">
            <div className="flex items-center gap-2 min-w-0">
              <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                Preview
              </span>
              <p className="text-sm truncate">
                {locale === "en"
                  ? "How visitors may see your profile (unsaved edits included)."
                  : "ตัวอย่างที่นักท่องเที่ยวอาจเห็น (รวมข้อมูลที่ยังไม่กดบันทึก)"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="inline-flex items-center gap-2 shrink-0 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
            >
              <X className="w-4 h-4" />
              {locale === "en" ? "Close" : "ปิด"}
            </button>
          </div>

          <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
                <div
                  className={`relative h-32 sm:h-48 overflow-hidden ${
                    pendingHeaderImageUrl ? "" : "bg-gradient-to-r from-primary to-primary-hover"
                  }`}
                >
                  {pendingHeaderImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pendingHeaderImageUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/15" />
                  <div className="absolute -bottom-16 left-6 sm:left-8">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-slate-200 shadow-lg">
                        <Image
                          src={pendingProfileImageUrl || guide.image || FALLBACK_AVATAR}
                          alt={previewDisplayName}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span
                        className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${
                          guideType === "local" ? "bg-green-500" : "bg-orange-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-20 pb-6 px-6 sm:px-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">{previewDisplayName}</h2>
                        {guide.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            {locale === "en" ? "Verified" : "ยืนยันแล้ว"}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            guideType === "local" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                          }`}
                        >
                          {guideType === "local" ? t("localGuide") : t("generalGuide")}
                        </span>
                        {guide.location ? (
                          <span className="text-slate-600">
                            {guide.location}, {t("thailand")}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="text-slate-500">{t("guideLicenseNumber")}:</span>
                        <span className="font-mono font-medium text-slate-700">
                          {guide.licenseNumber ?? "—"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-amber-500 text-lg font-bold">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {guide.rating}
                      </span>
                      <span className="text-slate-500">
                        ({guide.reviewCount} {t("reviews")})
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-800">{guide.tours}</p>
                      <p className="text-sm text-slate-500">{locale === "en" ? "Tours" : "ทัวร์"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-800">{guide.experience}</p>
                      <p className="text-sm text-slate-500">{locale === "en" ? "Years Exp." : "ปีประสบการณ์"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-800">{guide.reviewCount}</p>
                      <p className="text-sm text-slate-500">{t("reviews")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <section className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">
                      {locale === "en" ? "About" : "เกี่ยวกับ"}
                    </h3>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {previewBio || (locale === "en" ? "—" : "—")}
                    </p>
                  </section>

                  <section className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">
                      {locale === "en" ? "Languages" : "ภาษา"}
                    </h3>
                    {previewLanguages.length === 0 ? (
                      <p className="text-sm text-slate-500">—</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {previewLanguages.map((lang) => (
                          <span key={lang} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm">
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">
                      {locale === "en" ? "Specialties" : "ความชำนาญ"}
                    </h3>
                    {specialties.length === 0 ? (
                      <p className="text-sm text-slate-500">—</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {specialties.map((spec) => (
                          <span
                            key={spec}
                            className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                          >
                            {t(spec as any)}
                          </span>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="bg-white rounded-xl p-6 shadow-sm border border-dashed border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{t("customerReviews")}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {locale === "en"
                        ? "Reviews will appear here after tourists rate their experience. You can’t add or edit them from this page."
                        : "รีวิวจะแสดงที่นี่เมื่อนักท่องเที่ยวให้คะแนนหลังใช้บริการ — ไกด์ไม่สามารถเพิ่มหรือแก้รีวิวจากหน้านี้"}
                    </p>
                    <p className="text-xs text-slate-500 mt-3">
                      {locale === "en"
                        ? `Current summary from server: ${guide.rating} ★ (${guide.reviewCount} reviews).`
                        : `คะแนนรวมจากระบบปัจจุบัน: ${guide.rating} ดาว (${guide.reviewCount} รีวิว)`}
                    </p>
                  </section>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-4">
                    <h3 className="font-bold text-slate-800 mb-4">
                      {locale === "en" ? "Book with this guide" : "จองกับไกด์คนนี้"}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      {locale === "en"
                        ? "Demo placeholder (booking flow not connected yet)."
                        : "เดโม่เท่านั้น (ยังไม่เชื่อมระบบจองจริง)"}
                    </p>
                    <Link
                      href={`/explore?guideId=${encodeURIComponent(guide.publicProfileId ?? guide.id)}`}
                      className="block w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-center transition-colors"
                    >
                      {locale === "en" ? "View Tours" : "ดูทัวร์"}
                    </Link>
                    <button
                      type="button"
                      disabled
                      className="mt-3 w-full py-3 rounded-lg bg-primary/20 text-white font-semibold opacity-70 cursor-not-allowed"
                    >
                      {locale === "en" ? "Book (Coming soon)" : "จอง (กำลังทำ)"}
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-xs text-slate-500 pb-4">
                {locale === "en"
                  ? "“Tours by this guide” on the live site uses your published trips."
                  : "ส่วน “ทัวร์โดยไกด์” บนหน้าจริงจะดึงจากทริปที่คุณเผยแพร่แล้ว"}
              </p>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="ยืนยันการบันทึกโปรไฟล์"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-lg p-5">
            <h3 className="text-lg font-bold text-slate-900 mb-2">ยืนยันการบันทึก</h3>
            <p className="text-sm text-slate-600 mb-5">
              กด “ยืนยัน” เพื่อบันทึกข้อมูลลงระบบจริง คุณจะเปลี่ยนแปลงข้อมูลนี้ทันที
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setConfirmOpen(false)}
                disabled={saving}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={async () => {
                  setConfirmOpen(false);
                  await handleSaveProfile();
                }}
                disabled={saving}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

