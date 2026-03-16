# รายละเอียดที่หน้า Activity (/activity/[id]) แสดง — สิ่งที่ไกด์ต้องลง/เกี่ยวข้อง

อ้างอิงจาก **http://localhost:3000/activity/2** และโค้ด `src/app/activity/[id]/page.tsx` + `src/data/activities.ts`

---

## 1. ข้อมูลพื้นฐานทริป (จาก ActivityItem — ไกด์ลงได้ในฟอร์มสร้างทริป)

| ฟิลด์ | ที่แสดงบนหน้า | คำอธิบายสำหรับไกด์ |
|--------|----------------|---------------------|
| **title** | หัวข้อหลักของหน้า (H1) | ชื่อทริปภาษาไทย |
| **titleEn** | แสดงเมื่อเลือกภาษา EN | ชื่อทริปภาษาอังกฤษ |
| **image** | รูปหลัก + รูปเล็กด้านข้าง | URL รูปปกทริป |
| **imageAlt** | alt ของรูป | คำอธิบายรูป (accessibility) |
| **slug** | Breadcrumb "สำรวจ [จังหวัด]" + ลิงก์ destination | ปลายทาง/จังหวัด (bangkok, chiang-mai, …) |
| **duration** | ใน "เกี่ยวกับกิจกรรมนี้" + ตัวเลือกทัวร์ + กำหนดการ | ระยะเวลา เช่น "6 ชั่วโมง" |
| **durationEn** | แสดงเมื่อ locale EN | เช่น "6 hours" |
| **priceFrom** | ราคาในแถบด้านขวา "จาก X THB" (และใช้คำนวณเมื่อไม่มี options) | ราคาเริ่มต้นต่อคน (บาท) |
| **priceOriginal** | (ถ้ามี ใช้แสดงขีดฆ่า — ปัจจุบันหน้า detail ไม่ได้แสดงชัดในโค้ดที่อ่าน) | ราคาเดิมก่อนลด ถ้ามี |
| **category** / **categoryKey** | ไม่แสดงตรง ๆ บนหน้ารายละเอียด (ใช้ใน listing/ filter) | หมวดทริป เช่น เดย์ทริป |
| **rating** | ดาว + ตัวเลขด้านบน และบล็อกรีวิวด้านล่าง | คะแนนรวม (ระบบ/ลูกค้า) |
| **reviewCount** | "(X รีวิว)" ด้านบน และ "จาก X รีวิว" ในบล็อกรีวิว | จำนวนรีวิว |
| **features** / **featureKeys** | ไม่แสดงเป็นลิสต์บนหน้ารายละเอียด (ใช้ในการ์ดรายการ) | จุดเด่นทริป เช่น ฟรียกเลิก |
| **guideType** | แถบไกด์ "ไกด์ท้องถิ่น" / "ไกด์ทั่วไป" + ใน "เกี่ยวกับกิจกรรมนี้" | general | local |
| **guideId** | ลิงก์ไปหน้าไกด์ + รูป/ชื่อไกด์ | ไกด์ที่รับผิดชอบทริปนี้ |
| **tripCode** | แสดงใต้ชื่อทริปเป็นรหัส (เช่น BK02) | รหัสทริป |
| **badge** / **badgeKey** / **badgeRed** | แถบด้านขวา (ข้อความป้าย เช่น มีแนวโน้มขายหมด) | ป้ายพิเศษ (ถ้ามี) |
| **banner** | แท็กข้อความเหนือหัวข้อหลัก | ข้อความแบนเนอร์สั้น ๆ (ถ้ามี) |

---

## 2. ข้อมูลรายละเอียดเพิ่ม (ActivityDetail — ตอนนี้ระบบ generate ให้อัตโนมัติ ถ้าให้ไกด์ลงได้ต้องเพิ่มในฟอร์ม/API)

| ฟิลด์ | ที่แสดงบนหน้า | คำอธิบายสำหรับไกด์ |
|--------|----------------|---------------------|
| **description** | ย่อหน้าใต้ชื่อ/ไกด์ | คำอธิบายทริปสั้น ๆ (ไทย) |
| **descriptionEn** | แสดงเมื่อ locale EN | คำอธิบายทริปสั้น ๆ (อังกฤษ) |
| **about** | บล็อก "เกี่ยวกับกิจกรรมนี้" (ยกเลิกฟรี, จองแล้วจ่ายทีหลัง, ระยะเวลา, ไกด์) | ปัจจุบันระบบเติมให้ (ใช้ duration จากทริป) |
| **included** | รายการ "รวมอะไรบ้าง" ✓ | สิ่งที่รวมในทริป (ไกด์, ตั๋ว, ฟรียกเลิก ฯลฯ) |
| **notIncluded** | รายการ "ไม่รวมอะไรบ้าง" ✗ | สิ่งที่ไม่รวม (อาหารเพิ่ม, ทิป ฯลฯ) |
| **notSuitableFor** | บล็อก "ไม่เหมาะสำหรับ" | กลุ่มที่ไม่เหมาะ (เช่น ผู้ใช้รถเข็น) |
| **meetingPoint** | บล็อก "จุดนัดพบ" + ลิงก์เปิดแผนที่ | จุดนัดพบ / สถานที่เริ่มต้น |
| **importantInfo** | บล็อก "ข้อมูลสำคัญ" (หัวข้อ + รายการ) | เช่น สิ่งที่ต้องนำมา / ไม่ได้รับอนุญาต |
| **highlights** | บล็อก "ไฮไลท์" (ลิสต์ bullet) | จุดเด่นของทริปเป็นข้อ ๆ |
| **options** | บล็อก "เลือกจาก X ตัวเลือก" + การจองใช้ราคาตามตัวเลือก | ตัวเลือกทัวร์ (กลุ่มเล็ก/ส่วนตัว ฯลฯ) แต่ละตัวมี title, duration, guideLang, meeting, price, pricePerGroup |
| **itinerary** | บล็อก "กำหนดการเดินทาง" (ไทม์ไลน์ + แผนที่) | แต่ละขั้น: type, title, detail?, duration?, isMainStop? |
| **reviewSummary** | ในบล็อกรีวิว: คะแนนย่อย ไกด์ / การเดินทาง / ความคุ้มค่า | สรุปคะแนนแยกมิติ (ระบบ/ลูกค้า) |
| **reviews** | รีวิวลูกค้า (ชื่อ, ประเทศ, วันที่, ดาว, ข้อความ, รูป, จำนวนว่ามีประโยชน์) | รีวิวจากลูกค้า (มักมาจากระบบหลังจอง) |

---

## 3. สรุป: อะไรที่ไกด์ “ลง” ได้โดยตรง

- **ลงในฟอร์มสร้างทริป (มีแล้ว):**  
  title, titleEn, slug, duration (เป็นชั่วโมง → duration/durationEn), priceFrom, priceOriginal (ถ้ามี), categoryKey, featureKeys, guideType, tripCode, image, imageAlt, badgeKey, banner.  
  (guideId ระบบผูกกับไกด์ที่ล็อกอิน; rating/reviewCount ทริปใหม่มักเป็น 0 แล้วค่อยอัปเดตจากรีวิว)

- **ยังไม่ให้ไกด์ลงในฟอร์ม (แต่แสดงบนหน้า):**  
  description, descriptionEn, included, notIncluded, notSuitableFor, meetingPoint, importantInfo, highlights, options, itinerary.  
  ตอนนี้ระบบใช้ค่า default จาก `getActivityById` ทั้งหมด — ถ้าต้องการให้ไกด์แก้ได้ต้องเพิ่มฟิลด์เหล่านี้ในฟอร์มสร้าง/แก้ไขทริปและใน API

- **รีวิว (reviews / reviewSummary):**  
  โดยทั่วไปมาจากระบบหลังลูกค้าจองและให้คะแนน ไม่ใช่ฟิลด์ที่ไกด์ “ลง” เองในฟอร์มทริป

---

## 4. โครงสร้างข้อมูลอ้างอิง (สั้น ๆ)

- **ActivityItem:** id, slug, title, titleEn, image, imageAlt, rating, reviewCount, duration, durationEn, priceFrom, priceOriginal?, category, categoryKey, badge?, badgeKey?, badgeRed?, features, featureKeys?, banner?, guideType?, guideId?, tripCode?
- **ActivityDetail = ActivityItem +:** description?, descriptionEn?, about?, included?, notIncluded?, notSuitableFor?, meetingPoint?, importantInfo?, highlights?, options?, itinerary?, reviewSummary?, reviews?

ไฟล์ที่เกี่ยวข้อง:
- หน้า: `src/app/activity/[id]/page.tsx`
- ข้อมูลและ type: `src/data/activities.ts` (ActivityItem, ActivityDetail, getActivityById)
