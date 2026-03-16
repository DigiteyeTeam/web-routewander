# Server APIs สร้างแล้ว — สำหรับ Frontend ใช้ต่อและตรวจว่าถูกต้อง

เอกสารนี้บอกฝั่ง **Frontend** ว่า Server API ถูกสร้างไว้แล้ว และสรุป path, body, response พร้อมวิธีตรวจว่าเชื่อมต่อถูกต้องหรือไม่

---

## 1. สถานะ Server API

- **สร้างแล้ว:** ใช้ Next.js (App Router) เป็น backend
- **ฐานข้อมูล:** PostgreSQL (รองรับ AWS RDS), ORM: Prisma
- **Auth:** NextAuth + Google Provider (session เก็บใน DB)
- **อัปโหลดรูป:** AWS S3 (บัตรประชาชน, สมุดบัญชี)

Frontend ต้องเรียก API ผ่าน **same-origin** (โฮสต์เดียวกับเว็บ) หรือ CORS อนุญาตแล้ว จึงจะส่ง cookie session ได้

---

## 2. รายการ Endpoint (ตรวจว่าถูกต้องไหม)

| Method | Path | ต้องล็อกอิน? | คำอธิบายสั้น |
|--------|------|----------------|------------------|
| GET | `/api/guides` | ไม่ | รายการไกด์ (query: `type`, `location`) |
| GET | `/api/guides/[id]` | ไม่ | ไกด์คนเดียว |
| GET | `/api/guides/me` | ใช่ | โปรไฟล์ไกด์ของ user ปัจจุบัน หรือ `registered: false` + ข้อมูล user จาก Google |
| POST | `/api/guides/register` | ใช่ | ลงทะเบียนไกด์ (ขั้นแรกต้องล็อกอิน Google ก่อน) |
| PATCH | `/api/guides/me` | ใช่ | แก้ไขโปรไฟล์ไกด์ |
| POST | `/api/upload` | ใช่ | อัปโหลดรูป (บัตร/สมุดบัญชี) ได้ URL กลับมา |
| GET / POST | `/api/auth/[...nextauth]` | - | NextAuth (ล็อกอิน Google) |

**Base URL:** ถ้า Frontend กับ API อยู่ที่เดียวกัน (เช่น `https://your-app.vercel.app`) ใช้ path ข้างบนตรงๆ เช่น `fetch('/api/guides')`  
ถ้าแยก domain ใช้ full URL ของ API และต้องตั้ง CORS + credentials

---

## 3. Auth — ตรวจว่าถูกต้องไหม

- **ล็อกอิน:** ใช้ NextAuth ล็อกอินด้วย Google ที่ path `/api/auth/signin` (หรือตามที่ NextAuth ตั้งไว้)
- **API ที่ต้องล็อกอิน:** ต้องส่ง **cookie session** ไปกับ request (เช่น `fetch(url, { credentials: 'include' })`)
- **ถ้าไม่ล็อกอินแล้วเรียก POST /api/guides/register หรือ GET/PATCH /api/guides/me:** ได้ **401** พร้อม `{ "error": "กรุณาล็อกอินก่อนลงทะเบียนไกด์" }` (หรือข้อความในทำนองนี้)

Frontend ตรวจได้ว่า: หลังล็อกอินแล้วเรียก `GET /api/guides/me` ต้องได้ 200 (ไม่ใช่ 401)

---

## 4. รูปแบบ Request / Response ที่ Frontend ควรใช้ตรวจ

### GET /api/guides

- **Query (optional):** `?type=general|local` , `?location=bangkok` (หรือ locationSlug อื่น)
- **Response 200:** array ของ object ตาม type ด้านล่าง (GuideResponse)

### GET /api/guides/[id]

- **Response 200:** object เดียว (GuideResponse)
- **Response 404:** `{ "error": "Guide not found" }`

### GET /api/guides/me

- **Response 200 — ยังไม่ลงทะเบียนไกด์:**  
  `{ "registered": false, "user": { "id", "name", "email", "image" } }`  
  ใช้ `user` แสดง/เติมชื่อในฟอร์มลงทะเบียนได้
- **Response 200 — ลงทะเบียนแล้ว:**  
  object โปรไฟล์ไกด์ + `registered: true` + `status` + ฟิลด์เพิ่มเช่น `phone`, `idCardImageUrl`, `bankBookImageUrl` (บางฟิลด์อาจปิดบังเช่นเลขบัญชี)
- **Response 401:** ยังไม่ล็อกอิน

### POST /api/guides/register

- **Body (JSON):**  
  - บังคับ: `locationSlug` (หนึ่งใน: `bangkok`, `chiang-mai`, `phuket`, `krabi`, `pattaya`, `samut-songkhram`)  
  - ไม่บังคับ: `name` (ไม่ส่งได้ ระบบใช้ชื่อจาก Google), `phone`, `guideType` (`"general"` | `"local"`), ขั้นที่ 2–3 เช่น `nationalId`, `idCardImageUrl`, `bankName`, `accountNumber`, `accountHolder`, `bankBookImageUrl`
- **Response 201:** object โปรไฟล์ไกด์ (GuideResponse) + `status: "pending"` + `message` (ภาษาไทย)
- **Response 400:** validation หรือซ้ำ เช่น `{ "error": "บัญชีนี้ลงทะเบียนเป็นไกด์แล้ว ..." }` หรือ `{ "error": "กรุณาเลือกจังหวัดที่ให้บริการ" }`
- **Response 401:** ยังไม่ล็อกอิน

### PATCH /api/guides/me

- **Body (JSON):** ฟิลด์ที่ต้องการแก้ เช่น `name`, `phone`, `locationSlug`, `guideType`, `bio`, `bioEn`, `experience`, `languages[]`, `specialties[]`, `nationalId`, `idCardImageUrl`, `bankName`, `accountNumber`, `accountHolder`, `bankBookImageUrl`
- **Response 200:** object โปรไฟล์ไกด์หลังอัปเดต (GuideResponse)
- **Response 404:** ยังไม่ลงทะเบียนไกด์

### POST /api/upload

- **Body:** `multipart/form-data`  
  - `file`: ไฟล์รูป (JPEG/PNG/WebP, สูงสุด 5MB)  
  - `kind`: string เช่น `id_card`, `bank_book`
- **Response 200:** `{ "url": "...", "key": "..." }` — ใช้ `url` ใส่ใน `idCardImageUrl` หรือ `bankBookImageUrl` ตอน register / PATCH
- **Response 400/503:** ไม่มีไฟล์, ไฟล์ใหญ่เกิน, ประเภทไม่รองรับ, หรือ S3 ยังไม่ตั้งค่า

---

## 5. Type โปรไฟล์ไกด์ (GuideResponse) — ใช้ตรวจ response ถูกต้องไหม

ทุก endpoint ที่คืน "โปรไฟล์ไกด์" ใช้ shape นี้ (อาจมีฟิลด์เพิ่มใน GET /api/guides/me):

```ts
{
  id: string;
  name: string;
  guideType: "general" | "local";
  location: string;        // เหมือน locationSlug
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

Frontend ตรวจได้ว่า: response จาก GET /api/guides, GET /api/guides/[id], POST /api/guides/register, PATCH /api/guides/me มีฟิลด์เหล่านี้และ type ตรงกับที่ใช้ในโค้ด

---

## 6. รายการธนาคาร (bankName)

ค่าที่ส่งได้ใน `bankName` (ตอน register / PATCH):  
`"กรุงเทพ"`, `"กสิกรไทย"`, `"กรุงไทย"`, `"ไทยพาณิชย์"`, `"กรุงศรีอยุธยา"`, `"ทหารไทยธนชาต"`, `"ยูโอบี"`, `"ซีไอเอ็มบี ไทย"`, `"ฮ่องกงและเซี่ยงไฮ้"`, `"ออมสิน"`, `"อิสลามแห่งประเทศไทย"`, `"อื่นๆ"`

Frontend ตรวจได้ว่า: dropdown/select ธนาคารใช้ค่าข้างบนเท่านั้น

---

## 7. Flow ลงทะเบียนไกด์ (ตรวจว่าถูกต้องไหม)

1. **ล็อกอิน Google ก่อน** (NextAuth)
2. **GET /api/guides/me**  
   - ได้ `registered: false` และ `user: { id, name, email, image }` → แสดงฟอร์มลงทะเบียน และใช้ `user.name` เติมชื่อได้
3. **POST /api/guides/register**  
   - ส่งอย่างน้อย `locationSlug` (และถ้าต้องการ `name`, `phone`, `guideType`, ขั้น 2–3)  
   - ได้ 201 + โปรไฟล์ไกด์ + `status: "pending"`
4. (ถ้าต้องการ) **POST /api/upload** ส่ง `file` + `kind` → ได้ `url` แล้ว **PATCH /api/guides/me** ใส่ `idCardImageUrl` / `bankBookImageUrl`

Frontend ตรวจได้ว่า: ลำดับการเรียกและรูปแบบ body/response ตรงกับด้านบน

---

## 8. ข้อความ Error ที่อาจได้ (ตัวอย่าง)

- **401:** `"กรุณาล็อกอินก่อนลงทะเบียนไกด์"`
- **400:** `"บัญชีนี้ลงทะเบียนเป็นไกด์แล้ว ..."` , `"กรุณาเลือกจังหวัดที่ให้บริการ"` , `"ไม่พบชื่อจากบัญชี Google กรุณากรอกชื่อที่แสดงต่อนักท่องเที่ยว"` , `"เลขบัตรประชาชนต้อง 13 หลัก ..."`
- **404:** `"Guide not found"` , (PATCH /api/guides/me) `"Not registered as guide"`
- **500:** `"เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่"` หรือข้อความในทำนองนี้

Response error ส่วนใหญ่เป็น `{ "error": "ข้อความ" }` บางจุดมี `details` (validation)

---

## 9. Checklist สำหรับ Frontend — ดูว่าถูกต้องไหม

- [ ] ล็อกอิน Google ได้ และเรียก GET /api/guides/me ได้ 200 (ไม่ใช่ 401)
- [ ] ตอนยังไม่สมัคร ได้ `registered: false` และ `user` มี `id`, `name`, `email`, `image`
- [ ] ลงทะเบียนด้วย POST /api/guides/register ส่ง `locationSlug` (และถ้าต้องการ name, guideType) ได้ 201 และได้ object โปรไฟล์ไกด์ + `status: "pending"`
- [ ] หลังสมัครแล้ว GET /api/guides/me ได้ `registered: true` และข้อมูลไกด์
- [ ] แก้ไขโปรไฟล์ด้วย PATCH /api/guides/me ได้ 200 และได้โปรไฟล์หลังอัปเดต
- [ ] GET /api/guides ได้ array ไกด์ (มี query type/location ได้)
- [ ] GET /api/guides/[id] ได้ไกด์คนเดียว หรือ 404
- [ ] อัปโหลดรูป POST /api/upload (file + kind) ได้ `url` และนำไปใส่ใน register/PATCH ได้
- [ ] ฟิลด์โปรไฟล์ไกด์ (GuideResponse) ตรงกับ type ที่ Frontend ใช้
- [ ] ค่า `locationSlug` และ `bankName` ใช้ตามรายการที่ API รองรับ

ถ้าทุกข้อตรง แปลว่าเชื่อมต่อ Server API ถูกต้อง

---

**เอกสารลงทะเบียนละเอียด:** [REGISTER-GUIDE.md](REGISTER-GUIDE.md)
