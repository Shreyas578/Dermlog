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
    const files = formData.getAll("images") as File[];
    const singleFile = formData.get("image") as File | null;
    const scanType = (formData.get("scanType") as "facial" | "scalp_hair") || "facial";

    // Support both single file and multi-file batch uploads
    const filesToProcess = files.length > 0 ? files : (singleFile ? [singleFile] : []);

    if (filesToProcess.length === 0 || filesToProcess[0].size === 0) {
      return NextResponse.json({ error: "Please upload at least one image file." }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const processedScans = [];

    // Process all uploaded images sequentially to compute rolling timeline
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `scan-${Date.now()}-${i}-${file.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, buffer);
      const imageRelativePath = `/uploads/${filename}`;

      // Call YouCam Skin & Scalp Telemetry API
      const metrics = await callYouCamSkinAI(imageRelativePath, scanType);

      // Create scan entry (spaced out chronologically by week if batch uploaded)
      const scanDate = new Date(Date.now() - (filesToProcess.length - 1 - i) * 7 * 24 * 60 * 60 * 1000);

      const scan = await prisma.scan.create({
        data: {
          userId: user.id,
          scanType,
          imagePath: imageRelativePath,
          redness: metrics.redness,
          texture: metrics.texture,
          acneCount: metrics.acne_count,
          hydration: metrics.hydration,
          darkSpots: metrics.darkSpots,
          hairDensity: metrics.hairDensity,
          scalpFlaking: metrics.scalpFlaking,
          hairThickness: metrics.hairThickness,
          hairShedCount: metrics.hairShedCount,
          createdAt: scanDate,
        },
      });

      processedScans.push(scan);
    }

    // Pull last 6 scans to evaluate inflection rules
    const lastScansNewestFirst = await prisma.scan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    // Detect week-over-week deltas and inflections
    const inflectionResult = detectInflections(lastScansNewestFirst);

    // If inflection flags were triggered, generate anomaly report.
    // If it's a first scan/baseline or normal scan, generate a comprehensive baseline clinical analysis report so the user always receives full documentation & product links!
    const earliestScan = lastScansNewestFirst[lastScansNewestFirst.length - 1];
    const latestScan = lastScansNewestFirst[0];

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

    const chronologicalScans = [...lastScansNewestFirst].reverse();

    const summaryText = await generateClinicalSummary({
      userName: user.name,
      flags: inflectionResult.hasFlag ? inflectionResult.flags : ["baseline assessment"],
      recentScans: chronologicalScans,
      eventsInWindow,
    });

    const createdReport = await prisma.report.create({
      data: {
        userId: user.id,
        reportType: scanType === "scalp_hair" ? "scalp_hair" : "facial",
        summaryText,
        flaggedMetrics: JSON.stringify(inflectionResult.hasFlag ? inflectionResult.flags : ["baseline assessment"]),
        dateRangeStart: earliestScan.createdAt,
        dateRangeEnd: latestScan.createdAt,
      },
    });

    return NextResponse.json({
      success: true,
      scans: processedScans,
      scan: processedScans[processedScans.length - 1],
      totalUploaded: processedScans.length,
      inflectionResult,
      report: createdReport,
    });
  } catch (error) {
    console.error("Scan processing error:", error);
    return NextResponse.json({ error: "Failed to process scan" }, { status: 500 });
  }
}
