"use client";

import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface FurnitureData {
  name: string;
  widthCm: number;
  heightCm: number;
  color: string;
}

interface FurnitureFormProps {
  onSubmit: (data: FurnitureData) => void;
  initial?: FurnitureData;
  onCancel?: () => void;
}

export default function FurnitureForm({
  onSubmit,
  initial,
  onCancel,
}: FurnitureFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [widthCm, setWidthCm] = useState(initial?.widthCm ?? 50);
  const [heightCm, setHeightCm] = useState(initial?.heightCm ?? 50);
  const [color, setColor] = useState(initial?.color ?? "#6366f1");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ name, widthCm, heightCm, color });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Name"
        id="furniture-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Sofa"
        required
      />

      <Input
        label="Length (cm)"
        id="furniture-width"
        type="number"
        value={widthCm}
        onChange={(e) => setWidthCm(Number(e.target.value))}
        min={1}
        step={1}
        required
      />

      <Input
        label="Width (cm)"
        id="furniture-height"
        type="number"
        value={heightCm}
        onChange={(e) => setHeightCm(Number(e.target.value))}
        min={1}
        step={1}
        required
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="furniture-color" className="text-sm font-medium text-gray-700">
          Color
        </label>
        <input
          id="furniture-color"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-16 cursor-pointer rounded border border-gray-300"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary">
          {initial ? "Save" : "Create"}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
