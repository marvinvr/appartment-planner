"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Project {
  id: number;
  name: string;
  pdfPath: string | null;
  pixelsPerCm: number | null;
  createdAt: string;
}

function ProjectMenu({ onSetup, onDelete }: { onSetup: () => void; onDelete: () => void }) {
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
            onClick={() => { setOpen(false); onSetup(); }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          >
            Setup
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

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const project = await res.json();
    setNewName("");
    router.push(`/projects/${project.id}/setup`);
  };

  const deleteProject = async (id: number) => {
    if (!confirm("Delete this project and all its data?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Apartment Planner</h1>

      <form onSubmit={createProject} className="flex gap-3 mb-8">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New project name (e.g. Gartenstrasse 12)"
          className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          New Project
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-500">No projects yet. Create one above.</p>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-lg border p-4 flex items-center justify-between"
            >
              <div>
                <h2 className="font-semibold text-gray-900">{p.name}</h2>
                <div className="text-xs text-gray-500 mt-1 flex gap-3">
                  <span>{p.pdfPath ? "PDF uploaded" : "No PDF"}</span>
                  <span>{p.pixelsPerCm ? "Calibrated" : "Not calibrated"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/projects/${p.id}/layouts`)}
                  className="text-sm px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Open
                </button>
                <ProjectMenu
                  onSetup={() => router.push(`/projects/${p.id}/setup`)}
                  onDelete={() => deleteProject(p.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
