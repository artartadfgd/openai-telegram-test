import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLibraryTemplate } from "@/lib/library-content";
import { LOCALES, dictionaries, type Locale } from "@/lib/i18n/dictionary";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const locale: Locale = LOCALES.includes(body.locale) ? body.locale : "pt";
  const template = getLibraryTemplate(locale, slug);
  if (!template) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const doc = {
    title: template.title,
    objective: template.objective,
    category: template.category,
    courtSetup: template.courtSetup,
    totalDurationMin: template.totalDurationMin,
    playersCount: template.playersCount,
    intensity: template.intensity,
    materials: template.materials,
    blocks: template.blocks,
    progressions: [],
    regressions: [],
    socioAffective: "",
    notes: "",
  };

  const lib = dictionaries[locale].library;
  const userMessage = lib.useMessageUser.replace("{title}", template.title).replace("{category}", template.category);
  const assistantMessage = lib.useMessageAssistant
    .replace("{title}", template.title)
    .replace("{blocks}", String(template.blocks.length))
    .replace("{duration}", String(template.totalDurationMin));

  const conversation = await db.conversation.create({ data: { userId, title: template.title } });
  await db.message.create({
    data: { conversationId: conversation.id, role: "user", content: userMessage },
  });
  await db.message.create({
    data: { conversationId: conversation.id, role: "assistant", content: assistantMessage },
  });
  await db.trainingSession.create({
    data: {
      userId,
      conversationId: conversation.id,
      title: doc.title,
      objective: doc.objective,
      category: doc.category,
      totalDurationMin: doc.totalDurationMin,
      playersCount: doc.playersCount,
      field: doc.courtSetup,
      intensity: doc.intensity,
      doc: JSON.stringify(doc),
    },
  });

  return NextResponse.json({ conversationId: conversation.id });
}
