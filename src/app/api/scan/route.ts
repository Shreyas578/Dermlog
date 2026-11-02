import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateDemoUser } from "@/lib/seed";
import { callYouCamSkinAI } from "@/lib/youcam";
import { detectInflections } from "@/lib/inflection";
import { generateClinicalSummary } from "@/lib/ai";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDemoUser();
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const presetMode = formData.get("presetMode") as any; // normal, breakout_flare, dryness_flare, redness_flare

    let imageRelativePath = "/uploads/selfie-default.jpg";

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filename = `scan-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, buffer);
      imageRelativePath = `/uploads/${filename}`;
    }

    // 1. Call YouCam Skin AI API (Mocked with demo-tuning presets)
    const metrics = await callYouCamSkinAI(imageRelativePath, presetMode);

    // 2. Save scan result to database
    const scan = await prisma.scan.create({
      data: {
        userId: user.id,
        imagePath: imageRelativePath,
        redness: metrics.redness,
        texture: metrics.texture,
        acneCount: metrics.acne_count,
        hydration: metrics.hydration,
        darkSpots: metrics.dark_spots,
      },
    });

    // 3. CORE AGENTIC FEATURE: Pull last 6 scans from database (newest first)
    const lastScansNewestFirst = await prisma.scan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    // 4. Compute week-over-week deltas and check inflection rules
    const inflectionResult = detectInflections(lastScansNewestFirst);

    let createdReport = null;

    // 5. If flags triggered, build prompt with events in window and generate AI summary
    if (inflectionResult.hasFlag) {
      const earliestScan = lastScansNewestFirst[lastScansNewestFirst.length - 1];
      const latestScan = lastScansNewestFirst[0];

      // Pull events within the telemetric window
      const eventsInWindow = await prisma.event.findMany({
        where: {
          userId: user.id,
          eventDate: {
            gte: earliestScan.createdAt,
            lte: latestScan.createdAt,
          },
        },
        orderBy: { eventDate: "asc" },
      });

      // Chronological order for AI reasoning context
      const chronologicalScans = [...lastScansNewestFirst].reverse();

      const summaryText = await generateClinicalSummary({
        userName: user.name,
        flags: inflectionResult.flags,
        recentScans: chronologicalScans,
        eventsInWindow,
      });

      // Save summary in reports table
      createdReport = await prisma.report.create({
        data: {
          userId: user.id,
          summaryText,
          flaggedMetrics: JSON.stringify(inflectionResult.flags),
          dateRangeStart: earliestScan.createdAt,
          dateRangeEnd: latestScan.createdAt,
        },
      });
    }

    return NextResponse.json({
      success: true,
      scan,
      inflectionResult,
      report: createdReport,
    });
  } catch (error) {
    console.error("Scan processing error:", error);
    return NextResponse.json({ error: "Failed to process scan" }, { status: 500 });
  }
}
