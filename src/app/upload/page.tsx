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
  Sparkle,
  Sparkles as HairIcon,
} from "lucide-react";
import Link from "next/link";

export default function UploadScanPage() {
  const [scanType, setScanType] = useState<"facial" | "scalp_hair">("facial");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an image photo first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("scanType", scanType);

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process scan");
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
          Capture & Analyze Weekly Scan
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Upload your weekly facial selfie or scalp/hair parting photo. The AI pipeline quantifies biomarkers, checks rolling deltas for inflection patterns, and generates targeted solutions with the cheapest direct buy links.
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
              <Camera className="w-4 h-4 text-teal-400" />
              {scanType === "facial" ? "Facial Photograph" : "Scalp / Hair Parting Photograph"}
            </span>
            <span className="text-xs text-slate-400">Natural / Good Lighting</span>
          </div>

          {/* Upload Dropzone */}
          <div className="relative border-2 border-dashed border-white/10 hover:border-teal-500/50 rounded-2xl p-8 text-center transition-all bg-black/20 cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {previewUrl ? (
              <div className="flex flex-col items-center">
                <img
                  src={previewUrl}
                  alt="Scan Preview"
                  className="w-52 h-52 object-cover rounded-2xl border-2 border-teal-500/30 shadow-2xl mb-3"
                />
                <span className="text-xs font-semibold text-teal-300">
                  {selectedFile?.name} (Click or drop another to replace)
                </span>
              </div>
            ) : (
              <div className="space-y-3 py-8">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-teal-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">
                    {scanType === "facial"
                      ? "Click to browse or drop your facial selfie here"
                      : "Click to browse or drop your scalp parting or crown photo"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Accepts PNG, JPG, JPEG, WebP
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedFile}
          className="w-full py-4 rounded-2xl btn-primary text-sm font-bold flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              Analyzing {scanType === "facial" ? "Facial Skin" : "Scalp & Hair"} Telemetry...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {!selectedFile
                ? `Select a ${scanType === "facial" ? "face" : "hair/scalp"} photo to begin`
                : `Run Weekly ${scanType === "facial" ? "Skin" : "Hair"} Scan & Trigger Agent`}
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
              {result.scan?.scanType === "scalp_hair" ? "Hair & Scalp Telemetry Logged" : "Facial Telemetry Logged"}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              ID: {result.scan?.id?.slice(0, 8)}...
            </span>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              {result.scan?.scanType === "scalp_hair"
                ? "Trichological Follicular Metrics"
                : "Optical Telemetry Scores (YouCam AI)"}
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
                  Clinical Action Plan & Cheapest Treatments Compiled
                </span>
                <span className="text-xs text-teal-400/80">
                  {new Date(result.report.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-black/50 p-4 rounded-xl border border-white/[0.06]">
                {result.report.summaryText}
              </p>

              <div className="flex justify-end pt-1">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl btn-primary text-xs font-bold flex items-center gap-2"
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
