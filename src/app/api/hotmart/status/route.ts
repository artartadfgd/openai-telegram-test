import { NextResponse } from "next/server";
import { isHotmartConfigured } from "@/lib/hotmart";

export async function GET() {
  return NextResponse.json({ enabled: isHotmartConfigured() });
}
