export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const skillName = searchParams.get("skill")?.toUpperCase();

  const where = skillName ? { skill: { name: skillName as never } } : {};

  const sections = await db.section.findMany({
    where,
    include: {
      skill: true,
      exercises: {
        select: { id: true, level: true, title: true, xpReward: true, isFree: true, durationSeconds: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(sections);
}
