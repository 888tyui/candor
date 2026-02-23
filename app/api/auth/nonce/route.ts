import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

// Rate limit: 10 nonce requests per minute per IP
const NONCE_RATE_LIMIT = 10;
const NONCE_WINDOW_MS = 60_000;

export async function GET(req: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(req.headers);
  const limit = checkRateLimit(`nonce:${clientIP}`, NONCE_RATE_LIMIT, NONCE_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  // Cleanup expired nonces (limit to avoid long-running deletes)
  await prisma.authNonce.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  const nonce = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.authNonce.create({
    data: { nonce, expiresAt },
  });

  return NextResponse.json({ nonce, expiresAt: expiresAt.toISOString() });
}
