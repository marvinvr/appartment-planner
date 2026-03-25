"use client";
import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export async function renderPdfPageToDataUrl(
  pdfUrl: string,
  pageNumber = 1,
  scale = 1.0
): Promise<{ dataUrl: string; widthPx: number; heightPx: number }> {
  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
  return {
    dataUrl: canvas.toDataURL("image/png"),
    widthPx: viewport.width,
    heightPx: viewport.height,
  };
}
