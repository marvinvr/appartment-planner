"use client";

import Link from "next/link";

interface LayoutCardProps {
  layout: {
    id: number;
    name: string;
    createdAt: string;
  };
  projectId: number;
}

export default function LayoutCard({ layout, projectId }: LayoutCardProps) {
  return (
    <Link
      href={`/projects/${projectId}/layouts/${layout.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="text-sm font-semibold text-gray-900">{layout.name}</h3>
      <p className="mt-1 text-xs text-gray-500">
        {new Date(layout.createdAt).toLocaleDateString()}
      </p>
    </Link>
  );
}
