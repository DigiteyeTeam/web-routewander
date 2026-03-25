import { NextResponse } from "next/server";
import { getGuideApiBaseUrl, useExternalGuideApi } from "@/lib/api-proxy";

export async function GET() {
  if (!useExternalGuideApi()) {
    return NextResponse.json({ guides: [] });
  }
  const base = getGuideApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/public/guides`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "ไม่สามารถเชื่อมต่อ Server ได้" }, { status: 502 });
  }
}
