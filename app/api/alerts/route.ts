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
  const acknowledged = url.searchParams.get("acknowledged");

  const where: Record<string, unknown> = {
    rule: { userId: user.id },
  };
  if (acknowledged === "true") where.acknowledged = true;
  if (acknowledged === "false") where.acknowledged = false;

  const [data, total] = await Promise.all([
    prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        rule: { select: { name: true } },
      },
    }),
    prisma.alert.count({ where }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}
