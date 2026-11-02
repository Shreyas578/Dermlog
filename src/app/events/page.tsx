"use client";

import { useEffect, useState } from "react";
import { Plus, History, Tag, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

interface EventItem {
  id: string;
  label: string;
  note: string;
  eventDate: string;
  createdAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setEventDate(new Date().toISOString().split("T")[0]);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, note, eventDate }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to log event");
      }

      setSuccess(true);
      setLabel("");
      setNote("");
      fetchEvents();
    } catch (err: any) {
      setError(err.message || "Failed to record event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          Skincare Interventions
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Log Product or Routine Events
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Record when products are introduced, adjusted, or discontinued. These timeline markers are cross-referenced by the AI clinical engine when generating handoff summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5">
          <div className="p-7 rounded-3xl glass-panel space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <Plus className="w-4 h-4 text-teal-400" />
              Add Regimen Event
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Product / Routine Change <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Started 0.05% Tretinoin cream"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Effective Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Notes / Application Details
                </label>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Applied alternate evenings over moisturizer; slight stinging on cheeks."
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
                ></textarea>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Event recorded and placed on your timeline.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl btn-primary text-xs font-bold shadow-lg disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Log Intervention"}
              </button>
            </form>
          </div>
        </div>

        {/* History Column */}
        <div className="lg:col-span-7">
          <div className="p-7 rounded-3xl glass-panel space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                Intervention History
              </h2>
              <span className="text-xs text-slate-400">{events.length} logged entries</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No events recorded yet. Use the form to record changes to your skincare routine.
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl glass-card space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Tag className="w-4 h-4 text-teal-400 shrink-0" />
                        <span className="text-sm font-bold text-white">{ev.label}</span>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                        {new Date(ev.eventDate).toISOString().split("T")[0]}
                      </span>
                    </div>

                    {ev.note && (
                      <p className="text-xs text-slate-300 leading-relaxed pl-6.5 border-l border-white/10 ml-2">
                        {ev.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
