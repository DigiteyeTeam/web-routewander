import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/**
 * ดึง session ของ user ปัจจุบัน (จาก cookie ที่ส่งมา)
 * ใช้ใน API routes — ไม่ต้องรับ UID จาก body/header (ไม่ปลอดภัย)
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * ดึง UID (Google sub) ของ user ที่ล็อกอินแล้ว
 * ใช้เป็นหัวข้อหลัก (primary key) ในการค้นหา/สร้าง/อัปเดต user หรือ guide ใน DB
 * คืน null ถ้ายังไม่ล็อกอิน
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}
