import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { layouts, placements, furnitureItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: { layoutId: string } }
) {
  const layoutId = parseInt(params.layoutId);

  const [layout] = await db
    .select()
    .from(layouts)
    .where(eq(layouts.id, layoutId));

  if (!layout) {
    return NextResponse.json({ error: "Layout not found" }, { status: 404 });
  }

  const placementRows = await db
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

  return NextResponse.json({ ...layout, placements: placementRows });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { layoutId: string } }
) {
  const layoutId = parseInt(params.layoutId);
  const body = await request.json();
  const { name } = body;

  const [updated] = await db
    .update(layouts)
    .set({ name })
    .where(eq(layouts.id, layoutId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Layout not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function POST(
  _request: NextRequest,
  { params }: { params: { layoutId: string } }
) {
  const layoutId = parseInt(params.layoutId);

  const [original] = await db
    .select()
    .from(layouts)
    .where(eq(layouts.id, layoutId));

  if (!original) {
    return NextResponse.json({ error: "Layout not found" }, { status: 404 });
  }

  const [newLayout] = await db
    .insert(layouts)
    .values({ projectId: original.projectId, name: `${original.name} (copy)` })
    .returning();

  const existingPlacements = await db
    .select()
    .from(placements)
    .where(eq(placements.layoutId, layoutId));

  for (const p of existingPlacements) {
    await db.insert(placements).values({
      layoutId: newLayout.id,
      furnitureItemId: p.furnitureItemId,
      xPx: p.xPx,
      yPx: p.yPx,
      rotationDeg: p.rotationDeg,
    });
  }

  return NextResponse.json(newLayout, { status: 201 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { layoutId: string } }
) {
  const layoutId = parseInt(params.layoutId);

  await db.delete(layouts).where(eq(layouts.id, layoutId));

  return NextResponse.json({ success: true });
}
