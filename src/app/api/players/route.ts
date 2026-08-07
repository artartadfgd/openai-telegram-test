import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

const schema = z.object({
  teamId: z.string().min(1),
  name: z.string().min(1).max(60),
  position: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const teamId = req.nextUrl.searchParams.get("teamId");
  const players = await db.player.findMany({
    where: { userId, ...(teamId ? { teamId } : {}) },
    orderBy: { createdAt: "desc" },
    include: { team: true },
  });
  return NextResponse.json(players);
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const team = await db.team.findFirst({ where: { id: parsed.data.teamId, userId } });
  if (!team) return NextResponse.json({ error: "team_not_found" }, { status: 404 });
  const player = await db.player.create({ data: { ...parsed.data, userId } });
  return NextResponse.json(player);
}
