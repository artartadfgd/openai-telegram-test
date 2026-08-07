import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { sendCoachMessage } from "@/lib/conversation";

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
});

const CATEGORY_LABEL: Record<string, string> = { u6: "Sub-6", u11: "Sub-11", u14: "Sub-14", u16: "Sub-16", pro: "Profissional" };
const COURT_LABEL: Record<string, string> = { reduced: "quadra reduzida", attack: "zona de ataque", half: "meia quadra", full: "quadra completa" };
const MOMENT_LABEL: Record<string, string> = {
  preSeason: "pré-temporada",
  midWeek: "meio de semana",
  matchWeek: "semana de jogo",
  post: "pós-jogo (regenerativo)",
};

function buildPrompt(data: z.infer<typeof schema>) {
  const lines = [
    `Categoria: ${CATEGORY_LABEL[data.category] ?? data.category}`,
    `Número de jogadores: ${data.players}`,
    `Duração total: ${data.duration} min`,
    `Quadra: ${COURT_LABEL[data.courtSetup] ?? data.courtSetup}`,
    `Momento da semana: ${MOMENT_LABEL[data.weekMoment] ?? data.weekMoment}`,
    `Objetivo principal: ${data.objective}`,
  ];
  if (data.materials.trim()) lines.push(`Materiais disponíveis: ${data.materials.trim()}`);
  if (data.notes.trim()) lines.push(`Observações: ${data.notes.trim()}`);
  return `Monte um treino de voleibol com os seguintes parâmetros:\n${lines.join("\n")}`;
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  try {
    const result = await sendCoachMessage({
      userId,
      conversationId: null,
      teamId: parsed.data.teamId ?? null,
      text: buildPrompt(parsed.data),
      forceTraining: true,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "ai_error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
