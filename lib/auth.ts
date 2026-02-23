import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import nacl from "tweetnacl";
import bs58 from "bs58";

let _jwtSecret: Uint8Array | null = null;

function getJWTSecret(): Uint8Array {
  if (_jwtSecret) return _jwtSecret;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET environment variable is required. Generate one with: openssl rand -base64 32"
    );
  }
  if (secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }
  _jwtSecret = new TextEncoder().encode(secret);
  return _jwtSecret;
}

const JWT_ISSUER = "candor";
const JWT_EXPIRY = "24h";

export interface CandorJWTPayload extends JWTPayload {
  wallet: string;
}

/* ─── JWT ─── */

export async function signJWT(
  wallet: string,
  jti: string
): Promise<string> {
  return new SignJWT({ wallet } as CandorJWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(JWT_EXPIRY)
    .setJti(jti)
    .sign(getJWTSecret());
}

export async function verifyJWT(
  token: string
): Promise<CandorJWTPayload> {
  const { payload } = await jwtVerify(token, getJWTSecret(), {
    issuer: JWT_ISSUER,
  });
  return payload as CandorJWTPayload;
}

/* ─── SIWS (Sign In With Solana) ─── */

export function createSIWSMessage(
  wallet: string,
  nonce: string,
  domain: string
): string {
  const now = new Date().toISOString();
  return [
    `${domain} wants you to sign in with your Solana account:`,
    wallet,
    "",
    "Sign in to Candor",
    "",
    `URI: https://${domain}`,
    `Version: 1`,
    `Nonce: ${nonce}`,
    `Issued At: ${now}`,
  ].join("\n");
}

export function parseSIWSMessage(message: string): {
  domain: string;
  wallet: string;
  nonce: string;
} | null {
  try {
    const lines = message.split("\n");
    const domainMatch = lines[0]?.match(/^(.+) wants you to sign in/);
    const domain = domainMatch?.[1] ?? "";
    const wallet = lines[1]?.trim() ?? "";
    const nonceLine = lines.find((l) => l.startsWith("Nonce: "));
    const nonce = nonceLine?.replace("Nonce: ", "").trim() ?? "";
    if (!domain || !wallet || !nonce) return null;
    return { domain, wallet, nonce };
  } catch {
    return null;
  }
}

/* ─── Ed25519 Signature Verification ─── */

export function verifyEd25519Signature(
  message: string,
  signatureBase58: string,
  publicKeyBase58: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signatureBase58);
    const publicKeyBytes = bs58.decode(publicKeyBase58);
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch {
    return false;
  }
}

export function verifyEd25519SignatureRaw(
  messageBytes: Uint8Array,
  signatureBytes: Uint8Array,
  publicKeyBytes: Uint8Array
): boolean {
  try {
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch {
    return false;
  }
}
