# Prompt: สร้าง Server API เชื่อมฐานข้อมูลกับเว็บ Route Wander (เริ่มจากข้อมูลไกด์)

ใช้เอกสารนี้เป็น **prompt / สเปก** สำหรับออกแบบและพัฒนา Server API ที่เชื่อมกับฐานข้อมูล โดย**เริ่มจากข้อมูลไกด์ (Guides)** ก่อน แล้วค่อยขยายไปทริป (Activities) และการจองในภายหลัง

---

## 1. บริบทโปรเจกต์

- **Frontend:** Next.js (App Router), React, TypeScript
- **ที่อยู่เว็บ:** โปรเจกต์นี้ (RWV2) — หน้าหลัก, สำรวจทริป, หน้ารายละเอียดทริป, หน้าไกด์, ลงทะเบียนไกด์, Guide Manager (จัดการทริปของไกด์)
- **Auth ที่มีอยู่:** NextAuth + Google Provider (`src/app/api/auth/[...nextauth]/route.ts`), ใช้ได้สำหรับล็อกอินทั่วไป
- **ข้อมูลปัจจุบัน:** เป็น **mock / in-memory** ใน `src/data/guides.ts` และ `src/data/activities.ts` ไม่มีฐานข้อมูลจริง

**เป้าหมาย:** สร้าง API (แนะนำใช้ Next.js Route Handlers หรือ backend แยก) ที่เชื่อมกับ **ฐานข้อมูลจริง** โดยเริ่มจาก **ข้อมูลไกด์** — ให้เว็บดึง/ส่งข้อมูลไกด์ผ่าน API แทนการอ่านจาก `guides.ts`

---

## 2. โครงสร้างข้อมูลไกด์ที่เว็บใช้อยู่

### 2.1 Type ปัจจุบัน (Frontend)

จาก `src/data/guides.ts`:

```ts
export type GuideType = "general" | "local";

export type Guide = {
  id: string;
  nameKey: TranslationKey;   // ปัจจุบันใช้ key สำหรับ i18n
  guideType: GuideType;
  locationKey: TranslationKey;
  image: string;
  rating: number;
  reviewCount: number;
  tours: number;
  experience: number;         // ปีประสบการณ์
  languages: string[];
  specialties: TranslationKey[];
  bio: string;
  bioEn: string;
  verified: boolean;
  licenseNumber: string;
};
```

- **nameKey / locationKey / specialties:** ตอนนี้เป็น translation key (เช่น `"navGuide1"`, `"cityBangkok"`) ให้ frontend ใช้ `t(key)` แสดงข้อความ
- **สำหรับข้อมูลจริง:** แนะนำให้เก็บเป็น **ข้อความจริง** ใน DB (เช่น `name`, `location`, `specialties` เป็น array ของ string) แล้ว API ส่งกลับเป็น `name`, `location`, `specialties` — frontend จะต้องรองรับทั้งแบบ `nameKey` (ของข้อมูลเก่า) และ `name` (ของข้อมูลจาก API) หรือเปลี่ยนไปใช้ `name` / `location` / `specialties` ทั้งหมดเมื่อต่อ API แล้ว

### 2.2 ฟอร์มลงทะเบียนไกด์ (Register Guide)

จาก `src/app/register-guide/form/page.tsx` — 3 ขั้น:

**ขั้นที่ 1 – ข้อมูลส่วนตัว**

- ชื่อ-นามสกุล (ชื่อที่แสดงต่อนักท่องเที่ยว)
- เบอร์โทรติดต่อ
- จังหวัดที่ให้บริการ (กรุงเทพฯ, เชียงใหม่, ภูเก็ต, กระบี่, พัทยา, สมุทรสงคราม — ตรงกับ slug ได้ เช่น bangkok, chiang-mai, phuket, krabi, pattaya, samut-songkhram)

**ขั้นที่ 2 – ยืนยันตัวตน**

- เลขบัตรประชาชน (13 หลัก)
- บัตรประชาชน (ด้านหน้า) — อัปโหลดรูป

**ขั้นที่ 3 – ข้อมูลการรับเงิน**

- ธนาคาร (จากรายการที่กำหนด)
- เลขบัญชี
- ชื่อบัญชี (ตามสมุดบัญชี)
- รูปสมุดบัญชี (หน้าชื่อและเลขบัญชี)

นอกจากนี้ หลังล็อกอินด้วย Google จะมีข้อมูลจากบัญชี (email, name, image) — ต้อง **เชื่อมบัญชีกับไกด์** (หนึ่ง user = หนึ่ง guide profile เมื่อสมัครเป็นไกด์แล้ว)

---

## 3. สิ่งที่ API ต้องทำ (Phase 1: ไกด์เท่านั้น)

### 3.1 ฐานข้อมูล (แนะนำ)

- **ตาราง `guides` (หรือ `guide_profiles`)**
  - `id` (PK, UUID หรือ auto-increment)
  - `user_id` หรือ `email` — เชื่อมกับบัญชีที่ล็อกอิน (NextAuth ให้ `session.user.email` / `session.user.id` ถ้าใช้ adapter)
  - ชื่อแสดง: `name` (หรือเก็บ `name_key` ถ้าจะใช้ i18n ต่อ)
  - `guide_type`: enum หรือ string (`general` | `local`)
  - `location` หรือ `location_slug`: จังหวัด/ปลายทาง (bangkok, chiang-mai, …)
  - `image`: URL รูปโปรไฟล์
  - `rating`, `review_count`, `tours`, `experience`
  - `languages`: JSON array หรือตารางแยก
  - `specialties`: JSON array ของ string (หรือ key)
  - `bio`, `bio_en`
  - `verified`: boolean (อนุมัติโดยแอดมินหรือยัง)
  - `license_number`: เลขใบอนุญาต/รหัสไกด์
  - ข้อมูลยืนยันตัวตน: `national_id`, `id_card_image_url` (หรือ path ใน storage)
  - ข้อมูลจ่ายเงิน: `bank_name`, `account_number`, `account_holder`, `bank_book_image_url`
  - `created_at`, `updated_at`

- **การเก็บไฟล์:** รูปบัตรประชาชนและรูปสมุดบัญชี — อัปโหลดไป storage (S3, GCS, หรือโฟลเดอร์ในเซิร์ฟเวอร์) แล้วเก็บเฉพาะ **URL** ใน DB

### 3.2 Endpoints ที่ควรมี (Phase 1)

| Method | Path (ตัวอย่าง) | คำอธิบาย |
|--------|------------------|----------|
| GET | `/api/guides` | รายการไกด์ (สำหรับหน้า /guides, filter ตาม type ได้) |
| GET | `/api/guides/[id]` | ไกด์คนเดียว (สำหรับหน้า /guides/[id], หน้ารายละเอียดทริปที่แสดงไกด์) |
| POST | `/api/guides/register` | ส่งข้อมูลลงทะเบียนไกด์ (ทั้ง 3 ขั้น หรือแยก step ก็ได้) — ต้องมี session ล็อกอินแล้ว |
| PATCH | `/api/guides/me` หรือ `/api/guides/[id]` | แก้ไขโปรไฟล์ไกด์ (ต้องเป็นไกด์คนนั้นหรือแอดมิน) |
| GET | `/api/guides/me` | ดึงโปรไฟล์ไกด์ของ user ปัจจุบัน (สำหรับ Guide Manager, ใช้ตรวจว่าเป็นไกด์แล้วหรือยัง) |

- **การยืนยันตัวตน:** ถ้าแอดมินต้องอนุมัติ ให้มีฟิลด์ `status` (เช่น pending / approved / rejected) และ endpoint สำหรับแอดมิน (เช่น PATCH `/api/admin/guides/[id]/verify`) — ระบุในสเปกได้ว่าทำใน Phase 1 หรือ Phase 2

### 3.3 รูปแบบ Response ที่แนะนำ

- **GET /api/guides**  
  คืน array ของ object ที่มีฟิลด์ตรงกับ type `Guide` ที่ frontend ใช้ (หรือ version ที่ใช้ `name`, `location`, `specialties` แทน key)

- **GET /api/guides/[id]**  
  คืน object เดียว รูปแบบเดียวกัน

- **POST /api/guides/register**  
  รับ body: ข้อมูลจากฟอร์ม (ชื่อ, โทร, จังหวัด, เลขบัตร, bank, accountNumber, accountHolder และถ้ามี URL รูปบัตร/สมุดบัญชีหลังอัปโหลด)  
  คืน: 201 + ข้อมูลไกด์ที่สร้าง หรือ 400 ถ้าข้อมูลไม่ครบ/ซ้ำ

- **GET /api/guides/me**  
  ถ้ายังไม่สมัครไกด์: 404 หรือ `{ registered: false }`  
  ถ้าสมัครแล้ว: 200 + ข้อมูลไกด์ (รูปเดียวกับ GET /api/guides/[id])

### 3.4 Auth และการเชื่อม User–Guide

- ใช้ **NextAuth session** ตรวจว่า user ล็อกอินแล้ว
- เมื่อเรียก `POST /api/guides/register` หรือ `GET /api/guides/me` ให้ใช้ `session.user.email` (หรือ `session.user.id` ถ้ามี) เพื่อสร้างหรือดึง guide ที่ผูกกับ user นั้น
- ถ้าใช้ NextAuth Adapter (เช่น Prisma Adapter) จะมีตาราง `users` — ให้ `guides.user_id` เป็น FK ไปที่ `users.id` ได้

---

## 4. รายละเอียดเพิ่มสำหรับการพัฒนา

### 4.1 Tech stack (ตัวอย่าง)

- **Backend:** Next.js API Routes (ในโปรเจกต์นี้) หรือแยก service (Node/Express, etc.)
- **DB:** PostgreSQL หรือ MySQL
- **ORM:** Prisma หรือ Drizzle (แนะนำเพื่อ sync schema กับ TypeScript)
- **Storage รูป:** AWS S3, Google Cloud Storage หรือ local upload แล้วเก็บ path/URL ใน DB
- **Auth:** NextAuth — ใช้ `getServerSession()` ใน API route เพื่อตรวจ session

### 4.2 สิ่งที่ต้องทำฝั่ง Frontend (หลังมี API)

- สร้าง **client/helper** เรียก API (เช่น `fetch('/api/guides')`, `fetch('/api/guides/me')`)
- หน้า `/guides`, `/guides/[id]`, และจุดที่ใช้ `getGuideById` — เปลี่ยนจาก import ข้อมูลใน `guides.ts` เป็นดึงจาก API
- ฟอร์มลงทะเบียนไกด์ (`/register-guide/form`) — กดส่งแล้วเรียก `POST /api/guides/register` พร้อมข้อมูลฟอร์ม (และ URL รูปถ้ามี endpoint อัปโหลดแยก)
- Guide Manager — ใช้ `GET /api/guides/me` เพื่อดึงไกด์ปัจจุบันและใช้ `guide.id` แทน `MOCK_GUIDE_ID`

### 4.3 การแมป slug จังหวัด

เว็บใช้ `slug` ปลายทาง (bangkok, chiang-mai, …) ตรงกับ `src/data/activities.ts` และ `DESTINATION_NAMES` — ฟอร์มลงทะเบียนมี "จังหวัดที่ให้บริการ" แนะนำให้เก็บใน DB เป็น slug เดียวกัน (เช่น `bangkok`) เพื่อใช้ filter และแสดงผลสอดคล้องกับ frontend

---

## 5. Phase 2 (ไม่ทำในตอนนี้ แค่กำหนดขอบเขต)

หลังข้อมูลไกด์เชื่อม DB ได้แล้ว ค่อยขยายเป็น:

- **Activities (ทริป):** ตาราง activities / activity_details, CRUD ทริป, ผูก `guide_id` กับตาราง guides
- **การจอง (Bookings):** ตาราง bookings ผูกกับ activity และ user/guest
- **รีวิว:** ตาราง reviews ผูกกับ activity และ user

---

## 6. สรุป Checklist สำหรับผู้พัฒนา API

- [ ] ออกแบบตาราง `guides` (และถ้ามี `users` จาก NextAuth ให้เชื่อม `user_id`)
- [ ] ตั้งค่า DB + ORM (เช่น Prisma) และ migration
- [ ] สร้าง endpoint: GET /api/guides, GET /api/guides/[id]
- [ ] สร้าง endpoint: POST /api/guides/register (ต้องมี auth)
- [ ] สร้าง endpoint: GET /api/guides/me, PATCH /api/guides/me (หรือ PATCH /api/guides/[id] พร้อมตรวจสิทธิ์)
- [ ] จัดการอัปโหลดรูป (บัตรประชาชน, สมุดบัญชี) — เก็บ URL ใน guides
- [ ] กำหนด response shape ให้ตรงกับ type Guide (หรือ version ที่ใช้ name/location/specialties เป็น string)
- [ ] เขียนเอกสาร API (path, body, response) สำหรับ frontend
- [ ] ปรับ frontend ให้ดึงไกด์จาก API และส่งฟอร์มลงทะเบียนไปที่ API

ถ้าต้องการให้เริ่มจาก **ข้อมูลไกด์จริง** เท่านั้น ให้ทำเฉพาะส่วนที่เกี่ยวกับ `guides` และการลงทะเบียนไกด์ตามด้านบน แล้วค่อยเพิ่ม activities และ bookings ใน Phase 2
