import { db } from "@/lib/db";

function monthRange(offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  return { start, end };
}

function delta(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getDashboardStats(userId: string) {
  const { start: curStart, end: curEnd } = monthRange(0);
  const { start: prevStart, end: prevEnd } = monthRange(-1);

  const [curTrainings, prevTrainings, curPlayers, prevPlayers] = await Promise.all([
    db.trainingSession.findMany({ where: { userId, createdAt: { gte: curStart, lt: curEnd } } }),
    db.trainingSession.findMany({ where: { userId, createdAt: { gte: prevStart, lt: prevEnd } } }),
    db.player.count({ where: { userId, createdAt: { lt: curEnd } } }),
    db.player.count({ where: { userId, createdAt: { lt: prevEnd } } }),
  ]);

  const curObjectives = new Set(curTrainings.map((t) => t.objective)).size;
  const prevObjectives = new Set(prevTrainings.map((t) => t.objective)).size;
  const curHours = Math.round((curTrainings.length * 0.75 + Number.EPSILON) * 10) / 10;
  const prevHours = Math.round((prevTrainings.length * 0.75 + Number.EPSILON) * 10) / 10;

  const recent = await db.trainingSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { team: true },
  });

  return {
    month: {
      trainingsCreated: curTrainings.length,
      objectivesCount: curObjectives,
      playersFollowed: curPlayers,
      hoursSaved: curHours,
    },
    deltas: {
      trainingsCreated: delta(curTrainings.length, prevTrainings.length),
      objectivesCount: delta(curObjectives, prevObjectives),
      playersFollowed: delta(curPlayers, prevPlayers),
      hoursSaved: delta(curHours, prevHours),
    },
    recent: recent.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      teamName: t.team?.name ?? null,
      durationMin: t.totalDurationMin,
      createdAt: t.createdAt,
      conversationId: t.conversationId,
    })),
  };
}
