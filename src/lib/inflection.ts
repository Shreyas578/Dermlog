import { Scan } from "@prisma/client";

export interface InflectionRuleResult {
  hasFlag: boolean;
  flags: string[];
  metricsSummary: {
    metric: string;
    description: string;
    currentValue: number;
    previousValue: number;
    change: number;
  }[];
}

/**
 * Evaluates the user's scan history and detects inflection points:
 * 1. Redness increases >10% over 2 consecutive scans → "redness trend"
 * 2. Acne count increases by 3+ in one scan → "breakout cluster"
 * 3. Hydration drops >15% → "hydration drop"
 * 4. General texture spike (>12%) or notable shifts
 */
export function detectInflections(recentScansNewestFirst: Scan[]): InflectionRuleResult {
  const flags: string[] = [];
  const metricsSummary: InflectionRuleResult["metricsSummary"] = [];

  if (!recentScansNewestFirst || recentScansNewestFirst.length < 2) {
    return { hasFlag: false, flags, metricsSummary };
  }

  const latest = recentScansNewestFirst[0];
  const prev1 = recentScansNewestFirst[1];
  const prev2 = recentScansNewestFirst.length >= 3 ? recentScansNewestFirst[2] : null;

  // Rule 1: Acne count increases by 3+ in one scan → "breakout cluster"
  const acneDelta = latest.acneCount - prev1.acneCount;
  if (acneDelta >= 3) {
    flags.push("breakout cluster");
    metricsSummary.push({
      metric: "acneCount",
      description: `Acne count surged by ${acneDelta} (from ${prev1.acneCount} to ${latest.acneCount})`,
      currentValue: latest.acneCount,
      previousValue: prev1.acneCount,
      change: acneDelta,
    });
  }

  // Rule 2: Hydration drops > 15% in one scan → "hydration drop"
  // Calculate relative percent drop or absolute drop
  const hydrationDropPct = prev1.hydration > 0 ? ((prev1.hydration - latest.hydration) / prev1.hydration) * 100 : 0;
  if (hydrationDropPct >= 15 || (prev1.hydration - latest.hydration) >= 15) {
    flags.push("hydration drop");
    metricsSummary.push({
      metric: "hydration",
      description: `Skin hydration dropped by ${hydrationDropPct.toFixed(1)}% (from ${prev1.hydration.toFixed(1)}% to ${latest.hydration.toFixed(1)}%)`,
      currentValue: latest.hydration,
      previousValue: prev1.hydration,
      change: -(prev1.hydration - latest.hydration),
    });
  }

  // Rule 3: Redness increases > 10% over 2 consecutive scans → "redness trend"
  const rednessDelta1 = prev1.redness > 0 ? ((latest.redness - prev1.redness) / prev1.redness) * 100 : 0;
  if (prev2) {
    const rednessDelta2 = prev2.redness > 0 ? ((prev1.redness - prev2.redness) / prev2.redness) * 100 : 0;
    if (rednessDelta1 > 10 && rednessDelta2 > 10) {
      flags.push("redness trend");
      metricsSummary.push({
        metric: "redness",
        description: `Consecutive upward redness trend (+${rednessDelta2.toFixed(1)}% then +${rednessDelta1.toFixed(1)}%, currently ${latest.redness.toFixed(1)})`,
        currentValue: latest.redness,
        previousValue: prev1.redness,
        change: latest.redness - prev1.redness,
      });
    }
  } else if (rednessDelta1 >= 15) {
    // If only 2 scans exist, flag prominent single jump (>15%) as an emerging redness flare
    flags.push("redness trend");
    metricsSummary.push({
      metric: "redness",
      description: `Emerging redness spike (+${rednessDelta1.toFixed(1)}% from ${prev1.redness.toFixed(1)} to ${latest.redness.toFixed(1)})`,
      currentValue: latest.redness,
      previousValue: prev1.redness,
      change: latest.redness - prev1.redness,
    });
  }

  // Bonus inflection: Texture spike > 15%
  const textureDelta = prev1.texture > 0 ? ((latest.texture - prev1.texture) / prev1.texture) * 100 : 0;
  if (textureDelta >= 18) {
    flags.push("texture roughness spike");
    metricsSummary.push({
      metric: "texture",
      description: `Surface roughness increased by ${textureDelta.toFixed(1)}% (from ${prev1.texture.toFixed(1)} to ${latest.texture.toFixed(1)})`,
      currentValue: latest.texture,
      previousValue: prev1.texture,
      change: latest.texture - prev1.texture,
    });
  }

  return {
    hasFlag: flags.length > 0,
    flags,
    metricsSummary,
  };
}
