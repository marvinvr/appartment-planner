"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { renderPdfPageToDataUrl } from "@/lib/renderPdf";
import { useCalibration } from "@/components/canvas/useCalibration";

const SetupCanvas = dynamic(() => import("@/components/canvas/SetupCanvas"), { ssr: false });

interface Project {
  id: number;
  name: string;
  pdfPath: string | null;
  pdfWidthPx: number | null;
  pdfHeightPx: number | null;
  pixelsPerCm: number | null;
  calX1: number | null;
  calY1: number | null;
  calX2: number | null;
  calY2: number | null;
  calRealCm: number | null;
}

export default function SetupPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [pdfDims, setPdfDims] = useState<{ w: number; h: number } | null>(null);
  const [step, setStep] = useState<"upload" | "calibrate">("upload");
  const [showModal, setShowModal] = useState(false);
  const [realCm, setRealCm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calibration = useCalibration();

  const loadPdf = useCallback(async () => {
    const scale = parseFloat(process.env.NEXT_PUBLIC_PDF_RENDER_SCALE || "1");
    const result = await renderPdfPageToDataUrl(`/api/pdf/${projectId}`, 1, scale);
    setPdfDataUrl(result.dataUrl);
    setPdfDims({ w: result.widthPx, h: result.heightPx });
  }, [projectId]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((p: Project) => {
        setProject(p);
        if (p.pdfPath) {
          setStep("calibrate");
          loadPdf();
        }
      });
  }, [projectId, loadPdf]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    await fetch(`/api/projects/${projectId}/pdf`, {
      method: "POST",
      body: formData,
    });
    const scale = parseFloat(process.env.NEXT_PUBLIC_PDF_RENDER_SCALE || "1");
    const result = await renderPdfPageToDataUrl(`/api/pdf/${projectId}`, 1, scale);
    setPdfDataUrl(result.dataUrl);
    setPdfDims({ w: result.widthPx, h: result.heightPx });

    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pdfWidthPx: result.widthPx,
        pdfHeightPx: result.heightPx,
      }),
    });

    setUploading(false);
    setStep("calibrate");
    const res = await fetch(`/api/projects/${projectId}`);
    setProject(await res.json());
  };

  const handleStageClick = (e: any) => {
    if (calibration.state === "done") return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const scale = stage.scaleX();
    const x = (pos.x - stage.x()) / scale;
    const y = (pos.y - stage.y()) / scale;
    calibration.handleClick(x, y);
  };

  useEffect(() => {
    if (calibration.state === "done") {
      setShowModal(true);
    }
  }, [calibration.state]);

  const submitCalibration = async () => {
    const cm = parseFloat(realCm);
    if (!cm || !calibration.point1 || !calibration.point2) return;
    const res = await fetch(`/api/projects/${projectId}/calibration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        x1: calibration.point1.x,
        y1: calibration.point1.y,
        x2: calibration.point2.x,
        y2: calibration.point2.y,
        realCm: cm,
      }),
    });
    const updated = await res.json();
    setProject(updated);
    setShowModal(false);
    router.push(`/projects/${projectId}/layouts`);
  };

  const containerWidth = 900;
  const stageScale = pdfDims ? Math.min(1, containerWidth / pdfDims.w) : 1;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Projects
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {project?.name ?? "Loading..."} — Setup
        </h1>
      </div>

      {step === "upload" && (
        <div className="bg-white rounded-lg border p-8 text-center">
          <h2 className="text-lg font-semibold mb-4">Upload Floor Plan</h2>
          <p className="text-gray-500 mb-6">Upload a PDF of your floor plan to get started.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Choose PDF File"}
          </button>
        </div>
      )}

      {step === "calibrate" && pdfDataUrl && pdfDims && (
        <div>
          {project?.pixelsPerCm && calibration.state === "idle" ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">Calibrated</p>
                <p className="text-sm text-green-600">
                  Scale: {project.pixelsPerCm.toFixed(2)} px/cm
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    calibration.reset();
                    setProject((p) => p ? { ...p, pixelsPerCm: null } : p);
                  }}
                  className="text-sm px-4 py-2 bg-white border rounded hover:bg-gray-50"
                >
                  Re-calibrate
                </button>
                <button
                  onClick={() => router.push(`/projects/${projectId}/layouts`)}
                  className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Continue to Layouts →
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                {calibration.state === "idle" &&
                  "Click two points on the floor plan that correspond to a known distance."}
                {calibration.state === "first_point" &&
                  "First point placed. Now click the second point."}
                {calibration.state === "done" &&
                  "Both points placed. Enter the real-world distance."}
              </p>
              {calibration.state !== "idle" && (
                <button
                  onClick={calibration.reset}
                  className="text-sm text-blue-600 underline mt-1"
                >
                  Start over
                </button>
              )}
            </div>
          )}

          <div className="bg-white border rounded-lg overflow-hidden inline-block">
            <SetupCanvas
              pdfDataUrl={pdfDataUrl}
              width={pdfDims.w * stageScale}
              height={pdfDims.h * stageScale}
              scaleX={stageScale}
              scaleY={stageScale}
              onStageClick={handleStageClick}
              cursor={calibration.state !== "done" ? "crosshair" : "default"}
              point1={calibration.point1}
              point2={calibration.point2}
            />
          </div>

          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-gray-500 underline"
            >
              Upload different PDF
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              Enter Real-World Distance
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              How long is this distance in real life?
            </p>
            <div className="flex items-center gap-2 mb-6">
              <input
                type="number"
                value={realCm}
                onChange={(e) => setRealCm(e.target.value)}
                placeholder="e.g. 300"
                min="1"
                step="1"
                autoFocus
                className="flex-1 border rounded px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === "Enter" && submitCalibration()}
              />
              <span className="text-sm text-gray-500">cm</span>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  calibration.reset();
                }}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitCalibration}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
