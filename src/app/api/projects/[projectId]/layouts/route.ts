import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { layouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const projectId = parseInt(params.projectId);

  const allLayouts = await db
    .select()
    .from(layouts)
    .where(eq(layouts.projectId, projectId));

  return NextResponse.json(allLayouts);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const projectId = parseInt(params.projectId);
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const [created] = await db
    .insert(layouts)
    .values({ projectId, name })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
