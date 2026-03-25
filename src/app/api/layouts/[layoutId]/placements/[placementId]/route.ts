import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { placements } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: { layoutId: string; placementId: string } }
) {
  const placementId = parseInt(params.placementId);
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.xPx !== undefined) updates.xPx = body.xPx;
  if (body.yPx !== undefined) updates.yPx = body.yPx;
  if (body.rotationDeg !== undefined) updates.rotationDeg = body.rotationDeg;
  updates.updatedAt = new Date();

  const [updated] = await db
    .update(placements)
    .set(updates)
    .where(eq(placements.id, placementId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Placement not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { layoutId: string; placementId: string } }
) {
  const placementId = parseInt(params.placementId);

  await db.delete(placements).where(eq(placements.id, placementId));

  return NextResponse.json({ success: true });
}
