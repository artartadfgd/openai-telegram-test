import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { FavoritesView } from "@/components/favorites-view";
import type { TrainingDoc } from "@/lib/ai";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  const sessions = await db.trainingSession.findMany({
    where: { userId: user!.id, favorited: true },
    orderBy: { createdAt: "desc" },
    include: { team: true },
  });

  return (
    <FavoritesView
      sessions={sessions.map((s) => ({
        id: s.id,
        title: s.title,
        objective: s.objective,
        category: s.category,
        totalDurationMin: s.totalDurationMin,
        conversationId: s.conversationId,
        team: s.team ? { name: s.team.name } : null,
        doc: JSON.parse(s.doc) as TrainingDoc,
      }))}
    />
  );
}
