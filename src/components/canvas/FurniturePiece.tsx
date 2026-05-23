"use client";
import { Group, Rect, Text } from "react-konva";
import { useRef } from "react";
import Konva from "konva";

interface FurniturePieceProps {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  name: string;
  isSelected: boolean;
  draggable?: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
}

export default function FurniturePiece({
  x,
  y,
  width,
  height,
  rotation,
  color,
  name,
  isSelected,
  draggable = true,
  onSelect,
  onDragEnd,
}: FurniturePieceProps) {
  const groupRef = useRef<Konva.Group>(null);

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      rotation={rotation}
      listening={draggable}
      draggable={draggable}
      onClick={draggable ? onSelect : undefined}
      onTap={draggable ? onSelect : undefined}
      onDragStart={draggable ? onSelect : undefined}
      onDragEnd={(e) => {
        onDragEnd(e.target.x(), e.target.y());
      }}
    >
      <Rect
        width={width}
        height={height}
        fill={color}
        opacity={0.75}
        stroke={isSelected ? "#2563eb" : "#333333"}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={2}
      />
      <Text
        text={name}
        width={width}
        height={height}
        align="center"
        verticalAlign="middle"
        fontSize={Math.min(14, width / 4, height / 4)}
        fill="#1f2937"
        listening={false}
      />
    </Group>
  );
}
