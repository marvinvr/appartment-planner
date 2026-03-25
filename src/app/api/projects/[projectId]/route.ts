import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPdfPath } from "@/lib/storage";
import { existsSync, unlinkSync } from "fs";

export async function GET(
  _request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const projectId = parseInt(params.projectId);

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const projectId = parseInt(params.projectId);

  const pdfPath = getPdfPath(projectId);
  if (existsSync(pdfPath)) {
    unlinkSync(pdfPath);
  }

  await db.delete(projects).where(eq(projects.id, projectId));

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const projectId = parseInt(params.projectId);
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.pdfWidthPx !== undefined) updates.pdfWidthPx = body.pdfWidthPx;
  if (body.pdfHeightPx !== undefined) updates.pdfHeightPx = body.pdfHeightPx;

  const [updated] = await db
    .update(projects)
    .set(updates)
    .where(eq(projects.id, projectId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
