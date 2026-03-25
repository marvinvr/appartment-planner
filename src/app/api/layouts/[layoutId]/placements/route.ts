import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { placements, furnitureItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: { layoutId: string } }
) {
  const layoutId = parseInt(params.layoutId);

  const rows = await db
    .select({
      id: placements.id,
      layoutId: placements.layoutId,
      furnitureItemId: placements.furnitureItemId,
      xPx: placements.xPx,
      yPx: placements.yPx,
      rotationDeg: placements.rotationDeg,
      updatedAt: placements.updatedAt,
      furnitureItem: {
        id: furnitureItems.id,
        projectId: furnitureItems.projectId,
        name: furnitureItems.name,
        widthCm: furnitureItems.widthCm,
        heightCm: furnitureItems.heightCm,
        color: furnitureItems.color,
        createdAt: furnitureItems.createdAt,
      },
    })
    .from(placements)
    .leftJoin(furnitureItems, eq(placements.furnitureItemId, furnitureItems.id))
    .where(eq(placements.layoutId, layoutId));

  return NextResponse.json(rows);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { layoutId: string } }
) {
  const layoutId = parseInt(params.layoutId);
  const body = await request.json();
  const { furnitureItemId, xPx, yPx, rotationDeg } = body;

  if (furnitureItemId == null || xPx == null || yPx == null) {
    return NextResponse.json(
      { error: "furnitureItemId, xPx, and yPx are required" },
      { status: 400 }
    );
  }

  const values: Record<string, unknown> = {
    layoutId,
    furnitureItemId,
    xPx,
    yPx,
  };
  if (rotationDeg !== undefined) values.rotationDeg = rotationDeg;

  const [created] = await db
    .insert(placements)
    .values(values as typeof placements.$inferInsert)
    .returning();

  return NextResponse.json(created, { status: 201 });
}
