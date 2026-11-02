export interface SkinAndHairMetrics {
  // Facial metrics
  redness: number;    // 0 - 100
  texture: number;    // 0 - 100
  acne_count: number; // integer 0 - 50
  hydration: number;  // 0 - 100
  darkSpots: number;  // 0 - 100

  // Hair & Scalp metrics
  hairDensity: number;    // 0 - 100 (follicles / cm²)
  scalpFlaking: number;   // 0 - 100 (dandruff / seborrheic index)
  hairThickness: number;  // 0 - 100 (shaft caliber / miniaturization)
  hairShedCount: number;  // integer (daily shed count)
}

/**
 * Call YouCam Skin & Scalp AI Telemetry API
 * 
 * TODO: Replace with real YouCam Skin & Scalp API endpoint:
 * ```ts
 * const formData = new FormData();
 * formData.append('image', fs.createReadStream(imagePath));
 * formData.append('target', scanType); // 'facial' or 'scalp_hair'
 * const response = await fetch('https://api.perfectcorp.com/skin-ai/v1/analyze', {
 *   method: 'POST',
 *   headers: { 'Authorization': `Bearer ${process.env.YOUCAM_API_KEY}` },
 *   body: formData
 * });
 * return await response.json();
 * ```
 */
export async function callYouCamSkinAI(
  _imagePath: string,
  scanType: "facial" | "scalp_hair" = "facial"
): Promise<SkinAndHairMetrics> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (scanType === "scalp_hair") {
    // Plausible scalp & hair telemetry
    const hairDensity = 68 + Math.floor(Math.random() * 20); // 68 - 88
    const scalpFlaking = 18 + Math.floor(Math.random() * 18); // 18 - 36
    const hairThickness = 65 + Math.floor(Math.random() * 20); // 65 - 85
    const hairShedCount = 35 + Math.floor(Math.random() * 30); // 35 - 65 hairs/day

    return {
      redness: 18 + Math.floor(Math.random() * 10),
      texture: 25 + Math.floor(Math.random() * 10),
      acne_count: 0,
      hydration: 55 + Math.floor(Math.random() * 15),
      darkSpots: 10,
      hairDensity: Math.max(0, Math.min(100, hairDensity)),
      scalpFlaking: Math.max(0, Math.min(100, scalpFlaking)),
      hairThickness: Math.max(0, Math.min(100, hairThickness)),
      hairShedCount: Math.max(0, hairShedCount),
    };
  }

  // Facial telemetry
  const redness = 22 + Math.floor(Math.random() * 12);
  const texture = 32 + Math.floor(Math.random() * 10);
  const acne_count = 2 + Math.floor(Math.random() * 4);
  const hydration = 60 + Math.floor(Math.random() * 12);
  const darkSpots = 16 + Math.floor(Math.random() * 6);

  return {
    redness: Math.max(0, Math.min(100, redness)),
    texture: Math.max(0, Math.min(100, texture)),
    acne_count: Math.max(0, acne_count),
    hydration: Math.max(0, Math.min(100, hydration)),
    darkSpots: Math.max(0, Math.min(100, darkSpots)),
    hairDensity: 80,
    scalpFlaking: 15,
    hairThickness: 75,
    hairShedCount: 30,
  };
}
