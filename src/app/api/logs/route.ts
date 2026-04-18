import { db } from "@/db";
import { dailyLogs, affectedAreas, medications, foodEntries, triggers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/logs — list recent logs (with nested data for autofill)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const withNested = searchParams.get("nested") === "true";
  const limit = Math.min(parseInt(searchParams.get("limit") || "90"), 365);

  const logs = await db
    .select()
    .from(dailyLogs)
    .orderBy(desc(dailyLogs.logDate))
    .limit(limit);

  if (withNested && logs.length > 0) {
    const logIds = logs.map((l) => l.id);
    const { inArray } = await import("drizzle-orm");
    const allAreas = await db.select().from(affectedAreas).where(inArray(affectedAreas.logId, logIds));
    const allMeds = await db.select().from(medications).where(inArray(medications.logId, logIds));
    const allFoods = await db.select().from(foodEntries).where(inArray(foodEntries.logId, logIds));
    const allTriggers = await db.select().from(triggers).where(inArray(triggers.logId, logIds));

    const areaMap = new Map<string, typeof allAreas>();
    const medMap = new Map<string, typeof allMeds>();
    const foodMap = new Map<string, typeof allFoods>();
    const triggerMap = new Map<string, typeof allTriggers>();

    for (const a of allAreas) {
      if (!areaMap.has(a.logId)) areaMap.set(a.logId, []);
      areaMap.get(a.logId)!.push(a);
    }
    for (const m of allMeds) {
      if (!medMap.has(m.logId)) medMap.set(m.logId, []);
      medMap.get(m.logId)!.push(m);
    }
    for (const f of allFoods) {
      if (!foodMap.has(f.logId)) foodMap.set(f.logId, []);
      foodMap.get(f.logId)!.push(f);
    }
    for (const t of allTriggers) {
      if (!triggerMap.has(t.logId)) triggerMap.set(t.logId, []);
      triggerMap.get(t.logId)!.push(t);
    }

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

// POST /api/logs — upsert a daily log with nested data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    // Check if log exists for this date
    const existing = await db
      .select()
      .from(dailyLogs)
      .where(eq(dailyLogs.logDate, logDate));

    let logId: string;

    if (existing.length > 0) {
      // Update
      logId = existing[0].id;
      await db
        .update(dailyLogs)
        .set({
          overallSeverity: overallSeverity ?? null,
          itchLevel: itchLevel ?? null,
          sleepQuality: sleepQuality ?? null,
          stressLevel: stressLevel ?? null,
          mood: mood ?? null,
          notes: notes ?? null,
          weatherTemp: weatherTemp ?? null,
          weatherHumidity: weatherHumidity ?? null,
          weatherDesc: weatherDesc ?? null,
          updatedAt: new Date(),
        })
        .where(eq(dailyLogs.id, logId));

      // Delete old nested data and re-insert
      await db.delete(affectedAreas).where(eq(affectedAreas.logId, logId));
      await db.delete(medications).where(eq(medications.logId, logId));
      await db.delete(foodEntries).where(eq(foodEntries.logId, logId));
      await db.delete(triggers).where(eq(triggers.logId, logId));
    } else {
      // Insert
      const [inserted] = await db
        .insert(dailyLogs)
        .values({
          logDate,
          overallSeverity: overallSeverity ?? null,
          itchLevel: itchLevel ?? null,
          sleepQuality: sleepQuality ?? null,
          stressLevel: stressLevel ?? null,
          mood: mood ?? null,
          notes: notes ?? null,
          weatherTemp: weatherTemp ?? null,
          weatherHumidity: weatherHumidity ?? null,
          weatherDesc: weatherDesc ?? null,
        })
        .returning({ id: dailyLogs.id });
      logId = inserted.id;
    }

    // Insert nested data with proper null handling
    if (areas.length > 0) {
      await db.insert(affectedAreas).values(
        areas.map((a: Record<string, unknown>) => ({
          logId,
          bodyZone: (a.bodyZone as string) || "other",
          severity: (a.severity as number) || 5,
          oozing: (a.oozing as boolean) ?? false,
          scaling: (a.scaling as boolean) ?? false,
          redness: (a.redness as boolean) ?? false,
          swelling: (a.swelling as boolean) ?? false,
          photoUrl: (a.photoUrl as string) ?? null,
          notes: (a.notes as string) ?? null,
        }))
      );
    }
    if (meds.length > 0) {
      await db.insert(medications).values(
        meds.map((m: Record<string, unknown>) => ({
          logId,
          productName: (m.productName as string) || "未命名",
          type: (m.type as string) || "cream",
          bodyZones: (m.bodyZones as string[]) || [],
          timesApplied: (m.timesApplied as number) ?? 1,
          amount: (m.amount as string) ?? null,
          notes: (m.notes as string) ?? null,
        }))
      );
    }
    if (foods.length > 0) {
      await db.insert(foodEntries).values(
        foods
          .filter((f: Record<string, unknown>) => {
            const items = f.items as string[];
            return items && items.length > 0;
          })
          .map((f: Record<string, unknown>) => ({
            logId,
            mealType: (f.mealType as string) || "snack",
            items: (f.items as string[]) || [],
            suspectTrigger: (f.suspectTrigger as boolean) ?? false,
            photoUrl: (f.photoUrl as string) ?? null,
            notes: (f.notes as string) ?? null,
          }))
      );
    }
    if (triggerList.length > 0) {
      await db.insert(triggers).values(
        triggerList.map((t: Record<string, unknown>) => ({
          logId,
          triggerType: (t.triggerType as string) || "other",
          description: (t.description as string) ?? null,
          severity: (t.severity as number) ?? 3,
        }))
      );
    }

    return NextResponse.json({ success: true, logId });
  } catch (error) {
    console.error("[API /api/logs POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to save log", details: String(error) },
      { status: 500 }
    );
  }
}
