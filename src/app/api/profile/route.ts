import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email(),
});

export async function PATCH(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await db.user.findFirst({ where: { email, NOT: { id: userId } } });
  if (existing) return NextResponse.json({ error: "email_taken" }, { status: 409 });

  const user = await db.user.update({ where: { id: userId }, data: { fullName: parsed.data.fullName.trim(), email } });
  return NextResponse.json({ fullName: user.fullName, email: user.email });
}
