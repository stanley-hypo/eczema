import { db } from "@/db";
import { dailyLogs, affectedAreas, medications, foodEntries, triggers } from "@/db/schema";
import { eq, desc, inArray, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";

// GET /api/logs
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const withNested = searchParams.get("nested") === "true";
  const limit = Math.min(parseInt(searchParams.get("limit") || "90"), 365);

  const logs = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(desc(dailyLogs.logDate))
    .limit(limit);

  if (withNested && logs.length > 0) {
    const logIds = logs.map((l) => l.id);
    const allAreas = await db.select().from(affectedAreas).where(inArray(affectedAreas.logId, logIds));
    const allMeds = await db.select().from(medications).where(inArray(medications.logId, logIds));
    const allFoods = await db.select().from(foodEntries).where(inArray(foodEntries.logId, logIds));
    const allTriggers = await db.select().from(triggers).where(inArray(triggers.logId, logIds));

    const groupBy = <T extends { logId: string }>(items: T[]) => {
      const map = new Map<string, T[]>();
      for (const item of items) {
        if (!map.has(item.logId)) map.set(item.logId, []);
        map.get(item.logId)!.push(item);
      }
      return map;
    };

    const areaMap = groupBy(allAreas);
    const medMap = groupBy(allMeds);
    const foodMap = groupBy(allFoods);
    const triggerMap = groupBy(allTriggers);

    const result = logs.map((log) => ({
      ...log,
      areas: areaMap.get(log.id) || [],
      medications: medMap.get(log.id) || [],
      foods: foodMap.get(log.id) || [],
      triggers: triggerMap.get(log.id) || [],
    }));

    return NextResponse.json(result);
  }

  return NextResponse.json(logs);
}

// POST /api/logs
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // CSRF protection
  if (!(await verifyCsrf(req))) {
    return NextResponse.json({ error: "CSRF token missing or invalid" }, { status: 403 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    console.log("[API] POST /api/logs body:", JSON.stringify(body).slice(0, 2000));

    const {
      logDate,
      overallSeverity,
      itchLevel,
      sleepQuality,
      stressLevel,
      mood,
      notes,
      weatherTemp,
      weatherHumidity,
      weatherDesc,
      areas = [],
      meds = [],
      foods = [],
      triggerList = [],
    } = body;

    if (!logDate) {
      return NextResponse.json({ error: "logDate is required" }, { status: 400 });
    }

    const n = (v: unknown) => (v === "" || v === undefined || v === null ? null : v);
    const nInt = (v: unknown) => {
      if (v === "" || v === undefined || v === null) return null;
      const num = typeof v === "number" ? v : parseFloat(String(v));
      return isNaN(num) ? null : Math.round(num);
    };

    // Check existing for this user + date
    const existing = await db
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.logDate, logDate)));

    let logId: string;

    const logData = {
      overallSeverity: nInt(overallSeverity),
      itchLevel: nInt(itchLevel),
      sleepQuality: nInt(sleepQuality),
      stressLevel: nInt(stressLevel),
      mood: n(mood) as string | null,
      notes: n(notes) as string | null,
      weatherTemp: nInt(weatherTemp),
      weatherHumidity: nInt(weatherHumidity),
      weatherDesc: n(weatherDesc) as string | null,
    };

    if (existing.length > 0) {
      logId = existing[0].id;
      await db.update(dailyLogs).set({ ...logData, updatedAt: new Date() }).where(eq(dailyLogs.id, logId));
      await db.delete(affectedAreas).where(eq(affectedAreas.logId, logId));
      await db.delete(medications).where(eq(medications.logId, logId));
      await db.delete(foodEntries).where(eq(foodEntries.logId, logId));
      await db.delete(triggers).where(eq(triggers.logId, logId));
    } else {
      const [inserted] = await db.insert(dailyLogs).values({ userId, logDate, ...logData }).returning({ id: dailyLogs.id });
      logId = inserted.id;
    }

    for (const a of (areas as Record<string, unknown>[])) {
      const symptoms = (a.symptoms as string[]) || [];
      await db.insert(affectedAreas).values({
        logId,
        bodyZone: (a.bodyZone as string) || "other",
        subLocations: (a.subLocations as string[]) || [],
        severity: nInt(a.severity) ?? 5,
        symptoms,
        oozing: symptoms.includes("oozing"),
        scaling: symptoms.includes("scaling"),
        redness: symptoms.includes("redness"),
        swelling: symptoms.includes("swelling"),
        photoUrl: n(a.photoUrl) as string | null,
        notes: n(a.notes) as string | null,
      });
    }

    for (const m of (meds as Record<string, unknown>[])) {
      await db.insert(medications).values({
        logId,
        productName: (m.productName as string) || "未命名",
        type: (m.type as string) || "cream",
        bodyZones: (m.bodyZones as string[]) || [],
        timesApplied: nInt(m.timesApplied) ?? 1,
        amount: n(m.amount) as string | null,
        notes: n(m.notes) as string | null,
      });
    }

    for (const f of (foods as Record<string, unknown>[])) {
      const items = (f.items as string[]) || [];
      if (items.length === 0) continue;
      await db.insert(foodEntries).values({
        logId,
        mealType: (f.mealType as string) || "snack",
        items,
        suspectTrigger: (f.suspectTrigger as boolean) ?? false,
        photoUrl: n(f.photoUrl) as string | null,
        notes: n(f.notes) as string | null,
      });
    }

    for (const t of (triggerList as Record<string, unknown>[])) {
      await db.insert(triggers).values({
        logId,
        triggerType: (t.triggerType as string) || "other",
        description: n(t.description) as string | null,
        severity: nInt(t.severity) ?? 3,
      });
    }

    console.log("[API] Save success, logId:", logId);
    return NextResponse.json({ success: true, logId });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : "";
    console.error("[API] POST /api/logs ERROR:", errMsg, errStack);
    return NextResponse.json({ error: "Failed to save log", details: errMsg, stack: errStack }, { status: 500 });
  }
}
