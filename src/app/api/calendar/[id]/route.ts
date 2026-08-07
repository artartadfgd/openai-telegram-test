import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;
  const item = await db.scheduledTraining.findFirst({ where: { id, userId } });
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await db.scheduledTraining.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
