export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const exerciseId = searchParams.get("id");
  const sectionId  = searchParams.get("sectionId");

  if (exerciseId) {
    const exercise = await db.exercise.findUnique({
      where: { id: exerciseId },
      select: {
        id: true, title: true, level: true, audioUrl: true,
        durationSeconds: true, payload: true, maxScore: true,
        xpReward: true, isFree: true,
        section: { include: { skill: true } },
        // answerKey is intentionally excluded — grading is server-side
      },
    });
    if (!exercise) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(exercise);
  }

  if (sectionId) {
    const exercises = await db.exercise.findMany({
      where: { sectionId },
      select: {
        id: true, title: true, level: true, durationSeconds: true,
        xpReward: true, isFree: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(exercises);
  }

  return NextResponse.json({ error: "Provide id or sectionId" }, { status: 400 });
}
