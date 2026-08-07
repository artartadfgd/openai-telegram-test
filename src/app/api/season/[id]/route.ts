import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;
  const phase = await db.seasonPhase.findFirst({ where: { id, userId } });
  if (!phase) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await db.seasonPhase.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
