import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateDemoUser } from "@/lib/seed";

export async function GET() {
  try {
    const user = await getOrCreateDemoUser();

    const [scans, events, reports] = await Promise.all([
      prisma.scan.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      }),
      prisma.event.findMany({
        where: { userId: user.id },
        orderBy: { eventDate: "asc" },
      }),
      prisma.report.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      user,
      scans,
      events,
      reports,
    });
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
