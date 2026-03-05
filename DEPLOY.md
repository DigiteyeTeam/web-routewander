# Deploy Route Wander

## วิธีที่ 1: Vercel (แนะนำ)

1. ไปที่ [vercel.com](https://vercel.com) แล้วลงชื่อเข้าใช้ (ใช้ GitHub ได้)
2. คลิก **Add New** → **Project**
3. เลือก repo **DigiteyeTeam/web-routewander** จาก GitHub
4. Vercel จะ detect เป็น Next.js อัตโนมัติ — ไม่ต้องเปลี่ยน settings
5. คลิก **Deploy**
6. รอสักครู่ จะได้ URL เช่น `web-routewander.vercel.app`

ทุกครั้งที่ push ขึ้น `main` บน GitHub จะ deploy ใหม่อัตโนมัติ (Preview สำหรับ branch อื่น)

---

## วิธีที่ 2: Build และรันเอง (VPS / Server)

```bash
npm install
npm run build
npm start
```

ตัวแปรสภาพแวดล้อม (ถ้ามี): ใส่ใน `.env` หรือ `.env.production`

---

## วิธีที่ 3: Netlify

1. ไปที่ [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. เชื่อม GitHub แล้วเลือก repo **web-routewander**
3. Build command: `npm run build`
4. Publish directory: `.next` (หรือใช้ Next.js runtime ของ Netlify)
