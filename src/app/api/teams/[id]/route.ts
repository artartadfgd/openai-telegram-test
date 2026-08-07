import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1).max(60).optional(),
  category: z.string().min(1).optional(),
  seasonLabel: z.string().optional().nullable(),
  playStyle: z.string().optional().nullable(),
  priorities: z.array(z.string()).optional(),
  crestShape: z.enum(["shield", "circle", "diamond", "hex"]).optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;
  const team = await db.team.findFirst({ where: { id, userId } });
  if (!team) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { priorities, ...rest } = parsed.data;
  const updated = await db.team.update({
    where: { id },
    data: { ...rest, ...(priorities ? { priorities: JSON.stringify(priorities) } : {}) },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;
  const team = await db.team.findFirst({ where: { id, userId } });
  if (!team) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await db.team.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
