import { NextResponse } from "next/server";
import { getGuideApiBaseUrl, useExternalGuideApi } from "@/lib/api-proxy";

export async function POST(request: Request) {
  // Guest flow does not require auth, but we still reuse the same base URL logic.
  if (!useExternalGuideApi()) {
    return NextResponse.json({ error: "Local mode guest bookings not supported" }, { status: 501 });
  }

  const base = getGuideApiBaseUrl();
  try {
    const body = await request.text();
    // No Authorization header for guest checkout.
    const res = await fetch(`${base}/api/guests/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "ไม่สามารถเชื่อมต่อ Server ได้" }, { status: 502 });
  }
}

