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
 * Evaluates the user's scan history and detects inflection points for BOTH skin and hair:
 * Facial Rules:
 * 1. Redness increases >10% over consecutive scans → "redness trend"
 * 2. Acne count increases by 3+ in one scan → "breakout cluster"
 * 3. Hydration drops >15% → "hydration drop"
 * 
 * Hair & Scalp Rules:
 * 4. Hair density drops >8% in consecutive scans → "hair density thinning"
 * 5. Scalp flaking spikes >20% → "scalp seborrheic flare"
 * 6. Daily shedding count jumps by >25 hairs → "acute telogen shedding"
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

  // Rule 3: Redness increases > 10% over consecutive scans → "redness trend"
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
    flags.push("redness trend");
    metricsSummary.push({
      metric: "redness",
      description: `Emerging redness spike (+${rednessDelta1.toFixed(1)}% from ${prev1.redness.toFixed(1)} to ${latest.redness.toFixed(1)})`,
      currentValue: latest.redness,
      previousValue: prev1.redness,
      change: latest.redness - prev1.redness,
    });
  }

  // Rule 4: Hair density thinning (drop > 8%)
  if (latest.hairDensity && prev1.hairDensity) {
    const densityDelta = ((prev1.hairDensity - latest.hairDensity) / prev1.hairDensity) * 100;
    if (densityDelta >= 8) {
      flags.push("hair density thinning");
      metricsSummary.push({
        metric: "hairDensity",
        description: `Follicle density index dropped by ${densityDelta.toFixed(1)}% (from ${prev1.hairDensity.toFixed(1)} to ${latest.hairDensity.toFixed(1)})`,
        currentValue: latest.hairDensity,
        previousValue: prev1.hairDensity,
        change: -densityDelta,
      });
    }
  }

  // Rule 5: Scalp flaking spike (> 20% increase)
  if (latest.scalpFlaking && prev1.scalpFlaking) {
    const flakingDelta = latest.scalpFlaking - prev1.scalpFlaking;
    if (flakingDelta >= 12 || (latest.scalpFlaking / prev1.scalpFlaking) >= 1.25) {
      flags.push("scalp seborrheic flare");
      metricsSummary.push({
        metric: "scalpFlaking",
        description: `Scalp flaking / dandruff index spiked from ${prev1.scalpFlaking.toFixed(1)} to ${latest.scalpFlaking.toFixed(1)}`,
        currentValue: latest.scalpFlaking,
        previousValue: prev1.scalpFlaking,
        change: flakingDelta,
      });
    }
  }

  // Rule 6: Acute hair shedding surge (> 25 hairs jump)
  if (latest.hairShedCount && prev1.hairShedCount) {
    const shedDelta = latest.hairShedCount - prev1.hairShedCount;
    if (shedDelta >= 25) {
      flags.push("acute telogen shedding");
      metricsSummary.push({
        metric: "hairShedCount",
        description: `Daily shedding estimate jumped by +${shedDelta} hairs (now ~${latest.hairShedCount}/day)`,
        currentValue: latest.hairShedCount,
        previousValue: prev1.hairShedCount,
        change: shedDelta,
      });
    }
  }

  return {
    hasFlag: flags.length > 0,
    flags,
    metricsSummary,
  };
}
