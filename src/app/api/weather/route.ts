import { NextRequest, NextResponse } from "next/server";

// GET /api/weather?lat=...&lon=...
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = searchParams.get("lat") || "22.3193"; // Default: Hong Kong
  const lon = searchParams.get("lon") || "114.1694";

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
