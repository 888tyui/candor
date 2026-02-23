import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { isValidUUID } from "@/lib/validation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const includeEvents = req.nextUrl.searchParams.get("includeEvents") === "true";

  const session = await prisma.session.findFirst({
    where: { id, userId: user.id },
    include: {
      events: includeEvents
        ? { orderBy: { timestamp: "asc" }, take: 1000 }
        : false,
      alerts: true,
      _count: { select: { events: true } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}
