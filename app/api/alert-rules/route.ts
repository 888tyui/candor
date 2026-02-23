import { NextRequest, NextResponse } from "next/server";
import { type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { isValidAlertCondition, isAllowedWebhookUrl } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rules = await prisma.alertRule.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { alerts: true } } },
  });

  return NextResponse.json({ data: rules });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, condition, webhookUrl, enabled } = body as {
    name: string;
    condition: Record<string, unknown>;
    webhookUrl?: string;
    enabled?: boolean;
  };

  if (!name || typeof name !== "string" || name.length > 200) {
    return NextResponse.json(
      { error: "name is required (max 200 chars)" },
      { status: 400 }
    );
  }

  if (!isValidAlertCondition(condition)) {
    return NextResponse.json(
      { error: "Invalid condition. Required: type (error_rate|latency|cost_spike|tool_failure|session_duration|event_count), threshold (number >= 0)" },
      { status: 400 }
    );
  }

  // Validate webhook URL against SSRF
  if (webhookUrl) {
    if (!isAllowedWebhookUrl(webhookUrl)) {
      return NextResponse.json(
        { error: "Invalid webhook URL. Must be a public HTTP(S) URL" },
        { status: 400 }
      );
    }
  }

  const rule = await prisma.alertRule.create({
    data: {
      userId: user.id,
      name,
      condition: condition as Prisma.InputJsonValue,
      webhookUrl: webhookUrl || null,
      enabled: enabled ?? true,
    },
  });

  return NextResponse.json(rule, { status: 201 });
}
