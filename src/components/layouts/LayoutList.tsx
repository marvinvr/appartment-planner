"use client";

import LayoutCard from "@/components/layouts/LayoutCard";

interface Layout {
  id: number;
  name: string;
  createdAt: string;
}

interface LayoutListProps {
  layouts: Layout[];
  projectId: number;
}

export default function LayoutList({ layouts, projectId }: LayoutListProps) {
  if (layouts.length === 0) {
    return <p className="text-sm text-gray-400">No layouts yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {layouts.map((layout) => (
        <LayoutCard key={layout.id} layout={layout} projectId={projectId} />
      ))}
    </div>
  );
}
