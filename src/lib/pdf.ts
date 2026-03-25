import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { getPdfPath } from "./storage";

export async function readPdfFile(projectId: number): Promise<Buffer | null> {
  const path = getPdfPath(projectId);
  if (!existsSync(path)) {
    return null;
  }
  return readFile(path);
}
