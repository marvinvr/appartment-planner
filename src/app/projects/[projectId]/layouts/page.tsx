"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { renderPdfPageToDataUrl } from "@/lib/renderPdf";

interface Layout {
  id: number;
  name: string;
  createdAt: string;
}

function LayoutMenu({ onDuplicate, onDelete }: { onDuplicate: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-gray-400 hover:text-gray-600 px-1.5 py-1 rounded hover:bg-gray-100"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
          <button
            onClick={() => { setOpen(false); onDuplicate(); }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          >
            Duplicate
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function LayoutsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [projectName, setProjectName] = useState("");
  const [hasPdf, setHasPdf] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${projectId}`).then((r) => r.json()),
      fetch(`/api/projects/${projectId}/layouts`).then((r) => r.json()),
    ]).then(([proj, lays]) => {
      setProjectName(proj.name);
      setLayouts(lays);
      setHasPdf(!!proj.pdfPath);
      setLoading(false);

      if (proj.pdfPath) {
        renderPdfPageToDataUrl(`/api/pdf/${projectId}`, 1, 0.5).then((result) => {
          setPdfPreview(result.dataUrl);
        });
      }
    });
  }, [projectId]);

  const createLayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch(`/api/projects/${projectId}/layouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const layout = await res.json();
    setNewName("");
    router.push(`/projects/${projectId}/layouts/${layout.id}`);
  };

  const duplicateLayout = async (id: number) => {
    const res = await fetch(`/api/layouts/${id}`, { method: "POST" });
    const created = await res.json();
    setLayouts((prev) => [...prev, created]);
  };

  const deleteLayout = async (id: number) => {
    if (!confirm("Delete this layout?")) return;
    await fetch(`/api/layouts/${id}`, { method: "DELETE" });
    setLayouts((prev) => prev.filter((l) => l.id !== id));
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Projects
        </button>
        <span className="text-gray-300">/</span>
        <button
          onClick={() => router.push(`/projects/${projectId}/setup`)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Setup
        </button>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        {projectName} — Layouts
      </h1>

      {/* PDF Preview */}
      {hasPdf && (
        <div className="mb-6 bg-white border rounded-lg overflow-hidden">
          {pdfPreview ? (
            <img
              src={pdfPreview}
              alt="Floor plan preview"
              className="w-full max-h-48 object-contain bg-gray-50"
            />
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
              Loading preview...
            </div>
          )}
        </div>
      )}

      <form onSubmit={createLayout} className="flex gap-3 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New layout name (e.g. Option A)"
          className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          New Layout
        </button>
      </form>

      {layouts.length === 0 ? (
        <p className="text-gray-400 text-sm">No layouts yet. Create one above.</p>
      ) : (
        <div className="space-y-2">
          {layouts.map((layout) => (
            <div
              key={layout.id}
              className="bg-white border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <h2 className="font-semibold">{layout.name}</h2>
                <p className="text-xs text-gray-500">
                  Created {new Date(layout.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    router.push(`/projects/${projectId}/layouts/${layout.id}`)
                  }
                  className="text-sm px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Open
                </button>
                <LayoutMenu
                  onDuplicate={() => duplicateLayout(layout.id)}
                  onDelete={() => deleteLayout(layout.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
