"use client";

import Button from "@/components/ui/Button";

interface FurnitureItem {
  id: number;
  name: string;
  widthCm: number;
  heightCm: number;
  color: string;
}

interface FurnitureLibraryProps {
  items: FurnitureItem[];
  onPlace: (itemId: number) => void;
}

export default function FurnitureLibrary({
  items,
  onPlace,
}: FurnitureLibraryProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-700">Furniture Library</h3>

      {items.length === 0 && (
        <p className="text-sm text-gray-400">No furniture items yet.</p>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2"
        >
          {/* Color swatch */}
          <div
            className="h-5 w-5 shrink-0 rounded"
            style={{ backgroundColor: item.color }}
          />

          {/* Name & dims */}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-800">
              {item.name}
            </p>
            <p className="text-xs text-gray-500">
              {item.widthCm} × {item.heightCm} cm (L×W)
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => onPlace(item.id)}
          >
            Place
          </Button>
        </div>
      ))}
    </div>
  );
}
