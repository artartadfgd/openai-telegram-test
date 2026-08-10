import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { sendCoachMessage } from "@/lib/conversation";
import { dictionaries, LOCALES, type Locale } from "@/lib/i18n/dictionary";

const schema = z.object({
  category: z.string(),
  objective: z.string().min(1),
  players: z.number().int().min(1).max(60),
  duration: z.number().int().min(10).max(240),
  courtSetup: z.enum(["reduced", "attack", "half", "full"]),
  weekMoment: z.string(),
  materials: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  teamId: z.string().nullable().optional(),
  locale: z.enum(LOCALES).optional(),
});

function buildPrompt(data: z.infer<typeof schema>, locale: Locale) {
  const t = dictionaries[locale].trainingBuilder;
  const categoryLabels: Record<string, string> = { u6: t.categoryU6, u11: t.categoryU11, u14: t.categoryU14, u16: t.categoryU16, pro: t.categoryPro };
  const courtLabels: Record<string, string> = { reduced: t.courtReduced, attack: t.courtAttack, half: t.courtHalf, full: t.courtFull };
  const momentLabels: Record<string, string> = { preSeason: t.momentPreSeason, midWeek: t.momentMidWeek, matchWeek: t.momentMatchWeek, post: t.momentPost };

  const lines = [
    `${t.categoryLabel}: ${categoryLabels[data.category] ?? data.category}`,
    `${t.playersLabel}: ${data.players}`,
    `${t.durationLabel}: ${data.duration} min`,
    `${t.courtLabel}: ${courtLabels[data.courtSetup] ?? data.courtSetup}`,
    `${t.weekMomentLabel}: ${momentLabels[data.weekMoment] ?? data.weekMoment}`,
    `${t.objectiveLabel}: ${data.objective}`,
  ];
  if (data.materials.trim()) lines.push(`${t.materialsLabel}: ${data.materials.trim()}`);
  if (data.notes.trim()) lines.push(`${t.notesLabel}: ${data.notes.trim()}`);
  return `${t.title}:\n${lines.join("\n")}`;
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const locale: Locale = parsed.data.locale ?? "pt";

  try {
    const result = await sendCoachMessage({
      userId,
      conversationId: null,
      teamId: parsed.data.teamId ?? null,
      text: buildPrompt(parsed.data, locale),
      forceTraining: true,
      locale,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "ai_error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
