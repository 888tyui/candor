import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rates = await prisma.costRate.findMany({
    where: { userId: user.id },
    orderBy: [{ provider: "asc" }, { model: "asc" }],
  });

  return NextResponse.json({ data: rates });
}
