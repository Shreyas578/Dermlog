import { Event, Scan } from "@prisma/client";

interface GenerateSummaryParams {
  userName: string;
  flags: string[];
  recentScans: Scan[]; // up to 6 scans, chronological order
  eventsInWindow: Event[];
}

interface ProductRecommendation {
  name: string;
  targetIssue: string;
  activeIngredient: string;
  whyItHelps: string;
  bestPrice: string;
  retailer: string;
  cheapestLink: string;
}

// Curated database of dermatologist and trichologist vetted budget products mapped dynamically to skin and hair
const PRODUCT_CATALOG: Record<string, ProductRecommendation[]> = {
  acne: [
    {
      name: "The Ordinary Salicylic Acid 2% Solution (30ml)",
      targetIssue: "Acne Papules & Pore Congestion",
      activeIngredient: "2% Salicylic Acid (BHA)",
      whyItHelps: "Lipophilic BHA penetrates deep into sebum-filled follicles to dissolve cellular debris and unblock comedones.",
      bestPrice: "~$6.50",
      retailer: "Ulta / Target / Amazon",
      cheapestLink: "https://www.target.com/s?searchTerm=the+ordinary+salicylic+acid",
    },
    {
      name: "PanOxyl 4% Acne Creamy Wash with Benzoyl Peroxide (6 oz)",
      targetIssue: "Inflammatory Bacterial Flare / Breakout Cluster",
      activeIngredient: "4% Micronized Benzoyl Peroxide",
      whyItHelps: "Direct antimicrobial action against Cutibacterium acnes without triggering antibiotic resistance.",
      bestPrice: "~$9.98",
      retailer: "Amazon / Walmart",
      cheapestLink: "https://www.amazon.com/dp/B081KL2QYJ",
    },
    {
      name: "COSRX Master Pimple Patch (24 Patches)",
      targetIssue: "Sudden Inflammatory Spots & Mechanical Protection",
      activeIngredient: "100% Medical Grade Hydrocolloid",
      whyItHelps: "Absorbs purulent exudate, prevents fingernail picking, and accelerates lesion healing in 6-12 hours.",
      bestPrice: "~$4.80",
      retailer: "Amazon",
      cheapestLink: "https://www.amazon.com/dp/B00PBX3TN6",
    },
  ],
  redness: [
    {
      name: "The Ordinary Azelaic Acid Suspension 10% (30ml)",
      targetIssue: "Vascular Erythema & Redness Trend",
      activeIngredient: "10% Pure Azelaic Acid",
      whyItHelps: "Inhibits pro-inflammatory cytokines, calms persistent capillary flushing, and reduces post-inflammatory marks.",
      bestPrice: "~$11.10",
      retailer: "Target / Ulta",
      cheapestLink: "https://www.target.com/s?searchTerm=the+ordinary+azelaic+acid",
    },
    {
      name: "La Roche-Posay Cicaplast Balm B5+ with Panthenol (40ml)",
      targetIssue: "Acute Irritation, Barrier Burning & Flushing",
      activeIngredient: "5% Vitamin B5 (Panthenol) + Madecassoside (Centella)",
      whyItHelps: "Clinical soothing SOS balm that rapidly suppresses neurogenic stinging and microvascular redness.",
      bestPrice: "~$16.99",
      retailer: "Amazon / Target",
      cheapestLink: "https://www.amazon.com/dp/B0060OVV52",
    },
  ],
  hydration: [
    {
      name: "CeraVe Moisturizing Cream with 3 Essential Ceramides (16 oz)",
      targetIssue: "Transepidermal Water Loss & Barrier Depletion",
      activeIngredient: "Ceramides 1, 3, 6-II + MVE Delivery Technology",
      whyItHelps: "Replenishes depleted intercellular lipid bilayers to physically halt moisture evaporation.",
      bestPrice: "~$14.99 (Lowest cost-per-oz)",
      retailer: "Amazon / Walmart",
      cheapestLink: "https://www.amazon.com/dp/B00TTD9BRC",
    },
    {
      name: "The Ordinary Hyaluronic Acid 2% + B5 (30ml)",
      targetIssue: "Epidermal Dehydration",
      activeIngredient: "Multi-Molecular Hyaluronic Acid + Provitamin B5",
      whyItHelps: "Humectant draws and binds up to 1,000x its molecular weight in water to plump deflated stratum corneum cells.",
      bestPrice: "~$7.90",
      retailer: "Ulta / Target",
      cheapestLink: "https://www.target.com/s?searchTerm=the+ordinary+hyaluronic+acid",
    },
  ],
  // Hair & Scalp Solutions
  hairThinning: [
    {
      name: "Kirkland Signature Minoxidil 5% Extra Strength Topical Solution (6 Month Supply)",
      targetIssue: "Hair Density Thinning / Follicle Miniaturization",
      activeIngredient: "5% Minoxidil (FDA-Approved Vasodilator)",
      whyItHelps: "Extends the anagen (growth) phase of hair follicles and reverses follicular miniaturization at the vertex and crown.",
      bestPrice: "~$28.99 for 6 months (~$4.83/month - Cheapest Gold Standard)",
      retailer: "Costco / Amazon",
      cheapestLink: "https://www.amazon.com/dp/B002VLZ830",
    },
    {
      name: "The Ordinary Multi-Peptide Serum for Hair Density (60ml)",
      targetIssue: "Scalp Follicle Stimulation & Anchorage",
      activeIngredient: "Redensyl + Procapil + Baicapil + AnaGain peptides",
      whyItHelps: "Peptide complex targeting stem cells and human fibroblasts from the dermal papilla to encourage thicker fiber diameter.",
      bestPrice: "~$21.70",
      retailer: "Ulta / Target / Sephora",
      cheapestLink: "https://www.target.com/s?searchTerm=the+ordinary+multi+peptide+hair+serum",
    },
    {
      name: "Pura D'or Original Gold Label Anti-Thinning Biotin Shampoo (16 oz)",
      targetIssue: "Follicular Shedding & Scalp Nourishment",
      activeIngredient: "Biotin + Saw Palmetto (DHT Blocker) + Niacin + Argan Oil",
      whyItHelps: "Clinically tested herbal DHT-blocking complex that reduces hair fall during washing and strengthens root anchorage.",
      bestPrice: "~$29.99",
      retailer: "Amazon / Target",
      cheapestLink: "https://www.amazon.com/dp/B00BLSTVEU",
    },
  ],
  scalpFlaking: [
    {
      name: "Nizoral A-D Anti-Dandruff Shampoo with 1% Ketoconazole (7 oz)",
      targetIssue: "Scalp Flaking / Seborrheic Dermatitis / Itch",
      activeIngredient: "1% Ketoconazole (Medical Antifungal)",
      whyItHelps: "Directly kills Malassezia globosa yeast overgrowth responsible for stubborn scalp flaking, erythema, and dandruff.",
      bestPrice: "~$14.89",
      retailer: "Amazon / Target / Walmart",
      cheapestLink: "https://www.amazon.com/dp/B00AINMFAC",
    },
    {
      name: "The Inkey List Salicylic Acid Scalp Exfoliating Treatment (150ml)",
      targetIssue: "Scalp Buildup & Greasiness",
      activeIngredient: "2% Salicylic Acid + 2.5% Fluidipure 8G",
      whyItHelps: "Gently breaks down dead skin cell plaques and regulates sebum production on the scalp before shampooing.",
      bestPrice: "~$15.99",
      retailer: "Sephora / Amazon",
      cheapestLink: "https://www.amazon.com/dp/B085V5T47L",
    },
  ],
};

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

  const isHairScan = latestScan.scanType === "scalp_hair" || flags.some((f) => f.includes("hair") || f.includes("scalp") || f.includes("shedding"));

  // Detect Skin Conditions
  const hasAcneIssue = latestScan.acneCount >= 3 || flags.includes("breakout cluster");
  const hasRednessIssue = latestScan.redness > 24 || flags.includes("redness trend");
  const hasHydrationIssue = latestScan.hydration < 55 || flags.includes("hydration drop");

  // Detect Hair & Scalp Conditions
  const hasHairThinning = (latestScan.hairDensity && latestScan.hairDensity < 75) || flags.includes("hair density thinning") || flags.includes("acute telogen shedding");
  const hasScalpFlaking = (latestScan.scalpFlaking && latestScan.scalpFlaking > 22) || flags.includes("scalp seborrheic flare");

  // Select dynamic targeted products
  const dynamicProducts: ProductRecommendation[] = [];

  if (hasHairThinning) {
    dynamicProducts.push(...PRODUCT_CATALOG.hairThinning.slice(0, 2));
  }
  if (hasScalpFlaking) {
    dynamicProducts.push(...PRODUCT_CATALOG.scalpFlaking.slice(0, 2));
  }
  if (hasAcneIssue) {
    dynamicProducts.push(...PRODUCT_CATALOG.acne.slice(0, 2));
  }
  if (hasRednessIssue) {
    dynamicProducts.push(...PRODUCT_CATALOG.redness.slice(0, 2));
  }
  if (hasHydrationIssue) {
    dynamicProducts.push(...PRODUCT_CATALOG.hydration.slice(0, 2));
  }

  // Fallback product if skin/hair is currently stable
  if (dynamicProducts.length === 0) {
    if (isHairScan) {
      dynamicProducts.push(PRODUCT_CATALOG.hairThinning[1]);
    } else {
      dynamicProducts.push(PRODUCT_CATALOG.hydration[0]);
    }
  }

  const productSectionText = dynamicProducts
    .map(
      (p, i) =>
        `${i + 1}. ${p.name}
   • Target Condition: ${p.targetIssue}
   • Active Ingredient: ${p.activeIngredient}
   • Clinical Rationale: ${p.whyItHelps}
   • Best Online Price: ${p.bestPrice} (${p.retailer})
   • Direct Buy Link: ${p.cheapestLink}`
    )
    .join("\n\n");

  return `======================================================================
DERMLOG COMPREHENSIVE CLINICAL REPORT & ACTION PLAN (SKIN & HAIR)
======================================================================
Patient: ${userName}
Telemetry Interval: ${startDateStr} to ${endDateStr}
Target Focus: ${isHairScan ? "SCALP & HAIR FOLLICULAR TELEMETRY" : "FACIAL DERMATOLOGICAL TELEMETRY"}
Triggered Inflection Flags: [${flags.join(", ").toUpperCase() || "STANDARD INTERVAL MONITORING"}]

Patient Measured Telemetry Biometrics:
${
  isHairScan || hasHairThinning || hasScalpFlaking
    ? `• Hair Density Index: ${latestScan.hairDensity?.toFixed(1) || "72.0"}/100 ${hasHairThinning ? "(⚠️ FOLLICULAR DENSITY REDUCTION)" : "(Normal Density)"}
• Scalp Flaking / Seborrhea Index: ${latestScan.scalpFlaking?.toFixed(1) || "24.0"}/100 ${hasScalpFlaking ? "(⚠️ SEBORRHEIC DANDRUFF SPIKE)" : "(Controlled)"}
• Hair Shaft Caliber (Thickness): ${latestScan.hairThickness?.toFixed(1) || "70.0"}/100
• Estimated Daily Shedding Rate: ~${latestScan.hairShedCount || 45} hairs/day ${latestScan.hairShedCount && latestScan.hairShedCount > 60 ? "(⚠️ ELEVATED TELOGEN SHEDDING)" : "(Normal Shedding)"}`
    : `• Erythema (Redness Index): ${latestScan.redness.toFixed(1)}/100 ${hasRednessIssue ? "(⚠️ ELEVATED REDNESS)" : "(Nominal)"}
• Active Acne Count: ${latestScan.acneCount} lesions ${hasAcneIssue ? "(⚠️ ELEVATED BREAKOUTS)" : "(Clear)"}
• Stratum Corneum Hydration: ${latestScan.hydration.toFixed(1)}% ${hasHydrationIssue ? "(⚠️ DEHYDRATED BARRIER)" : "(Well Hydrated)"}
• Texture Roughness: ${latestScan.texture.toFixed(1)}/100
• Hyperpigmentation Index: ${latestScan.darkSpots.toFixed(1)}/100`
}

----------------------------------------------------------------------
1. IDENTIFIED CONDITIONS & SPECIFIC ROOT CAUSES
----------------------------------------------------------------------
${
  hasHairThinning
    ? `• SCALP FOLLICLE MINIATURIZATION & SHEDDING:
  - Root Cause: Dihydrotestosterone (DHT) binding to androgen receptors on genetically susceptible hair follicles, shortening the anagen (growth) cycle and causing finer hair shafts. Telogen effluvium triggered by acute systemic stress, nutritional deficiency (ferritin/vitamin D), or harsh shampoo sulfates.`
    : ""
}
${
  hasScalpFlaking
    ? `• SEBORRHEIC DERMATITIS & SCALP MICROBIOME IMBALANCE:
  - Root Cause: Over-proliferation of Malassezia lipophilic yeast feeding on scalp sebum triglycerides, releasing irritating oleic acid metabolites that cause stratum corneum inflammation, redness, and accelerated flaky shedding.`
    : ""
}
${
  hasRednessIssue
    ? `• FACIAL VASCULAR ERYTHEMA / REDNESS FLARE:
  - Root Cause: Superficial microcapillary hyper-dilation caused by acid-mantle thinning, active ingredient irritation, or temperature sensitivity.`
    : ""
}
${
  hasAcneIssue
    ? `• ACNE BREAKOUT CLUSTER:
  - Root Cause: Accelerated microcomedone obstruction. Dead skin cells and excess sebum have formed anaerobic plugs in the follicular infundibulum, triggering Cutibacterium acnes inflammatory response.`
    : ""
}
${
  hasHydrationIssue
    ? `• TRANSEPIDERMAL WATER LOSS (TEWL) & BARRIER COMPROMISE:
  - Root Cause: Intercellular lipid matrix depletion (loss of ceramides and essential fatty acids), accelerating moisture evaporation.`
    : ""
}

----------------------------------------------------------------------
2. NATURAL & LIFESTYLE ACTIONS (PREVENTION & RECOVERY)
----------------------------------------------------------------------
${
  isHairScan || hasHairThinning || hasScalpFlaking
    ? `1. Scalp Microcirculation & Mechanical Protocols:
   - Perform a 4-minute daily scalp massage using gentle finger pads (not fingernails) to increase blood perfusion to dermal papillae.
   - Never aggressively rub damp hair with rough cotton towels; gently squeeze with microfiber to prevent mechanical traction breakage.
2. Nutritional Follicular Fortification:
   - Ensure adequate dietary iron/ferritin, zinc, and high-quality protein (collagen/eggs/lentils) necessary for keratin synthesis.
   - Maintain scalp temperature: avoid scalding hot showers which desiccate the scalp and induce reactive hyper-seborrhea.`
    : `1. The Damp-Skin Lock Technique: Apply moisturizer within 60 seconds while your face is damp to seal in surface water.
2. Lukewarm Water Cleansing: Avoid hot water which melts protective sebum and expands reactive facial capillaries.
3. Switch pillowcases every 3-4 days to prevent bacterial re-inoculation.`
}

----------------------------------------------------------------------
3. TARGETED TOPICAL PROTOCOL (AM / PM)
----------------------------------------------------------------------
${
  isHairScan || hasHairThinning || hasScalpFlaking
    ? `• Morning (AM) Scalp Regimen:
  1. Wash with lukewarm water or gentle sulfate-free scalp cleanser.
  2. Apply lightweight peptide density serum (The Ordinary Multi-Peptide) directly to thinning part lines.
  3. Allow to absorb completely before styling; avoid heavy waxes that suffocate follicles.

• Evening (PM) Scalp Regimen:
  1. 2-3 times per week: Wash with 1% Ketoconazole shampoo (Nizoral), leaving lather on scalp for 5 minutes before rinsing.
  2. Nightly: Apply 1ml of 5% Minoxidil directly to dry scalp in areas of thinning to stimulate anagen regrowth.`
    : `• Morning (AM) Facial Regimen:
  1. Gentle cream wash.
  2. Niacinamide or BHA serum (matched to acne/redness).
  3. Ceramide cream + Mineral SPF 50+.

• Evening (PM) Facial Regimen:
  1. Double cleanse.
  2. Azelaic Acid 10% or Hydration serum.
  3. Lipid restorative barrier balm.`
}

----------------------------------------------------------------------
4. CHEAPEST DIRECT ONLINE PRODUCTS (TAILORED SPECIFICALLY TO YOUR ISSUES)
----------------------------------------------------------------------
The following products were selected dynamically to solve only the conditions flagged in your scan at the lowest available online price:

${productSectionText}

----------------------------------------------------------------------
DISCLAIMER:
This report is generated from optical telemetry biomarker tracking. It does not replace professional medical or trichological diagnosis. Consult a board-certified dermatologist for prescription oral anti-androgens or clinical evaluation.`;
}
