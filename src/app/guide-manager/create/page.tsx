"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenLine, Settings, ImagePlus, AlertCircle, ArrowLeft, Tag } from "lucide-react";
import { getAllActivities } from "@/data/activities";
import {
  FILTER_CATEGORIES,
  DESTINATION_NAMES,
  type FeatureKey,
  type ActivityItem,
  type ActivityDetail,
  type GuideType,
  type ItineraryStep,
} from "@/data/activities";
import { useTranslation } from "@/context/LocaleContext";
import { featureKeyToTKey, type TranslationKey } from "@/i18n/translations";

const MOCK_GUIDE_ID = "1";
const MAX_OPEN_TRIPS = 3;
const STORAGE_KEY = "guide-manager-closed-ids";

/** หมวดหมู่ที่เลือกได้ (ไม่รวม "all") */
const CATEGORY_OPTIONS = FILTER_CATEGORIES.filter((c) => c.key !== "all");

/** จังหวัด/ปลายทาง ตรงกับ slug ใน ActivityItem */
const DESTINATION_OPTIONS = Object.entries(DESTINATION_NAMES).map(([value, label]) => ({ value, label }));

const FEATURE_KEYS: FeatureKey[] = [
  "skipTheLine",
  "freeCancellation",
  "localTasting",
  "pickupIncluded",
  "guidedTour",
  "sunsetView",
  "proPhoto",
  "lessCrowded",
  "boatRide",
  "privateTour",
  "drinkIncluded",
  "trekking",
  "scenicView",
  "snorkeling",
  "sunriseView",
  "waterSports",
  "dinnerIncluded",
  "fireflyViewing",
];

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

/** ป้าย (badge) ตรงกับ ActivityItem */
const BADGE_OPTIONS: { key: "" | "likelyToSellOut" | "popular"; label: string; red?: boolean }[] = [
  { key: "", label: "ไม่มี" },
  { key: "likelyToSellOut", label: "มีแนวโน้มขายหมด", red: true },
  { key: "popular", label: "ยอดนิยม", red: false },
];

/** ตัวอย่างรายละเอียดทริป (ตรงกับที่แสดงใน /activity/[id]) */
const EXAMPLE_DESCRIPTION =
  "เดินทางไปยังจังหวัดและสัมผัสประสบการณ์ที่หลากหลายในทัวร์พร้อมไกด์ท้องถิ่น ชมสถานที่สำคัญ และทำกิจกรรมที่คุณสนใจ";
const EXAMPLE_DESCRIPTION_EN =
  "Travel to the destination and experience a variety of tours with local guides. Visit key sights and do activities you enjoy.";
const EXAMPLE_INCLUDED = "ไกด์ท้องถิ่น\nตั๋วเข้าชม (ตามที่ระบุ)\nฟรียกเลิกภายใน 24 ชม.";
const EXAMPLE_NOT_INCLUDED = "อาหารและเครื่องดื่มเพิ่มเติม\nเคล็ดลับ";
const EXAMPLE_NOT_SUITABLE = "ผู้ที่มีความบกพร่องด้านการเคลื่อนไหว, ผู้ใช้รถเข็น";
const EXAMPLE_MEETING_POINT = "พบกันที่จุดนัดพบในเมือง (ส่งรายละเอียดหลังจอง)";
const EXAMPLE_IMPORTANT_1_TITLE = "สิ่งที่ต้องนำมา";
const EXAMPLE_IMPORTANT_1_ITEMS = "รองเท้าใส่สบาย\nแว่นกันแดด\nครีมกันแดด";
const EXAMPLE_IMPORTANT_2_TITLE = "ไม่ได้รับอนุญาต";
const EXAMPLE_IMPORTANT_2_ITEMS = "กระเป๋าใบใหญ่";
const EXAMPLE_HIGHLIGHTS = "ไกด์ท้องถิ่นชาวไทย\nประสบการณ์เล็กกลุ่ม\nเหมาะสำหรับนักท่องเที่ยวต่างชาติ";
const EXAMPLE_OPTION_1_TITLE = "ทัวร์กลุ่มเล็ก";
const EXAMPLE_OPTION_1_MEETING = "จุดนัดพบในเมือง";
const EXAMPLE_OPTION_2_TITLE = "ทัวร์แบบส่วนตัว";
const EXAMPLE_OPTION_2_MEETING = "ไปรับที่โรงแรม";

/** กำหนดการตัวอย่าง (ใช้ __CITY__ แทนชื่อจังหวัด แล้วแทนที่ใน buildTripPayload) */
const EXAMPLE_ITINERARY: ItineraryStep[] = [
  { type: "start_pickup", title: "สถานที่เริ่มต้น/จุดนัดรับ", detail: "ขึ้นอยู่กับตัวเลือกที่เลือก", isMainStop: true },
  { type: "travel", title: "รถบัส/รถโค้ช", duration: "ประมาณ 1 ชั่วโมง" },
  { type: "rest", title: "จุดพักระหว่างทาง", detail: "เวลาพัก (15 นาที)" },
  { type: "travel", title: "รถบัส/รถโค้ช", duration: "ประมาณ 45 นาที" },
  { type: "activity", title: "__CITY__", detail: "ไกด์ทัวร์", duration: "2 - 3 ชั่วโมง", isMainStop: true },
  { type: "activity", title: "__CITY__", detail: "เวลาว่าง", duration: "30 นาที", isMainStop: true },
  { type: "travel", title: "รถบัส/รถโค้ช", duration: "ประมาณ 1 ชั่วโมง" },
  { type: "drop_off", title: "จุดส่ง", detail: "ส่งที่จุดนัดพบ", isMainStop: true },
];

function parseLines(s: string): string[] {
  return s
    .split(/\n|,/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** สร้าง object ทริปตามโครงสร้าง ActivityDetail ให้ตรงกับ /activity/[id] ทุกฟิลด์ */
function buildTripPayload(
  form: {
    title: string;
    titleEn: string;
    categoryKey: string;
    slug: string;
    durationHours: string;
    priceFrom: string;
    priceOriginal: string;
    featureKeys: FeatureKey[];
    guideType: GuideType;
    tripCode: string;
    image: string;
    imageAlt: string;
    badgeKey: "" | "likelyToSellOut" | "popular";
    banner: string;
    description: string;
    descriptionEn: string;
    includedText: string;
    notIncludedText: string;
    notSuitableForText: string;
    meetingPoint: string;
    importantInfo1Title: string;
    importantInfo1Items: string;
    importantInfo2Title: string;
    importantInfo2Items: string;
    highlightsText: string;
    option1Title: string;
    option1Meeting: string;
    option2Title: string;
    option2Meeting: string;
  },
  t: (key: TranslationKey) => string
): Omit<ActivityDetail, "id"> {
  const hours = form.durationHours ? parseInt(form.durationHours, 10) : 0;
  const duration = hours ? `${hours} ชั่วโมง` : "";
  const durationEn = hours ? `${hours} hours` : "";
  const category = CATEGORY_OPTIONS.find((c) => c.key === form.categoryKey)?.label ?? form.categoryKey;
  const features = form.featureKeys
    .map((k) => (featureKeyToTKey[k] ? t(featureKeyToTKey[k]) : ""))
    .filter(Boolean);
  const badgeOpt = form.badgeKey ? BADGE_OPTIONS.find((b) => b.key === form.badgeKey) : undefined;
  const priceFromNum = form.priceFrom ? parseInt(form.priceFrom, 10) : 0;
  const cityName = form.slug ? DESTINATION_NAMES[form.slug] || form.slug : "จังหวัด";

  const base: Omit<ActivityItem, "id"> = {
    title: form.title,
    titleEn: form.titleEn || undefined,
    slug: form.slug || "bangkok",
    duration,
    durationEn,
    priceFrom: priceFromNum,
    priceOriginal: form.priceOriginal ? parseInt(form.priceOriginal, 10) : undefined,
    category,
    categoryKey: form.categoryKey || "guided-tour",
    image: form.image || "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80",
    imageAlt: form.imageAlt || form.title,
    rating: 0,
    reviewCount: 0,
    features,
    featureKeys: form.featureKeys.length ? form.featureKeys : undefined,
    guideType: form.guideType || "general",
    guideId: MOCK_GUIDE_ID,
    tripCode: form.tripCode || undefined,
    badge: badgeOpt?.label,
    badgeKey: form.badgeKey || undefined,
    badgeRed: badgeOpt?.red,
    banner: form.banner || undefined,
  };

  const included = parseLines(form.includedText);
  const notIncluded = parseLines(form.notIncludedText);
  const notSuitableFor = parseLines(form.notSuitableForText);
  const highlights = parseLines(form.highlightsText);
  const importantInfo = [
    { title: form.importantInfo1Title, items: parseLines(form.importantInfo1Items) },
    { title: form.importantInfo2Title, items: parseLines(form.importantInfo2Items) },
  ].filter((b) => b.title.trim());

  const options = [
    {
      title: form.option1Title || EXAMPLE_OPTION_1_TITLE,
      duration,
      guideLang: "ไทย, อังกฤษ",
      meeting: form.option1Meeting || EXAMPLE_OPTION_1_MEETING,
      price: priceFromNum,
    },
    {
      title: form.option2Title || EXAMPLE_OPTION_2_TITLE,
      duration,
      guideLang: "ไทย, อังกฤษ",
      meeting: form.option2Meeting || EXAMPLE_OPTION_2_MEETING,
      price: priceFromNum * 2,
      pricePerGroup: true,
    },
  ];

  const itinerary: ItineraryStep[] = EXAMPLE_ITINERARY.map((step) => ({
    ...step,
    title: step.title === "__CITY__" ? cityName : step.title,
  }));

  return {
    ...base,
    description: form.description.trim() || undefined,
    descriptionEn: form.descriptionEn.trim() || undefined,
    included: included.length ? included : undefined,
    notIncluded: notIncluded.length ? notIncluded : undefined,
    notSuitableFor: notSuitableFor.length ? notSuitableFor : undefined,
    meetingPoint: form.meetingPoint.trim() || undefined,
    importantInfo: importantInfo.length ? importantInfo : undefined,
    highlights: highlights.length ? highlights : undefined,
    options,
    itinerary,
  };
}

export default function CreateTripPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [categoryKey, setCategoryKey] = useState("");
  const [slug, setSlug] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [featureKeys, setFeatureKeys] = useState<FeatureKey[]>([]);
  const [guideType, setGuideType] = useState<GuideType>("general");
  const [tripCode, setTripCode] = useState("");
  const [image, setImage] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [priceOriginal, setPriceOriginal] = useState("");
  const [badgeKey, setBadgeKey] = useState<"" | "likelyToSellOut" | "popular">("");
  const [banner, setBanner] = useState("");
  const [description, setDescription] = useState(EXAMPLE_DESCRIPTION);
  const [descriptionEn, setDescriptionEn] = useState(EXAMPLE_DESCRIPTION_EN);
  const [includedText, setIncludedText] = useState(EXAMPLE_INCLUDED);
  const [notIncludedText, setNotIncludedText] = useState(EXAMPLE_NOT_INCLUDED);
  const [notSuitableForText, setNotSuitableForText] = useState(EXAMPLE_NOT_SUITABLE);
  const [meetingPoint, setMeetingPoint] = useState(EXAMPLE_MEETING_POINT);
  const [importantInfo1Title, setImportantInfo1Title] = useState(EXAMPLE_IMPORTANT_1_TITLE);
  const [importantInfo1Items, setImportantInfo1Items] = useState(EXAMPLE_IMPORTANT_1_ITEMS);
  const [importantInfo2Title, setImportantInfo2Title] = useState(EXAMPLE_IMPORTANT_2_TITLE);
  const [importantInfo2Items, setImportantInfo2Items] = useState(EXAMPLE_IMPORTANT_2_ITEMS);
  const [highlightsText, setHighlightsText] = useState(EXAMPLE_HIGHLIGHTS);
  const [option1Title, setOption1Title] = useState(EXAMPLE_OPTION_1_TITLE);
  const [option1Meeting, setOption1Meeting] = useState(EXAMPLE_OPTION_1_MEETING);
  const [option2Title, setOption2Title] = useState(EXAMPLE_OPTION_2_TITLE);
  const [option2Meeting, setOption2Meeting] = useState(EXAMPLE_OPTION_2_MEETING);
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setClosedIds(loadClosedIds());
  }, []);

  const myTrips = useMemo(() => getAllActivities().filter((a) => a.guideId === MOCK_GUIDE_ID), []);
  const openCount = myTrips.length - closedIds.size;
  const canPublish = openCount < MAX_OPEN_TRIPS;

  const toggleFeature = (key: FeatureKey) => {
    setFeatureKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildTripPayload(
      {
        title,
        titleEn,
        categoryKey,
        slug,
        durationHours,
        priceFrom,
        priceOriginal,
        featureKeys,
        guideType,
        tripCode,
        image,
        imageAlt: imageAlt || title,
        badgeKey,
        banner,
        description,
        descriptionEn,
        includedText,
        notIncludedText,
        notSuitableForText,
        meetingPoint,
        importantInfo1Title,
        importantInfo1Items,
        importantInfo2Title,
        importantInfo2Items,
        highlightsText,
        option1Title,
        option1Meeting,
        option2Title,
        option2Meeting,
      },
      t
    );
    console.log("Draft trip (mock):", payload);
    router.push("/guide-manager");
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) return;
    const payload = buildTripPayload(
      {
        title,
        titleEn,
        categoryKey,
        slug,
        durationHours,
        priceFrom,
        priceOriginal,
        featureKeys,
        guideType,
        tripCode,
        image,
        imageAlt: imageAlt || title,
        badgeKey,
        banner,
        description,
        descriptionEn,
        includedText,
        notIncludedText,
        notSuitableForText,
        meetingPoint,
        importantInfo1Title,
        importantInfo1Items,
        importantInfo2Title,
        importantInfo2Items,
        highlightsText,
        option1Title,
        option1Meeting,
        option2Title,
        option2Meeting,
      },
      t
    );
    console.log("Publish trip (mock):", payload);
    router.push("/guide-manager");
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 px-6 md:px-10 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">สร้างทริปใหม่</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            กรอกข้อมูลให้ตรงกับระบบทริปของเว็บ (เปิดได้สูงสุด {MAX_OPEN_TRIPS} ทริป)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            บันทึกแบบร่าง
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish}
            className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            เผยแพร่ทริป
          </button>
        </div>
      </header>

      <div className="p-6 md:p-10 max-w-4xl">
        {!canPublish && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">เปิดทริปครบ {MAX_OPEN_TRIPS} ทริปแล้ว</p>
              <p className="text-amber-700 mt-0.5">
                กรุณาปิดรับจองอย่างน้อย 1 ทริปในหน้า{" "}
                <Link href="/guide-manager" className="underline font-semibold">ทริปของฉัน</Link> ก่อนจึงจะเผยแพร่ทริปใหม่ได้
              </p>
            </div>
          </div>
        )}

        <form className="space-y-8">
          <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
              <span className="size-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <PenLine className="w-4 h-4" strokeWidth={2} />
              </span>
              รายละเอียดทริป
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">ชื่อทริป (ไทย) *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ทัวร์วัดพระแก้วและพระบรมมหาราชวัง"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">ชื่อทริป (อังกฤษ)</label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Grand Palace & Temple Tour"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">หมวดหมู่ *</label>
                <select
                  value={categoryKey}
                  onChange={(e) => setCategoryKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">ตรงกับ categoryKey ในระบบทริป</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
              <span className="size-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4" strokeWidth={2} />
              </span>
              ตั้งค่าทริป
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">ราคาต่อคน (บาท) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">฿</span>
                  <input
                    type="number"
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">priceFrom ตรงกับทริป</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">ราคาเดิม (บาท) ไม่บังคับ</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">฿</span>
                  <input
                    type="number"
                    value={priceOriginal}
                    onChange={(e) => setPriceOriginal(e.target.value)}
                    placeholder="เว้นว่างได้"
                    min={0}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">priceOriginal (แสดงขีดฆ่า)</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">ระยะเวลา (ชั่วโมง) *</label>
                <input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  placeholder="เช่น 4"
                  min={1}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-slate-400 mt-1">จะแสดงเป็น &quot;X ชั่วโมง&quot; / &quot;X hours&quot;</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">จังหวัด / ปลายทาง (slug) *</label>
                <select
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="">เลือกจังหวัด</option>
                  {DESTINATION_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">ตรงกับ slug ของทริป</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">รหัสทริป</label>
                <input
                  type="text"
                  value={tripCode}
                  onChange={(e) => setTripCode(e.target.value)}
                  placeholder="เช่น BK01"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-slate-400 mt-1">tripCode (ถ้ามี)</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold mb-2 text-slate-700">ประเภทไกด์</label>
                <select
                  value={guideType}
                  onChange={(e) => setGuideType(e.target.value as GuideType)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="general">ไกด์ทั่วไป (General)</option>
                  <option value="local">ไกด์ท้องถิ่น (Local)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">ป้าย (badge)</label>
                <select
                  value={badgeKey}
                  onChange={(e) => setBadgeKey((e.target.value || "") as "" | "likelyToSellOut" | "popular")}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  {BADGE_OPTIONS.map((b) => (
                    <option key={b.key || "none"} value={b.key}>
                      {b.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">badgeKey / badge / badgeRed</p>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">แบนเนอร์ (banner)</label>
                <input
                  type="text"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  placeholder="ข้อความแบนเนอร์ ถ้ามี"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span className="size-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <Tag className="w-4 h-4" strokeWidth={2} />
              </span>
              จุดเด่นทริป (featureKeys)
            </h3>
            <p className="text-sm text-slate-500 mb-4">เลือกได้หลายข้อ ตรงกับ featureKeys ในระบบ</p>
            <div className="flex flex-wrap gap-2">
              {FEATURE_KEYS.map((key) => {
                const tKey = featureKeyToTKey[key];
                const label = tKey ? t(tKey) : key;
                const checked = featureKeys.includes(key);
                return (
                  <label
                    key={key}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      checked
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-slate-200 text-slate-600 hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFeature(key)}
                      className="sr-only"
                    />
                    {label}
                  </label>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span className="size-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <ImagePlus className="w-4 h-4" strokeWidth={2} />
              </span>
              รูปภาพทริป
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">URL รูปหลัก (image)</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">คำอธิบายรูป (imageAlt)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="เช่น วัดพระแก้ว"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <p className="text-xs text-slate-400">อัปโหลดไฟล์จะเปิดในเวอร์ชันถัดไป ตอนนี้ใส่ URL ได้เลย</p>
            </div>
          </section>

          {/* รายละเอียดเพิ่มเติม (ตัวอย่าง ตรงกับ /activity/[id]) */}
          <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-slate-800">
              <span className="size-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                <PenLine className="w-4 h-4" strokeWidth={2} />
              </span>
              รายละเอียดเพิ่มเติม (ตัวอย่าง)
            </h3>
            <p className="text-sm text-slate-500 mb-6">ค่าตัวอย่างตรงกับที่แสดงในหน้ารายละเอียดทริป แก้ไขได้ตามจริง</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">คำอธิบายทริป (ไทย)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder={EXAMPLE_DESCRIPTION}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">คำอธิบายทริป (อังกฤษ)</label>
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder={EXAMPLE_DESCRIPTION_EN}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700">รวมอะไรบ้าง (หนึ่งบรรทัดต่อข้อ)</label>
                  <textarea
                    value={includedText}
                    onChange={(e) => setIncludedText(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700">ไม่รวมอะไรบ้าง</label>
                  <textarea
                    value={notIncludedText}
                    onChange={(e) => setNotIncludedText(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">ไม่เหมาะสำหรับ (คั่นด้วย comma หรือบรรทัดใหม่)</label>
                <input
                  type="text"
                  value={notSuitableForText}
                  onChange={(e) => setNotSuitableForText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">จุดนัดพบ</label>
                <input
                  type="text"
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">ไฮไลท์ (หนึ่งบรรทัดต่อข้อ)</label>
                <textarea
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-bold text-slate-700 mb-3">ข้อมูลสำคัญ (2 บล็อก)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      value={importantInfo1Title}
                      onChange={(e) => setImportantInfo1Title(e.target.value)}
                      placeholder="หัวข้อ เช่น สิ่งที่ต้องนำมา"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-2"
                    />
                    <textarea
                      value={importantInfo1Items}
                      onChange={(e) => setImportantInfo1Items(e.target.value)}
                      rows={3}
                      placeholder="หนึ่งบรรทัดต่อข้อ"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={importantInfo2Title}
                      onChange={(e) => setImportantInfo2Title(e.target.value)}
                      placeholder="หัวข้อ เช่น ไม่ได้รับอนุญาต"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-2"
                    />
                    <textarea
                      value={importantInfo2Items}
                      onChange={(e) => setImportantInfo2Items(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-bold text-slate-700 mb-3">ตัวเลือกทัวร์ (2 ตัวเลือก ราคาอิงจากราคาต่อคนด้านบน)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-xs font-medium text-slate-500 mb-1">ตัวเลือกที่ 1 (ราคาต่อคน)</label>
                    <input
                      type="text"
                      value={option1Title}
                      onChange={(e) => setOption1Title(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-2"
                      placeholder={EXAMPLE_OPTION_1_TITLE}
                    />
                    <input
                      type="text"
                      value={option1Meeting}
                      onChange={(e) => setOption1Meeting(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder={EXAMPLE_OPTION_1_MEETING}
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-xs font-medium text-slate-500 mb-1">ตัวเลือกที่ 2 (ราคาต่อกลุ่ม)</label>
                    <input
                      type="text"
                      value={option2Title}
                      onChange={(e) => setOption2Title(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm mb-2"
                      placeholder={EXAMPLE_OPTION_2_TITLE}
                    />
                    <input
                      type="text"
                      value={option2Meeting}
                      onChange={(e) => setOption2Meeting(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder={EXAMPLE_OPTION_2_MEETING}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">กำหนดการเดินทางใช้ตัวอย่าง 8 ขั้น (ชื่อจังหวัดอิงจากปลายทางที่เลือก)</p>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between pt-4">
            <Link
              href="/guide-manager"
              className="inline-flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              กลับไปทริปของฉัน
            </Link>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                บันทึกแบบร่าง
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={!canPublish}
                className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                เผยแพร่ทริป
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
