"use client";
import { Stage, Layer } from "react-konva";
import FloorplanBackground from "./FloorplanBackground";
import CalibrationOverlay from "./CalibrationOverlay";

interface SetupCanvasProps {
  pdfDataUrl: string;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  onStageClick: (e: any) => void;
  cursor: string;
  point1: { x: number; y: number } | null;
  point2: { x: number; y: number } | null;
}

export default function SetupCanvas({
  pdfDataUrl,
  width,
  height,
  scaleX,
  scaleY,
  onStageClick,
  cursor,
  point1,
  point2,
}: SetupCanvasProps) {
  return (
    <Stage
      width={width}
      height={height}
      scaleX={scaleX}
      scaleY={scaleY}
      onClick={onStageClick}
      style={{ cursor }}
    >
      <Layer listening={false}>
        <FloorplanBackground imageUrl={pdfDataUrl} />
      </Layer>
      <Layer listening={false}>
        <CalibrationOverlay point1={point1} point2={point2} />
      </Layer>
    </Stage>
  );
}
