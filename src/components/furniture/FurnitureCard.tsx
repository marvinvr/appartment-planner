"use client";

import Button from "@/components/ui/Button";

interface FurnitureItem {
  id: number;
  name: string;
  widthCm: number;
  heightCm: number;
  color: string;
}

interface FurnitureCardProps {
  item: FurnitureItem;
  onEdit: () => void;
  onDelete: () => void;
}

export default function FurnitureCard({
  item,
  onEdit,
  onDelete,
}: FurnitureCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Color swatch */}
      <div
        className="h-8 w-8 shrink-0 rounded"
        style={{ backgroundColor: item.color }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">
          {item.name}
        </p>
        <p className="text-xs text-gray-500">
          {item.widthCm} × {item.heightCm} cm (L×W)
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        <Button variant="secondary" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
