import { NextResponse } from "next/server";
import { getNextAuthToken, getGuideApiBaseUrl, useExternalGuideApi } from "@/lib/api-proxy";

export async function POST(request: Request) {
  // ออกแบบให้ proxy ไปยัง server ภายนอก (s-rwn2) เมื่อมี API_BASE_URL
  if (!useExternalGuideApi()) {
    return NextResponse.json(
      { error: "API_BASE_URL ยังไม่ได้ตั้งค่า" },
      { status: 503 }
    );
  }

  const token = await getNextAuthToken();
  if (!token) {
    return NextResponse.json({ error: "กรุณาล็อกอินก่อนอัปโหลดรูป" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const incomingFiles = formData.getAll("files");
  if (!incomingFiles || incomingFiles.length === 0) {
    return NextResponse.json({ error: "กรุณาอัปโหลดไฟล์รูปทริป" }, { status: 400 });
  }

  // Forward multipart to external server.
  const out = new FormData();
  incomingFiles.forEach((f: unknown, idx) => {
    const file: any = f;
    if (!file) return;
    const name = typeof file.name === "string" && file.name ? file.name : `trip-image-${idx}`;
    out.append("files", file, name);
  });

  const base = getGuideApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/trips/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: out,
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "ไม่สามารถเชื่อมต่อ Server ได้" }, { status: 502 });
  }
}

