import { NextRequest, NextResponse } from "next/server";
import { inferDistrictFromNominatimAddress, inferProvinceLabelFromNominatimAddress } from "@/lib/inferProvinceThailand";

type NominatimItem = {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: Record<string, string>;
};

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

/**
 * ค้นหาสถานที่ในประเทศไทย (OpenStreetMap Nominatim)
 * ใช้เฉพาะช่วยเติมฟอร์ม — ไม่ต้องมีฐานข้อมูลสถานที่ของเรา
 * นโยบาย: https://operations.osmfoundation.org/policies/nominatim/
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL(NOMINATIM);
  url.searchParams.set("q", q);
  url.searchParams.set("countrycodes", "th");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "10");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "en");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          process.env.NOMINATIM_USER_AGENT ??
          "RouteWanderGuideEditor/1.0 (trip editor; contact: https://github.com/)",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ results: [], error: "search_failed" }, { status: 502 });
    }

    const data = (await res.json()) as NominatimItem[];
    const results = data.map((item) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      const displayName = item.display_name;
      const shortName =
        typeof item.name === "string" && item.name.trim().length > 0
          ? item.name.trim()
          : displayName.split(",")[0]?.trim() || displayName;

      const suggestedProvince = inferProvinceLabelFromNominatimAddress(item.address);
      const suggestedDistrict = inferDistrictFromNominatimAddress(item.address);

      return {
        name: shortName,
        displayName,
        lat: Number.isFinite(lat) ? lat : null,
        lng: Number.isFinite(lng) ? lng : null,
        suggestedProvince,
        suggestedDistrict,
      };
    });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], error: "search_failed" }, { status: 502 });
  }
}
