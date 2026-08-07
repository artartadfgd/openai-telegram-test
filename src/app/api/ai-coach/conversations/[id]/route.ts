import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;

  const conversation = await db.conversation.findFirst({ where: { id, userId } });
  if (!conversation) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [messages, training] = await Promise.all([
    db.message.findMany({ where: { conversationId: id }, orderBy: { createdAt: "asc" } }),
    db.trainingSession.findFirst({ where: { conversationId: id }, orderBy: { createdAt: "desc" } }),
  ]);

  return NextResponse.json({
    conversation,
    messages,
    training: training ? { ...JSON.parse(training.doc), _sessionId: training.id, _favorited: training.favorited } : null,
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;
  const conversation = await db.conversation.findFirst({ where: { id, userId } });
  if (!conversation) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await db.conversation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
