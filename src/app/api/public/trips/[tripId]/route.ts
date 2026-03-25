import { NextResponse } from "next/server";
import { getGuideApiBaseUrl, useExternalGuideApi } from "@/lib/api-proxy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const encoded = encodeURIComponent(tripId);

  if (!useExternalGuideApi()) {
    return NextResponse.json({ error: "ไม่พบทริป" }, { status: 404 });
  }
  const base = getGuideApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/public/trips/${encoded}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "ไม่สามารถเชื่อมต่อ Server ได้" }, { status: 502 });
  }
}
