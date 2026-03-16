import { NextResponse } from "next/server";
import { getSession, getCurrentUserId } from "@/lib/auth";
import { createGuide, getGuideByUserId } from "@/lib/guides-store";
import { getNextAuthToken, getGuideApiBaseUrl, useExternalGuideApi } from "@/lib/api-proxy";

const VALID_LOCATION_SLUGS = ["bangkok", "chiang-mai", "phuket", "krabi", "pattaya", "samut-songkhram"];

export async function POST(request: Request) {
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
      const body = await request.text();
      const res = await fetch(`${base}/api/guides/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
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

  const uid = await getCurrentUserId();
  if (!uid) {
    return NextResponse.json(
      { error: "กรุณาล็อกอินก่อนลงทะเบียนไกด์" },
      { status: 401 }
    );
  }

  if (getGuideByUserId(uid)) {
    return NextResponse.json(
      { error: "บัญชีนี้ลงทะเบียนเป็นไกด์แล้ว" },
      { status: 400 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "รูปแบบข้อมูลไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  const locationSlug = typeof body.locationSlug === "string" ? body.locationSlug.trim() : "";
  if (!locationSlug || !VALID_LOCATION_SLUGS.includes(locationSlug)) {
    return NextResponse.json(
      { error: "กรุณาเลือกจังหวัดที่ให้บริการ" },
      { status: 400 }
    );
  }

  const session = await getSession();
  const nameFromGoogle = session?.user?.name;
  const name = typeof body.name === "string" ? body.name.trim() : nameFromGoogle?.trim() ?? "";
  if (!name) {
    return NextResponse.json(
      { error: "ไม่พบชื่อจากบัญชี Google กรุณากรอกชื่อที่แสดงต่อนักท่องเที่ยว" },
      { status: 400 }
    );
  }

  const guideType = body.guideType === "local" ? "local" : "general";
  const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
  const nationalId = typeof body.nationalId === "string" ? body.nationalId.trim() : undefined;
  if (nationalId && !/^\d{13}$/.test(nationalId.replace(/\s/g, ""))) {
    return NextResponse.json(
      { error: "เลขบัตรประชาชนต้อง 13 หลัก" },
      { status: 400 }
    );
  }
  const idCardImageUrl = typeof body.idCardImageUrl === "string" ? body.idCardImageUrl : undefined;
  const bankName = typeof body.bankName === "string" ? body.bankName : undefined;
  const accountNumber = typeof body.accountNumber === "string" ? body.accountNumber : undefined;
  const accountHolder = typeof body.accountHolder === "string" ? body.accountHolder : undefined;
  const bankBookImageUrl = typeof body.bankBookImageUrl === "string" ? body.bankBookImageUrl : undefined;
  const image = typeof body.image === "string" ? body.image : session?.user?.image ?? undefined;

  try {
    const guide = createGuide(uid, {
      name,
      guideType,
      locationSlug,
      image: image ?? null,
      phone,
      nationalId,
      idCardImageUrl,
      bankName,
      accountNumber,
      accountHolder,
      bankBookImageUrl,
    });

    return NextResponse.json(
      {
        ...guide,
        status: "pending",
        message: "ลงทะเบียนเรียบร้อย รอการตรวจสอบจากทีมงาน",
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof Error && err.message === "ALREADY_REGISTERED") {
      return NextResponse.json(
        { error: "บัญชีนี้ลงทะเบียนเป็นไกด์แล้ว" },
        { status: 400 }
      );
    }
    if (err instanceof Error && err.message === "INVALID_LOCATION") {
      return NextResponse.json(
        { error: "กรุณาเลือกจังหวัดที่ให้บริการ" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
