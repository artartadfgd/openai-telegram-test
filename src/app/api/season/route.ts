import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  teamId: z.string().min(1),
  name: z.string().min(1).max(60),
  color: z.string().default("#3B82F6"),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const teamId = req.nextUrl.searchParams.get("teamId");
  const phases = await db.seasonPhase.findMany({
    where: { userId, ...(teamId ? { teamId } : {}) },
    orderBy: { startDate: "asc" },
  });
  return NextResponse.json(phases);
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const team = await db.team.findFirst({ where: { id: parsed.data.teamId, userId } });
  if (!team) return NextResponse.json({ error: "team_not_found" }, { status: 404 });
  const phase = await db.seasonPhase.create({
    data: {
      userId,
      teamId: parsed.data.teamId,
      name: parsed.data.name,
      color: parsed.data.color,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
    },
  });
  return NextResponse.json(phase);
}
