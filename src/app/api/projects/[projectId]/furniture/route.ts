import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { furnitureItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const projectId = parseInt(params.projectId);

  const items = await db
    .select()
    .from(furnitureItems)
    .where(eq(furnitureItems.projectId, projectId));

  return NextResponse.json(items);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const projectId = parseInt(params.projectId);
  const body = await request.json();
  const { name, widthCm, heightCm, color } = body;

  if (!name || widthCm == null || heightCm == null) {
    return NextResponse.json(
      { error: "name, widthCm, and heightCm are required" },
      { status: 400 }
    );
  }

  const values: Record<string, unknown> = {
    projectId,
    name,
    widthCm,
    heightCm,
  };
  if (color !== undefined) values.color = color;

  const [created] = await db
    .insert(furnitureItems)
    .values(values as typeof furnitureItems.$inferInsert)
    .returning();

  return NextResponse.json(created, { status: 201 });
}
