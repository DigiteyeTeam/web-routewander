import { NextResponse } from "next/server";
import { getNextAuthToken, getGuideApiBaseUrl, useExternalGuideApi } from "@/lib/api-proxy";

export async function GET() {
  if (!useExternalGuideApi()) {
    return NextResponse.json({ error: "Local mode tourist bookings not supported" }, { status: 501 });
  }

  const token = await getNextAuthToken();
  if (!token) {
    return NextResponse.json({ error: "กรุณาล็อกอินก่อน" }, { status: 401 });
  }

  const base = getGuideApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/tourists/me/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "ไม่สามารถเชื่อมต่อ Server ได้" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  if (!useExternalGuideApi()) {
    return NextResponse.json({ error: "Local mode tourist bookings not supported" }, { status: 501 });
  }

  const token = await getNextAuthToken();
  if (!token) {
    return NextResponse.json({ error: "กรุณาล็อกอินก่อน" }, { status: 401 });
  }

  const base = getGuideApiBaseUrl();
  try {
    const body = await request.text();
    const res = await fetch(`${base}/api/tourists/me/bookings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "ไม่สามารถเชื่อมต่อ Server ได้" }, { status: 502 });
  }
}

