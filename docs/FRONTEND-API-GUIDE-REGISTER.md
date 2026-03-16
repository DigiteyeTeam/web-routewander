# คู่มือ API สำหรับ Frontend — ลงทะเบียนไกด์

เอกสารนี้บอกฝั่ง Frontend ว่าต้องยิง API อย่างไรเพื่อเชื่อมกับ Server ลงทะเบียนไกด์ (Register Guide)

---

## 1. Base URL

- **พัฒนา (local):** `http://localhost:4000`
- **Production:** ใช้ URL ที่ deploy API จริง (เช่น `https://api.your-domain.com`)

ทุก endpoint ด้านล่างอยู่ภายใต้ base URL นี้ (เช่น `GET {baseUrl}/api/guides/me`)

---

## 2. การยืนยันตัวตน (Auth)

Server ใช้ **NextAuth JWT** (วิธี A) — ต้องส่ง token ที่ NextAuth สร้างให้หลังล็อกอิน (Google)

- **Header:** `Authorization: Bearer <token>`
- **ที่มา token:** หลัง user ล็อกอิน NextAuth แล้ว ใช้ค่า JWT จาก session (เช่น `session.accessToken` หรือค่าที่ NextAuth ใส่ใน session / JWT)
- **ถ้าไม่ส่งหรือ token ผิด/หมดอายุ:** Server ตอบ **401** พร้อม body `{ "error": "กรุณาล็อกอินก่อนลงทะเบียนไกด์" }`

**สรุป:** ทุก request ไปที่ `/api/guides/*` และ `/api/upload` ต้องมี header นี้

---

## 3. รูปแบบ Error

ทุก error จาก API จะเป็น:

- **HTTP status:** 400, 401, 404, 413, 500 ฯลฯ ตามเหตุการณ์
- **Body:** `{ "error": "ข้อความภาษาไทย" }`

ตัวอย่าง: `{ "error": "กรุณาเลือกจังหวัดที่ให้บริการ" }`

---

## 4. Endpoints

### 4.1 GET /api/guides/me

**ใช้ทำอะไร:** ตรวจว่า user ปัจจุบันลงทะเบียนไกด์แล้วหรือยัง และดึงข้อมูล user/guide

**Request**

- Method: `GET`
- Headers: `Authorization: Bearer <token>`

**Response 200 — ยังไม่ลงทะเบียนไกด์**

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

**Response 200 — ลงทะเบียนแล้ว**

Object โปรไฟล์ไกด์ พร้อม `registered: true`, `status: "pending" | "approved"` และฟิลด์อื่นๆ เช่น `phone`, `idCardImageUrl`, `bankBookImageUrl` ฯลฯ (ตามที่เก็บในระบบ)

**Response 401:** ไม่มี token หรือ token ไม่ถูกต้อง → `{ "error": "กรุณาล็อกอินก่อนลงทะเบียนไกด์" }`

---

### 4.2 POST /api/guides/register

**ใช้ทำอะไร:** ลงทะเบียนไกด์ (สร้างรายการในระบบ)

**Request**

- Method: `POST`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body (JSON):

| ฟิลด์ | บังคับ | รายละเอียด |
|--------|--------|-------------|
| locationSlug | ใช่ | หนึ่งใน: `bangkok`, `chiang-mai`, `phuket`, `krabi`, `pattaya`, `samut-songkhram` |
| name | ไม่* | ชื่อที่แสดง (*ถ้าไม่ส่ง ใช้ชื่อจาก Google ถ้ามี) |
| phone | ไม่ | เบอร์โทร |
| guideType | ไม่ | `"general"` \| `"local"` (default `"general"`) |
| nationalId | ไม่ | เลขบัตร 13 หลัก |
| idCardImageUrl | ไม่ | URL รูปบัตร (จาก S3 หลังอัปโหลดผ่าน POST /upload) |
| bankName | ไม่ | ชื่อธนาคาร |
| accountNumber | ไม่ | เลขบัญชี |
| accountHolder | ไม่ | ชื่อบัญชี |
| bankBookImageUrl | ไม่ | URL รูปสมุดบัญชี (จาก S3) |

**Response 201**

Object โปรไฟล์ไกด์ + `"status": "pending"` + `"message": "ลงทะเบียนเรียบร้อย รอการตรวจสอบจากทีมงาน"`

**Response 400 (ข้อความที่อาจได้)**

- `"กรุณาเลือกจังหวัดที่ให้บริการ"` — locationSlug ไม่มีหรือไม่ถูกต้อง
- `"ไม่พบชื่อจากบัญชี Google กรุณากรอกชื่อที่แสดงต่อนักท่องเที่ยว"` — ไม่มีชื่อ
- `"เลขบัตรประชาชนต้อง 13 หลัก"` — nationalId ไม่ใช่ 13 หลัก
- `"บัญชีนี้ลงทะเบียนเป็นไกด์แล้ว"` — ลงทะเบียนซ้ำ

**Response 401:** ไม่มีหรือ token ไม่ถูกต้อง

---

### 4.3 PATCH /api/guides/me

**ใช้ทำอะไร:** แก้ไขโปรไฟล์ไกด์

**Request**

- Method: `PATCH`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body (JSON): ฟิลด์ที่ต้องการอัปเดต เช่น `name`, `phone`, `locationSlug`, `guideType`, `nationalId`, `idCardImageUrl`, `bankName`, `accountNumber`, `accountHolder`, `bankBookImageUrl`

**Response 200:** Object โปรไฟล์ไกด์หลังอัปเดต

**Response 404:** ยังไม่มีรายการ guide สำหรับ user นี้ → `{ "error": "ยังไม่มีรายการลงทะเบียนไกด์" }`

**Response 401:** ไม่มีหรือ token ไม่ถูกต้อง

---

### 4.4 POST /api/upload

**ใช้ทำอะไร:** อัปโหลดรูปไป S3 แล้วได้ URL กลับมา นำไปใส่ใน `idCardImageUrl` / `bankBookImageUrl` ตอน register หรือ PATCH

**Request**

- Method: `POST`
- Headers: `Authorization: Bearer <token>`
- Content-Type: `multipart/form-data`
- Body (form data):
  - **file** — ไฟล์รูป (JPEG/PNG/WebP, สูงสุด 5MB)
  - **kind** — `"id_card"` หรือ `"bank_book"`

**Response 200**

```json
{
  "url": "https://...",
  "key": "register-guide/<userId>/id-card.xxx"
}
```

Frontend ใช้ค่า **url** ไปใส่ใน `idCardImageUrl` หรือ `bankBookImageUrl` ตอนเรียก `POST /api/guides/register` หรือ `PATCH /api/guides/me`

**Response 400/413:** ไม่มีไฟล์, ไฟล์ใหญ่เกิน, ประเภทไม่รองรับ → `{ "error": "ข้อความภาษาไทย" }`

**Response 401:** ไม่มีหรือ token ไม่ถูกต้อง

---

## 5. ลำดับการใช้งานที่แนะนำ (ฟอร์มลงทะเบียนไกด์)

1. **GET /api/guides/me** — ตรวจว่า user ลงทะเบียนแล้วหรือยัง
   - ถ้า `registered: true` → แสดงสถานะ/โปรไฟล์ หรือไปหน้าแก้ไข
   - ถ้า `registered: false` → แสดงฟอร์มลงทะเบียน
2. (ถ้ามีรูปบัตร/สมุดบัญชี) **POST /api/upload** ส่ง `file` + `kind: "id_card"` หรือ `"bank_book"` แล้วเก็บ `url` จาก response
3. **POST /api/guides/register** — ส่ง `locationSlug` (บังคับ) และฟิลด์อื่นๆ รวมถึง `idCardImageUrl`, `bankBookImageUrl` ถ้ามี
4. แก้ไขโปรไฟล์ภายหลัง: **PATCH /api/guides/me** พร้อมฟิลด์ที่ต้องการอัปเดต

---

## 6. CORS

Server ตั้ง CORS รับจาก origin ที่กำหนด (เช่น development ใช้ `http://localhost:3000`)  
ถ้า Frontend รันที่ port อื่นหรือ domain อื่น ต้องให้ทีม Backend เพิ่ม origin นั้นใน `CORS_ORIGIN`

---

## 7. สรุปสั้นๆ ให้ Frontend

- **Base URL:** `http://localhost:4000` (dev) หรือ URL production
- **Auth:** ส่ง `Authorization: Bearer <token>` โดยใช้ NextAuth JWT หลังล็อกอิน Google
- **Error:** ทุก error เป็น `{ "error": "ข้อความภาษาไทย" }` + HTTP status
- **ลงทะเบียน:** อัปโหลดรูปผ่าน POST /upload ก่อน → เอา `url` ไปใส่ในฟิลด์รูปตอน POST /api/guides/register หรือ PATCH /api/guides/me

---

## 8. การใช้ผ่าน Next.js (Proxy)

ถ้า Frontend กับ Next.js อยู่ที่เดียวกัน (เช่น `http://localhost:3000`):

- Frontend **ไม่ต้องเปลี่ยน URL** — ยังเรียก `fetch('/api/guides/me')`, `fetch('/api/guides/register', ...)` ตามเดิม (same-origin)
- ที่ Next.js ตั้งค่า **API_BASE_URL** (เช่น `http://localhost:4000`) ใน `.env`
- Next.js จะอ่าน NextAuth JWT จาก cookie แล้ว **proxy** ไปยัง Server ใหม่ พร้อม header `Authorization: Bearer <token>`
- ดังนั้น Frontend ไม่ต้องส่ง Bearer เอง; ส่งแค่ cookie session (credentials: 'include') เหมือนเดิม
