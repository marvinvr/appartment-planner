import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { furnitureItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: { furnitureId: string } }
) {
  const furnitureId = parseInt(params.furnitureId);
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.widthCm !== undefined) updates.widthCm = body.widthCm;
  if (body.heightCm !== undefined) updates.heightCm = body.heightCm;
  if (body.color !== undefined) updates.color = body.color;

  const [updated] = await db
    .update(furnitureItems)
    .set(updates)
    .where(eq(furnitureItems.id, furnitureId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Furniture item not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { furnitureId: string } }
) {
  const furnitureId = parseInt(params.furnitureId);

  await db.delete(furnitureItems).where(eq(furnitureItems.id, furnitureId));

  return NextResponse.json({ success: true });
}
