import { db } from "@/lib/db";
import { generateTrainingDoc, chatReply, looksLikeTrainingRequest, type TrainingDoc } from "@/lib/ai";
import { dictionaries, LOCALES, type Locale } from "@/lib/i18n/dictionary";

export async function sendCoachMessage({
  userId,
  conversationId,
  teamId,
  text,
  forceTraining = false,
  locale = "pt",
}: {
  userId: string;
  conversationId: string | null;
  teamId?: string | null;
  text: string;
  forceTraining?: boolean;
  locale?: Locale;
}) {
  const safeLocale: Locale = (LOCALES as readonly string[]).includes(locale) ? locale : "pt";
  let conversation = conversationId ? await db.conversation.findFirst({ where: { id: conversationId, userId } }) : null;
  const isNewConversation = !conversation;
  if (!conversation) {
    conversation = await db.conversation.create({ data: { userId, teamId: teamId ?? null } });
  } else if (teamId && teamId !== conversation.teamId) {
    conversation = await db.conversation.update({ where: { id: conversation.id }, data: { teamId } });
  }

  await db.message.create({ data: { conversationId: conversation.id, role: "user", content: text } });

  const wantsTraining = forceTraining || looksLikeTrainingRequest(text);

  try {
    let trainingDoc: TrainingDoc | null = null;

    if (wantsTraining) {
      trainingDoc = await generateTrainingDoc(text, safeLocale);
      await db.trainingSession.create({
        data: {
          userId,
          teamId: teamId ?? null,
          conversationId: conversation.id,
          title: trainingDoc.title,
          objective: trainingDoc.objective,
          category: trainingDoc.category,
          totalDurationMin: trainingDoc.totalDurationMin,
          playersCount: trainingDoc.playersCount,
          field: trainingDoc.courtSetup,
          intensity: trainingDoc.intensity,
          doc: JSON.stringify(trainingDoc),
        },
      });
      const readyMessage = dictionaries[safeLocale].aiCoach.trainingReady
        .replace("{title}", trainingDoc.title)
        .replace("{blocks}", String(trainingDoc.blocks.length))
        .replace("{duration}", String(trainingDoc.totalDurationMin));
      await db.message.create({
        data: { conversationId: conversation.id, role: "assistant", content: readyMessage },
      });
      if (!conversation.title) {
        await db.conversation.update({ where: { id: conversation.id }, data: { title: trainingDoc.title } });
      }
    } else {
      const history = await db.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "asc" },
        take: 20,
      });
      const reply = await chatReply(
        history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        safeLocale
      );
      await db.message.create({ data: { conversationId: conversation.id, role: "assistant", content: reply } });
      if (!conversation.title) {
        await db.conversation.update({ where: { id: conversation.id }, data: { title: text.slice(0, 60) } });
      }
    }

    return { conversationId: conversation.id, trainingDoc };
  } catch (err) {
    if (isNewConversation) {
      await db.conversation.delete({ where: { id: conversation.id } }).catch(() => {});
    }
    throw err;
  }
}
