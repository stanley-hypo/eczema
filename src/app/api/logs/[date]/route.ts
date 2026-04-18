import { db } from "@/db";
import { dailyLogs, affectedAreas, medications, foodEntries, triggers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/logs/[date] — get full log for a date
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  const log = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.logDate, date));

  if (log.length === 0) {
    return NextResponse.json(null);
  }

  const logId = log[0].id;
  const areas = await db
    .select()
    .from(affectedAreas)
    .where(eq(affectedAreas.logId, logId));
  const meds = await db
    .select()
    .from(medications)
    .where(eq(medications.logId, logId));
  const foods = await db
    .select()
    .from(foodEntries)
    .where(eq(foodEntries.logId, logId));
  const triggerList = await db
    .select()
    .from(triggers)
    .where(eq(triggers.logId, logId));

  return NextResponse.json({
    ...log[0],
    areas,
    medications: meds,
    foods,
    triggers: triggerList,
  });
}

// DELETE /api/logs/[date]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  const log = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.logDate, date));

  if (log.length > 0) {
    await db.delete(dailyLogs).where(eq(dailyLogs.id, log[0].id));
  }

  return NextResponse.json({ success: true });
}
