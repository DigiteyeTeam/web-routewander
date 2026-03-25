/**
 * 77 เขตปกครอง (76 จังหวัด + กรุงเทพมหานคร) — slug ใช้ใน trip.slug / province
 * ชื่อไทยตามทะเบียนราชการ / ชื่ออังกฤษสำหรับแสดงนักท่องเที่ยว
 */

export type ThailandProvince = {
  slug: string;
  nameTh: string;
  nameEn: string;
};

/** 77 จังหวัด (เรียงกลุ่มตามข้อมูลมาตรฐาน; หน้า UI จัดเรียงอีกทีได้) */
const RAW: readonly ThailandProvince[] = [
  { slug: "amnat-charoen", nameTh: "อำนาจเจริญ", nameEn: "Amnat Charoen" },
  { slug: "ang-thong", nameTh: "อ่างทอง", nameEn: "Ang Thong" },
  { slug: "bangkok", nameTh: "กรุงเทพมหานคร", nameEn: "Bangkok" },
  { slug: "bueng-kan", nameTh: "บึงกาฬ", nameEn: "Bueng Kan" },
  { slug: "buri-ram", nameTh: "บุรีรัมย์", nameEn: "Buri Ram" },
  { slug: "chachoengsao", nameTh: "ฉะเชิงเทรา", nameEn: "Chachoengsao" },
  { slug: "chai-nat", nameTh: "ชัยนาท", nameEn: "Chai Nat" },
  { slug: "chaiyaphum", nameTh: "ชัยภูมิ", nameEn: "Chaiyaphum" },
  { slug: "chanthaburi", nameTh: "จันทบุรี", nameEn: "Chanthaburi" },
  { slug: "chiang-mai", nameTh: "เชียงใหม่", nameEn: "Chiang Mai" },
  { slug: "chiang-rai", nameTh: "เชียงราย", nameEn: "Chiang Rai" },
  { slug: "chon-buri", nameTh: "ชลบุรี", nameEn: "Chon Buri" },
  { slug: "chumphon", nameTh: "ชุมพร", nameEn: "Chumphon" },
  { slug: "kalasin", nameTh: "กาฬสินธุ์", nameEn: "Kalasin" },
  { slug: "kamphaeng-phet", nameTh: "กำแพงเพชร", nameEn: "Kamphaeng Phet" },
  { slug: "kanchanaburi", nameTh: "กาญจนบุรี", nameEn: "Kanchanaburi" },
  { slug: "khon-kaen", nameTh: "ขอนแก่น", nameEn: "Khon Kaen" },
  { slug: "krabi", nameTh: "กระบี่", nameEn: "Krabi" },
  { slug: "lampang", nameTh: "ลำปาง", nameEn: "Lampang" },
  { slug: "lamphun", nameTh: "ลำพูน", nameEn: "Lamphun" },
  { slug: "loei", nameTh: "เลย", nameEn: "Loei" },
  { slug: "lop-buri", nameTh: "ลพบุรี", nameEn: "Lop Buri" },
  { slug: "mae-hong-son", nameTh: "แม่ฮ่องสอน", nameEn: "Mae Hong Son" },
  { slug: "maha-sarakham", nameTh: "มหาสารคาม", nameEn: "Maha Sarakham" },
  { slug: "mukdahan", nameTh: "มุกดาหาร", nameEn: "Mukdahan" },
  { slug: "nakhon-nayok", nameTh: "นครนายก", nameEn: "Nakhon Nayok" },
  { slug: "nakhon-pathom", nameTh: "นครปฐม", nameEn: "Nakhon Pathom" },
  { slug: "nakhon-phanom", nameTh: "นครพนม", nameEn: "Nakhon Phanom" },
  { slug: "nakhon-ratchasima", nameTh: "นครราชสีมา", nameEn: "Nakhon Ratchasima" },
  { slug: "nakhon-sawan", nameTh: "นครสวรรค์", nameEn: "Nakhon Sawan" },
  { slug: "nakhon-si-thammarat", nameTh: "นครศรีธรรมราช", nameEn: "Nakhon Si Thammarat" },
  { slug: "nan", nameTh: "น่าน", nameEn: "Nan" },
  { slug: "narathiwat", nameTh: "นราธิวาส", nameEn: "Narathiwat" },
  { slug: "nong-bua-lam-phu", nameTh: "หนองบัวลำภู", nameEn: "Nong Bua Lam Phu" },
  { slug: "nong-khai", nameTh: "หนองคาย", nameEn: "Nong Khai" },
  { slug: "nonthaburi", nameTh: "นนทบุรี", nameEn: "Nonthaburi" },
  { slug: "pathum-thani", nameTh: "ปทุมธานี", nameEn: "Pathum Thani" },
  { slug: "pattani", nameTh: "ปัตตานี", nameEn: "Pattani" },
  { slug: "phangnga", nameTh: "พังงา", nameEn: "Phangnga" },
  { slug: "phatthalung", nameTh: "พัทลุง", nameEn: "Phatthalung" },
  { slug: "phayao", nameTh: "พะเยา", nameEn: "Phayao" },
  { slug: "phetchabun", nameTh: "เพชรบูรณ์", nameEn: "Phetchabun" },
  { slug: "phetchaburi", nameTh: "เพชรบุรี", nameEn: "Phetchaburi" },
  { slug: "phichit", nameTh: "พิจิตร", nameEn: "Phichit" },
  { slug: "phitsanulok", nameTh: "พิษณุโลก", nameEn: "Phitsanulok" },
  { slug: "phra-nakhon-si-ayutthaya", nameTh: "พระนครศรีอยุธยา", nameEn: "Phra Nakhon Si Ayutthaya" },
  { slug: "phrae", nameTh: "แพร่", nameEn: "Phrae" },
  { slug: "phuket", nameTh: "ภูเก็ต", nameEn: "Phuket" },
  { slug: "prachin-buri", nameTh: "ปราจีนบุรี", nameEn: "Prachin Buri" },
  { slug: "prachuap-khiri-khan", nameTh: "ประจวบคีรีขันธ์", nameEn: "Prachuap Khiri Khan" },
  { slug: "ranong", nameTh: "ระนอง", nameEn: "Ranong" },
  { slug: "ratchaburi", nameTh: "ราชบุรี", nameEn: "Ratchaburi" },
  { slug: "rayong", nameTh: "ระยอง", nameEn: "Rayong" },
  { slug: "roi-et", nameTh: "ร้อยเอ็ด", nameEn: "Roi Et" },
  { slug: "sa-kaeo", nameTh: "สระแก้ว", nameEn: "Sa Kaeo" },
  { slug: "sakon-nakhon", nameTh: "สกลนคร", nameEn: "Sakon Nakhon" },
  { slug: "samut-prakan", nameTh: "สมุทรปราการ", nameEn: "Samut Prakan" },
  { slug: "samut-sakhon", nameTh: "สมุทรสาคร", nameEn: "Samut Sakhon" },
  { slug: "samut-songkhram", nameTh: "สมุทรสงคราม", nameEn: "Samut Songkhram" },
  { slug: "saraburi", nameTh: "สระบุรี", nameEn: "Saraburi" },
  { slug: "satun", nameTh: "สตูล", nameEn: "Satun" },
  { slug: "sing-buri", nameTh: "สิงห์บุรี", nameEn: "Sing Buri" },
  { slug: "si-sa-ket", nameTh: "ศรีสะเกษ", nameEn: "Si Sa Ket" },
  { slug: "songkhla", nameTh: "สงขลา", nameEn: "Songkhla" },
  { slug: "sukhothai", nameTh: "สุโขทัย", nameEn: "Sukhothai" },
  { slug: "suphan-buri", nameTh: "สุพรรณบุรี", nameEn: "Suphan Buri" },
  { slug: "surat-thani", nameTh: "สุราษฎร์ธานี", nameEn: "Surat Thani" },
  { slug: "surin", nameTh: "สุรินทร์", nameEn: "Surin" },
  { slug: "tak", nameTh: "ตาก", nameEn: "Tak" },
  { slug: "trang", nameTh: "ตรัง", nameEn: "Trang" },
  { slug: "trat", nameTh: "ตราด", nameEn: "Trat" },
  { slug: "ubon-ratchathani", nameTh: "อุบลราชธานี", nameEn: "Ubon Ratchathani" },
  { slug: "udon-thani", nameTh: "อุดรธานี", nameEn: "Udon Thani" },
  { slug: "uthai-thani", nameTh: "อุทัยธานี", nameEn: "Uthai Thani" },
  { slug: "uttaradit", nameTh: "อุตรดิตถ์", nameEn: "Uttaradit" },
  { slug: "yala", nameTh: "ยะลา", nameEn: "Yala" },
  { slug: "yasothon", nameTh: "ยโสธร", nameEn: "Yasothon" },
];

if (RAW.length !== 77) {
  throw new Error(`thailand-provinces: expected 77 provinces, got ${RAW.length}`);
}

/** จัดเรียงตามชื่อไทย (สำหรับ dropdown) */
export const THAILAND_PROVINCES: readonly ThailandProvince[] = [...RAW].sort((a, b) =>
  a.nameTh.localeCompare(b.nameTh, "th")
);

const BY_SLUG = new Map(THAILAND_PROVINCES.map((p) => [p.slug, p]));

/** slug เก่าที่ไม่ใช่ 77 จังหวัด (เช่น พัทยา) */
const LEGACY_BY_SLUG: Record<string, ThailandProvince> = {
  pattaya: { slug: "pattaya", nameTh: "พัทยา", nameEn: "Pattaya" },
};

export function getProvinceBySlug(slug: string): ThailandProvince | undefined {
  if (!slug) return undefined;
  return BY_SLUG.get(slug) ?? LEGACY_BY_SLUG[slug];
}

export function provinceSlugToNameTh(slug: string): string {
  return getProvinceBySlug(slug)?.nameTh ?? "";
}

export function provinceSlugToNameEn(slug: string): string {
  return getProvinceBySlug(slug)?.nameEn ?? slug;
}

/** แปลงชื่อจังหวัดภาษาไทย (หรือ slug เดิม) → slug มาตรฐฯ */
export function provinceInputToSlug(input: string): string | undefined {
  const t = input.trim();
  if (!t) return undefined;
  if (BY_SLUG.has(t)) return t;
  for (const p of THAILAND_PROVINCES) {
    if (p.nameTh === t) return p.slug;
  }
  for (const p of Object.values(LEGACY_BY_SLUG)) {
    if (p.nameTh === t) return p.slug;
  }
  return undefined;
}

/** ชื่อไทยทุกจังหวัด — สำหับจับคู่จาก Nominatim */
export const ALL_THAI_PROVINCE_LABELS_TH: string[] = THAILAND_PROVINCES.map((p) => p.nameTh);

/** slug → ชื่ออังกฤษ (รวม legacy) */
export function buildProvinceSlugToEn(): Record<string, string> {
  const o: Record<string, string> = {};
  for (const p of THAILAND_PROVINCES) {
    o[p.slug] = p.nameEn;
  }
  o.pattaya = "Pattaya";
  return o;
}
