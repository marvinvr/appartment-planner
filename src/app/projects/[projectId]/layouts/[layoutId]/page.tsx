"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const EditorCanvas = dynamic(() => import("@/components/canvas/EditorCanvas"), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center text-gray-400">Loading editor...</div>,
});

interface Project {
  id: number;
  name: string;
  pdfWidthPx: number;
  pdfHeightPx: number;
  pixelsPerCm: number;
}

interface Layout {
  id: number;
  name: string;
  placements: Array<{
    id: number;
    furnitureItemId: number;
    xPx: number;
    yPx: number;
    rotationDeg: number;
  }>;
}

interface FurnitureItem {
  id: number;
  name: string;
  widthCm: number;
  heightCm: number;
  color: string;
}

export default function LayoutEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const layoutId = params.layoutId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [showNewLayout, setShowNewLayout] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${projectId}`).then((r) => r.json()),
      fetch(`/api/layouts/${layoutId}`).then((r) => r.json()),
      fetch(`/api/projects/${projectId}/furniture`).then((r) => r.json()),
    ]).then(([proj, lay, furn]) => {
      setProject(proj);
      setLayout(lay);
      setNewName(lay.name);
      setFurniture(furn);
      setLoading(false);
    });
  }, [projectId, layoutId]);

  const handleRename = async () => {
    if (!newName.trim()) return;
    const res = await fetch(`/api/layouts/${layoutId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const updated = await res.json();
    setLayout((l) => l ? { ...l, name: updated.name } : l);
    setRenaming(false);
  };

  const createLayout = async () => {
    if (!newLayoutName.trim()) return;
    const res = await fetch(`/api/projects/${projectId}/layouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newLayoutName.trim() }),
    });
    const created = await res.json();
    setShowNewLayout(false);
    setNewLayoutName("");
    router.push(`/projects/${projectId}/layouts/${created.id}`);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!project || !layout) return <div className="p-8 text-red-500">Not found</div>;
  if (!project.pixelsPerCm) {
    return (
      <div className="p-8">
        <p className="text-red-600 mb-4">Project is not calibrated yet.</p>
        <button
          onClick={() => router.push(`/projects/${projectId}/setup`)}
          className="text-sm px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go to Setup
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="h-12 bg-white border-b flex items-center px-4 gap-3 flex-shrink-0">
        <button
          onClick={() => router.push(`/projects/${projectId}/layouts`)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Layouts
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => router.push(`/projects/${projectId}/layouts`)}
          className="text-sm font-medium text-gray-700 hover:text-blue-600"
        >
          {project.name}
        </button>
        <span className="text-gray-300">›</span>
        {renaming ? (
          <div className="flex items-center gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
            />
            <button onClick={handleRename} className="text-sm text-blue-600">Save</button>
            <button onClick={() => setRenaming(false)} className="text-sm text-gray-500">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{layout.name}</span>
            <button
              onClick={() => setRenaming(true)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Rename
            </button>
          </div>
        )}

        <div className="ml-auto">
          <button
            onClick={() => setShowNewLayout(true)}
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + New Layout
          </button>
        </div>
      </div>

      {/* Editor */}
      <EditorCanvas
        projectId={parseInt(projectId)}
        layoutId={parseInt(layoutId)}
        pdfUrl={`/api/pdf/${projectId}`}
        pdfWidthPx={project.pdfWidthPx}
        pdfHeightPx={project.pdfHeightPx}
        pixelsPerCm={project.pixelsPerCm}
        initialFurnitureItems={furniture}
        initialPlacements={layout.placements}
      />

      {/* New Layout Modal */}
      {showNewLayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">New Layout</h3>
            <input
              type="text"
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              placeholder="Layout name (e.g. Option B)"
              autoFocus
              className="w-full border rounded px-3 py-2 text-sm mb-4"
              onKeyDown={(e) => e.key === "Enter" && createLayout()}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowNewLayout(false); setNewLayoutName(""); }}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createLayout}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
