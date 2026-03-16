import { cookies } from "next/headers";

const API_BASE_URL = process.env.API_BASE_URL ?? "";
const NEXTAUTH_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

/**
 * ดึง NextAuth JWT จาก cookie — ใช้ส่งเป็น Bearer token ไปยัง API Server ภายนอก
 * คืน null ถ้าไม่มี session
 */
export async function getNextAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NEXTAUTH_COOKIE_NAME)?.value ?? null;
  return token;
}

/** ตรวจว่าได้ตั้ง API_BASE_URL แล้ว (ใช้ Server ภายนอก) หรือยัง */
export function useExternalGuideApi(): boolean {
  return Boolean(API_BASE_URL?.trim());
}

export function getGuideApiBaseUrl(): string {
  return API_BASE_URL.replace(/\/$/, "");
}
