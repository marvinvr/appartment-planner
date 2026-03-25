import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { computePixelsPerCm } from "@/lib/calibration";

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const projectId = parseInt(params.projectId);
  const body = await request.json();
  const { x1, y1, x2, y2, realCm } = body;

  if (x1 == null || y1 == null || x2 == null || y2 == null || realCm == null) {
    return NextResponse.json(
      { error: "x1, y1, x2, y2, and realCm are required" },
      { status: 400 }
    );
  }

  const pixelsPerCm = computePixelsPerCm(x1, y1, x2, y2, realCm);

  const [updated] = await db
    .update(projects)
    .set({
      calX1: x1,
      calY1: y1,
      calX2: x2,
      calY2: y2,
      calRealCm: realCm,
      pixelsPerCm,
    })
    .where(eq(projects.id, projectId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
