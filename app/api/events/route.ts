import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { parsePositiveInt, isValidUUID, isValidISODate } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = req.nextUrl;
  const page = parsePositiveInt(url.searchParams.get("page"), 1, 1000);
  const pageSize = parsePositiveInt(url.searchParams.get("pageSize"), 50, 200);
  const sessionId = url.searchParams.get("sessionId");
  const toolName = url.searchParams.get("tool");
  const method = url.searchParams.get("method");
  const since = url.searchParams.get("since");

  // Validate optional UUID
  if (sessionId && !isValidUUID(sessionId)) {
    return NextResponse.json({ error: "Invalid sessionId" }, { status: 400 });
  }

  // Validate date
  if (since && !isValidISODate(since)) {
    return NextResponse.json({ error: "Invalid date format for 'since'" }, { status: 400 });
  }

  const where: Record<string, unknown> = {
    session: { userId: user.id },
  };
  if (sessionId) where.sessionId = sessionId;
  if (toolName) where.toolName = toolName;
  if (method) where.method = method;
  if (since) where.timestamp = { gte: new Date(since) };

  const [data, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}
