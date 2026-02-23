import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyEd25519SignatureRaw, signJWT, parseSIWSMessage } from "@/lib/auth";
import { seedCostRatesForUser } from "@/lib/seed-cost-rates";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import bs58 from "bs58";
import { randomUUID } from "crypto";

// Rate limit: 5 verify attempts per minute per IP
const VERIFY_RATE_LIMIT = 5;
const VERIFY_WINDOW_MS = 60_000;

// Solana addresses are base58-encoded 32-byte public keys (32-44 chars)
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function isValidSolanaAddress(address: string): boolean {
  if (!SOLANA_ADDRESS_REGEX.test(address)) return false;
  try {
    const decoded = bs58.decode(address);
    return decoded.length === 32;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(req.headers);
  const limit = checkRateLimit(`verify:${clientIP}`, VERIFY_RATE_LIMIT, VERIFY_WINDOW_MS);
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

  try {
    const body = await req.json();
    const { message, signature, publicKey } = body as {
      message: string;
      signature: string; // base58 or array
      publicKey: string; // base58
    };

    if (!message || !signature || !publicKey) {
      return NextResponse.json(
        { error: "Missing message, signature, or publicKey" },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!isValidSolanaAddress(publicKey)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Parse and validate the SIWS message
    const parsed = parseSIWSMessage(message);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid SIWS message format" },
        { status: 400 }
      );
    }

    // Verify the wallet in the message matches the publicKey
    if (parsed.wallet !== publicKey) {
      return NextResponse.json(
        { error: "Wallet address mismatch" },
        { status: 400 }
      );
    }

    // Atomic nonce claim: find and mark used in a single transaction
    // This prevents race conditions where two concurrent requests both see the nonce as unused
    const claimedNonce = await prisma.$transaction(async (tx) => {
      const nonce = await tx.authNonce.findUnique({
        where: { nonce: parsed.nonce },
      });

      if (!nonce || nonce.used || nonce.expiresAt < new Date()) {
        return null;
      }

      // Mark as used immediately within the transaction
      await tx.authNonce.update({
        where: { id: nonce.id },
        data: { used: true, wallet: publicKey },
      });

      return nonce;
    });

    if (!claimedNonce) {
      return NextResponse.json(
        { error: "Invalid or expired nonce" },
        { status: 400 }
      );
    }

    // Verify Ed25519 signature
    const messageBytes = new TextEncoder().encode(message);
    let signatureBytes: Uint8Array;

    if (Array.isArray(signature)) {
      signatureBytes = new Uint8Array(signature);
    } else {
      try {
        signatureBytes = bs58.decode(signature);
      } catch {
        return NextResponse.json(
          { error: "Invalid signature encoding" },
          { status: 400 }
        );
      }
    }

    // Ed25519 signatures must be 64 bytes
    if (signatureBytes.length !== 64) {
      return NextResponse.json(
        { error: "Invalid signature length" },
        { status: 400 }
      );
    }

    const publicKeyBytes = bs58.decode(publicKey);

    const valid = verifyEd25519SignatureRaw(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { walletAddress: publicKey },
      update: {},
      create: { walletAddress: publicKey },
    });

    // Seed cost rates on first login
    await seedCostRatesForUser(user.id);

    // Create user session
    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await prisma.userSession.create({
      data: {
        walletAddress: publicKey,
        userId: user.id,
        jti,
        expiresAt,
        userAgent: req.headers.get("user-agent") || undefined,
        ipAddress:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          req.headers.get("x-real-ip") ||
          undefined,
      },
    });

    // Sign JWT
    const token = await signJWT(publicKey, jti);

    return NextResponse.json({
      token,
      wallet: publicKey,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("[auth/verify]", err);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
