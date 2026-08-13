import { NextResponse } from "next/server";
import { checkApiHealth } from "@/lib/jiosaavn";
import { config } from "@/lib/config";

export async function GET() {
  const ok = await checkApiHealth();
  return NextResponse.json({ ok, url: config.jiosaavnApiUrl });
}
