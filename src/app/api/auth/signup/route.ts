import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { verifyPurchase } from "@/lib/hotmart";

const schema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const { fullName, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  try {
    const purchaseValid = await verifyPurchase(normalizedEmail);
    if (!purchaseValid) {
      return NextResponse.json({ error: "purchase_not_found" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "hotmart_error" }, { status: 502 });
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: { email: normalizedEmail, passwordHash, fullName: fullName.trim() },
  });

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
