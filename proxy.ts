import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

let _jwtSecret: Uint8Array | null = null;

function getJWTSecret(): Uint8Array {
  if (_jwtSecret) return _jwtSecret;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  _jwtSecret = new TextEncoder().encode(secret);
  return _jwtSecret;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth for non-API routes and auth endpoints
  if (!pathname.startsWith("/api/") || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { payload } = await jwtVerify(token, getJWTSecret(), {
      issuer: "candor",
    });

    // Validate required claims exist
    if (!payload.wallet || !payload.jti) {
      return NextResponse.json(
        { error: "Invalid token claims" },
        { status: 401 }
      );
    }

    // Add wallet address to headers for downstream use
    const response = NextResponse.next();
    response.headers.set("x-wallet-address", payload.wallet as string);
    response.headers.set("x-user-jti", payload.jti as string);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
