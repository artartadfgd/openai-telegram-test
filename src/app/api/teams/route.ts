import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1).max(60),
  category: z.string().min(1),
  seasonLabel: z.string().optional().nullable(),
  playStyle: z.string().optional().nullable(),
  priorities: z.array(z.string()).default([]),
  crestShape: z.enum(["shield", "circle", "diamond", "hex"]).default("shield"),
  primaryColor: z.string().default("#3B82F6"),
  secondaryColor: z.string().default("#0b0b0e"),
});

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const teams = await db.team.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { players: true } } },
  });
  return NextResponse.json(
    teams.map((t) => ({ ...t, priorities: JSON.parse(t.priorities), playersCount: t._count.players }))
  );
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { priorities, ...rest } = parsed.data;
  const team = await db.team.create({
    data: { ...rest, userId, priorities: JSON.stringify(priorities) },
  });
  return NextResponse.json(team);
}
