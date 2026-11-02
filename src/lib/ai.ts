import { Event, Scan } from "@prisma/client";

interface GenerateSummaryParams {
  userName: string;
  flags: string[];
  recentScans: Scan[]; // up to 6 scans, chronological order
  eventsInWindow: Event[];
}

/**
 * Generates a concise, clinical 150-200 word dermatologist handoff summary.
 * Uses free open-source models via API (Groq Llama-3.1-8b, OpenRouter free models,
 * or local Ollama if configured). Includes a deterministic fallback so demos never fail.
 */
export async function generateClinicalSummary({
  userName,
  flags,
  recentScans,
  eventsInWindow,
}: GenerateSummaryParams): Promise<string> {
  const latestScan = recentScans[recentScans.length - 1];
  const firstScan = recentScans[0];
  const startDateStr = new Date(firstScan.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endDateStr = new Date(latestScan.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const scanDataText = recentScans
    .map(
      (s) =>
        `- Date: ${new Date(s.createdAt).toISOString().split("T")[0]} | Redness: ${s.redness} | Texture: ${s.texture} | Acne Count: ${s.acneCount} | Hydration: ${s.hydration}% | Dark Spots: ${s.darkSpots}`
    )
    .join("\n");

  const eventsText =
    eventsInWindow.length > 0
      ? eventsInWindow
          .map(
            (e) =>
              `- [${new Date(e.eventDate).toISOString().split("T")[0]}] Event: "${e.label}" — Note: ${e.note}`
          )
          .join("\n")
      : "No product interventions or events recorded in this period.";

  const systemInstruction = `You are an AI clinical documentation assistant. Draft a concise, professional 150-200 word clinical handoff summary for a dermatologist reviewing patient ${userName}'s weekly facial scan telemetry.
CRITICAL INSTRUCTIONS:
- Write in plain clinical handoff language, no fluff or conversational greetings.
- Reference specific dates and numerical values from the data provided.
- You are not diagnosing. Only summarize observed data trends, correlate logged product/event entries, and flag patterns for a professional to review.
- Do not hallucinate conditions or recommend prescription drugs.`;

  const userPrompt = `Telemetric Monitoring Range: ${startDateStr} to ${endDateStr}
Triggered Inflection Flags: ${flags.join(", ")}

Scan History (Last ${recentScans.length} scans):
${scanDataText}

Logged Events / Interventions in Window:
${eventsText}

Please write the clinical handoff summary now.`;

  // 1. Try Groq API (Free tier for Llama-3.1-8b)
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 450,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch (err) {
      console.warn("Groq API call failed, trying next provider:", err);
    }
  }

  // 2. Try OpenRouter Free API (meta-llama/llama-3.1-8b-instruct:free or mistral)
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Dermlog Local Handoff",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 450,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch (err) {
      console.warn("OpenRouter API call failed:", err);
    }
  }

  // 3. Try Local Ollama if running
  try {
    const ollamaUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";
    const res = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1:8b",
        prompt: `${systemInstruction}\n\n${userPrompt}`,
        stream: false,
      }),
      signal: AbortSignal.timeout(3000), // quick failover if Ollama is not running locally
    });

    if (res.ok) {
      const data = await res.json();
      if (data.response?.trim()) return data.response.trim();
    }
  } catch (_e) {
    // Ollama not reachable, fall back to high-fidelity clinical synthesis
  }

  // 4. Clinical Deterministic Reasoning Generator (Guarantees demo never breaks offline or without API keys)
  return buildDeterministicClinicalSummary({
    userName,
    flags,
    recentScans,
    eventsInWindow,
    startDateStr,
    endDateStr,
  });
}

function buildDeterministicClinicalSummary({
  userName,
  flags,
  recentScans,
  eventsInWindow,
  startDateStr,
  endDateStr,
}: {
  userName: string;
  flags: string[];
  recentScans: Scan[];
  eventsInWindow: Event[];
  startDateStr: string;
  endDateStr: string;
}): string {
  const latest = recentScans[recentScans.length - 1];
  const prev = recentScans.length > 1 ? recentScans[recentScans.length - 2] : null;

  const flagDescriptions = flags.join(", ");
  const eventNotes =
    eventsInWindow.length > 0
      ? `Coinciding user-logged interventions include: ${eventsInWindow
          .map((e) => `"${e.label}" on ${new Date(e.eventDate).toLocaleDateString()}`)
          .join(", ")}.`
      : "No topical interventions or regimen adjustments were recorded in this tracking interval.";

  let trendAnalysis = "";
  if (prev) {
    trendAnalysis = `Over the current interval, erythema index moved from ${prev.redness.toFixed(1)} to ${latest.redness.toFixed(1)}, while acne lesion count shifted from ${prev.acneCount} to ${latest.acneCount}. Epidermal hydration was quantified at ${latest.hydration.toFixed(1)}% (prior baseline: ${prev.hydration.toFixed(1)}%), with texture index evaluated at ${latest.texture.toFixed(1)}.`;
  } else {
    trendAnalysis = `Baseline scan telemetry indicates erythema score of ${latest.redness.toFixed(1)}, texture irregularity index of ${latest.texture.toFixed(1)}, hydration level of ${latest.hydration.toFixed(1)}%, and ${latest.acneCount} visible inflammatory/comedonal lesions.`;
  }

  return `CLINICAL HANDOFF REPORT: Patient ${userName}
Monitoring Window: ${startDateStr} to ${endDateStr}
Triggered Telemetry Flags: [${flagDescriptions.toUpperCase()}]

Observed Trajectory:
Review of sequential serial scans indicates an acute inflection triggering protocol thresholds for ${flagDescriptions}. ${trendAnalysis}

Regimen Correlation:
${eventNotes} Temporal alignment between regimen changes and subsequent biomarker deviations warrants clinician assessment to rule out contact irritation, vehicle intolerance, or transient retinization purging versus genuine clinical deterioration.

Clinical Caveat:
This algorithmic assessment compiles quantitative optical telemetry and chronological patient logs for triage and handoff purposes only; it does not constitute a formal diagnostic determination.`;
}
