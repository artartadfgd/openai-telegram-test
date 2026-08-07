import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { LibraryView } from "@/components/library-view";
import type { TrainingDoc } from "@/lib/ai";

export default async function LibraryPage() {
  const user = await getCurrentUser();
  const sessions = await db.trainingSession.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
    include: { team: true },
  });

  return (
    <LibraryView
      sessions={sessions.map((s) => ({
        id: s.id,
        title: s.title,
        objective: s.objective,
        category: s.category,
        totalDurationMin: s.totalDurationMin,
        createdAt: s.createdAt.toISOString(),
        team: s.team ? { name: s.team.name } : null,
        doc: JSON.parse(s.doc) as TrainingDoc,
      }))}
    />
  );
}
