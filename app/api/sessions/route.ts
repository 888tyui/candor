import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { parsePositiveInt } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = req.nextUrl;
  const page = parsePositiveInt(url.searchParams.get("page"), 1, 1000);
  const pageSize = parsePositiveInt(url.searchParams.get("pageSize"), 20, 100);
  const agentId = url.searchParams.get("agentId");
  const status = url.searchParams.get("status"); // "active" | "ended"

  const where: Record<string, unknown> = { userId: user.id };
  if (agentId) where.agentId = agentId;
  if (status === "active") where.endedAt = null;
  if (status === "ended") where.endedAt = { not: null };

  const [data, total] = await Promise.all([
    prisma.session.findMany({
      where,
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { events: true, alerts: true } },
      },
    }),
    prisma.session.count({ where }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}
