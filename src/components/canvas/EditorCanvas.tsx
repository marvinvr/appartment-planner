"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Transformer } from "react-konva";
import Konva from "konva";
import FloorplanBackground from "./FloorplanBackground";
import FurniturePiece from "./FurniturePiece";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { renderPdfPageToDataUrl } from "@/lib/renderPdf";

const PALETTE = [
  "#93c5fd", // blue
  "#86efac", // green
  "#fca5a5", // red
  "#fcd34d", // amber
  "#c4b5fd", // violet
  "#fdba74", // orange
  "#67e8f9", // cyan
  "#f9a8d4", // pink
  "#a5b4fc", // indigo
  "#d9f99d", // lime
];

function pickColor(usedColors: string[]): string {
  const unused = PALETTE.filter((c) => !usedColors.includes(c));
  if (unused.length > 0) return unused[0];
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

interface FurnitureItem {
  id: number;
  name: string;
  widthCm: number;
  heightCm: number;
  color: string;
}

interface Placement {
  id: number;
  furnitureItemId: number;
  xPx: number;
  yPx: number;
  rotationDeg: number;
}

interface EditorCanvasProps {
  projectId: number;
  layoutId: number;
  pdfUrl: string;
  pdfWidthPx: number;
  pdfHeightPx: number;
  pixelsPerCm: number;
  initialFurnitureItems: FurnitureItem[];
  initialPlacements: Placement[];
}

export default function EditorCanvas({
  projectId,
  layoutId,
  pdfUrl,
  pdfWidthPx,
  pdfHeightPx,
  pixelsPerCm,
  initialFurnitureItems,
  initialPlacements,
}: EditorCanvasProps) {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>(initialFurnitureItems);
  const [placements, setPlacements] = useState<Placement[]>(initialPlacements);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  // Furniture form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", widthCm: "", heightCm: "", color: "#93c5fd" });

  useEffect(() => {
    const scale = parseFloat(process.env.NEXT_PUBLIC_PDF_RENDER_SCALE || "1");
    renderPdfPageToDataUrl(pdfUrl, 1, scale).then((result) => {
      setPdfDataUrl(result.dataUrl);
    });
  }, [pdfUrl]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    if (selectedId !== null) {
      const node = stage.findOne(`#placement-${selectedId}`);
      if (node) {
        tr.nodes([node]);
        tr.getLayer()?.batchDraw();
        return;
      }
    }
    tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [selectedId, placements]);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current!;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition()!;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.max(0.2, Math.min(3, oldScale + direction * 0.05));
    setZoom(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, []);

  const handleDragEnd = useCallback(
    async (placementId: number, x: number, y: number) => {
      setPlacements((prev) =>
        prev.map((p) => (p.id === placementId ? { ...p, xPx: x, yPx: y } : p))
      );
      await fetch(`/api/layouts/${layoutId}/placements/${placementId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xPx: x, yPx: y }),
      });
    },
    [layoutId]
  );

  const placeItem = useCallback(
    async (furnitureItemId: number) => {
      const res = await fetch(`/api/layouts/${layoutId}/placements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          furnitureItemId,
          xPx: pdfWidthPx / 2,
          yPx: pdfHeightPx / 2,
          rotationDeg: 0,
        }),
      });
      const created = await res.json();
      setPlacements((prev) => [...prev, created]);
    },
    [layoutId, pdfWidthPx, pdfHeightPx]
  );

  const rotateSelected = useCallback(async () => {
    if (selectedId === null) return;
    const placement = placements.find((p) => p.id === selectedId);
    if (!placement) return;
    const newRot = (placement.rotationDeg + 90) % 360;
    setPlacements((prev) =>
      prev.map((p) => (p.id === selectedId ? { ...p, rotationDeg: newRot } : p))
    );
    await fetch(`/api/layouts/${layoutId}/placements/${selectedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rotationDeg: newRot }),
    });
  }, [selectedId, placements, layoutId]);

  const removeSelected = useCallback(async () => {
    if (selectedId === null) return;
    setPlacements((prev) => prev.filter((p) => p.id !== selectedId));
    setSelectedId(null);
    await fetch(`/api/layouts/${layoutId}/placements/${selectedId}`, {
      method: "DELETE",
    });
  }, [selectedId, layoutId]);

  const getFurnitureItem = (id: number) => furnitureItems.find((f) => f.id === id);

  // --- Furniture CRUD ---
  const resetForm = () => {
    setForm({ name: "", widthCm: "", heightCm: "", color: pickColor(furnitureItems.map((i) => i.color)) });
    setShowForm(false);
    setEditingId(null);
  };

  const openAddForm = () => {
    const usedColors = furnitureItems.map((i) => i.color);
    setForm({ name: "", widthCm: "", heightCm: "", color: pickColor(usedColors) });
    setEditingId(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
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
      setFurnitureItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
    } else {
      const res = await fetch(`/api/projects/${projectId}/furniture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const created = await res.json();
      setFurnitureItems((prev) => [...prev, created]);
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
    setFurnitureItems((prev) => prev.filter((i) => i.id !== id));
    setPlacements((prev) => prev.filter((p) => p.furnitureItemId !== id));
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 border-r bg-gray-50 p-3 overflow-y-auto flex-shrink-0 flex flex-col">
        <h3 className="font-semibold text-sm text-gray-700 mb-2">Furniture Library</h3>
        <p className="text-[11px] text-gray-400 mb-3">Changes apply to all layouts.</p>

        <div className="space-y-1.5 flex-1">
          {furnitureItems.map((item) => (
            <div key={item.id} className="bg-white border rounded p-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.widthCm} × {item.heightCm} cm (L×W)
                  </div>
                </div>
                <button
                  onClick={() => placeItem(item.id)}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Place
                </button>
              </div>
              <div className="flex gap-1 mt-1.5">
                <button
                  onClick={() => startEdit(item)}
                  className="text-[11px] text-gray-500 hover:text-gray-700"
                >
                  Edit
                </button>
                <span className="text-gray-300">·</span>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-[11px] text-red-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={openAddForm}
          className="mt-3 w-full border-2 border-dashed rounded py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
        >
          + Add Item
        </button>
      </div>

      <Modal
        open={showForm}
        onClose={resetForm}
        title={editingId ? "Edit Furniture Item" : "Add Furniture Item"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="planning-furniture-name" className="text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="planning-furniture-name"
              type="text"
              placeholder="Chair, Sofa, Dining Table..."
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="planning-furniture-width" className="text-sm font-medium text-gray-700">
                Length (cm)
              </label>
              <input
                id="planning-furniture-width"
                type="number"
                placeholder="200"
                value={form.widthCm}
                onChange={(e) => setForm((f) => ({ ...f, widthCm: e.target.value }))}
                required
                min="1"
                step="0.1"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="planning-furniture-height" className="text-sm font-medium text-gray-700">
                Width (cm)
              </label>
              <input
                id="planning-furniture-height"
                type="number"
                placeholder="90"
                value={form.heightCm}
                onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))}
                required
                min="1"
                step="0.1"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Color</h4>
              <p className="text-xs text-gray-500">Used for the item on the planning canvas.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Select color ${c}`}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className="h-8 w-8 rounded-full border-2 transition-transform"
                  style={{
                    backgroundColor: c,
                    borderColor: form.color === c ? "#1f2937" : "#e5e7eb",
                    transform: form.color === c ? "scale(1.08)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">
              {editingId ? "Save Changes" : "Add Item"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Canvas area */}
      <div className="flex-1 flex flex-col">
        <div ref={containerRef} className="flex-1 bg-gray-200 overflow-hidden">
          {pdfDataUrl && (
            <Stage
              ref={stageRef}
              width={containerSize.width}
              height={containerSize.height}
              scaleX={zoom}
              scaleY={zoom}
              x={stagePos.x}
              y={stagePos.y}
              onWheel={handleWheel}
              onClick={(e) => {
                if (e.target === stageRef.current) {
                  setSelectedId(null);
                }
              }}
              draggable
              onDragEnd={(e) => {
                if (e.target === stageRef.current) {
                  setStagePos({ x: e.target.x(), y: e.target.y() });
                }
              }}
            >
              <Layer listening={false}>
                <FloorplanBackground imageUrl={pdfDataUrl} />
              </Layer>
              <Layer>
                {placements.map((p) => {
                  const item = getFurnitureItem(p.furnitureItemId);
                  if (!item) return null;
                  const w = item.widthCm * pixelsPerCm;
                  const h = item.heightCm * pixelsPerCm;
                  return (
                    <FurniturePiece
                      key={p.id}
                      id={p.id}
                      x={p.xPx}
                      y={p.yPx}
                      width={w}
                      height={h}
                      rotation={p.rotationDeg}
                      color={item.color}
                      name={item.name}
                      isSelected={selectedId === p.id}
                      onSelect={() => setSelectedId(p.id)}
                      onDragEnd={(x, y) => handleDragEnd(p.id, x, y)}
                    />
                  );
                })}
                <Transformer
                  ref={transformerRef}
                  rotateEnabled={false}
                  resizeEnabled={false}
                  borderStroke="#2563eb"
                  borderStrokeWidth={2}
                />
              </Layer>
            </Stage>
          )}
        </div>
        {/* Toolbar */}
        <div className="h-12 bg-white border-t flex items-center px-4 gap-4">
          <span className="text-sm text-gray-500">
            Zoom: {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
            className="text-sm px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            −
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setStagePos({ x: 0, y: 0 });
            }}
            className="text-sm px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Reset
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            className="text-sm px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            +
          </button>
          <div className="border-l h-6 mx-2" />
          {selectedId !== null && (
            <>
              <span className="text-sm text-gray-700">
                Selected: {getFurnitureItem(placements.find((p) => p.id === selectedId)?.furnitureItemId ?? -1)?.name}
              </span>
              <button
                onClick={rotateSelected}
                className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Rotate
              </button>
              <button
                onClick={removeSelected}
                className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
