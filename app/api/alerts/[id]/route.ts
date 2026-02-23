import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { isValidUUID } from "@/lib/validation";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  // Verify ownership through the alert rule
  const existing = await prisma.alert.findFirst({
    where: { id, rule: { userId: user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  const alert = await prisma.alert.update({
    where: { id },
    data: { acknowledged: true },
  });

  return NextResponse.json(alert);
}
