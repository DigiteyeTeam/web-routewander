# ลงทะเบียนไกด์ — รายละเอียดสำหรับ Frontend

เอกสารนี้สรุปรายละเอียดการลงทะเบียนไกด์ที่ Frontend ต้องรู้เพื่อเชื่อมกับ Server API

---

## ลิงก์ที่เกี่ยวข้อง

- **API สรุป path / body / response:** [FRONTEND-API-GUIDE.md](FRONTEND-API-GUIDE.md)
- **Prompt สร้าง Server API (Phase 1 ไกด์):** [PROMPT-SERVER-API-GUIDES.md](PROMPT-SERVER-API-GUIDES.md)

---

## Flow การลงทะเบียน

1. User เข้า **ลงชื่อด้วย Google** (NextAuth) ก่อน
2. หลังล็อกอิน → เรียก **GET /api/guides/me**
   - ถ้า `registered: false` → แสดงฟอร์มลงทะเบียน (3 ขั้น)
   - ถ้า `registered: true` → redirect ไป Guide Manager หรือหน้าโปรไฟล์ไกด์
3. กรอกฟอร์ม (ขั้น 1: ส่วนตัว, ขั้น 2: ยืนยันตัวตน, ขั้น 3: การรับเงิน)
4. กดส่ง → **POST /api/guides/register** พร้อม body ตามสเปกใน FRONTEND-API-GUIDE.md
5. อัปโหลดรูป (ถ้ามี): **POST /api/upload** แล้วนำ `url` ใส่ใน `idCardImageUrl` / `bankBookImageUrl` ก่อนหรือหลัง register (หรือ PATCH /api/guides/me ภายหลัง)

---

## ฟิลด์ฟอร์มที่ส่งไป API

| ฟิลด์ | บังคับ | ค่าที่ส่ง (ตัวอย่าง) |
|--------|--------|----------------------|
| locationSlug | ใช่ | `bangkok`, `chiang-mai`, `phuket`, `krabi`, `pattaya`, `samut-songkhram` |
| name | ไม่ (ใช้ชื่อจาก Google ได้) | string |
| phone | ไม่ | string |
| guideType | ไม่ | `"general"` \| `"local"` |
| nationalId | ไม่ (ขั้น 2) | 13 หลัก |
| idCardImageUrl | ไม่ | URL จาก POST /api/upload |
| bankName | ไม่ (ขั้น 3) | ดูรายการใน FRONTEND-API-GUIDE.md |
| accountNumber | ไม่ | string |
| accountHolder | ไม่ | string |
| bankBookImageUrl | ไม่ | URL จาก POST /api/upload |

---

## หน้าฟอร์มในโปรเจกต์

- ลงทะเบียนไกด์: `src/app/register-guide/` (landing) และ `src/app/register-guide/form/` (ฟอร์ม 3 ขั้น)

เมื่อต่อ API แล้ว หน้า form ต้อง:

- หลังล็อกอิน เรียก GET /api/guides/me เพื่อเช็ค registered และดึง user.name มาเติมชื่อ
- ส่ง POST /api/guides/register เมื่อกดส่งคำสมัคร (และ POST /api/upload ก่อนถ้ามีการอัปโหลดรูป)
