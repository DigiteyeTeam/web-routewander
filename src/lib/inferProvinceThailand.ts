import { ALL_THAI_PROVINCE_LABELS_TH, THAILAND_PROVINCES } from "@/data/thailand-provinces";

const LABELS_TH = ALL_THAI_PROVINCE_LABELS_TH;

/**
 * จับจังหวัดจาก address ของ Nominatim (ผลค้นหา EN มักได้ชื่ออังกฤษใน state — แมตช์แล้วคืนชื่อไทยสำหรับ dropdown)
 */
export function inferProvinceLabelFromNominatimAddress(
  address?: Record<string, string>
): string | null {
  if (!address) return null;
  const parts = [
    address.state,
    address.province,
    address.city,
    address.county,
    address.municipality,
    address.town,
    address.region,
  ].filter(Boolean) as string[];

  for (const part of parts) {
    const cleaned = part.replace(/^จังหวัด\s*/, "").trim();
    const lower = cleaned.toLowerCase();
    for (const p of THAILAND_PROVINCES) {
      if (
        cleaned === p.nameTh ||
        cleaned === p.nameEn ||
        lower === p.nameEn.toLowerCase() ||
        cleaned.includes(p.nameTh) ||
        p.nameTh.includes(cleaned) ||
        cleaned.includes(p.nameEn) ||
        p.nameEn.toLowerCase().includes(lower) ||
        lower.includes(p.nameEn.toLowerCase())
      ) {
        return p.nameTh;
      }
    }
    for (const label of LABELS_TH) {
      if (cleaned === label || cleaned.includes(label) || label.includes(cleaned)) {
        return label;
      }
    }
  }
  return null;
}

/** อำเภอ/เขต ถ้ามี (ไม่บังคับ) */
export function inferDistrictFromNominatimAddress(address?: Record<string, string>): string | undefined {
  if (!address) return undefined;
  const d =
    address.county ||
    address.city_district ||
    address.suburb ||
    address.district ||
    address.subdistrict ||
    "";
  const t = String(d).trim();
  return t.length > 0 ? t : undefined;
}
