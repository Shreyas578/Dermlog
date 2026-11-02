"use client";

import { useEffect, useState, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Download,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Camera,
  Plus,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Layers,
  Activity,
  Flame,
  Droplets,
  ShoppingBag,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { ClinicalReportViewer } from "@/components/ClinicalReportViewer";
import html2canvas from "html2canvas";
import { exportDermatologistHandoffPDF } from "@/lib/pdfExport";

interface Scan {
  id: string;
  imagePath: string;
  redness: number;
  texture: number;
  acneCount: number;
  hydration: number;
  darkSpots: number;
  createdAt: string;
}

interface EventItem {
  id: string;
  label: string;
  note: string;
  eventDate: string;
}

interface Report {
  id: string;
  summaryText: string;
  flaggedMetrics: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState<Scan[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [userName, setUserName] = useState("Alex Morgan");
  const [expandedReports, setExpandedReports] = useState<Record<string, boolean>>({});
  const [pdfGeneratingId, setPdfGeneratingId] = useState<string | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (data.scans) setScans(data.scans);
      if (data.events) setEvents(data.events);
      if (data.reports) {
        setReports(data.reports);
        if (data.reports.length > 0) {
          setExpandedReports({ [data.reports[0].id]: true });
        }
      }
      if (data.user?.name) setUserName(data.user.name);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedReports((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportPDF = async (report: Report) => {
    try {
      setPdfGeneratingId(report.id);
      let chartImageBase64 = "";

      if (chartContainerRef.current) {
        const canvas = await html2canvas(chartContainerRef.current, {
          backgroundColor: "#060a10",
          scale: 2,
        });
        chartImageBase64 = canvas.toDataURL("image/png");
      }

      await exportDermatologistHandoffPDF({
        ...report,
        userName,
        chartImageBase64,
        scansInRange: scans,
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to export PDF: " + String(err));
    } finally {
      setPdfGeneratingId(null);
    }
  };

  const chartData = scans.map((scan) => {
    const dateStr = new Date(scan.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const matchedEvent = events.find((e) => {
      const eTime = new Date(e.eventDate).getTime();
      const sTime = new Date(scan.createdAt).getTime();
      return Math.abs(eTime - sTime) <= 3 * 24 * 60 * 60 * 1000;
    });

    return {
      date: dateStr,
      fullDate: new Date(scan.createdAt).toISOString().split("T")[0],
      redness: scan.redness,
      texture: scan.texture,
      acneCount: scan.acneCount,
      hydration: scan.hydration,
      darkSpots: scan.darkSpots,
      eventLabel: matchedEvent ? matchedEvent.label : null,
    };
  });

  const latestScan = scans.length > 0 ? scans[scans.length - 1] : null;

  // Utility to parse hyperlinks in markdown/text so users can click products
  const renderFormattedSummary = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 underline font-bold hover:text-cyan-200 inline-flex items-center gap-1 bg-cyan-950/70 px-2 py-0.5 rounded-md border border-cyan-500/40 mx-1 transition-all hover:bg-cyan-900/80 shadow-sm"
          >
            Buy Online (Cheapest Verified) <ExternalLink className="w-3 h-3 inline text-cyan-400" />
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-10">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-10">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              Autonomous Inflection Surveillance & Clinical Treatment Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Skin Health & Biomarker Trajectory
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Track weekly facial scans, identify root causes, and access comprehensive holistic + cosmetic routines with direct cheapest purchase links for every flagged problem.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/events"
              className="px-5 py-3 rounded-2xl btn-secondary text-sm font-semibold flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-indigo-400" />
              Log Event
            </Link>
            <Link
              href="/upload"
              className="px-6 py-3 rounded-2xl btn-primary text-sm font-bold flex items-center gap-2 shadow-lg"
            >
              <Camera className="w-4 h-4" />
              Scan Weekly Selfie
            </Link>
          </div>
        </div>
      </div>

      {/* Latest Metrics Cards */}
      {latestScan ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              label: "Redness (Erythema)",
              val: latestScan.redness.toFixed(1),
              scale: "/100",
              icon: Flame,
              color: "text-rose-400",
              badge: latestScan.redness > 24 ? "Elevated" : "Nominal",
              badgeColor: latestScan.redness > 24 ? "bg-rose-500/15 text-rose-300 border-rose-500/30" : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
            },
            {
              label: "Surface Texture",
              val: latestScan.texture.toFixed(1),
              scale: "/100",
              icon: Layers,
              color: "text-amber-400",
              badge: "Smoothness Index",
              badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
            },
            {
              label: "Acne Lesions",
              val: latestScan.acneCount,
              scale: " spots",
              icon: AlertCircle,
              color: "text-orange-400",
              badge: latestScan.acneCount >= 4 ? "Flare Alert" : "Controlled",
              badgeColor: latestScan.acneCount >= 4 ? "bg-orange-500/15 text-orange-300 border-orange-500/30" : "bg-teal-500/15 text-teal-300 border-teal-500/30",
            },
            {
              label: "Skin Hydration",
              val: `${latestScan.hydration.toFixed(1)}%`,
              scale: "",
              icon: Droplets,
              color: "text-sky-400",
              badge: latestScan.hydration < 52 ? "Depleted" : "Optimal",
              badgeColor: latestScan.hydration < 52 ? "bg-sky-500/15 text-sky-300 border-sky-500/30" : "bg-teal-500/15 text-teal-300 border-teal-500/30",
            },
            {
              label: "Hyperpigmentation",
              val: latestScan.darkSpots.toFixed(1),
              scale: "/100",
              icon: Activity,
              color: "text-purple-400",
              badge: "Tone Uniformity",
              badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
            },
          ].map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${m.badgeColor}`}>
                    {m.badge}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">{m.label}</div>
                  <div className="text-2xl font-black text-white mt-0.5 tracking-tight flex items-baseline gap-1">
                    <span className={m.color}>{m.val}</span>
                    <span className="text-xs font-medium text-slate-500">{m.scale}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl glass-panel border border-dashed border-teal-500/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto text-teal-300">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No scans recorded yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upload your weekly selfie to establish your baseline and generate your personalized clinical action plan.
          </p>
          <div className="pt-2">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-xs font-bold"
            >
              Take First Scan <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Longitudinal Timeline Chart */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-teal-400" />
              Longitudinal Biomarker Timeline
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Multi-metric trajectory over time with routine product changes marked on the canvas
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/25">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span> Redness
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Texture
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/25">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span> Acne Count
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Hydration %
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/25">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span> Dark Spots
            </span>
          </div>
        </div>

        {loading ? (
          <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
              Loading telemetry...
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-slate-400 space-y-2 text-sm">
            <Layers className="w-8 h-8 text-slate-600 mb-1" />
            <p className="font-semibold text-slate-300">Timeline will display here</p>
            <p className="text-xs text-slate-500">Record 2 or more scans to visualize trends and inflection markers.</p>
          </div>
        ) : (
          <div ref={chartContainerRef} className="h-84 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 30, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.6} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const dataPoint = payload[0].payload;
                      return (
                        <div className="bg-[#0b121e]/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl text-xs space-y-2 min-w-[220px]">
                          <div className="font-bold text-white border-b border-white/10 pb-1.5 flex justify-between">
                            <span>Scan Date: {label}</span>
                            <span className="text-slate-400 text-[10px] font-mono">{dataPoint.fullDate}</span>
                          </div>
                          <div className="text-rose-400 flex justify-between font-medium">
                            <span>Redness:</span>
                            <span className="font-bold">{dataPoint.redness}</span>
                          </div>
                          <div className="text-amber-400 flex justify-between font-medium">
                            <span>Texture:</span>
                            <span className="font-bold">{dataPoint.texture}</span>
                          </div>
                          <div className="text-orange-400 flex justify-between font-medium">
                            <span>Acne Count:</span>
                            <span className="font-bold">{dataPoint.acneCount}</span>
                          </div>
                          <div className="text-cyan-400 flex justify-between font-medium">
                            <span>Hydration:</span>
                            <span className="font-bold">{dataPoint.hydration}%</span>
                          </div>
                          <div className="text-purple-400 flex justify-between font-medium">
                            <span>Dark Spots:</span>
                            <span className="font-bold">{dataPoint.darkSpots}</span>
                          </div>
                          {dataPoint.eventLabel && (
                            <div className="mt-2 pt-2 border-t border-white/10 text-teal-300 text-[11px] bg-teal-500/10 p-2 rounded-xl">
                              📌 Regimen: {dataPoint.eventLabel}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {chartData
                  .filter((d) => d.eventLabel)
                  .map((ev, i) => (
                    <ReferenceLine
                      key={`ev-${i}`}
                      x={ev.date}
                      stroke="#2dd4bf"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      label={{
                        value: `📌 ${ev.eventLabel?.substring(0, 18)}`,
                        position: "top",
                        fill: "#2dd4bf",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    />
                  ))}
                <Line
                  type="monotone"
                  dataKey="redness"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#f43f5e", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="texture"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="acneCount"
                  stroke="#fb923c"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#fb923c", strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="hydration"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#06b6d4", strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="darkSpots"
                  stroke="#c084fc"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#c084fc", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" />
              Comprehensive Clinical Handoff & Treatment Reports
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Root causes, holistic/natural lifestyle actions, cosmetic routines, and direct online cheapest buy links
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-300">
            {reports.length} Reports
          </span>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel text-center text-slate-400 text-xs space-y-1">
            <p className="font-semibold text-slate-300">No reports generated yet</p>
            <p className="text-slate-500">
              When weekly scans trigger inflection thresholds (redness trend, breakout cluster, or hydration drop), comprehensive clinical handoffs and product recommendations will automatically compile here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const isExpanded = !!expandedReports[report.id];
              let flags: string[] = [];
              try {
                flags = JSON.parse(report.flaggedMetrics);
              } catch {
                flags = [report.flaggedMetrics];
              }

              return (
                <div key={report.id} className="glass-panel rounded-2xl overflow-hidden transition-all">
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/25">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                        {flags.map((flag, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 uppercase tracking-wide"
                          >
                            ⚠️ {flag}
                          </span>
                        ))}
                      </div>

                      <div className="text-xs text-slate-300">
                        Longitudinal Interval:{" "}
                        <span className="font-medium text-white">
                          {new Date(report.dateRangeStart).toLocaleDateString()} —{" "}
                          {new Date(report.dateRangeEnd).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportPDF(report)}
                        disabled={pdfGeneratingId === report.id}
                        className="px-4 py-2.5 rounded-xl btn-primary text-xs flex items-center gap-2 shadow-md disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {pdfGeneratingId === report.id ? "Generating PDF..." : "Download PDF"}
                      </button>

                      <button
                        onClick={() => toggleExpand(report.id)}
                        className="px-4 py-2.5 rounded-xl btn-secondary text-xs flex items-center gap-1.5"
                      >
                        {isExpanded ? (
                          <>
                            Hide Report <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            View Full Action Plan <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 pt-4 border-t border-white/[0.06] bg-black/40 space-y-4">
                      <ClinicalReportViewer reportText={report.summaryText} />
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/[0.06]">
                        <span className="flex items-center gap-1.5 text-teal-400">
                          <ShoppingBag className="w-3.5 h-3.5" /> Direct retailer links verified at lowest available price
                        </span>
                        <span>Clinical AI Decision Support</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
