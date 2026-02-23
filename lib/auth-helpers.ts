import { NextRequest } from "next/server";
import { prisma } from "./db";
import { verifyJWT } from "./auth";
import { validateEnv } from "./env-check";

/**
 * Extract and verify the authenticated user from a request.
 *
 * Defence-in-depth: even though middleware already verifies the JWT and sets
 * x-wallet-address, we re-verify the JWT here so that API routes are safe
 * even if middleware is misconfigured or bypassed.
 */
export async function getUserFromRequest(req: NextRequest) {
  validateEnv();
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload.wallet) return null;

    // Verify session is not revoked
    if (payload.jti) {
      const session = await prisma.userSession.findUnique({
        where: { jti: payload.jti },
        select: { revoked: true, expiresAt: true },
      });
      if (!session || session.revoked || session.expiresAt < new Date()) {
        return null;
      }
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: payload.wallet },
    });

    return user;
  } catch {
    return null;
  }
}

export function getWalletFromRequest(req: NextRequest): string | null {
  // Still use the header for lightweight checks where full user lookup isn't needed,
  // but only in routes that are behind the middleware JWT gate.
  return req.headers.get("x-wallet-address");
}
