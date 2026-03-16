# Prompt: สร้าง Server API ใหม่ — Register ไกด์ (DynamoDB + S3 + Google Sign-In)

ใช้เอกสารนี้เป็น **สเปกและ prompt** สำหรับสร้าง **Server API ชุดใหม่** สำหรับระบบลงทะเบียนไกด์ โดยไม่ใช้ server เก่า

---

## 1. ข้อกำหนดหลัก

| ข้อกำหนด | รายละเอียด |
|----------|-------------|
| **ฐานข้อมูล** | **Amazon DynamoDB** — เก็บข้อมูลไกด์ (และ user ถ้าต้องการ) |
| **เก็บไฟล์ภาพ** | **Amazon S3** — เก็บรูปบัตรประชาชน, รูปสมุดบัญชี ที่อัปโหลดจากฟอร์มลงทะเบียน |
| **การยืนยันตัวตน** | **Google Sign-In** — ให้สอดคล้องกับเว็บ (เว็บใช้ NextAuth + Google อยู่แล้ว) Server ต้องยืนยันว่า request มาจาก user ที่ล็อกอินด้วย Google และได้ **UID (Google sub)** มาเป็นตัวระบุหลัก |

---

## 2. สถานะฝั่ง Frontend (เว็บที่ต้องเชื่อม)

- เว็บมีหน้า **/register-guide** และ **/register-guide/form**
- ผู้ใช้ **ล็อกอินด้วย Google** ผ่าน NextAuth แล้วกรอกฟอร์มลงทะเบียนไกด์
- Frontend จะเรียก API ของ Server ใหม่นี้ โดยส่ง **token เพื่อยืนยันตัวตน** (ดูหัวข้อ Auth ด้านล่าง)
- Frontend คาดหวัง **path, method, body, response** ตามที่ระบุในหัวข้อ APIs ด้านล่าง

---

## 3. Auth — Google Sign-In ให้สอดคล้องกับเว็บ

เป้าหมาย: Server รู้ว่า “คนที่เรียก API นี้คือ user ไหน” โดยใช้ **ตัวระบุจาก Google (UID = Google `sub`)** เป็นหลัก

### 3.1 วิธีที่รองรับได้ (เลือกทำอย่างใดอย่างหนึ่ง)

**วิธี A — ใช้ NextAuth JWT (แนะนำถ้า Server กับ Frontend อยู่ทีมเดียวกัน)**  
- Frontend หลังล็อกอิน NextAuth จะส่ง **JWT ที่ NextAuth สร้าง** ไปใน header: `Authorization: Bearer <nextauth_jwt>`  
- Server ต้องมี **NEXTAUTH_SECRET** (ค่าเดียวกับที่เว็บใช้) เพื่อ decode/verify JWT นี้  
- จาก payload ของ JWT อ่าน **user id** (ซึ่ง NextAuth ใส่ค่า Google `sub` ไว้) → ใช้เป็น **UID**  
- ข้อดี: ไม่ต้องเปลี่ยน Frontend มาก (ส่ง token จาก session ได้)

**วิธี B — ใช้ Google ID Token**  
- Frontend ส่ง **Google ID token** (id_token จาก OAuth response) ใน header: `Authorization: Bearer <google_id_token>`  
- Server **verify token กับ Google** (ใช้ Google Client ID ตรวจ signature / เรียก Google tokeninfo endpoint)  
- จาก payload อ่าน **sub** → ใช้เป็น **UID**  
- ข้อดี: Server ไม่พึ่ง NextAuth, ใช้ได้กับหลาย client

ในทั้งสองวิธี:  
- ถ้า **ไม่มี token หรือ token ไม่ถูกต้อง/หมดอายุ** → ตอบ **401** พร้อม body เช่น `{ "error": "กรุณาล็อกอินก่อนลงทะเบียนไกด์" }`  
- **ห้ามรับ UID จาก body หรือ query** — ต้องได้ UID จาก token เท่านั้น

---

## 4. DynamoDB — ออกแบบเก็บข้อมูลไกด์

### 4.1 ตาราง Guides (หรือชื่อที่ตกลงกัน)

- **Partition Key (PK):** `userId` (string) — ใช้ค่า **UID จาก Google (sub)**  
  → หนึ่ง Google account ต่อหนึ่งรายการ guide  
- **Attributes ตัวอย่าง (ตามที่ API ใช้):**

| Attribute | Type | หมายเหตุ |
|-----------|------|----------|
| userId | string | PK = UID จาก Google |
| name | string | ชื่อที่แสดง |
| guideType | string | "general" \| "local" |
| locationSlug | string | bangkok, chiang-mai, phuket, krabi, pattaya, samut-songkhram |
| location | string | ชื่อจังหวัดภาษาไทย (สำหรับแสดง) |
| image | string? | URL รูปโปรไฟล์ (จาก Google หรือ S3) |
| phone | string? | เบอร์โทร |
| nationalId | string? | เลขบัตร 13 หลัก |
| idCardImageUrl | string? | URL รูปบัตรใน S3 |
| bankName | string? | ชื่อธนาคาร |
| accountNumber | string? | เลขบัญชี |
| accountHolder | string? | ชื่อบัญชี |
| bankBookImageUrl | string? | URL รูปสมุดบัญชีใน S3 |
| status | string | "pending" \| "approved" |
| rating | number | ค่าเริ่มต้น 0 |
| reviewCount | number | ค่าเริ่มต้น 0 |
| tours | number | ค่าเริ่มต้น 0 |
| experience | number | ค่าเริ่มต้น 0 |
| languages | list (string) | ค่าเริ่มต้น [] |
| specialties | list (string) | ค่าเริ่มต้น [] |
| bio | string? | |
| bioEn | string? | |
| verified | boolean | ค่าเริ่มต้น false |
| licenseNumber | string? | |
| createdAt | string | ISO 8601 |
| updatedAt | string | ISO 8601 |

- **Condition:** ก่อนสร้างรายการใหม่ ตรวจว่าไม่มี item ที่มี `userId` เดียวกัน (ลงทะเบียนซ้ำไม่ได้)

---

## 5. S3 — เก็บไฟล์ภาพ

- **Bucket:** สร้าง bucket สำหรับเก็บไฟล์จากฟอร์มลงทะเบียน (เช่น รูปบัตรประชาชน, รูปสมุดบัญชี)
- **การเข้าถึง:** ตั้งค่า CORS และนโยบายให้ Server อัปโหลดได้ และให้ client เข้าถึงรูปได้ (public read หรือ signed URL ตามนโยบายความปลอดภัย)
- **Key pattern ตัวอย่าง:**  
  `guides/{userId}/id-card.{ext}` และ `guides/{userId}/bank-book.{ext}`  
  หรือ `guides/{userId}/{kind}-{timestamp}.{ext}` (kind = id_card | bank_book)
- **รูปแบบ URL ที่คืนให้ Frontend:** หลังอัปโหลดแล้ว Server คืน **URL ของไฟล์ใน S3** (เช่น public URL หรือ presigned URL) ให้ Frontend นำไปใส่ในฟิลด์ `idCardImageUrl` / `bankBookImageUrl` ตอนเรียก POST register หรือ PATCH

---

## 6. APIs สำหรับ Register

Base path ตัวอย่าง: `https://api.your-domain.com` หรือ `https://your-api.com`  
ถ้า deploy ร่วมกับเว็บ Next.js อาจใช้ path prefix เช่น `/api` แล้ว proxy ไปที่ backend จริง

---

### 6.1 GET /guides/me (หรือ /api/guides/me)

- **วัตถุประสงค์:** ตรวจว่า user ปัจจุบัน (จาก token) ลงทะเบียนไกด์แล้วหรือยัง และดึงข้อมูล user/guide
- **Auth:** ต้องส่ง token ใน header `Authorization: Bearer <token>` (ตามวิธี A หรือ B ที่เลือก)
- **Response 200 — ยังไม่ลงทะเบียนไกด์**

```json
{
  "registered": false,
  "user": {
    "id": "<UID จาก Google>",
    "name": "ชื่อจาก Google",
    "email": "email@example.com",
    "image": "https://..."
  }
}
```

- **Response 200 — ลงทะเบียนแล้ว**

  คืน object โปรไฟล์ไกด์ (GuideResponse ด้านล่าง) พร้อม `"registered": true` และ `"status": "pending" | "approved"`  
  รวมฟิลด์เพิ่มเช่น `phone`, `idCardImageUrl`, `bankBookImageUrl` ตามที่เก็บใน DynamoDB (เลขบัญชีจะส่งหรือปิดบังตามนโยบาย)

- **Response 401:** ไม่มี token หรือ token ไม่ถูกต้อง

---

### 6.2 POST /guides/register (หรือ /api/guides/register)

- **วัตถุประสงค์:** ลงทะเบียนไกด์ (สร้างรายการใน DynamoDB)
- **Auth:** ต้องส่ง token ใน header `Authorization: Bearer <token>`
- **Content-Type:** application/json
- **Body (JSON):**

| ฟิลด์ | บังคับ | รายละเอียด |
|--------|--------|-------------|
| locationSlug | ใช่ | หนึ่งใน: bangkok, chiang-mai, phuket, krabi, pattaya, samut-songkhram |
| name | ไม่* | ชื่อที่แสดง (*ถ้าไม่ส่ง ให้ใช้ชื่อจาก token/Google ถ้ามี) |
| phone | ไม่ | เบอร์โทร |
| guideType | ไม่ | "general" \| "local" (default "general") |
| nationalId | ไม่ | เลขบัตร 13 หลัก |
| idCardImageUrl | ไม่ | URL รูปบัตร (จาก S3 หลังอัปโหลด) |
| bankName | ไม่ | ชื่อธนาคาร |
| accountNumber | ไม่ | เลขบัญชี |
| accountHolder | ไม่ | ชื่อบัญชี |
| bankBookImageUrl | ไม่ | URL รูปสมุดบัญชี (จาก S3) |

- **Logic:**
  1. ดึง UID จาก token (ห้ามใช้จาก body)
  2. ตรวจว่า DynamoDB ยังไม่มี item ที่ PK = userId นี้ ถ้ามีแล้ว → 400
  3. Validate: locationSlug ต้องอยู่ในรายการที่อนุญาต; ถ้ามี nationalId ต้อง 13 หลัก; name ต้องมี (จาก body หรือจากข้อมูล Google ใน token)
  4. สร้าง item ใน DynamoDB (userId = UID, status = "pending", ค่าเริ่มต้น rating/reviewCount/tours/experience/languages/specialties ฯลฯ)
  5. คืน 201 พร้อม object โปรไฟล์ไกด์

- **Response 201**

  Body: object โปรไฟล์ไกด์ (GuideResponse) + `"status": "pending"` + `"message": "ลงทะเบียนเรียบร้อย รอการตรวจสอบจากทีมงาน"`

- **Response 400 (ตัวอย่างข้อความที่ Frontend คาดไว้)**
  - `"กรุณาเลือกจังหวัดที่ให้บริการ"` — locationSlug ไม่มีหรือไม่ถูกต้อง
  - `"ไม่พบชื่อจากบัญชี Google กรุณากรอกชื่อที่แสดงต่อนักท่องเที่ยว"` — ไม่มีชื่อ
  - `"เลขบัตรประชาชนต้อง 13 หลัก"` — nationalId ไม่ใช่ 13 หลัก
  - `"บัญชีนี้ลงทะเบียนเป็นไกด์แล้ว"` — มี userId ใน DynamoDB แล้ว

- **Response 401:** ไม่มีหรือ token ไม่ถูกต้อง

---

### 6.3 PATCH /guides/me (หรือ /api/guides/me) (ถ้าต้องการ)

- **วัตถุประสงค์:** แก้ไขโปรไฟล์ไกด์
- **Auth:** Bearer token
- **Body (JSON):** ฟิลด์ที่ต้องการอัปเดต (name, phone, locationSlug, guideType, nationalId, idCardImageUrl, bankName, accountNumber, accountHolder, bankBookImageUrl ฯลฯ)
- **Response 200:** object โปรไฟล์ไกด์หลังอัปเดต
- **Response 404:** ยังไม่มีรายการ guide สำหรับ userId นี้
- **Response 401:** ไม่มีหรือ token ไม่ถูกต้อง

---

### 6.4 POST /upload (หรือ /api/upload) — อัปโหลดรูปไป S3

- **วัตถุประสงค์:** รับไฟล์รูปจาก Frontend แล้วอัปโหลดไป S3 และคืน URL
- **Auth:** Bearer token (ต้องล็อกอิน)
- **Content-Type:** multipart/form-data
- **Body:**
  - `file` — ไฟล์รูป (JPEG/PNG/WebP, แนะนำจำกัดขนาด เช่น สูงสุด 5MB)
  - `kind` — string เช่น "id_card" หรือ "bank_book" (ใช้จัด key ใน S3)
- **Logic:** ดึง UID จาก token, อัปโหลดไป S3 (key ตาม pattern ที่กำหนด), คืน URL ที่เข้าถึงได้
- **Response 200**

```json
{
  "url": "https://...",
  "key": "guides/<userId>/id-card.xxx"
}
```

- **Response 400/413:** ไม่มีไฟล์, ไฟล์ใหญ่เกิน, ประเภทไม่รองรับ
- **Response 401:** ไม่มีหรือ token ไม่ถูกต้อง

Frontend จะนำ `url` ไปใส่ใน `idCardImageUrl` หรือ `bankBookImageUrl` ตอนเรียก POST /guides/register หรือ PATCH /guides/me

---

## 7. รูปแบบโปรไฟล์ไกด์ (GuideResponse)

ทุก endpoint ที่คืน “โปรไฟล์ไกด์” ควรมีรูปแบบอย่างน้อยแบบนี้ (ให้ตรงกับที่ Frontend ใช้):

```ts
{
  id: string;              // ใช้ userId (Google UID) เป็น id ได้
  name: string;
  guideType: "general" | "local";
  location: string;        // ชื่อจังหวัดภาษาไทย
  locationSlug: string;
  image: string | null;
  rating: number;
  reviewCount: number;
  tours: number;
  experience: number;
  languages: string[];
  specialties: string[];
  bio: string | null;
  bioEn: string | null;
  verified: boolean;
  licenseNumber: string | null;
}
```

ฟิลด์เพิ่มสำหรับ /guides/me เมื่อลงทะเบียนแล้ว: status, phone, idCardImageUrl, bankBookImageUrl ฯลฯ ตามที่เก็บใน DynamoDB

---

## 8. สรุป Checklist สำหรับทีม Server

- [ ] เลือกวิธี Auth: วิธี A (NextAuth JWT) หรือ วิธี B (Google ID token) และ implement การ verify + ดึง UID
- [ ] สร้างตาราง DynamoDB สำหรับ guides (PK = userId)
- [ ] สร้าง S3 bucket และกำหนด key pattern, CORS, นโยบายการเข้าถึง
- [ ] Implement GET /guides/me
- [ ] Implement POST /guides/register (รวม validation และข้อความ error ตามที่ระบุ)
- [ ] (ถ้าต้องการ) Implement PATCH /guides/me
- [ ] Implement POST /upload (อัปโหลดไป S3, คืน URL)
- [ ] ทุก error response ใช้รูปแบบ `{ "error": "ข้อความภาษาไทย" }` และ HTTP status ตรงสเปก
- [ ] ถ้า Frontend กับ API อยู่คนละ domain: ตั้ง CORS และอนุญาต credentials / header ที่จำเป็น (รวม Authorization)

---

## 9. อ้างอิงฝั่ง Frontend

- ฟอร์มลงทะเบียนส่ง: **locationSlug** (บังคับ), name, phone, guideType, nationalId, bankName, accountNumber, accountHolder  
- รูปบัตร/สมุดบัญชี: Frontend จะอัปโหลดผ่าน POST /upload ก่อน แล้วนำ URL ไปใส่ใน idCardImageUrl / bankBookImageUrl ตอน register หรือ PATCH  
- เอกสารสำหรับ Frontend: [FRONTEND-API-GUIDE.md](FRONTEND-API-GUIDE.md) (อาจต้องอัปเดต base URL และวิธีส่ง token ตามที่ Server ใหม่กำหนด)

---

เมื่อ Server ใหม่พร้อมแล้ว ฝั่ง Frontend จะต้องอัปเดตเฉพาะ **base URL ของ API** และ **วิธีส่ง token** (เช่น ส่ง NextAuth JWT หรือ Google ID token ใน Authorization header) ให้ตรงกับที่ Server รองรับ
