import { db } from "@/db";
import { medications, foodEntries } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/suggestions?type=medication|food
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";

  const results: { medications: string[]; foods: string[] } = {
    medications: [],
    foods: [],
  };

  if (type === "medication" || type === "all") {
    const medRows = await db
      .select({
        productName: medications.productName,
        type: medications.type,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(medications)
      .groupBy(medications.productName, medications.type)
      .orderBy(desc(sql`count(*)`))
      .limit(30);

    results.medications = [
      ...new Set(medRows.map((r) => r.productName).filter(Boolean)),
    ];
  }

  if (type === "food" || type === "all") {
    const foodRows = await db
      .select({ items: foodEntries.items })
      .from(foodEntries)
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
