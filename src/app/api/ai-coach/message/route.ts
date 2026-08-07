import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { sendCoachMessage } from "@/lib/conversation";

const schema = z.object({
  conversationId: z.string().nullable().optional(),
  teamId: z.string().nullable().optional(),
  text: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  try {
    const result = await sendCoachMessage({
      userId,
      conversationId: parsed.data.conversationId ?? null,
      teamId: parsed.data.teamId ?? null,
      text: parsed.data.text,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "ai_error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
