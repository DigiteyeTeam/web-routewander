import { NextResponse } from "next/server";
import { getGuideApiBaseUrl, useExternalGuideApi } from "@/lib/api-proxy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const encoded = encodeURIComponent(userId);

  if (!useExternalGuideApi()) {
    return NextResponse.json({ trips: [] });
  }
  const base = getGuideApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/public/guides/${encoded}/trips`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "ไม่สามารถเชื่อมต่อ Server ได้" }, { status: 502 });
  }
}
