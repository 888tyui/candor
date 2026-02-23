import { NextRequest, NextResponse } from "next/server";
import { cleanupOldData } from "@/lib/data-retention";

/**
 * POST /api/cleanup — Trigger data retention cleanup.
 * Protected by middleware (requires valid JWT).
 * Can also be called by a cron job with Bearer token.
 */
export async function POST(req: NextRequest) {
  try {
    const result = await cleanupOldData();
    const total = Object.values(result).reduce((a, b) => a + b, 0);
    return NextResponse.json({ cleaned: total, details: result });
  } catch (err) {
    console.error("[cleanup] Failed:", err);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
