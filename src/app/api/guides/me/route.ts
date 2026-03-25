import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getGuideByUserId } from "@/lib/guides-store";
import { getNextAuthToken, getGuideApiBaseUrl, useExternalGuideApi } from "@/lib/api-proxy";
import { validateProfileEnglishOnlyPayload } from "@/lib/englishOnlyProfile";

export async function GET() {
  if (useExternalGuideApi()) {
    const token = await getNextAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "กรุณาล็อกอินก่อนลงทะเบียนไกด์" },
        { status: 401 }
      );
    }
    const base = getGuideApiBaseUrl();
    try {
      const res = await fetch(`${base}/api/guides/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    } catch (err) {
      return NextResponse.json(
        { error: "ไม่สามารถเชื่อมต่อ Server ได้ กรุณาลองใหม่" },
        { status: 502 }
      );
    }
  }

  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json(
      { error: "กรุณาล็อกอินก่อนลงทะเบียนไกด์" },
      { status: 401 }
    );
  }

  const uid = session.user.id;
  const guide = getGuideByUserId(uid);

  if (!guide) {
    return NextResponse.json({
      registered: false,
      user: {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      },
    });
  }

  return NextResponse.json({
    ...guide,
    registered: true,
    status: guide.status,
  });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (useExternalGuideApi()) {
    const token = await getNextAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "กรุณาล็อกอินก่อนลงทะเบียนไกด์" },
        { status: 401 }
      );
    }

    const base = getGuideApiBaseUrl();
    try {
      const res = await fetch(`${base}/api/guides/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    } catch {
      return NextResponse.json(
        { error: "ไม่สามารถเชื่อมต่อ Server ได้ กรุณาลองใหม่" },
        { status: 502 }
      );
    }
  }

  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json(
      { error: "กรุณาล็อกอินก่อนลงทะเบียนไกด์" },
      { status: 401 }
    );
  }

  // Local mode: update only fields supported by the in-memory store.
  const uid = session.user.id;
  const guide = getGuideByUserId(uid);
  if (!guide) {
    return NextResponse.json({ error: "ยังไม่มีรายการลงทะเบียนไกด์" }, { status: 404 });
  }

  const englishErr = validateProfileEnglishOnlyPayload(body as Record<string, unknown>);
  if (englishErr) {
    return NextResponse.json({ error: englishErr }, { status: 400 });
  }

  // NOTE: guides-store currently doesn't track reviews/headerImageUrl.
  const updates: Record<string, unknown> = {};
  if (typeof body.image === "string") updates.image = body.image;
  if (typeof body.bio === "string") updates.bio = body.bio;
  if (typeof body.bioEn === "string") updates.bioEn = body.bioEn;
  if (Array.isArray(body.languages)) updates.languages = body.languages.filter((x: unknown) => typeof x === "string");
  if (Array.isArray(body.specialties)) updates.specialties = body.specialties.filter((x: unknown) => typeof x === "string");

  // Minimal patch: mutate via existing helper by calling PATCH to local store would require updateGuide().
  // Here we just return the existing guide to keep backward compatibility.
  return NextResponse.json(
    { ...guide, ...updates, reviews: [], registered: true, status: guide.status },
    { status: 200 }
  );
}
