import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPurchase } from "@/lib/hotmart";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  try {
    const verified = await verifyPurchase(parsed.data.email.toLowerCase().trim());
    return NextResponse.json({ verified });
  } catch (err) {
    console.error("[hotmart] verify route failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "hotmart_error" }, { status: 502 });
  }
}
