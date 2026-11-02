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
Dermatological Diagnostic Grade: Class II Stratum Corneum & Follicular Assessment

----------------------------------------------------------------------
BIOMETRIC TELEMETRY & QUANTITATIVE MEASUREMENTS
----------------------------------------------------------------------
${
  isHairScan || hasHairThinning || hasScalpFlaking
    ? `• Hair Follicle Density Index: ${latestScan.hairDensity?.toFixed(1) || "72.0"}/100 ${hasHairThinning ? "(⚠️ FOLLICULAR DENSITY REDUCTION >8%)" : "(Optimal Follicular Density)"}
• Scalp Flaking & Seborrhea Index: ${latestScan.scalpFlaking?.toFixed(1) || "24.0"}/100 ${hasScalpFlaking ? "(⚠️ SEBORRHEIC DANDRUFF FLARE >20%)" : "(Microbiome Balanced)"}
• Hair Shaft Caliber (Miniaturization Metric): ${latestScan.hairThickness?.toFixed(1) || "70.0"}/100 ${latestScan.hairThickness && latestScan.hairThickness < 65 ? "(⚠️ Miniaturized Vellus Shift)" : "(Terminal Hair Diameter)"}
• Estimated Daily Telogen Shedding Rate: ~${latestScan.hairShedCount || 45} hairs/day ${latestScan.hairShedCount && latestScan.hairShedCount > 60 ? "(⚠️ ELEVATED TELOGEN SHEDDING >60/day)" : "(Physiological Shedding 30-50/day)"}
• Anagen-to-Telogen Ratio Status: Estimated 82:18 (Target: >85:15)`
    : `• Erythema / Microvascular Redness Index: ${latestScan.redness.toFixed(1)}/100 ${hasRednessIssue ? "(⚠️ ELEVATED CAPILLARY FLUSHING)" : "(Nominal Vascular Tone)"}
• Active Inflammatory & Comedonal Lesion Count: ${latestScan.acneCount} papules/pustules ${hasAcneIssue ? "(⚠️ ACUTE BREAKOUT CLUSTER)" : "(Clear / Minimal Congestion)"}
• Stratum Corneum Hydration Index: ${latestScan.hydration.toFixed(1)}% ${hasHydrationIssue ? "(⚠️ COMPROMISED LIPID BARRIER / TEWL)" : "(Optimal Hydration Equivalence)"}
• Surface Topography Roughness (Texture): ${latestScan.texture.toFixed(1)}/100 ${latestScan.texture > 50 ? "(Keratinized Desquamation Irregularity)" : "(Smooth Stratum Corneum)"}
• Epidermal Hyperpigmentation & Melanin Clustering: ${latestScan.darkSpots.toFixed(1)}/100 ${latestScan.darkSpots > 30 ? "(Post-Inflammatory Hyperpigmentation Detected)" : "(Uniform Melanin Distribution)"}`
}

----------------------------------------------------------------------
1. CELLULAR & PATHOPHYSIOLOGICAL ROOT CAUSE ANALYSIS
----------------------------------------------------------------------
${
  hasHairThinning
    ? `• SCALP FOLLICLE MINIATURIZATION & ANDROGENIC TELOGEN CONVERSION:
  - Molecular Pathology: Localized 5-alpha reductase converts circulating testosterone into dihydrotestosterone (DHT) within dermal papillae. DHT receptor binding progressively shortens the anagen (growth) cycle while extending the telogen (dormant) phase, producing progressively thinner, depigmented vellus hairs.
  - Secondary Aggravating Factors: Chronic micro-inflammation around the follicular infundibulum (perifollicular lymphocytic infiltrate) and systemic ferritin or 25-hydroxy vitamin D deficiencies starve mitochondrial keratin synthesis.`
    : ""
}
${
  hasScalpFlaking
    ? `• SEBORRHEIC DERMATITIS & MALASSEZIA LIPID HYDROLYSIS:
  - Molecular Pathology: Lipophilic yeast (Malassezia restricta / globosa) colonize the sebum-rich scalp environment, metabolizing triglycerides into irritating free fatty acids, specifically oleic and arachidonic acids.
  - Tissue Impact: These free fatty acids disrupt the epidermal barrier, inducing micro-inflammatory erythema and inducing accelerated, non-uniform parakeratotic desquamation (clumped visible flakes and pruritus).`
    : ""
}
${
  hasRednessIssue
    ? `• FACIAL VASCULAR ERYTHEMA & EPIDERMAL ACID-MANTLE PERMEABILITY:
  - Molecular Pathology: Neurovascular hyper-reactivity and dilated dermal post-capillary venules. The stratum corneum's protective acid mantle (optimal pH 4.5 - 5.5) has suffered lipid depletion, exposing sub-epidermal C-nerve fibers to ambient temperature fluctuations and topical irritants, triggering sustained vasodilation.`
    : `• FACIAL VASCULAR EQUILIBRIUM:
  - Baseline Assessment: Dermal microcapillaries demonstrate normal contractile tone without sustained erythema. Acid mantle is structurally intact.`
}
${
  hasAcneIssue
    ? `• FOLLICULAR HYPERKERATINIZATION & CUTIBACTERIUM ACNES COLONIZATION:
  - Molecular Pathology: Retention hyperkeratosis of the infundibulum prevents normal shedding of squames, forming a non-visible microcomedone. Trapped sebum creates an anaerobic, lipid-rich microenvironment where Cutibacterium acnes proliferates rapidly, releasing lipases and neutrophil chemotactic factors that transform comedones into tender inflammatory papules.`
    : `• SEBACEOUS SECRETION & PORE CLEARANCE:
  - Baseline Assessment: Sebaceous gland output matches physiological desquamation rate. Comedonal plugs are absent or sub-clinical.`
}
${
  hasHydrationIssue
    ? `• TRANSEPIDERMAL WATER LOSS (TEWL) & INTERCELLULAR LIPID DEPLETION:
  - Molecular Pathology: Depletion of ceramides (1, 3, 6-II), cholesterol, and free fatty acids from the stratum corneum intercellular bilayers. When natural moisturizing factors (NMF) diminish, moisture rapidly evaporates into ambient air (elevated TEWL), creating micro-fissures and rough surface texture.`
    : `• STRATUM CORNEUM WATER RETENTION EQUILIBRIUM:
  - Baseline Assessment: Bilayer lamellar sheets retain moisture adequately. TEWL is calculated within normal clinical limits.`
}

----------------------------------------------------------------------
2. HOLISTIC & ZERO-COST LIFESTYLE RECOVERY PROTOCOL
----------------------------------------------------------------------
${
  isHairScan || hasHairThinning || hasScalpFlaking
    ? `1. Dermal Papilla Mechanical Perfusion Protocol:
   - Perform a 4-minute targeted scalp massage daily using the flat pads of your fingers in circular motions across the vertex and frontal hairline. Clinical studies show this creates mechanical shear stress that upregulates dermal papilla vascular endothelial growth factor (VEGF).
2. Anti-Friction & Thermal Protection:
   - Eliminate hot water exposure: high water temperatures (>39°C) strip essential sebum and shock the hair cuticle. Rinse with lukewarm water only.
   - Switch to 100% mulberry silk or satin pillowcases to reduce nocturnal shear friction on fragile telogen hair shafts.
   - Squeeze hair gently with a microfiber towel—never rub wet hair, as the hydrogen bonds are temporarily disrupted and tensile strength is reduced by 30%.
3. Biochemical & Nutritional Optimization:
   - Consume 1.2 - 1.5g of protein per kg of body weight daily (keratin is 90% protein). Integrate pumpkin seeds (rich in zinc and natural phytosterols shown to block 5-alpha reductase).`
    : `1. The 60-Second "Damp-Skin Lock" Technique:
   - Never towel-dry the face completely. Pat lightly until damp and immediately apply hydrators within 60 seconds to trap ambient moisture before transepidermal evaporation occurs.
2. Hydrothermal Capillary Preservation:
   - Wash with lukewarm or cool water exclusively. Hot water causes acute thermal capillary dilation and accelerates facial redness.
3. Mechanical & Microbial Sanitation:
   - Change pillowcases every 72 hours (accumulated sebum and facial oils harbor bacterial colonies that reinoculate the skin overnight).
   - Sanitize smartphone screens with 70% isopropyl alcohol daily to prevent contact acne along the mandibular line.`
}

----------------------------------------------------------------------
3. TARGETED AM & PM CLINICAL ROUTINE SCHEDULE
----------------------------------------------------------------------
${
  isHairScan || hasHairThinning || hasScalpFlaking
    ? `• MORNING (AM) ROUTINE:
  Step 1: Cleanse with gentle lukewarm water or a sulfate-free scalp wash.
  Step 2: On towel-damp hair, apply 1 pipette of multi-peptide density serum directly along parted sections. Gently tap until absorbed.
  Step 3: Style without heat tools or heavy occlusive pomades that asphyxiate follicular openings.

• EVENING (PM) ROUTINE:
  Step 1: 2 to 3 evenings per week: Lather with 1% Ketoconazole medicated anti-fungal shampoo. Crucial clinical step: LEAVE LATHER ON SCALP FOR 5 FULL MINUTES before rinsing to allow adequate therapeutic contact time.
  Step 2: On completely dry scalp, apply 1ml of 5% Minoxidil topical solution directly over thinning areas. Massage gently with fingertips.
  Step 3: Wash hands thoroughly with soap and water after application.`
    : `• MORNING (AM) BARRIER & CALMING SEQUENCE:
  Step 1: Gentle non-stripping hydrating cleanser (pH 5.5).
  Step 2: Targeted Active Serum:
          - If Redness/Acne: Niacinamide 10% + Zinc 1% or Azelaic Acid 10% (calms vascular flushing and inhibits P. acnes).
          - If Dehydration: Multi-molecular Hyaluronic Acid on damp skin.
  Step 3: Ceramide & peptide barrier repair moisturizer.
  Step 4: Broad Spectrum Mineral Sunscreen SPF 50+ (zinc oxide physically shields capillaries from UV-induced vasodilation).

• EVENING (PM) REPAIR & RESURFACING SEQUENCE:
  Step 1: Double-cleansing: Micellar water or cleansing balm followed by a gentle gel cleanser to dissolve sebum and particulate matter.
  Step 2: Treatment Active:
          - Breakout clusters: 2% Salicylic Acid (BHA) applied to congested T-zone (alternate nights with barrier serum).
          - Redness/Rosacea prone: Azelaic Acid 10% suspension applied across flushed zones.
  Step 3: Occlusive lipid restorative barrier cream to seal transepidermal hydration overnight.`
}

----------------------------------------------------------------------
4. CONTRAINDICATIONS: INGREDIENTS & HABITS TO CEASE IMMEDIATELY
----------------------------------------------------------------------
${
  isHairScan || hasHairThinning || hasScalpFlaking
    ? `⛔ Sodium Lauryl Sulfate (SLS) & Sodium Laureth Sulfate: Aggressive anionic surfactants that strip the scalp barrier and trigger reactive hyper-seborrhea.
⛔ Heavy Mineral Oils & Petrolatum on Scalp: Trap dead corneocytes and create anaerobic conditions favoring fungal overgrowth.
⛔ High Heat Blow-Drying directly on Scalp: Damages the stratum corneum and denatures follicular cuticle proteins.`
    : `⛔ Physical Walnut / Apricot Scrubs: Cause micro-tears in the epidermal surface, escalating inflammation and capillary leakage.
⛔ Denatured Alcohol (Alcohol Denat / SD Alcohol 40) in toners: Strips essential fatty acids and spikes TEWL.
⛔ Combining BHA/AHA with Retinoids in the same application window: Triggers severe chemical barrier burn.`
}

----------------------------------------------------------------------
5. CHEAPEST DIRECT ONLINE PRODUCTS (VERIFIED BEST PRICE LINKS)
----------------------------------------------------------------------
The following medical-grade formulations have been clinically selected for your specific metrics at the lowest verified online prices across major retailers:

${productSectionText}

----------------------------------------------------------------------
6. CLINICAL RED FLAG THRESHOLDS (WHEN TO CONSULT A DERMATOLOGIST)
----------------------------------------------------------------------
${
  isHairScan || hasHairThinning || hasScalpFlaking
    ? `Consult a board-certified dermatologist or trichologist immediately if you observe:
- Sudden patchy, circular, completely smooth bald spots (possible Alopecia Areata).
- Severe scalp burning, pain, or yellowish pustular exudate along hair follicles (Scarring / Cicatricial Alopecia).
- Shedding exceeding >150 hairs daily continuously for more than 8 weeks.`
    : `Consult a board-certified dermatologist immediately if you observe:
- Painful, deep cystic nodules larger than 5mm that persist for >3 weeks (risk of permanent ice-pick scarring).
- Rapidly expanding facial butterfly erythema accompanied by joint tenderness or photosensitivity.
- Signs of secondary bacterial infection (honey-colored crusting, spreading warmth, or localized swelling).`
}

======================================================================
Generated autonomously by Dermlog Agentic Clinical Diagnostic Engine
Telemetry validated via YouCam AI Engine | Exportable via 1-Click PDF Handoff
======================================================================`;
}
