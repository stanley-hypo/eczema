import { NextRequest, NextResponse } from "next/server";

// GET /api/weather?lat=...&lon=...
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const latRaw = searchParams.get("lat") || "22.3193";
  const lonRaw = searchParams.get("lon") || "114.1694";

  // Validate lat/lon are numeric to prevent SSRF
  const lat = parseFloat(latRaw);
  const lon = parseFloat(lonRaw);
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia/Hong_Kong`
    );
    const data = await res.json();
    return NextResponse.json(data.current);
  } catch {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
