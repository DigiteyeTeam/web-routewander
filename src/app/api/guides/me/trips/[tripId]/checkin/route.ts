import { NextResponse } from "next/server";
import { getNextAuthToken, getGuideApiBaseUrl, useExternalGuideApi } from "@/lib/api-proxy";

export async function GET(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;

  if (!useExternalGuideApi()) {
    return NextResponse.json({ error: "Local mode check-in not implemented" }, { status: 501 });
  }

  const token = await getNextAuthToken();
  if (!token) {
    return NextResponse.json({ error: "กรุณาล็อกอินก่อน" }, { status: 401 });
  }

  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const base = getGuideApiBaseUrl();
  const target = `${base}/api/guides/me/trips/${encodeURIComponent(tripId)}/checkin${
    date ? `?date=${encodeURIComponent(date)}` : ""
  }`;

  try {
    const res = await fetch(target, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "ไม่สามารถเชื่อมต่อ Server ได้" }, { status: 502 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const body = await request.json().catch(() => ({}));

  if (!useExternalGuideApi()) {
    return NextResponse.json({ error: "Local mode check-in not implemented" }, { status: 501 });
  }

  const token = await getNextAuthToken();
  if (!token) {
    return NextResponse.json({ error: "กรุณาล็อกอินก่อน" }, { status: 401 });
  }

  const base = getGuideApiBaseUrl();
  const queryDate = typeof body?.date === "string" ? body.date.trim() : "";
  const target = `${base}/api/guides/me/trips/${encodeURIComponent(tripId)}/checkin${
    queryDate ? `?date=${encodeURIComponent(queryDate)}` : ""
  }`;

  try {
    const res = await fetch(target, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "ไม่สามารถเชื่อมต่อ Server ได้" }, { status: 502 });
  }
}

