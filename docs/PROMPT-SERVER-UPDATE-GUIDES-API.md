# Prompt: ให้ฝั่ง Server อัปเดต API ลงทะเบียนไกด์ (Guides)

ส่งเอกสารนี้ให้ **ทีม Server** เพื่ออัปเดต/ implement API ให้สอดคล้องกับ Frontend ที่เชื่อมข้อมูลจริงแล้ว

---

## 1. สถานะฝั่ง Frontend

- **หน้า /register-guide** ใช้ **Google Sign-In จริง** (NextAuth + Google Provider) และเรียก **API จริง** แล้ว
- Frontend ส่ง request ไปที่ **same-origin** (เช่น `https://your-domain.com/api/guides/me`) พร้อม **cookie session**
- **ห้ามรับ UID จาก body หรือ query** — ฝั่ง Server ต้องดึง **UID จาก session** (ที่ NextAuth ตรวจจาก cookie) เท่านั้น ใช้ UID นี้เป็น **หัวข้อหลัก (primary key)** ในการค้นหา/สร้าง/อัปเดต user หรือ guide

---

## 2. สิ่งที่ Server ต้องรองรับ (อัปเดตให้ตรงกับ Frontend)

### 2.1 Auth และการระบุตัวตน

- Request ที่ไป `GET /api/guides/me`, `POST /api/guides/register`, `PATCH /api/guides/me` จะมี **cookie session** (NextAuth) มาด้วย
- Server ต้อง:
  1. อ่าน session จาก cookie (ใช้ NextAuth `getServerSession(authOptions)` หรือ decode JWT ตามที่ deploy ร่วมกัน)
  2. ดึง **UID** จาก session — ค่านี้คือ **Google `sub`** (ตัวระบุผู้ใช้จาก Google) ใช้เป็น **ตัวระบุหลักของ user** ในระบบ
  3. ไม่รับ `userId` / `uid` จาก request body หรือ query string (เสี่ยงปลอม)

- ถ้าไม่มี session หรือ session หมดอายุ: ตอบ **401** พร้อม body เช่น  
  `{ "error": "กรุณาล็อกอินก่อนลงทะเบียนไกด์" }`

### 2.2 GET /api/guides/me

- **Method:** GET  
- **Auth:** ต้องมี session (ส่ง cookie)
- **Response 200 — ยังไม่ลงทะเบียนไกด์:**  
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
- **Response 200 — ลงทะเบียนแล้ว:**  
  object โปรไฟล์ไกด์ (ตาม GuideResponse ด้านล่าง) + `"registered": true` + `"status": "pending" | "approved"` และฟิลด์เพิ่มเช่น `phone`, `idCardImageUrl`, `bankBookImageUrl` ตามที่เก็บใน DB (เลขบัญชีอาจปิดบังหรือไม่ส่งก็ได้)
- **Response 401:** ไม่มี session

### 2.3 POST /api/guides/register

- **Method:** POST  
- **Auth:** ต้องมี session — ใช้ **UID จาก session** เป็นเจ้าของ guide
- **Content-Type:** application/json  
- **Body (JSON):**
  - **บังคับ:** `locationSlug` — หนึ่งใน: `bangkok`, `chiang-mai`, `phuket`, `krabi`, `pattaya`, `samut-songkhram`
  - **ไม่บังคับ:**  
    `name`, `phone`, `guideType` (`"general"` | `"local"`),  
    `nationalId`, `idCardImageUrl`, `bankName`, `accountNumber`, `accountHolder`, `bankBookImageUrl`
- **ชื่อ (name):** ถ้า client ไม่ส่ง หรือส่งค่าว่าง Server ใช้ **ชื่อจาก session (Google)** แทนได้
- **Validation ที่ Frontend คาดไว้:**
  - ไม่มีหรือไม่ใช่ `locationSlug` ที่อนุญาต → 400: `"กรุณาเลือกจังหวัดที่ให้บริการ"`
  - ไม่มีชื่อ (และไม่มีจาก Google) → 400: `"ไม่พบชื่อจากบัญชี Google กรุณากรอกชื่อที่แสดงต่อนักท่องเที่ยว"`
  - เลขบัตรไม่ใช่ 13 หลัก (ถ้าส่งมา) → 400: `"เลขบัตรประชาชนต้อง 13 หลัก"`
  - บัญชีนี้ลงทะเบียนเป็นไกด์แล้ว (มี guide สำหรับ UID นี้แล้ว) → 400: `"บัญชีนี้ลงทะเบียนเป็นไกด์แล้ว"`
- **Response 201:**  
  object โปรไฟล์ไกด์ (GuideResponse) + `"status": "pending"` + `"message": "ลงทะเบียนเรียบร้อย รอการตรวจสอบจากทีมงาน"` (หรือข้อความในทำนองนี้)
- **Response 401:** ไม่มี session

### 2.4 โปรไฟล์ไกด์ (GuideResponse) — รูปแบบที่ Frontend ใช้

ทุก endpoint ที่คืน "โปรไฟล์ไกด์" ควรมี shape อย่างน้อยแบบนี้:

```ts
{
  id: string;              // ใช้ UID จาก Google เป็น id ของ guide ได้
  name: string;
  guideType: "general" | "local";
  location: string;        // ชื่อจังหวัดภาษาไทย
  locationSlug: string;    // bangkok | chiang-mai | ...
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

ฟิลด์เพิ่มสำหรับ GET /api/guides/me (เมื่อลงทะเบียนแล้ว): `status`, `phone`, `idCardImageUrl`, `bankBookImageUrl` ฯลฯ ตามที่ Server เก็บ

### 2.5 PATCH /api/guides/me (ถ้ามี)

- ใช้ UID จาก session หา guide แล้วอัปเดตฟิลด์ที่ส่งมา
- Response 200: โปรไฟล์ไกด์หลังอัปเดต
- 404: ยังไม่มีโปรไฟล์ไกด์สำหรับ UID นี้

---

## 3. ฐานข้อมูล (แนะนำสำหรับ Server)

- มีตารางเก็บ **guide** (หรือ user ที่เป็นไกด์) โดยมีคอลัมน์ **ตัวระบุ user จาก Google** (เช่น `google_id` / `userId`) ใช้ค่า **UID จาก session** เป็นหัวข้อหลัก
- หนึ่ง UID ต่อหนึ่ง guide (หนึ่งบัญชี Google ลงทะเบียนไกด์ได้ครั้งเดียว)
- ฟิลด์ที่เก็บอย่างน้อย: ตาม GuideResponse + phone, nationalId, idCardImageUrl, bankName, accountNumber, accountHolder, bankBookImageUrl, status, createdAt ฯลฯ

---

## 4. สรุปให้ทีม Server

1. **Frontend พร้อมแล้ว** — หน้า /register-guide ลงชื่อด้วย Google จริง และเรียก GET /api/guides/me กับ POST /api/guides/register จริง
2. **Auth:** ใช้ **session จาก cookie** เท่านั้น ดึง **UID (Google sub)** จาก session เป็นตัวระบุ user — ไม่รับ UID จาก body/query
3. **อัปเดต/ implement:** GET /api/guides/me, POST /api/guides/register (และ PATCH /api/guides/me ถ้าต้องการ) ให้ request/response ตรงกับด้านบน
4. **Response error:** ใช้รูปแบบ `{ "error": "ข้อความภาษาไทย" }` และ status code ตามที่ระบุ (401, 400, 404)

ถ้า Server แยก domain กับ Frontend ต้องตั้ง **CORS** และอนุญาต **credentials** (cookie) มาที่ API ด้วย

---

**อ้างอิงเพิ่ม:**  
- [FRONTEND-API-GUIDE.md](FRONTEND-API-GUIDE.md) — รายละเอียด path, body, response สำหรับ Frontend  
- [PROMPT-SERVER-API-GUIDES.md](PROMPT-SERVER-API-GUIDES.md) — สเปกเดิมสำหรับสร้าง API ไกด์ (Phase 1)
