import { db } from "@/db";
import { medications, foodEntries, dailyLogs } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// GET /api/suggestions?type=medication|food (user-scoped)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";

  const results: { medications: string[]; foods: string[] } = {
    medications: [],
    foods: [],
  };

  // Get user's log IDs for scoping
  const userLogs = await db.select({ id: dailyLogs.id }).from(dailyLogs).where(eq(dailyLogs.userId, userId));
  const logIds = userLogs.map((l) => l.id);
  if (logIds.length === 0) return NextResponse.json(results);

  if (type === "medication" || type === "all") {
    const { inArray } = await import("drizzle-orm");
    const medRows = await db
      .select({
        productName: medications.productName,
        type: medications.type,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(medications)
      .where(inArray(medications.logId, logIds))
      .groupBy(medications.productName, medications.type)
      .orderBy(desc(sql`count(*)`))
      .limit(30);

    results.medications = [
      ...new Set(medRows.map((r) => r.productName).filter(Boolean)),
    ];
  }

  if (type === "food" || type === "all") {
    const { inArray } = await import("drizzle-orm");
    const foodRows = await db
      .select({ items: foodEntries.items })
      .from(foodEntries)
      .where(inArray(foodEntries.logId, logIds))
      .orderBy(desc(foodEntries.id))
      .limit(100);

    const allItems = new Set<string>();
    for (const row of foodRows) {
      if (Array.isArray(row.items)) {
        for (const item of row.items) {
          if (typeof item === "string" && item.trim()) {
            allItems.add(item.trim());
          }
        }
      }
    }
    results.foods = [...allItems];
  }

  return NextResponse.json(results);
}
