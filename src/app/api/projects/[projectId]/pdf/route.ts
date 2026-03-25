import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { savePdf } from "@/lib/storage";

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const projectId = parseInt(params.projectId);

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const pdfPath = await savePdf(projectId, buffer);

  await db
    .update(projects)
    .set({ pdfPath })
    .where(eq(projects.id, projectId));

  return NextResponse.json({ pdfUrl: `/api/pdf/${projectId}` });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  return NextResponse.redirect(
    new URL(`/api/pdf/${params.projectId}`, process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
  );
}
