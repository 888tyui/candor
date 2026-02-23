import { NextRequest, NextResponse } from "next/server";
import { type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { isValidUUID, isValidAlertCondition, isAllowedWebhookUrl } from "@/lib/validation";

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

  // Verify ownership
  const existing = await prisma.alertRule.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Alert rule not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, condition, webhookUrl, enabled } = body as {
    name?: string;
    condition?: Record<string, unknown>;
    webhookUrl?: string | null;
    enabled?: boolean;
  };

  if (name !== undefined && (typeof name !== "string" || name.length > 200)) {
    return NextResponse.json({ error: "name must be a string (max 200 chars)" }, { status: 400 });
  }

  if (condition !== undefined && !isValidAlertCondition(condition)) {
    return NextResponse.json(
      { error: "Invalid condition format" },
      { status: 400 }
    );
  }

  if (webhookUrl !== undefined && webhookUrl !== null) {
    if (!isAllowedWebhookUrl(webhookUrl)) {
      return NextResponse.json(
        { error: "Invalid webhook URL. Must be a public HTTP(S) URL" },
        { status: 400 }
      );
    }
  }

  const rule = await prisma.alertRule.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(condition !== undefined && { condition: condition as Prisma.InputJsonValue }),
      ...(webhookUrl !== undefined && { webhookUrl }),
      ...(enabled !== undefined && { enabled }),
    },
  });

  return NextResponse.json(rule);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await prisma.alertRule.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Alert rule not found" }, { status: 404 });
  }

  await prisma.alertRule.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
