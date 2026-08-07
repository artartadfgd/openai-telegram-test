import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  trainingSessionId: z.string().min(1),
  date: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const month = req.nextUrl.searchParams.get("month");
  let where: { userId: string; date?: { gte: Date; lt: Date } } = { userId };
  if (month) {
    const [y, m] = month.split("-").map(Number);
    where = { userId, date: { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) } };
  }

  const items = await db.scheduledTraining.findMany({
    where,
    orderBy: { date: "asc" },
    include: { trainingSession: { include: { team: true } } },
  });

  return NextResponse.json(
    items.map((it) => ({
      id: it.id,
      date: it.date.toISOString(),
      trainingSessionId: it.trainingSessionId,
      title: it.trainingSession.title,
      category: it.trainingSession.category,
      durationMin: it.trainingSession.totalDurationMin,
      conversationId: it.trainingSession.conversationId,
      teamName: it.trainingSession.team?.name ?? null,
    }))
  );
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const session = await db.trainingSession.findFirst({ where: { id: parsed.data.trainingSessionId, userId } });
  if (!session) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const item = await db.scheduledTraining.create({
    data: { userId, trainingSessionId: parsed.data.trainingSessionId, date: new Date(parsed.data.date) },
  });
  return NextResponse.json(item);
}
