import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getNextAuthToken, getGuideApiBaseUrl, useExternalGuideApi } from "@/lib/api-proxy";

export async function GET() {
  if (useExternalGuideApi()) {
    const token = await getNextAuthToken();
    if (!token) {
      return NextResponse.json({ error: "กรุณาล็อกอินก่อน" }, { status: 401 });
    }

    const base = getGuideApiBaseUrl();
    try {
      const res = await fetch(`${base}/api/guides/me/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    } catch {
      return NextResponse.json({ error: "ไม่สามารถเชื่อมต่อ Server ได้" }, { status: 502 });
    }
  }

  // Local mode not implemented for trips yet.
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "กรุณาล็อกอินก่อน" }, { status: 401 });
  return NextResponse.json({ trips: [] }, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (useExternalGuideApi()) {
    const token = await getNextAuthToken();
    if (!token) {
      return NextResponse.json({ error: "กรุณาล็อกอินก่อน" }, { status: 401 });
    }

    const base = getGuideApiBaseUrl();
    try {
      const res = await fetch(`${base}/api/guides/me/trips`, {
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

  return NextResponse.json({ error: "Local mode trips not implemented" }, { status: 501 });
}

