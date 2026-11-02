export interface YouCamSkinMetrics {
  redness: number;    // 0 - 100
  texture: number;    // 0 - 100
  acne_count: number; // integer 0 - 50
  hydration: number;  // 0 - 100
  dark_spots: number; // 0 - 100
}

/**
 * Call YouCam Skin AI API (Mocked for 72-hour Hackathon Demo)
 * 
 * TODO: Replace with real YouCam Skin AI API call:
 * ```ts
 * const formData = new FormData();
 * formData.append('image', fs.createReadStream(imagePath));
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
  presetMode?: "normal" | "breakout_flare" | "dryness_flare" | "redness_flare"
): Promise<YouCamSkinMetrics> {
  // Simulate network latency for API call
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Plausible default ranges
  let redness = 22 + Math.floor(Math.random() * 8);
  let texture = 35 + Math.floor(Math.random() * 10);
  let acne_count = 2 + Math.floor(Math.random() * 3);
  let hydration = 65 + Math.floor(Math.random() * 10);
  let dark_spots = 18 + Math.floor(Math.random() * 6);

  // Allow presets for demoing inflection detection easily during pitch
  if (presetMode === "breakout_flare") {
    acne_count += 5; // Triggers "breakout cluster" (>3 increase)
    redness += 14;
  } else if (presetMode === "redness_flare") {
    redness += 18; // Triggers redness trend (>10%)
    texture += 8;
  } else if (presetMode === "dryness_flare") {
    hydration -= 22; // Triggers hydration drop (>15% drop)
    texture += 12;
  }

  return {
    redness: Math.max(0, Math.min(100, redness)),
    texture: Math.max(0, Math.min(100, texture)),
    acne_count: Math.max(0, acne_count),
    hydration: Math.max(0, Math.min(100, hydration)),
    dark_spots: Math.max(0, Math.min(100, dark_spots)),
  };
}
