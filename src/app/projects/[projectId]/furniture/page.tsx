"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface FurnitureItem {
  id: number;
  name: string;
  widthCm: number;
  heightCm: number;
  color: string;
}

export default function FurniturePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", widthCm: "", heightCm: "", color: "#93c5fd" });

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${projectId}`).then((r) => r.json()),
      fetch(`/api/projects/${projectId}/furniture`).then((r) => r.json()),
    ]).then(([proj, furniture]) => {
      setProjectName(proj.name);
      setItems(furniture);
      setLoading(false);
    });
  }, [projectId]);

  const resetForm = () => {
    setForm({ name: "", widthCm: "", heightCm: "", color: "#93c5fd" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      widthCm: parseFloat(form.widthCm),
      heightCm: parseFloat(form.heightCm),
      color: form.color,
    };

    if (editingId !== null) {
      const res = await fetch(`/api/furniture/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
    } else {
      const res = await fetch(`/api/projects/${projectId}/furniture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const created = await res.json();
      setItems((prev) => [...prev, created]);
    }
    resetForm();
  };

  const startEdit = (item: FurnitureItem) => {
    setForm({
      name: item.name,
      widthCm: String(item.widthCm),
      heightCm: String(item.heightCm),
      color: item.color,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Delete this item? It will be removed from all layouts.")) return;
    await fetch(`/api/furniture/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {projectName} — Furniture Library
        </h1>
        <button
          onClick={() => router.push(`/projects/${projectId}/layouts`)}
          className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Layouts →
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Editing a furniture item updates it in all layouts.
      </p>

      {/* Item list */}
      <div className="space-y-2 mb-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-lg p-4 flex items-center gap-4"
          >
            <div
              className="w-8 h-8 rounded"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                {item.widthCm} × {item.heightCm} cm (L×W)
              </p>
            </div>
            <button
              onClick={() => startEdit(item)}
              className="text-sm px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200"
            >
              Edit
            </button>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-sm px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-gray-400 text-sm">No furniture items yet.</p>
        )}
      </div>

      {/* Add/Edit form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">
            {editingId ? "Edit Item" : "Add Item"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm text-gray-600">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full border rounded px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Length (cm)</label>
              <input
                type="number"
                value={form.widthCm}
                onChange={(e) => setForm((f) => ({ ...f, widthCm: e.target.value }))}
                required
                min="1"
                step="0.1"
                className="w-full border rounded px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Width (cm)</label>
              <input
                type="number"
                value={form.heightCm}
                onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))}
                required
                min="1"
                step="0.1"
                className="w-full border rounded px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Color</label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                className="w-full h-10 border rounded mt-1 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              {editingId ? "Save" : "Create"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed rounded-lg p-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
        >
          + Add Item
        </button>
      )}
    </div>
  );
}
