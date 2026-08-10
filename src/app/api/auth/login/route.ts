import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { verifyPurchase } from "@/lib/hotmart";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();
  const user = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  try {
    const purchaseValid = await verifyPurchase(normalizedEmail);
    if (!purchaseValid) {
      return NextResponse.json({ error: "purchase_not_found" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "hotmart_error" }, { status: 502 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
