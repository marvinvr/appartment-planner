export function pixelDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function computePixelsPerCm(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  realCm: number
): number {
  return pixelDistance(x1, y1, x2, y2) / realCm;
}

export function cmToCanvasPx(cm: number, pixelsPerCm: number): number {
  return cm * pixelsPerCm;
}
