"use client";

import React from "react";
import {
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Sun,
  Moon,
  HeartHandshake,
  Dna,
  ShoppingBag,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface ClinicalReportViewerProps {
  reportText: string;
}

export function ClinicalReportViewer({ reportText }: ClinicalReportViewerProps) {
  if (!reportText) return null;

  // Split report into major sections by line dividers
  const sections = reportText.split(/----------------------------------------------------------------------/);

  // Parse header from section 0
  const headerBlock = sections[0] || "";
  const subSections = sections.slice(1);

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(/^https?:\/\//)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="my-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-extrabold text-xs shadow-md shadow-teal-500/20 hover:from-teal-400 hover:to-cyan-400 transition-all hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Buy Online (Cheapest Verified) ↗
          </a>
        );
      }
      return part;
    });
  };

  const getSectionIcon = (title: string) => {
    if (title.includes("BIOMETRIC") || title.includes("MEASUREMENT")) return <Activity className="w-4 h-4 text-cyan-400" />;
    if (title.includes("ROOT CAUSE") || title.includes("PATHOPHYSIOLOGICAL")) return <Dna className="w-4 h-4 text-emerald-400" />;
    if (title.includes("LIFESTYLE") || title.includes("ZERO-COST")) return <HeartHandshake className="w-4 h-4 text-teal-400" />;
    if (title.includes("AM & PM") || title.includes("ROUTINE")) return <Sun className="w-4 h-4 text-amber-400" />;
    if (title.includes("CONTRAINDICATIONS")) return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    if (title.includes("PRODUCTS") || title.includes("ONLINE")) return <ShoppingBag className="w-4 h-4 text-teal-300" />;
    if (title.includes("RED FLAG") || title.includes("CONSULT")) return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    return <Sparkles className="w-4 h-4 text-cyan-300" />;
  };

  const getSectionColor = (title: string) => {
    if (title.includes("CONTRAINDICATIONS") || title.includes("RED FLAG")) {
      return "border-rose-500/30 bg-rose-950/20";
    }
    if (title.includes("PRODUCTS")) {
      return "border-teal-500/40 bg-teal-950/20";
    }
    if (title.includes("AM & PM")) {
      return "border-amber-500/30 bg-amber-950/15";
    }
    return "border-white/[0.08] bg-slate-950/40";
  };

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-teal-950/70 via-slate-900/90 to-cyan-950/50 border border-teal-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Agentic Clinical Diagnostic Report
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Personalized Treatment Dossier & Handoff
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              Autonomous physiological evaluation synthesized from YouCam AI telemetry.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Class II Diagnostic Grade</span>
          </div>
        </div>
      </div>

      {/* Render Subsections as visually distinct cards */}
      <div className="space-y-4">
        {subSections.map((sec, idx) => {
          const lines = sec.trim().split("\n");
          const sectionTitle = lines[0]?.trim() || `Section ${idx + 1}`;
          const sectionBody = lines.slice(1).join("\n").trim();

          if (!sectionBody) return null;

          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${getSectionColor(sectionTitle)} shadow-lg backdrop-blur-sm`}
            >
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06] mb-3.5">
                <div className="p-1.5 rounded-lg bg-white/[0.05] border border-white/10">
                  {getSectionIcon(sectionTitle)}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                  {sectionTitle.replace(/^\d+\.\s*/, "")}
                </h4>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                {renderTextWithLinks(sectionBody)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
