"use client";
import { Circle, Line } from "react-konva";

interface CalibrationOverlayProps {
  point1?: { x: number; y: number } | null;
  point2?: { x: number; y: number } | null;
}

export default function CalibrationOverlay({ point1, point2 }: CalibrationOverlayProps) {
  return (
    <>
      {point1 && (
        <Circle x={point1.x} y={point1.y} radius={6} fill="red" />
      )}
      {point2 && (
        <>
          <Circle x={point2.x} y={point2.y} radius={6} fill="red" />
          {point1 && (
            <Line
              points={[point1.x, point1.y, point2.x, point2.y]}
              stroke="red"
              strokeWidth={2}
              dash={[5, 5]}
            />
          )}
        </>
      )}
    </>
  );
}
