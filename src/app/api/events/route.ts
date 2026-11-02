import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateDemoUser } from "@/lib/seed";

export async function GET() {
  try {
    const user = await getOrCreateDemoUser();
    const events = await prisma.event.findMany({
      where: { userId: user.id },
      orderBy: { eventDate: "desc" },
    });
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateDemoUser();
    const body = await req.json();
    const { label, note, eventDate } = body;

    if (!label || !eventDate) {
      return NextResponse.json({ error: "Label and date are required" }, { status: 400 });
    }

    const newEvent = await prisma.event.create({
      data: {
        userId: user.id,
        label,
        note: note || "",
        eventDate: new Date(eventDate),
      },
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
