import { NextRequest, NextResponse } from "next/server";
import { readPdfFile } from "@/lib/pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const projectId = parseInt(params.projectId);

  const pdfBuffer = await readPdfFile(projectId);

  if (!pdfBuffer) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
