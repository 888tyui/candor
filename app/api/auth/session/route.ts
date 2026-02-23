import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    // Verify session is not revoked AND not expired
    const session = await prisma.userSession.findUnique({
      where: { jti: payload.jti! },
    });

    if (!session || session.revoked) {
      return NextResponse.json({ error: "Session revoked" }, { status: 401 });
    }

    if (session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Update last active
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({
      wallet: payload.wallet,
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    // Revoke the session
    await prisma.userSession.updateMany({
      where: { jti: payload.jti! },
      data: { revoked: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
