import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Sparkles, LayoutDashboard, Camera, History, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Dermlog — Precision Skin Health Diary & Telemetry",
  description: "Longitudinal optical skin telemetry, inflection detection, and clinical handoff reporting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-teal-500 selection:text-slate-950">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#080d16]/75 border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-400 p-[1.5px] shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-all duration-300">
                <div className="w-full h-full bg-[#080e18] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-teal-300 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    Dermlog
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/25 tracking-wide">
                    AGENTIC
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Longitudinal Skin Telemetry
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-teal-400" />
                Dashboard
              </Link>
              <Link
                href="/upload"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-2"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                Scan Selfie
              </Link>
              <Link
                href="/events"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-2"
              >
                <History className="w-4 h-4 text-indigo-400" />
                Log Events
              </Link>
            </nav>

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 py-1.5 px-3 rounded-full bg-white/[0.03] border border-white/[0.08]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              <span className="font-medium text-slate-300">Local Sandbox</span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {children}
        </main>

        <footer className="border-t border-white/[0.06] bg-[#05080e]/60 py-6 text-center text-xs text-slate-500">
          <p>
            Dermlog • Autonomous Optical Telemetry & Clinical Reasoning Diary
          </p>
        </footer>
      </body>
    </html>
  );
}
