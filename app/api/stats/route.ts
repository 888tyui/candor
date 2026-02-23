import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { isValidPeriod } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = req.nextUrl;
  const periodParam = url.searchParams.get("period") || "24h";
  const period = isValidPeriod(periodParam) ? periodParam : "24h";
  const groupBy = url.searchParams.get("groupBy"); // "tool" | "agent"

  if (groupBy && groupBy !== "tool" && groupBy !== "agent") {
    return NextResponse.json({ error: "groupBy must be 'tool' or 'agent'" }, { status: 400 });
  }

  const periodMs: Record<string, number> = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };
  const since = new Date(Date.now() - periodMs[period]);

  const sessionWhere = { userId: user.id, startedAt: { gte: since } };
  const eventWhere = { session: { userId: user.id }, timestamp: { gte: since } };

  // Use aggregation queries instead of loading all events into memory
  const [
    totalSessions,
    activeSessions,
    eventAgg,
    costAgg,
    errorCount,
    topToolsRaw,
  ] = await Promise.all([
    prisma.session.count({ where: sessionWhere }),
    prisma.session.count({ where: { userId: user.id, endedAt: null } }),
    prisma.event.aggregate({
      where: eventWhere,
      _count: true,
      _avg: { latencyMs: true },
    }),
    prisma.session.aggregate({
      where: sessionWhere,
      _sum: { totalCostEstimate: true },
    }),
    prisma.event.count({
      where: { ...eventWhere, error: { not: Prisma.JsonNull } },
    }),
    prisma.event.groupBy({
      by: ["toolName"],
      where: eventWhere,
      _count: true,
      _sum: { costEstimate: true },
      orderBy: { _count: { toolName: "desc" } },
      take: 10,
    }),
  ]);

  const totalEvents = eventAgg._count;
  const totalCost = costAgg._sum.totalCostEstimate || 0;
  const errorRate = totalEvents > 0 ? errorCount / totalEvents : 0;
  const avgLatencyMs = eventAgg._avg.latencyMs || 0;

  const topTools = topToolsRaw.map((t) => ({
    toolName: t.toolName || "unknown",
    count: t._count,
    totalCost: t._sum.costEstimate || 0,
  }));

  // Group by agent if requested (still needs a query, but using groupBy)
  let grouped: Record<string, unknown>[] | undefined;
  if (groupBy === "tool") {
    grouped = topTools;
  } else if (groupBy === "agent") {
    const agentGroupRaw = await prisma.session.groupBy({
      by: ["agentId"],
      where: sessionWhere,
      _count: true,
      _sum: { totalCostEstimate: true },
      orderBy: { _count: { agentId: "desc" } },
    });
    grouped = agentGroupRaw.map((a) => ({
      agentId: a.agentId || "unknown",
      count: a._count,
      totalCost: a._sum.totalCostEstimate || 0,
    }));
  }

  return NextResponse.json({
    totalSessions,
    activeSessions,
    totalEvents,
    totalCost,
    errorRate,
    avgLatencyMs,
    topTools,
    grouped,
    period,
  });
}
