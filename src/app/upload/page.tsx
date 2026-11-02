"use client";

import { useState } from "react";
import {
  Camera,
  Upload,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Images,
  X,
} from "lucide-react";
import Link from "next/link";
import { ClinicalReportViewer } from "@/components/ClinicalReportViewer";

export default function UploadScanPage() {
  const [scanType, setScanType] = useState<"facial" | "scalp_hair">("facial");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);
      const newUrls = filesArr.map((f) => URL.createObjectURL(f));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
      setResult(null);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError("Please select at least one photo.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("scanType", scanType);

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process scans");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Camera className="w-3.5 h-3.5" />
          Skin & Hair Follicular Telemetry
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Batch Upload & Telemetry Analysis
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Upload <strong>one or multiple photos at once</strong> (e.g. photos from consecutive weeks). Dermlog extracts biometric scores for each image, computes the week-over-week deltas, and synthesizes clinical handoffs with direct product links.
        </p>
      </div>

      {/* Target Focus Selector (Facial Skin vs Scalp & Hair) */}
      <div className="p-2 rounded-2xl glass-panel grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setScanType("facial");
            setResult(null);
          }}
          className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            scanType === "facial"
              ? "btn-primary shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Camera className="w-4 h-4" />
          Facial Skin Scan
        </button>
        <button
          type="button"
          onClick={() => {
            setScanType("scalp_hair");
            setResult(null);
          }}
          className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            scanType === "scalp_hair"
              ? "btn-primary shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Hair & Scalp Telemetry Scan
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-8 rounded-3xl glass-panel space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <Images className="w-4 h-4 text-teal-400" />
              Upload Photos ({selectedFiles.length} selected)
            </span>
            <span className="text-xs text-slate-400 font-medium">Multiple files supported</span>
          </div>

          {/* Upload Dropzone */}
          <div className="relative border-2 border-dashed border-white/10 hover:border-teal-500/50 rounded-2xl p-8 text-center transition-all bg-black/20 cursor-pointer group">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="space-y-3 py-6">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-teal-400 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  Click or drag-and-drop to add one or multiple photos
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Hold Ctrl / Shift to select multiple photos at once (PNG, JPG, WebP)
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Image Preview Grid */}
          {previewUrls.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-slate-300">
                Selected Images ({previewUrls.length}):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-square">
                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg hover:bg-rose-500 transition-colors z-20"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded bg-black/70 text-[10px] text-teal-300 font-mono">
                      Photo #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || selectedFiles.length === 0}
          className="w-full py-4 rounded-2xl btn-primary text-sm font-bold flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              Processing {selectedFiles.length} Photos & Telemetry Timeline...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {selectedFiles.length === 0
                ? "Select one or multiple photos to begin"
                : `Analyze ${selectedFiles.length} Photo${selectedFiles.length > 1 ? "s" : ""} & Trigger Telemetry Agent`}
            </>
          )}
        </button>
      </form>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="p-8 rounded-3xl glass-panel space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              {result.totalUploaded} {result.totalUploaded > 1 ? "Scans" : "Scan"} Successfully Ingested
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Batch: {result.totalUploaded} Scans Processed
            </span>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Latest Extracted Biometrics (YouCam AI Engine)
            </div>

            {result.scan?.scanType === "scalp_hair" ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-xl glass-card">
                  <div className="text-xs text-slate-400">Hair Density</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">{result.scan?.hairDensity}</div>
                  <div className="text-[10px] text-slate-500">follicles/cm²</div>
                </div>
                <div className="p-4 rounded-xl glass-card">
                  <div className="text-xs text-slate-400">Scalp Flaking</div>
                  <div className="text-xl font-black text-amber-400 mt-1">{result.scan?.scalpFlaking}</div>
                  <div className="text-[10px] text-slate-500">dandruff index</div>
                </div>
                <div className="p-4 rounded-xl glass-card">
                  <div className="text-xs text-slate-400">Hair Thickness</div>
                  <div className="text-xl font-black text-cyan-400 mt-1">{result.scan?.hairThickness}</div>
                  <div className="text-[10px] text-slate-500">caliber index</div>
                </div>
                <div className="p-4 rounded-xl glass-card">
                  <div className="text-xs text-slate-400">Est. Daily Shedding</div>
                  <div className="text-xl font-black text-rose-400 mt-1">{result.scan?.hairShedCount}</div>
                  <div className="text-[10px] text-slate-500">hairs / day</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-4 rounded-xl glass-card">
                  <div className="text-xs text-slate-400">Redness</div>
                  <div className="text-xl font-black text-rose-400 mt-1">{result.scan?.redness}</div>
                </div>
                <div className="p-4 rounded-xl glass-card">
                  <div className="text-xs text-slate-400">Texture</div>
                  <div className="text-xl font-black text-amber-400 mt-1">{result.scan?.texture}</div>
                </div>
                <div className="p-4 rounded-xl glass-card">
                  <div className="text-xs text-slate-400">Acne Count</div>
                  <div className="text-xl font-black text-orange-400 mt-1">{result.scan?.acneCount}</div>
                </div>
                <div className="p-4 rounded-xl glass-card">
                  <div className="text-xs text-slate-400">Hydration</div>
                  <div className="text-xl font-black text-sky-400 mt-1">{result.scan?.hydration}%</div>
                </div>
                <div className="p-4 rounded-xl glass-card">
                  <div className="text-xs text-slate-400">Dark Spots</div>
                  <div className="text-xl font-black text-purple-400 mt-1">{result.scan?.darkSpots}</div>
                </div>
              </div>
            )}
          </div>

          {/* Inflection Evaluation Box */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                Inflection Rule Evaluation
              </span>
              {result.inflectionResult?.hasFlag ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">
                  FLAG TRIGGERED ({result.inflectionResult?.flags?.length})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                  WITHIN NORMAL BOUNDS
                </span>
              )}
            </div>

            {result.inflectionResult?.metricsSummary?.length > 0 && (
              <div className="space-y-1 pt-2 text-xs text-rose-300/90 font-mono">
                {result.inflectionResult.metricsSummary.map((m: any, i: number) => (
                  <div key={i}>• {m.description}</div>
                ))}
              </div>
            )}
          </div>

          {/* Report Generated Box */}
          {result.report && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-950/40 to-slate-900/60 border border-teal-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-teal-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-300" />
                  Clinical Action Plan & Direct Product Links Compiled
                </span>
                <span className="text-xs text-teal-400/80">
                  {new Date(result.report.createdAt).toLocaleTimeString()}
                </span>
              </div>

              {/* Dynamic Styled Clinical Dossier */}
              <ClinicalReportViewer reportText={result.report.summaryText} />

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-teal-400 font-medium">
                  Click the glowing buy buttons inside the dossier to access lowest verified prices.
                </span>
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl btn-primary text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  View on Dashboard & Download PDF <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
