import { db } from "@/db";
import { dailyLogs, affectedAreas, medications, foodEntries, triggers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/logs — list recent logs
export async function GET() {
  const logs = await db
    .select()
    .from(dailyLogs)
    .orderBy(dailyLogs.logDate)
    .limit(90);

  return NextResponse.json(logs);
}

// POST /api/logs — upsert a daily log with nested data
export async function POST(req: NextRequest) {
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
        overallSeverity,
        itchLevel,
        sleepQuality,
        stressLevel,
        mood,
        notes,
        weatherTemp,
        weatherHumidity,
        weatherDesc,
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
        overallSeverity,
        itchLevel,
        sleepQuality,
        stressLevel,
        mood,
        notes,
        weatherTemp,
        weatherHumidity,
        weatherDesc,
      })
      .returning({ id: dailyLogs.id });
    logId = inserted.id;
  }

  // Insert nested data
  if (areas.length > 0) {
    await db.insert(affectedAreas).values(
      areas.map((a: Record<string, unknown>) => ({ ...a, logId }))
    );
  }
  if (meds.length > 0) {
    await db.insert(medications).values(
      meds.map((m: Record<string, unknown>) => ({ ...m, logId }))
    );
  }
  if (foods.length > 0) {
    await db.insert(foodEntries).values(
      foods.map((f: Record<string, unknown>) => ({ ...f, logId }))
    );
  }
  if (triggerList.length > 0) {
    await db.insert(triggers).values(
      triggerList.map((t: Record<string, unknown>) => ({ ...t, logId }))
    );
  }

  return NextResponse.json({ success: true, logId });
}
