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
    const scanType = (formData.get("scanType") as "facial" | "scalp_hair") || "facial";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Please upload an image file." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const filename = `scan-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);
    const imageRelativePath = `/uploads/${filename}`;

    // 1. Call YouCam Skin & Scalp Telemetry API
    const metrics = await callYouCamSkinAI(imageRelativePath, scanType);

    // 2. Save scan result to Database
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
      },
    });

    // 3. Pull user's last 6 scans
    const lastScansNewestFirst = await prisma.scan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    // 4. Compute week-over-week deltas & check skin/hair inflection rules
    const inflectionResult = detectInflections(lastScansNewestFirst);

    let createdReport = null;

    // 5. If flags triggered, generate tailored clinical report
    if (inflectionResult.hasFlag) {
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
        flags: inflectionResult.flags,
        recentScans: chronologicalScans,
        eventsInWindow,
      });

      createdReport = await prisma.report.create({
        data: {
          userId: user.id,
          reportType: scanType === "scalp_hair" ? "scalp_hair" : "facial",
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
