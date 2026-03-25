import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { join } from "path";

function getUploadDir(): string {
  const dir = process.env.UPLOAD_DIR || "./data/uploads";
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export async function savePdf(projectId: number, buffer: Buffer): Promise<string> {
  const uploadDir = getUploadDir();
  const fileName = `${projectId}.pdf`;
  const filePath = join(uploadDir, fileName);
  await writeFile(filePath, buffer);
  return fileName;
}

export function getPdfPath(projectId: number): string {
  const uploadDir = getUploadDir();
  return join(uploadDir, `${projectId}.pdf`);
}
